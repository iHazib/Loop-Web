import * as db from './db.js';
import * as metrics from './metrics.js';
import { demoDataset } from './demo.js';
import { keepaConfigured, tokenStatus } from './keepa.js';
import { syncBrand, discoverCompetitors, importAsins } from './sync.js';
import { validate, TEMPLATES, type UploadKind } from './validate.js';
import * as ai from './ai.js';
import * as acc from './access.js';
import { verifyGoogleToken } from '../auth.js';
import { BRAND_STATUSES, TEST_BUY_VERDICTS, PORTAL_TABS, brandSettings, type BrandSettings, type Dataset, type ProtectionCase, type CaseStatus, type Brand, type BrandStatus, type TestBuy, type TestBuyVerdict } from './types.js';
import { newCases, autoResolve } from './protection.js';
import * as email from './email.js';
import * as st from './searchterms.js';
import * as cs from './casestudies.js';
import * as alerts from './alerts.js';
import { mailConfigured, sendMail } from './mailer.js';
import crypto from 'node:crypto';

/* Router for /api/portal/*, shared by Express (server/app.ts) and Vercel (api/index.ts).
   Who can do what:
   - staff  = signed in through /admin (allowlisted): every brand, Keepa runs, brands, team invites
   - client manager = their brands: view, upload sheets, edit products, import ASINs, find competitors, work cases
   - client viewer  = their brands: view and ask AI
   - anyone = the demo brand */

export interface PortalReq {
  method: string;
  path: string;
  query: Record<string, string | undefined>;
  body: Record<string, unknown>;
  user: { email: string; name: string } | null; // admin session (staff)
  cookieHeader?: string;
  authHeader?: string;
}
export interface PortalRes { status: number; data: unknown; setCookie?: string }

const ok = (data: unknown, setCookie?: string): PortalRes => ({ status: 200, data, setCookie });
const err = (status: number, error: string): PortalRes => ({ status, data: { error } });

let demoCache: { at: number; ds: Dataset } | null = null;
function demo(): Dataset {
  if (!demoCache || Date.now() - demoCache.at > 600_000) demoCache = { at: Date.now(), ds: demoDataset() };
  return demoCache.ds;
}
const DEMO_BRAND = { id: 'demo', name: 'Halcyon Foods (demo)', plan: 'Illustrative data' };

async function principal(req: PortalReq): Promise<acc.Principal | null> {
  if (req.user) return { kind: 'staff', email: req.user.email, name: req.user.name };
  const s = acc.verifyClient(acc.cookieValue(req.cookieHeader, acc.PORTAL_COOKIE));
  if (!s || !db.dbConfigured()) return null;
  const brands = await db.userBrands(s.email);
  return { kind: 'client', email: s.email, name: s.name, brands };
}

