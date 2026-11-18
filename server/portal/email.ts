import type { Dataset, ProtectionCase } from './types.js';
import { CASE_HELP } from './types.js';
import * as metrics from './metrics.js';

/* Which emails go to a brand, decided by Loopretail staff per brand.
   Settings live on the brand (portal_brands.email_settings). Previews render from the
   brand's current data, so staff see exactly what the brand would get today.
   Sending is switched on once an email provider is set up; the log records every send. */

export const ALERT_KINDS = [
  'unauthorised_seller',
  'grey_market',
  'price',
  'buybox',
  'listing_changed',
  'supply_chain',
  'new_product',
] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];
export type AlertMode = 'off' | 'instant' | 'daily';

export const REPORT_KINDS = ['weekly_report', 'monthly_review'] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];

export const EMAIL_LABELS: Record<AlertKind | ReportKind, { label: string; help: string }> = {
  unauthorised_seller: { label: 'Unauthorised sellers', help: CASE_HELP.unauthorised_seller ?? '' },
  grey_market: { label: 'Grey market stock', help: CASE_HELP.grey_market ?? '' },
  price: { label: 'Price alerts', help: 'A listing drops below the minimum price, or a rival undercuts you on a key product.' },
  buybox: { label: 'Buy Box lost', help: 'A seller who is not authorised takes the Buy Box.' },
  listing_changed: { label: 'Listing changes', help: 'Title, brand or images changed on one of your listings.' },
  supply_chain: { label: 'Supply chain', help: 'Low stock cover and products about to run out.' },
  new_product: { label: 'New products', help: 'New competitor or compatible listings found this week.' },
  weekly_report: { label: 'Weekly report', help: 'Sales, ads, stock and protection in one summary every Monday.' },
  monthly_review: { label: 'Monthly review', help: 'The month in numbers, with what to fix and which channel comes next.' },
};

export interface EmailSettings {
  enabled: boolean; // master switch for this brand
  recipients: string[];
  alerts: Record<AlertKind, AlertMode>;
  reports: Record<ReportKind, boolean>;
  updatedAt?: string;
  updatedBy?: string;
}

