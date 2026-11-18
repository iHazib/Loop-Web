import type { Dataset, ProtectionCase } from './types.js';
import * as metrics from './metrics.js';
import * as email from './email.js';
import * as db from './db.js';
import { mailConfigured, sendMail } from './mailer.js';

/* Alert emails (#9 to #12) and per user choices (#13).

   What counts as an alert: every kind turns the brand's current data into items with a stable key
   (a case id, a SKU and week for low stock, a competitor ASIN). An item is emailed once per mode:
   instant runs after each daily Keepa check, the daily digest runs once a day and also carries the
   weekly report on Mondays and the monthly review on the 1st.

   Who gets what: staff set each kind to off, instant or daily digest for the brand (admin → Emails).
   Off means nobody at the brand gets it. Otherwise addresses on the brand's list get the staff choice,
   and each brand user can pick their own (portal → Home → Your email alerts), which wins for them.

   The first run for a brand only records what is already there, so nobody gets a backlog. Nothing is
   marked as sent until an email provider is set up, so alerts are not lost before then. */

type Mode = email.AlertMode;
type Kind = email.AlertKind;
type ReportKind = email.ReportKind;
export interface AlertItem { key: string; title: string; detail: string }

const open = (c: ProtectionCase) => c.status === 'flagged' || c.status === 'reviewing';
const mondayOf = (d: Date) => { const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x.toISOString().slice(0, 10); };

export function items(ds: Dataset, kind: Kind, now = new Date()): AlertItem[] {
  const cases = (types: ProtectionCase['type'][]) => ds.cases.filter((c) => open(c) && types.includes(c.type)).map((c) => ({ key: `case:${c.id}`, title: c.title, detail: c.detail }));
  switch (kind) {
    case 'unauthorised_seller': return cases(['unauthorised_seller']);
    case 'grey_market': return cases(['grey_market']);
    case 'buybox': return cases(['buybox_lost']);
    case 'listing_changed': return cases(['listing_changed']);
    case 'price': {
      const out = cases(['price_below_min']);
      for (const p of metrics.analysis(ds).products) {
        if (p.cheapest === false && p.price != null && p.lowestCompetitor != null && p.price - p.lowestCompetitor > 0.5)
          out.push({ key: `undercut:${p.sku}:${p.lowestCompetitor.toFixed(2)}`, title: `Undercut on ${p.name}`, detail: `You £${p.price.toFixed(2)}, lowest rival £${p.lowestCompetitor.toFixed(2)}` });
      }
      return out;
    }
    case 'supply_chain': {
      const wk = mondayOf(now);
      return metrics.logistics(ds).reorder.map((s) => ({
        key: `stock:${s.sku}:${wk}`,
        title: s.total <= 0 ? `${s.name} is out of stock` : `${s.name}: ${s.weeksCover} weeks of stock left`,
        detail: `${s.total} units, selling about ${s.weeklyUnits} a week`,
      }));
    }
    case 'new_product': {
      const snap = new Map(ds.snapshots.map((s) => [s.asin, s]));
      const name = (sku: string) => ds.products.find((p) => p.sku === sku)?.name ?? sku;
      return [
        ...ds.competitors.map((c) => ({ key: `comp:${c.sku}:${c.asin}`, title: snap.get(c.asin)?.title || c.asin, detail: `New ${c.kind} listing for ${name(c.sku)}${snap.get(c.asin)?.price != null ? `, £${snap.get(c.asin)!.price!.toFixed(2)}` : ''}` })),
        ...ds.products.map((p) => ({ key: `prod:${p.sku}`, title: `${p.name} added`, detail: `Now tracked${p.asin ? ` on Amazon UK as ${p.asin}` : ''}` })),
      ];
    }
  }
}

/* ── Who gets what ── */

export interface UserPrefs { alerts: Partial<Record<Kind, Mode>>; reports: Partial<Record<ReportKind, boolean>> }
export function cleanPrefs(raw: unknown): UserPrefs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>;
  const out: UserPrefs = { alerts: {}, reports: {} };
  for (const k of email.ALERT_KINDS) if (['off', 'instant', 'daily'].includes(r.alerts?.[k])) out.alerts[k] = r.alerts[k];
  for (const k of email.REPORT_KINDS) if (typeof r.reports?.[k] === 'boolean') out.reports[k] = r.reports[k];
  return out;
}
type Plan = { alerts: Record<Kind, Mode>; reports: Record<ReportKind, boolean> };

export function audience(s: email.EmailSettings, users: { email: string; prefs: unknown }[]): Map<string, Plan> {
  const m = new Map<string, Plan>();
  const listed = new Set(s.recipients);
  const base = (on: boolean): Plan => ({
    alerts: Object.fromEntries(email.ALERT_KINDS.map((k) => [k, on ? s.alerts[k] : 'off'])) as Record<Kind, Mode>,
    reports: Object.fromEntries(email.REPORT_KINDS.map((k) => [k, on && s.reports[k]])) as Record<ReportKind, boolean>,
  });
  for (const e of listed) m.set(e, base(true));
  for (const u of users) {
    const p = cleanPrefs(u.prefs);
    const plan = base(listed.has(u.email));
    for (const k of email.ALERT_KINDS) if (s.alerts[k] !== 'off' && p.alerts[k]) plan.alerts[k] = p.alerts[k]!;
    for (const k of email.REPORT_KINDS) if (s.reports[k] && p.reports[k] !== undefined) plan.reports[k] = p.reports[k]!;
    m.set(u.email, plan);
  }
  return m;
}

/* ── One run ── */

type State = { baseline?: string; sent?: Record<Mode, Partial<Record<Kind, string[]>>>; lastReport?: Partial<Record<ReportKind, string>> };
export interface RunResult { brandId: string; mode: 'instant' | 'daily'; status: string; emails: { to: string; subject: string; items: number; sent: boolean; detail: string }[]; fresh: Partial<Record<Kind, number>> }