const VIEWS = ['home', 'overview', 'channels', 'protection', 'analysis', 'ads', 'logistics', 'd2c'] as const;
const KINDS: UploadKind[] = ['products', 'sales', 'ads', 'sellers', 'competitors', 'd2c'];
const STATUSES: CaseStatus[] = ['flagged', 'reviewing', 'clear', 'resolved'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const num = (v: unknown) => { const n = Number(String(v ?? '').replace(/[£,\s]/g, '')); return Number.isFinite(n) && n >= 0 ? n : null; };

/** What clients may see about their brand (no staff notes). */
const publicBrand = (b: Brand): Brand => ({ id: b.id, name: b.name, plan: b.plan, status: b.status, accountManager: b.accountManager, accountManagerEmail: b.accountManagerEmail, settings: brandSettings(b) });

/** Validates the editable brand fields; returns an error message string when invalid. */
function brandFields(body: Record<string, unknown>): Partial<Brand> | string {
  const f: Partial<Brand> = {};
  if (body.status !== undefined) {
    if (!BRAND_STATUSES.includes(body.status as BrandStatus)) return `Status must be one of ${BRAND_STATUSES.join(', ')}.`;
    f.status = body.status as BrandStatus;
  }
  for (const k of ['accountManager', 'accountManagerEmail', 'contactEmail', 'notes'] as const) {
    if (body[k] === undefined) continue;
    const v = String(body[k]).trim();
    if ((k === 'accountManagerEmail' || k === 'contactEmail') && v && !EMAIL.test(v)) return `${k === 'contactEmail' ? 'Brand contact' : 'Account manager'} email is not valid.`;
    f[k] = v.slice(0, k === 'notes' ? 4000 : 120);
  }
  return f;
}

export async function handlePortal(req: PortalReq): Promise<PortalRes | null> {
  const { method, path, query, body } = req;
  if (!path.startsWith('/api/portal')) return null;
  const parts = path.replace(/^\/api\/portal\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);

  /* ── Scheduled job ── */
  if (parts[0] === 'cron' && parts[1] === 'keepa') {
    const secret = (process.env.CRON_SECRET || '').trim();
    if (!secret || req.authHeader !== `Bearer ${secret}`) return err(401, 'Unauthorised');
    const results = [];
    for (const b of await db.listBrands()) {
      try { results.push({ brand: b.id, ...(await syncBrand(b.id)) }); }
      catch (e) { results.push({ brand: b.id, error: e instanceof Error ? e.message : String(e) }); }
      // Instant alerts go out straight after each brand's check.
      try { const a = await alerts.run(b.id, 'instant'); results.push({ brand: b.id, alerts: a.status }); }
      catch (e) { results.push({ brand: b.id, alertsError: (e as Error).message }); }
    }
    return ok({ results });
  }
  if (parts[0] === 'cron' && parts[1] === 'digest') {
    const secret = (process.env.CRON_SECRET || '').trim();
    if (!secret || req.authHeader !== `Bearer ${secret}`) return err(401, 'Unauthorised');
    const results = [];
    for (const b of await db.listBrands()) {
      try { const a = await alerts.run(b.id, 'daily'); results.push({ brand: b.id, status: a.status, emails: a.emails.length }); }
      catch (e) { results.push({ brand: b.id, error: (e as Error).message }); }
    }
    return ok({ results });
  }

  /* ── Client auth ── */
  if (parts[0] === 'auth') {
    if (!db.dbConfigured()) return err(503, 'The database is not configured yet.');
    if (parts[1] === 'login' && method === 'POST') {
      const email = String(body.email ?? '').trim().toLowerCase();
      const password = String(body.password ?? '');
      if (acc.throttled(email)) return err(429, 'Too many attempts. Try again in 15 minutes.');
      const u = email ? await db.getUser(email) : null;
      if (!u || !acc.checkPassword(password, u.passwordHash)) { acc.noteFailure(email); return err(401, 'Email or password is incorrect.'); }
      const brands = await db.userBrands(email);
      if (!Object.keys(brands).length) return err(403, 'This account has no brand access yet. Ask Loopretail to invite you.');
      acc.clearFailures(email);
      await db.touchLogin(email);
      return ok({ email, name: u.name, brands: Object.keys(brands) }, acc.setClientCookie({ email, name: u.name }));
    }
    if (parts[1] === 'google' && method === 'POST') {
      const credential = String(body.credential ?? '');
      if (!credential) return err(400, 'Missing Google credential.');
      const profile = await verifyGoogleToken(credential);
      if (!profile || !profile.verified) return err(401, 'Could not verify this Google account.');
      const email = profile.email.toLowerCase();
      const u = await db.getUser(email);
      const brands = u ? await db.userBrands(email) : {};
      if (!u || !Object.keys(brands).length) return err(403, `${email} has no brand access yet. Ask Loopretail to invite this email.`);
      const name = u.name || profile.name;
      await db.touchLogin(email);
      return ok({ email, name, brands: Object.keys(brands) }, acc.setClientCookie({ email, name }));
    }
    if (parts[1] === 'logout' && method === 'POST') return ok({ ok: true }, acc.clearClientCookie());
    if (parts[1] === 'invite' && parts[2]) {
      const hash = acc.sha256(parts[2]);
      const inv = await db.getInvite(hash);
      if (!inv) return err(404, 'This invite link is invalid or has expired. Ask Loopretail for a new one.');
      if (method === 'GET') {
        const existing = await db.getUser(inv.email);
        return ok({ email: inv.email, brandName: inv.brandName, role: inv.role, hasPassword: Boolean(existing?.passwordHash) });
      }
      if (method === 'POST') {
        const password = String(body.password ?? '');
        const name = String(body.name ?? '').trim().slice(0, 80);
        const problem = acc.passwordProblem(password);
        if (problem) return err(400, problem);
        await db.upsertUser(inv.email, name, acc.hashPassword(password));
        await db.linkUser(inv.email, inv.brandId, inv.role);
        await db.useInvite(hash);
        await db.touchLogin(inv.email);
        await db.addEvents(inv.brandId, [{ at: new Date().toISOString(), source: 'Team', message: `${inv.email} joined as ${inv.role}`, level: 'info' }]);
        return ok({ brandId: inv.brandId }, acc.setClientCookie({ email: inv.email, name }));
      }
    }
    return err(404, 'Unknown auth route.');
  }

  /* ── Public case studies: teasers for everyone, the full study with a valid access code ── */
  if (parts[0] === 'case-studies') {
    if (!db.dbConfigured()) return ok([]);
    try {
      if (method === 'GET' && !parts[1]) return ok((await db.listStudies(true)).map(cs.teaser));
      const study = parts[1] ? await db.getStudy(parts[1]) : null;
      if (!study || !study.published) return err(404, 'This case study is not available.');
      if (method === 'GET' && !parts[2]) return ok(cs.teaser(study));
      if (method === 'POST' && parts[2] === 'unlock') {
        const key = `case:${study.slug}`;
        if (acc.throttled(key)) return err(429, 'Too many wrong codes. Try again in 15 minutes.');
        const code = cs.normCode(String(body.code ?? ''));
        const a = code.length === 8 ? await db.findAccess(acc.sha256(code)) : null;
        const valid = a && !a.revoked && new Date(a.expiresAt).getTime() > Date.now() && (!a.studyId || a.studyId === study.id);
        if (!valid) { acc.noteFailure(key); return err(401, a && new Date(a.expiresAt).getTime() <= Date.now() ? 'This code has expired. Ask us for a new one.' : 'That code does not open this case study.'); }
        await db.useAccess(a!.id, a!.uses);
        return ok({ ...cs.full(study), allStudies: !a!.studyId, expiresAt: a!.expiresAt });
      }
    } catch (e) {
      if (/portal_case/i.test((e as Error).message)) return method === 'GET' && !parts[1] ? ok([]) : err(404, 'This case study is not available.');
      throw e;
    }
    return err(404, 'Unknown case study route.');
  }

  const who = await principal(req);

  if (parts[0] === 'status' && method === 'GET') {
    let keepaTokens: unknown = null;
    if (acc.isStaff(who) && keepaConfigured()) { try { keepaTokens = await tokenStatus(); } catch (e) { keepaTokens = { error: (e as Error).message }; } }
    return ok({
      db: db.dbConfigured(), keepa: keepaConfigured(), ai: ai.aiConfigured(), keepaTokens,
      signedIn: Boolean(who),
      principal: who ? { kind: who.kind, email: who.email, name: who.name, brands: who.kind === 'client' ? who.brands : null } : null,
    });
  }

  if (parts[0] === 'templates' && method === 'GET') return ok(TEMPLATES);

  if (parts[0] === 'brands' && parts.length === 1) {
    if (method === 'GET') {
      if (!who || !db.dbConfigured()) return ok([DEMO_BRAND]);
      const all = await db.listBrands();
      if (who.kind === 'staff') return ok([DEMO_BRAND, ...all]);
      return ok(all.filter((b) => who.brands[b.id]).map(publicBrand));
    }
    if (method === 'POST') {
      if (!acc.isStaff(who)) return err(403, 'Only Loopretail staff can add brands.');
      const name = String(body.name ?? '').trim();
      if (!name) return err(400, 'Brand name is required.');
      const fields = brandFields(body);
      if (typeof fields === 'string') return err(400, fields);
      const brand = await db.createBrand(name.slice(0, 80), String(body.plan ?? '').slice(0, 60), { status: 'onboarding', accountManager: who!.name || who!.email, accountManagerEmail: who!.email, ...fields });
      await db.addEvents(brand.id, [{ at: new Date().toISOString(), source: 'Loopretail', message: `Brand created by ${who!.email}`, level: 'info' }]);
      let invitePath: string | null = null;
      const inviteEmail = String(body.inviteEmail ?? '').trim().toLowerCase();
      if (inviteEmail) {
        if (!EMAIL.test(inviteEmail)) return ok({ ...brand, invitePath, warning: 'Brand created, but the invite email was not valid.' });
        const role = body.inviteRole === 'viewer' ? 'viewer' : 'manager';
        await db.ensureUser(inviteEmail);
        await db.linkUser(inviteEmail, brand.id, role);
        const { token, hash } = acc.newInviteToken();
        await db.createInvite(hash, inviteEmail, brand.id, role);
        invitePath = `/portal/invite/${token}`;
      }
      return ok({ ...brand, invitePath });
    }
  }

  /* ── Staff admin: case studies and access codes ── */
  if (parts[0] === 'admin' && parts[1] === 'case-studies') {
    if (!acc.isStaff(who)) return err(403, 'Staff only.');
    if (!db.dbConfigured()) return err(503, 'The database is not configured yet.');
    const guard = async <T,>(f: () => Promise<T>) => {
      try { return await f(); }
      catch (e) { if (/portal_case/i.test((e as Error).message)) return err(500, 'Case studies are missing in the database. Run supabase/portal.sql again.') as unknown as T; throw e; }
    };
    if (parts[2] === 'access') {
      if (method === 'GET') return guard(async () => ok(await db.listAccess()));
      if (method === 'POST') {
        const label = String(body.label ?? '').trim().slice(0, 100);
        if (!label) return err(400, 'Say who the code is for.');
        const days = Math.min(Math.max(Math.round(Number(body.days) || 14), 1), 365);
        const studyId = body.studyId ? String(body.studyId) : null;
        const code = cs.newCode();
        const expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
        return guard(async () => { await db.createAccess({ id: crypto.randomUUID(), label, studyId, codeHash: acc.sha256(cs.normCode(code)), expiresAt }); return ok({ code, expiresAt }); });
      }
      if (method === 'DELETE') return guard(async () => { await db.revokeAccess(String(query.id ?? '')); return ok({ revoked: true }); });
    }
    if (method === 'GET' && !parts[2]) return guard(async () => ok(await db.listStudies(false)));
    if (method === 'POST' && !parts[2]) {
      const clean = cs.cleanStudy(body);
      if (typeof clean === 'string') return err(400, clean);
      return guard(async () => {
        const all = await db.listStudies(false);
        const id = body.id ? String(body.id) : crypto.randomUUID();
        if (all.some((x) => x.slug === clean.slug && x.id !== id)) return err(400, `Another case study already uses the link /case-studies/${clean.slug}.`);
        await db.saveStudy(id, clean);
        return ok({ id, ...clean });
      });
    }
    if (method === 'DELETE' && !parts[2]) return guard(async () => { await db.deleteStudy(String(query.id ?? '')); return ok({ deleted: true }); });
    return err(404, 'Unknown case study route.');
  }

  /* ── Staff admin: bulk brand import from CSV. Existing names are skipped, not duplicated. ── */
  if (parts[0] === 'admin' && parts[1] === 'brands' && parts[2] === 'bulk' && method === 'POST') {
    if (!acc.isStaff(who)) return err(403, 'Only Loopretail staff can add brands.');
    const rows = Array.isArray(body.rows) ? (body.rows as Record<string, unknown>[]) : [];
    if (!rows.length) return err(400, 'The file has no rows.');
    if (rows.length > 500) return err(400, 'Upload at most 500 brands at a time.');
    const norm = (h: string) => h.toLowerCase().replace(/\(.*\)/g, '').replace(/[^a-z]/g, '');
    const ALIAS: Record<string, string> = { brandname: 'name', name: 'name', brand: 'name', plan: 'plan', status: 'status', accountmanager: 'accountManager', accountmanageremail: 'accountManagerEmail', brandcontactemail: 'contactEmail', contactemail: 'contactEmail', notes: 'notes' };
    const existing = new Set((await db.listBrands()).map((b) => b.name.trim().toLowerCase()));
    let accepted = 0; const rejected: { row: number; reason: string }[] = [];
    for (const [i, raw] of rows.entries()) {
      const r: Record<string, string> = {};
      for (const [k, v] of Object.entries(raw)) { const f = ALIAS[norm(k)]; if (f) r[f] = String(v ?? '').trim(); }
      const row = i + 2;
      if (!r.name) { rejected.push({ row, reason: 'Brand name is empty.' }); continue; }
      if (existing.has(r.name.toLowerCase())) { rejected.push({ row, reason: `${r.name} already exists, skipped.` }); continue; }
      const input: Record<string, unknown> = {};
      if (r.status) input.status = r.status.toLowerCase();
      for (const k of ['accountManager', 'accountManagerEmail', 'contactEmail', 'notes'] as const) if (r[k]) input[k] = r[k];
      const fields = brandFields(input);
      if (typeof fields === 'string') { rejected.push({ row, reason: fields }); continue; }
      const brand = await db.createBrand(r.name.slice(0, 80), (r.plan ?? '').slice(0, 60), { status: 'onboarding', accountManager: who!.name || who!.email, accountManagerEmail: who!.email, ...fields });
      await db.addEvents(brand.id, [{ at: new Date().toISOString(), source: 'Loopretail', message: `Brand created by ${who!.email} (bulk CSV)`, level: 'info' }]);
      existing.add(r.name.toLowerCase()); accepted++;
    }
    return ok({ accepted, rejected });
  }

  /* ── Staff admin: every onboarded brand ── */
  if (parts[0] === 'admin') {
    if (!acc.isStaff(who)) return err(who ? 403 : 401, 'Staff only.');
    if (!db.dbConfigured()) return err(503, 'The database is not configured yet.');
    if (parts[1] === 'brands' && !parts[2] && method === 'GET') {
      const [brands, counts] = await Promise.all([db.listBrands(), db.userCounts()]);
      const rows = [];
      for (const b of brands) {
        const ds = await db.loadDataset(b.id);
        if (ds) rows.push(metrics.adminSummary(ds, counts[b.id] ?? 0));
      }
      const by = (s: string) => rows.filter((r) => r.brand.status === s).length;
      return ok({
        totals: { brands: rows.length, active: by('active'), onboarding: by('onboarding'), paused: by('paused'), churned: by('churned'), highCases: rows.reduce((a, r) => a + r.highCases, 0), needAttention: rows.filter((r) => r.health !== 'ok' && r.brand.status !== 'churned').length },
        brands: rows,
      });
    }
    if (parts[1] === 'brands' && parts[2]) {
      const id = parts[2];
      const brand = await db.getBrand(id);
      if (!brand) return err(404, 'Brand not found.');
      /* Dashboard settings for this brand */
      if (parts[3] === 'settings' && method === 'PATCH') {
        const cur = brandSettings(brand);
        const next: BrandSettings = brandSettings({ settings: { ...cur, ...(body as Partial<BrandSettings>) } });
        if (body.hiddenTabs !== undefined && !Array.isArray(body.hiddenTabs)) return err(400, 'hiddenTabs must be a list.');
        try { await db.updateBrand(id, { settings: next }); }
        catch (e) { return err(500, /settings|column/i.test((e as Error).message) ? 'Brand settings are missing in the database. Run supabase/portal.sql again.' : (e as Error).message); }
        await db.addEvents(id, [{ at: new Date().toISOString(), source: 'Loopretail', message: `Dashboard settings updated by ${who!.email}`, level: 'info' }]);
        return ok(next);
      }
      /* Every list behind the brand's dashboard, for staff to manage */
      if (parts[3] === 'data' && method === 'GET') {
        const ds = (await db.loadDataset(id))!;
        const snap = new Map<string, { title: string; price: number | null; day: string }>();
        for (const x of ds.snapshots) { const e = snap.get(x.asin); if (!e || x.day > e.day) snap.set(x.asin, { title: x.title, price: x.price, day: x.day }); }
        const weeks = <T extends { weekStart: string }>(rows: T[], val: (r: T) => number) => {
          const m = new Map<string, { week: string; rows: number; total: number }>();
          for (const r of rows) { const e = m.get(r.weekStart) ?? { week: r.weekStart, rows: 0, total: 0 }; e.rows++; e.total += val(r); m.set(r.weekStart, e); }
          return [...m.values()].map((w) => ({ ...w, total: Math.round(w.total * 100) / 100 })).sort((a, b) => b.week.localeCompare(a.week));
        };
        return ok({
          settings: brandSettings(brand),
          tabs: PORTAL_TABS,
          sellers: ds.sellers,
          competitors: ds.competitors.map((c) => ({ ...c, title: snap.get(c.asin)?.title ?? '', price: snap.get(c.asin)?.price ?? null, product: ds.products.find((p) => p.sku === c.sku)?.name ?? c.sku })),
          products: ds.products.map((p) => ({ sku: p.sku, name: p.name })),
          sheets: {
            sales: weeks(ds.sales, (r) => r.revenue),
            ads: weeks(ds.ads, (r) => r.spend),
            d2c: weeks(ds.d2c, (r) => r.revenue),
          },
        });
      }
      if (parts[3] === 'sellers' && method === 'POST') {
        const name = String(body.sellerName ?? '').trim().slice(0, 120);
        if (!name) return err(400, 'Seller name is required.');
        const sid = String(body.amazonSellerId ?? '').trim().toUpperCase();
        if (sid && !/^[A-Z0-9]{8,20}$/.test(sid)) return err(400, 'Amazon seller ID looks wrong: it is 8 to 20 letters and numbers, e.g. A1B2C3D4E5F6G7.');
        const until = String(body.validUntil ?? '').trim();
        if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) return err(400, 'Valid until must be a date (YYYY-MM-DD) or empty.');
        if (body.originalName && body.originalName !== name) await db.deleteSeller(id, String(body.originalName));
        await db.saveSellers(id, [{ sellerName: name, amazonSellerId: sid, ebayUsername: String(body.ebayUsername ?? '').trim().slice(0, 80), skus: String(body.skus ?? 'All').trim().slice(0, 2000) || 'All', validUntil: until }]);
        return ok({ saved: true });
      }
      if (parts[3] === 'sellers' && method === 'DELETE') {
        await db.deleteSeller(id, String(query.name ?? ''));
        return ok({ deleted: true });
      }
      if (parts[3] === 'products' && method === 'POST') {
        const sku = String(body.sku ?? '').trim().slice(0, 60);
        const name = String(body.name ?? '').trim().slice(0, 120);
        if (!sku || !name) return err(400, 'SKU and product name are required.');
        const asin = String(body.asin ?? '').trim().toUpperCase();
        if (asin && !/^[A-Z0-9]{10}$/.test(asin)) return err(400, 'ASIN must be 10 letters and numbers.');
        const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) && x >= 0 ? x : 0; };
        await db.saveProducts(id, [{ sku, name, asin, ean: String(body.ean ?? '').trim().slice(0, 20), cost: n(body.cost), rrp: n(body.rrp), mapPrice: n(body.mapPrice) }]);
        return ok({ saved: true });
      }
      if (parts[3] === 'competitors' && method === 'POST') {
        const sku = String(body.sku ?? '').trim();
        const asin = String(body.asin ?? '').trim().toUpperCase();
        if (!sku || !/^[A-Z0-9]{10}$/.test(asin)) return err(400, 'Pick a product and enter a 10 character ASIN.');
        const kind = body.kind === 'compatible' ? 'compatible' : 'competitor';
        await db.saveCompetitors(id, [{ sku, asin, kind, source: 'manual', createdAt: new Date().toISOString().slice(0, 10) }]);
        return ok({ saved: true });
      }
      if (parts[3] === 'rows' && method === 'DELETE') {
        const kind = String(query.kind ?? '');
        const week = String(query.week ?? '');
        if (!['sales', 'ads', 'd2c'].includes(kind) || !/^\d{4}-\d{2}-\d{2}$/.test(week)) return err(400, 'Say which sheet and week to delete.');
        await db.deleteWeek(id, kind as 'sales' | 'ads' | 'd2c', week);
        await db.addEvents(id, [{ at: new Date().toISOString(), source: 'Loopretail', message: `${kind} rows for week ${week} deleted by ${who!.email}`, level: 'warn' }]);
        return ok({ deleted: true });
      }
      /* Products on every marketplace */
      if (parts[3] === 'listings' && method === 'GET') {
        const ds = await db.loadDataset(id);
        return ok({ listings: metrics.listings(ds!), euMarkets: process.env.KEEPA_EU_MARKETS ?? 'DE,FR,IT,ES' });
      }
      /* Email permissions: which alerts and reports go to the brand */
      if (parts[3] === 'email') {
        const missing = (e: Error) => /email_settings|portal_email_log|column|relation/i.test(e.message);
        if (parts[4] === 'run' && method === 'POST') {
          const mode = body.mode === 'daily' ? 'daily' : 'instant';
          try { return ok(await alerts.run(id, mode, { dryRun: body.dryRun === true })); }
          catch (e) { if (missing(e as Error) || /alert_state|alert_prefs/i.test((e as Error).message)) return err(500, 'Alert columns are missing in the database. Run supabase/portal.sql again.'); throw e; }
        }
        if (parts[4] === 'test' && method === 'POST') {
          const kind = String(body.kind ?? '') as email.AlertKind | email.ReportKind;
          if (![...email.ALERT_KINDS, ...email.REPORT_KINDS].includes(kind)) return err(400, 'Unknown email type.');
          if (!mailConfigured()) return err(503, 'No email provider is set up yet, so test emails cannot be sent.');
          const p = email.preview((await db.loadDataset(id))!, kind);
          const r = await sendMail(who!.email, `[Test] ${p.subject}`, p.html);
          return r.ok ? ok({ sentTo: who!.email }) : err(502, r.detail);
        }
        if (parts[4] === 'preview' && method === 'GET') {
          const kind = String(query.kind ?? '') as email.AlertKind | email.ReportKind;
          if (![...email.ALERT_KINDS, ...email.REPORT_KINDS].includes(kind)) return err(400, 'Unknown email type.');
          const ds = await db.loadDataset(id);
          return ok(email.preview(ds!, kind));
        }
        if (method === 'GET') {
          const users = await db.brandUsers(id);
          const available = [...new Set([...users.users.map((u: { email: string }) => u.email), brand.contactEmail].filter(Boolean) as string[])];
          let settings = email.defaultSettings(), log: Awaited<ReturnType<typeof db.emailLog>> = [], ready = true;
          try { const c = email.cleanSettings(await db.getEmailSettings(id)); if (typeof c !== 'string') settings = c; log = await db.emailLog(id); }
          catch (e) { if (!missing(e as Error)) throw e; ready = false; }
          if (!settings.recipients.length && !settings.updatedAt) settings.recipients = available;
          return ok({ settings, available, log, ready, labels: email.EMAIL_LABELS, alertKinds: email.ALERT_KINDS, reportKinds: email.REPORT_KINDS, sending: Boolean(process.env.RESEND_API_KEY || process.env.POSTMARK_TOKEN) });
        }
        if (method === 'PATCH') {
          const c = email.cleanSettings(body);
          if (typeof c === 'string') return err(400, c);
          c.updatedAt = new Date().toISOString(); c.updatedBy = who!.email;
          try { await db.saveEmailSettings(id, c); }
          catch (e) { if (missing(e as Error)) return err(500, 'Email settings are missing in the database. Run supabase/portal.sql again.'); throw e; }
          await db.addEvents(id, [{ at: c.updatedAt, source: 'Loopretail', message: `Email permissions updated by ${who!.email}`, level: 'info' }]);
          return ok(c);
        }
      }
      if (method === 'GET' && !parts[3]) {
        const ds = await db.loadDataset(id);
        const users = await db.brandUsers(id);
        return ok({ brand, summary: metrics.adminSummary(ds!, users.users.length), home: metrics.home(ds!), users, openCases: ds!.cases.filter((c) => c.status === 'flagged' || c.status === 'reviewing').slice(0, 30) });
      }
      if (method === 'PATCH' && !parts[3]) {
        const fields = brandFields(body);
        if (typeof fields === 'string') return err(400, fields);
        if (body.name !== undefined) { const n = String(body.name).trim(); if (!n) return err(400, 'Brand name cannot be empty.'); fields.name = n.slice(0, 80); }
        if (body.plan !== undefined) fields.plan = String(body.plan).slice(0, 60);
        try { await db.updateBrand(id, fields); }
        catch (e) { return err(500, /column/i.test((e as Error).message) ? 'New brand fields are missing in the database. Run supabase/portal.sql again.' : (e as Error).message); }
        if (fields.status && fields.status !== brand.status) await db.addEvents(id, [{ at: new Date().toISOString(), source: 'Loopretail', message: `Status changed to ${fields.status} by ${who!.email}`, level: 'info' }]);
        return ok(await db.getBrand(id));
      }
      if (method === 'DELETE' && !parts[3]) {
        if (query.confirm !== id) return err(400, 'Confirm by sending the brand id.');
        await db.deleteBrand(id);
        return ok({ deleted: true });
      }
    }
    return err(404, `No admin route for ${method} ${path}`);
  }

  if (parts[0] !== 'brands' || !parts[1]) return err(404, `No portal route for ${method} ${path}`);
  const brandId = parts[1];
  const isDemo = brandId === 'demo';
  if (!acc.canView(who, brandId)) return err(who ? 403 : 401, who ? 'You do not have access to this brand.' : 'Sign in to view this brand.');
  if (!isDemo && !db.dbConfigured()) return err(503, 'The database is not configured yet.');
  const action = parts[3] !== undefined ? `${parts[2]}/${parts[3]}` : parts[2];
  const loadDs = async () => (isDemo ? demo() : await db.loadDataset(brandId));

  /* ── Read views ── */
  if (method === 'GET' && (VIEWS as readonly string[]).includes(parts[2])) {
    const ds = await loadDs();
    if (!ds) return err(404, 'Brand not found.');
    const weeks = Math.min(13, Math.max(1, Number(query.weeks) || 4));
    const base = { brand: acc.isStaff(who) ? ds.brand : publicBrand(ds.brand), demo: isDemo, canEdit: acc.canEdit(who, brandId), isStaff: acc.isStaff(who) };
    switch (parts[2]) {
      case 'home': return ok({ ...base, ...metrics.home(ds) });
      case 'overview': return ok({ ...base, ...metrics.overview(ds, weeks) });
      case 'channels': return ok({ ...base, ...metrics.channels(ds, weeks) });
      case 'protection': return ok({ ...base, ...metrics.protection(ds) });
      case 'analysis': return ok({ ...base, ...metrics.analysis(ds, query.sku) });
      case 'ads': return ok({ ...base, ...metrics.ads(ds, weeks) });
      case 'logistics': return ok({ ...base, ...metrics.logistics(ds) });
      case 'd2c': return ok({ ...base, ...metrics.d2c(ds, weeks) });
    }
  }
  if (method === 'GET' && parts[2] === 'products') {
    const ds = await loadDs();
    return ds ? ok(ds.products) : err(404, 'Brand not found.');
  }

  /* ── AI search ── */
  if (method === 'POST' && parts[2] === 'ask') {
    if (!ai.aiConfigured()) return err(503, 'AI search is not switched on yet (GEMINI_API_KEY missing).');
    const q = String(body.question ?? '').trim();
    if (q.length < 3) return err(400, 'Type a question first.');
    if (!ai.aiAllowed(who?.email ?? `anon:${brandId}`, who ? 40 : 10)) return err(429, 'Hourly question limit reached. Try again later.');
    const ds = await loadDs();
    if (!ds) return err(404, 'Brand not found.');
    try { return ok(await ai.ask(ds, q)); }
    catch (e) { return err(502, `AI could not answer: ${(e as Error).message}`); }
  }

  /* ── Ads: search term report (read) ── */
  if (method === 'GET' && parts[2] === 'searchterms') {
    const missing = (e: Error) => /portal_search_terms|relation|column/i.test(e.message);
    if (isDemo) {
      const up = st.demoReport(new Date().toISOString().slice(0, 10));
      return ok({ periods: [{ periodStart: up.periodStart, periodEnd: up.periodEnd, uploadedAt: new Date().toISOString(), terms: up.rows.length }], period: { periodStart: up.periodStart, periodEnd: up.periodEnd }, ready: true, ...st.analyse(up.rows) });
    }
    try {
      const periods = await db.searchTermPeriods(brandId);
      const [ps, pe] = String(query.period ?? '').split('_');
      const period = periods.find((x) => x.periodStart === ps && x.periodEnd === pe) ?? periods[0];
      if (!period) return ok({ periods, period: null, ready: true, summary: null, terms: [] });
      const rows = await db.loadSearchTerms(brandId, period.periodStart, period.periodEnd);
      return ok({ periods, period, ready: true, ...st.analyse(rows, brandSettings((await db.getBrand(brandId))).targetAcosPct) });
    } catch (e) {
      if (missing(e as Error)) return ok({ periods: [], period: null, ready: false, summary: null, terms: [] });
      throw e;
    }
  }

  /* Everything below changes data. */
  if (isDemo) return err(403, 'The demo brand is read only.');
  /* ── Each brand user's own email alerts (viewers too) ── */
  if (parts[2] === 'my-alerts') {
    if (!db.dbConfigured() || brandId === 'demo') return err(400, 'Email alerts are set per brand login.');
    if (who?.kind !== 'client') return err(400, 'Staff set alerts for the brand in admin → Emails. This page is for brand logins.');
    const missingCol = (e: Error) => /alert_prefs|email_settings|column/i.test(e.message);
    try {
      const set = email.cleanSettings(await db.getEmailSettings(brandId));
      const st = typeof set === 'string' ? email.defaultSettings() : set;
      const mine = (await db.userAlertPrefs(brandId)).find((u) => u.email === who.email);
      if (method === 'PATCH') {
        const p = alerts.cleanPrefs(body);
        await db.saveUserAlertPrefs(who.email, brandId, p);
        return ok({ saved: true });
      }
      if (method === 'GET') {
        const plan = alerts.audience(st, [{ email: who.email, prefs: mine?.prefs ?? {} }]).get(who.email)!;
        return ok({
          enabled: st.enabled, sending: mailConfigured(), email: who.email,
          alerts: email.ALERT_KINDS.map((k) => ({ kind: k, ...email.EMAIL_LABELS[k], allowed: st.alerts[k] !== 'off', brandDefault: st.alerts[k], mine: plan.alerts[k] })),
          reports: email.REPORT_KINDS.map((k) => ({ kind: k, ...email.EMAIL_LABELS[k], allowed: st.reports[k], mine: plan.reports[k] })),
        });
      }
    } catch (e) { if (missingCol(e as Error)) return err(500, 'Email alerts need a database update. Ask Loopretail to run supabase/portal.sql.'); throw e; }
  }

  if (!acc.canEdit(who, brandId)) return err(403, 'Your account can view this brand but not change it.');

  /* ── Team (staff only) ── */
  if (parts[2] === 'users') {
    if (!acc.isStaff(who)) return err(403, 'Only Loopretail staff can manage brand logins.');
    if (method === 'GET') return ok(await db.brandUsers(brandId));
    if (method === 'POST') {
      const email = String(body.email ?? '').trim().toLowerCase();
      const role = body.role === 'manager' ? 'manager' : 'viewer';
      if (!EMAIL.test(email)) return err(400, 'Enter a valid email address.');
      await db.ensureUser(email);
      await db.linkUser(email, brandId, role);
      const { token, hash } = acc.newInviteToken();
      await db.createInvite(hash, email, brandId, role);
      return ok({ email, role, invitePath: `/portal/invite/${token}`, expiresInDays: 7 });
    }
    if (method === 'DELETE') {
      await db.unlinkUser(String(query.email ?? ''), brandId);
      return ok({ removed: true });
    }
  }

  /* ── Sheet uploads ── */
  if (method === 'POST' && parts[2] === 'upload') {
    const kind = parts[3] as UploadKind;
    if (!KINDS.includes(kind)) return err(400, `Unknown upload type "${parts[3]}".`);
    const rows = Array.isArray(body.rows) ? (body.rows as Record<string, unknown>[]) : [];
    if (!rows.length) return err(400, 'The file has no rows.');
    if (rows.length > 20000) return err(400, 'Upload at most 20,000 rows at a time.');
    const ds = await db.loadDataset(brandId);
    if (!ds) return err(404, 'Brand not found.');
    const knownSkus = new Set(ds.products.map((p) => p.sku));
    if (kind === 'products') for (const r of rows) { const k = Object.keys(r).find((h) => h.toLowerCase().replace(/[^a-z]/g, '') === 'sku'); if (k) knownSkus.add(String(r[k])); }
    const { accepted, rejected } = validate(kind, rows, knownSkus);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (accepted.length) {
      if (kind === 'products') await db.saveProducts(brandId, accepted as any);
      if (kind === 'sales') await db.saveSales(brandId, accepted as any);
      if (kind === 'ads') await db.saveAds(brandId, accepted as any);
      if (kind === 'sellers') await db.saveSellers(brandId, accepted as any);
      if (kind === 'competitors') await db.saveCompetitors(brandId, accepted as any);
      if (kind === 'd2c') await db.saveD2c(brandId, accepted as any);
      await db.addEvents(brandId, [{ at: new Date().toISOString(), source: 'Manual sheet', message: `${kind[0].toUpperCase() + kind.slice(1)} uploaded by ${who?.email} (${accepted.length} rows${rejected.length ? `, ${rejected.length} rejected` : ''})`, level: rejected.length ? 'warn' : 'ok' }]);
    }
    return ok({ accepted: accepted.length, rejected });
  }

  /* ── Ads: search term report (upload, delete) ── */
  if (parts[2] === 'searchterms' && method === 'POST') {
    const up = st.cleanUpload(body.report);
    if (typeof up === 'string') return err(400, up);
    try { await db.saveSearchTerms(brandId, up); }
    catch (e) { if (/portal_search_terms|relation/i.test((e as Error).message)) return err(500, 'Search term reports are missing in the database. Run supabase/portal.sql again.'); throw e; }
    await db.addEvents(brandId, [{ at: new Date().toISOString(), source: 'Amazon Ads', message: `Search term report uploaded by ${who?.email} (${up.rows.length} terms, ${up.periodStart} to ${up.periodEnd})`, level: 'ok' }]);
    return ok({ terms: up.rows.length, periodStart: up.periodStart, periodEnd: up.periodEnd, currency: up.currency });
  }
  if (parts[2] === 'searchterms' && method === 'DELETE') {
    const [ps, pe] = String(query.period ?? '').split('_');
    if (!ps || !pe) return err(400, 'Say which period to delete.');
    await db.deleteSearchTerms(brandId, ps, pe);
    return ok({ deleted: true });
  }

  /* ── Products: import from ASINs (Keepa), edit, delete ── */
  if (method === 'POST' && action === 'products/import') {
    if (!keepaConfigured()) return err(503, 'Keepa is not configured yet.');
    const asins = String(body.asins ?? '').split(/[\s,;]+/).filter(Boolean);
    return ok(await importAsins(brandId, asins));
  }
  if (parts[2] === 'products' && parts[3] && method === 'PATCH') {
    const patch: { name?: string; cost?: number; rrp?: number; mapPrice?: number } = {};
    if (body.name !== undefined) patch.name = String(body.name).slice(0, 120);
    for (const f of ['cost', 'rrp', 'mapPrice'] as const) if (body[f] !== undefined) { const n = num(body[f]); if (n == null) return err(400, `${f} must be a number.`); patch[f] = n; }
    await db.updateProduct(brandId, parts[3], patch);
    return ok({ updated: true });
  }
  if (parts[2] === 'products' && parts[3] && method === 'DELETE') {
    await db.deleteProduct(brandId, parts[3]);
    return ok({ deleted: true });
  }

  /* ── Keepa ── */
  if (method === 'POST' && action === 'keepa/sync') {
    if (!acc.isStaff(who)) return err(403, 'Keepa checks run automatically every day.');
    if (!keepaConfigured()) return err(503, 'Keepa is not configured. Add KEEPA_API_KEY to the server environment.');
    return ok(await syncBrand(brandId));
  }
  if (method === 'POST' && action === 'keepa/discover') {
    if (!keepaConfigured()) return err(503, 'Keepa is not configured yet.');
    const sku = String(body.sku ?? '');
    if (!sku) return err(400, 'Pick a product first.');
    if (!ai.aiAllowed(`discover:${who?.email}`, 15)) return err(429, 'Hourly search limit reached. Try again later.');
    return ok(await discoverCompetitors(brandId, sku, String(body.keywords ?? '')));
  }

  if (parts[2] === 'competitors' && method === 'DELETE') {
    await db.deleteCompetitor(brandId, String(query.sku ?? ''), String(query.asin ?? ''));
    return ok({ deleted: true });
  }

  /* ── Test buys: log what arrived; a grey or UK verdict reclassifies the seller case straight away ── */
  if (method === 'POST' && parts[2] === 'cases' && parts[3] && parts[4] === 'testbuy') {
    const ds = await db.loadDataset(brandId);
    const c = ds?.cases.find((x) => x.id === parts[3]);
    if (!ds || !c) return err(404, 'Case not found.');
    if (c.type !== 'unauthorised_seller' && c.type !== 'grey_market') return err(400, 'Test buys are logged on unauthorised seller and grey market cases.');
    const verdict = String(body.verdict ?? '') as TestBuyVerdict;
    if (!TEST_BUY_VERDICTS.includes(verdict)) return err(400, 'Pick a verdict: UK stock, grey market stock, counterfeit or unclear.');
    const day = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? '')) ? String(v) : '');
    const at = new Date().toISOString();
    const tb: TestBuy = {
      id: `tb-${Date.now().toString(36)}`,
      at, by: who?.email ?? 'unknown',
      orderedOn: day(body.orderedOn) || at.slice(0, 10),
      receivedOn: day(body.receivedOn),
      packaging: String(body.packaging ?? '').trim().slice(0, 500),
      batchCode: String(body.batchCode ?? '').trim().slice(0, 120),
      notes: String(body.notes ?? '').trim().slice(0, 2000),
      verdict,
    };
    const updated: ProtectionCase = {
      ...c, updatedAt: at,
      severity: verdict === 'counterfeit' ? 'high' : c.severity,
      testBuys: [...(c.testBuys ?? []), tb],
      actions: [...c.actions, { at, by: tb.by, note: `Test buy logged: ${verdict.replace('_', ' ')}${tb.batchCode ? `, batch ${tb.batchCode}` : ''}` }],
    };
    await db.saveCases(brandId, [updated]);
    // re-run the rules so the seller lands in the right case type now, not at the next daily check
    const next = { ...ds, cases: ds.cases.map((x) => (x.id === updated.id ? updated : x)) };
    const opened = newCases(next);
    const resolved = autoResolve(next);
    if (opened.length || resolved.length) await db.saveCases(brandId, [...opened, ...resolved]);
    const movedTo = opened.find((o) => o.asin === c.asin && o.sellerId === c.sellerId);
    return ok({ case: resolved.find((r) => r.id === c.id) ?? updated, movedTo: movedTo ?? null });
  }

  /* ── Case workflow ── */
  if (method === 'PATCH' && parts[2] === 'cases' && parts[3]) {
    const ds = await db.loadDataset(brandId);
    const c = ds?.cases.find((x) => x.id === parts[3]);
    if (!ds || !c) return err(404, 'Case not found.');
    const status = body.status ? (String(body.status) as CaseStatus) : c.status;
    if (!STATUSES.includes(status)) return err(400, 'Unknown status.');
    const at = new Date().toISOString();
    const note = String(body.note ?? '').trim().slice(0, 2000);
    const updated: ProtectionCase = { ...c, status, updatedAt: at, actions: [...c.actions, { at, by: who?.email ?? 'unknown', note: note || `Status changed to ${status}` }] };
    await db.saveCases(brandId, [updated]);
    return ok(updated);
  }

  return err(404, `No portal route for ${method} ${path}`);
}