export function defaultSettings(): EmailSettings {
  return {
    enabled: false,
    recipients: [],
    alerts: { unauthorised_seller: 'instant', grey_market: 'instant', price: 'instant', buybox: 'instant', listing_changed: 'daily', supply_chain: 'daily', new_product: 'off' },
    reports: { weekly_report: true, monthly_review: false },
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Merges a stored or posted value onto the defaults, dropping anything unknown. */
export function cleanSettings(raw: unknown): EmailSettings | string {
  const d = defaultSettings();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, any>;
  const out: EmailSettings = { ...d, alerts: { ...d.alerts }, reports: { ...d.reports } };
  if (typeof r.enabled === 'boolean') out.enabled = r.enabled;
  if (Array.isArray(r.recipients)) {
    const list = [...new Set(r.recipients.map((x: unknown) => String(x).trim().toLowerCase()).filter(Boolean))] as string[];
    const bad = list.find((x) => !EMAIL.test(x));
    if (bad) return `${bad} is not a valid email address.`;
    if (list.length > 20) return 'Add at most 20 recipients.';
    out.recipients = list;
  }
  for (const k of ALERT_KINDS) if (['off', 'instant', 'daily'].includes(r.alerts?.[k])) out.alerts[k] = r.alerts[k];
  for (const k of REPORT_KINDS) if (typeof r.reports?.[k] === 'boolean') out.reports[k] = r.reports[k];
  if (typeof r.updatedAt === 'string') out.updatedAt = r.updatedAt;
  if (typeof r.updatedBy === 'string') out.updatedBy = r.updatedBy;
  return out;
}

/* ── Previews ── */

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const isOpen = (c: ProtectionCase) => c.status === 'flagged' || c.status === 'reviewing';

type Item = { title: string; detail: string };

function shell(brand: string, heading: string, intro: string, items: Item[], cta: { label: string; path: string }) {
  const rows = items.map((i) => `<tr><td style="padding:12px 0;border-top:1px solid #dfe2de"><div style="font-weight:600;color:#121614">${esc(i.title)}</div><div style="color:#5c635f;font-size:14px;margin-top:2px">${esc(i.detail)}</div></td></tr>`).join('');
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#f3f4f2;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px">
<div style="font-weight:700;color:#e6192b;font-size:15px">Loopretail</div>
<h1 style="font-size:22px;color:#121614;margin:14px 0 6px">${esc(heading)}</h1>
<p style="color:#5c635f;font-size:15px;margin:0 0 12px">${esc(intro)}</p>
<table style="width:100%;border-collapse:collapse;font-size:15px">${rows}</table>
<a href="https://loopretail.io${cta.path}" style="display:inline-block;margin-top:18px;background:#e6192b;color:#ffffff;text-decoration:none;font-weight:600;padding:11px 16px;border-radius:10px">${esc(cta.label)}</a>
<p style="color:#8a918d;font-size:12px;margin-top:22px">You get this because ${esc(brand)} is set up for these emails with Loopretail. Reply to this email to reach your account manager.</p>
</div></div>`;
}

export function preview(ds: Dataset, kind: AlertKind | ReportKind) {
  const brand = ds.brand.name;
  const id = ds.brand.id;
  const cases = (t: ProtectionCase['type'][]) => ds.cases.filter((c) => isOpen(c) && t.includes(c.type)).slice(0, 8).map((c) => ({ title: c.title, detail: c.detail }));
  let subject = '', heading = '', intro = '', items: Item[] = [], cta = { label: 'Open Loop Protect', path: `/portal/${id}/protection` };

  switch (kind) {
    case 'unauthorised_seller':
      items = cases(['unauthorised_seller']);
      subject = `${items.length} unauthorised seller${items.length === 1 ? '' : 's'} on your Amazon listings`;
      heading = 'Unauthorised sellers'; intro = `${CASE_HELP.unauthorised_seller} We have opened a case for each one.`;
      break;
    case 'grey_market':
      items = cases(['grey_market']);
      subject = `Grey market stock found on ${items.length} listing${items.length === 1 ? '' : 's'}`;
      heading = 'Grey market stock'; intro = `${CASE_HELP.grey_market} Each case lists the signals and any test buy.`;
      break;
    case 'price': {
      items = cases(['price_below_min']);
      const an = metrics.analysis(ds);
      for (const p of an.products) if (p.cheapest === false && p.price != null && p.lowestCompetitor != null && p.price - p.lowestCompetitor > 0.5) items.push({ title: `Undercut on ${p.name}`, detail: `You £${p.price.toFixed(2)}, lowest rival £${p.lowestCompetitor.toFixed(2)}` });
      subject = `Price alerts: ${items.length} to look at`;
      heading = 'Price alerts'; intro = 'Sellers below your minimum price, and rivals now cheaper than you on key products.';
      break;
    }
    case 'buybox':
      items = cases(['buybox_lost']);
      subject = `Buy Box lost on ${items.length} listing${items.length === 1 ? '' : 's'}`;
      heading = 'Buy Box lost'; intro = 'A seller who is not authorised holds the Buy Box, so shoppers see their offer instead of yours.';
      break;
    case 'listing_changed':
      items = cases(['listing_changed']);
      subject = `${items.length} listing change${items.length === 1 ? '' : 's'} detected`;
      heading = 'Listing changes'; intro = 'These listings changed since the last check. Before and after are saved in each case.';
      break;
    case 'supply_chain': {
      const lg = metrics.logistics(ds);
      items = lg.reorder.map((s) => ({ title: `${s.name}: ${s.weeksCover} weeks of stock left`, detail: `${s.total} units, selling about ${s.weeklyUnits} a week` }));
      subject = `Stock: ${items.length} product${items.length === 1 ? '' : 's'} under 4 weeks of cover`;
      heading = 'Supply chain'; intro = 'Products that will run out within four weeks at the current rate of sale.';
      cta = { label: 'Open stock', path: `/portal/${id}/logistics` };
      break;
    }
    case 'new_product': {
      const latest = ds.competitors.reduce((m, c) => (c.createdAt > m ? c.createdAt : m), '');
      const since = latest ? new Date(new Date(latest).getTime() - 7 * 86_400_000).toISOString().slice(0, 10) : '';
      const snap = new Map(ds.snapshots.map((s) => [s.asin, s]));
      items = ds.competitors.filter((c) => c.createdAt >= since).slice(0, 8).map((c) => ({ title: snap.get(c.asin)?.title || c.asin, detail: `New ${c.kind} listing for ${ds.products.find((p) => p.sku === c.sku)?.name ?? c.sku}${snap.get(c.asin)?.price != null ? `, £${snap.get(c.asin)!.price!.toFixed(2)}` : ''}` }));
      subject = `${items.length} new competitor listing${items.length === 1 ? '' : 's'} this week`;
      heading = 'New products'; intro = 'New competitor and compatible listings found on Amazon UK this week.';
      cta = { label: 'Open Brand Analysis', path: `/portal/${id}/analysis` };
      break;
    }
    case 'weekly_report':
    case 'monthly_review': {
      const h = metrics.home(ds);
      items = h.attention.slice(0, 5).map((a) => ({ title: a.title, detail: a.detail }));
      subject = kind === 'weekly_report' ? `${brand}: your weekly report` : `${brand}: your monthly review`;
      heading = kind === 'weekly_report' ? 'Your week in numbers' : 'Your month in numbers';
      intro = 'The full report is in your dashboard. These need your attention first:';
      cta = { label: 'Open the report', path: `/portal/${id}/report` };
      break;
    }
  }
  const empty = !items.length;
  if (empty) items = [{ title: 'Nothing to report right now', detail: 'This email is only sent when there is something in it.' }];
  return { kind, subject, html: shell(brand, heading, intro, items, cta), items: empty ? 0 : items.length };
}
