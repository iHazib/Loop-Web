import * as db from './db.js';
import * as metrics from './metrics.js';
import { demoDataset } from './demo.js';
import { keepaConfigured, tokenStatus } from './keepa.js';
import { syncBrand, discoverCompetitors, importAsins } from './sync.js';
import { validate, TEMPLATES, type UploadKind } from './validate.js';
import * as ai from './ai.js';
import * as acc from './access.js';
import type { Dataset, ProtectionCase, CaseStatus } from './types.js';

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

const VIEWS = ['overview', 'channels', 'protection', 'analysis', 'ads', 'logistics', 'd2c'] as const;
const KINDS: UploadKind[] = ['products', 'sales', 'ads', 'sellers', 'competitors', 'd2c'];
const STATUSES: CaseStatus[] = ['flagged', 'reviewing', 'clear', 'resolved'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const num = (v: unknown) => { const n = Number(String(v ?? '').replace(/[£,\s]/g, '')); return Number.isFinite(n) && n >= 0 ? n : null; };

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
      return ok(all.filter((b) => who.brands[b.id]));
    }
    if (method === 'POST') {
      if (!acc.isStaff(who)) return err(403, 'Only Loopretail staff can add brands.');
      const name = String(body.name ?? '').trim();
      if (!name) return err(400, 'Brand name is required.');
      return ok(await db.createBrand(name, String(body.plan ?? '')));
    }
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
    const base = { brand: ds.brand, demo: isDemo, canEdit: acc.canEdit(who, brandId), isStaff: acc.isStaff(who) };
    switch (parts[2]) {
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

  /* Everything below changes data. */
  if (isDemo) return err(403, 'The demo brand is read only.');
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