function compose(brand: string, brandId: string, mode: 'instant' | 'daily', byKind: [Kind, AlertItem[]][]) {
  const total = byKind.reduce((n, [, i]) => n + i.length, 0);
  const one = byKind.length === 1 ? email.EMAIL_LABELS[byKind[0][0]].label : null;
  const subject = mode === 'daily'
    ? `${brand}: daily alerts, ${total} new`
    : one ? `${brand}: ${one.toLowerCase()} (${total} new)` : `${brand}: ${total} new alerts`;
  const list = byKind.flatMap(([k, its]) => its.slice(0, 10).map((i) => ({ title: byKind.length > 1 ? `${email.EMAIL_LABELS[k].label}: ${i.title}` : i.title, detail: i.detail })));
  const path = byKind.every(([k]) => k === 'supply_chain') ? `/portal/${brandId}/logistics` : byKind.every(([k]) => k === 'new_product') ? `/portal/${brandId}/analysis` : `/portal/${brandId}/protection`;
  const intro = mode === 'daily' ? 'New since yesterday. Each item links back to your dashboard.' : 'Found in today\'s check of your listings.';
  return { subject, html: email.shell(brand, one ?? (mode === 'daily' ? 'Your daily alerts' : 'New alerts'), intro, list, { label: 'Open your dashboard', path }), items: total };
}

export async function run(brandId: string, mode: 'instant' | 'daily', opts: { now?: Date; dryRun?: boolean } = {}): Promise<RunResult> {
  const now = opts.now ?? new Date();
  const res: RunResult = { brandId, mode, status: '', emails: [], fresh: {} };
  const cs = email.cleanSettings(await db.getEmailSettings(brandId));
  if (typeof cs === 'string' || !cs.enabled) { res.status = 'Emails are switched off for this brand.'; return res; }
  const ds = await db.loadDataset(brandId);
  if (!ds) { res.status = 'Brand not found.'; return res; }
  const state: State = await db.getAlertState(brandId);
  const all = Object.fromEntries(email.ALERT_KINDS.map((k) => [k, items(ds, k, now)])) as Record<Kind, AlertItem[]>;

  if (!state.baseline) {
    const keys = Object.fromEntries(email.ALERT_KINDS.map((k) => [k, all[k].map((i) => i.key)]));
    if (!opts.dryRun) await db.saveAlertState(brandId, { baseline: now.toISOString(), sent: { instant: keys, daily: keys, off: {} }, lastReport: {} });
    res.status = 'First run: recorded what is already open, so only new items are emailed from now on.';
    return res;
  }
  const sent = state.sent ?? { instant: {}, daily: {}, off: {} };
  const fresh = Object.fromEntries(email.ALERT_KINDS.map((k) => {
    const seen = new Set(sent[mode]?.[k] ?? []);
    return [k, all[k].filter((i) => !seen.has(i.key))];
  })) as Record<Kind, AlertItem[]>;
  for (const k of email.ALERT_KINDS) if (fresh[k].length) res.fresh[k] = fresh[k].length;

  const who = audience(cs, await db.userAlertPrefs(brandId));
  const live = mailConfigured() && !opts.dryRun;
  const out: { to: string; subject: string; html: string; items: number; kind: string }[] = [];
  for (const [to, plan] of who) {
    const byKind = email.ALERT_KINDS.filter((k) => plan.alerts[k] === mode && fresh[k].length).map((k) => [k, fresh[k]] as [Kind, AlertItem[]]);
    if (byKind.length) out.push({ to, ...compose(ds.brand.name, brandId, mode, byKind), kind: mode === 'daily' ? 'daily_digest' : byKind.length === 1 ? byKind[0][0] : 'alerts' });
  }
  // Reports ride on the daily run: weekly on Mondays, monthly on the 1st.
  const today = now.toISOString().slice(0, 10);
  const due: ReportKind[] = mode === 'daily' ? email.REPORT_KINDS.filter((k) => (k === 'weekly_report' ? now.getUTCDay() === 1 : now.getUTCDate() === 1) && state.lastReport?.[k] !== today) : [];
  for (const k of due) {
    const p = email.preview(ds, k);
    for (const [to, plan] of who) if (plan.reports[k]) out.push({ to, subject: p.subject, html: p.html, items: p.items, kind: k });
  }

  for (const m of out) {
    const r = live ? await sendMail(m.to, m.subject, m.html) : { ok: false, detail: opts.dryRun ? 'Dry run' : 'No email provider set up' };
    res.emails.push({ to: m.to, subject: m.subject, items: m.items, sent: r.ok, detail: r.detail });
    if (live) await db.logEmail(brandId, { kind: m.kind, subject: m.subject, recipients: [m.to], status: r.ok ? 'sent' : 'failed', detail: r.detail }).catch(() => undefined);
  }
  if (live) {
    for (const k of email.ALERT_KINDS) {
      if (!fresh[k].length) continue;
      sent[mode] = sent[mode] ?? {};
      sent[mode][k] = [...(sent[mode][k] ?? []), ...fresh[k].map((i) => i.key)].slice(-1500);
    }
    const lastReport = { ...(state.lastReport ?? {}) };
    for (const k of due) lastReport[k] = today;
    await db.saveAlertState(brandId, { ...state, sent, lastReport });
  }
  res.status = !out.length ? 'Nothing new to send.' : live ? `Sent ${res.emails.filter((e) => e.sent).length} of ${out.length} emails.` : opts.dryRun ? `${out.length} emails would go out.` : `${out.length} emails ready, but no email provider is set up yet, so nothing was sent.`;
  return res;
}
