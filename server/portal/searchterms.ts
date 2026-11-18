/* Sponsored Products search term report.
   The brand (or Loopretail) uploads Amazon Ads' "Search term" report as it is exported
   (CSV or XLSX, converted to rows in the browser). We read it by header name, total it per
   search term, then flag:
   - wasted spend: clicks with no orders,
   - winners: converting terms at or under the target ACoS that are not yet exact match keywords,
   - bid down: converting terms well over the target ACoS,
   - negatives: wasted spend terms that came through broad, phrase or auto targeting. */

export interface SearchTermRow {
  campaign: string;
  adGroup: string;
  targeting: string;
  matchType: string; // BROAD / PHRASE / EXACT / '-' for auto and product targeting
  searchTerm: string;
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  units: number;
}
export interface SearchTermUpload { periodStart: string; periodEnd: string; rows: SearchTermRow[]; currency: string }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const ALIASES: Record<string, string[]> = {
  date: ['date', 'day'],
  startDate: ['startdate', 'reportstartdate'],
  endDate: ['enddate', 'reportenddate'],
  currency: ['currency'],
  campaign: ['campaignname', 'campaign'],
  adGroup: ['adgroupname', 'adgroup'],
  targeting: ['targeting', 'keyword', 'keywordtext', 'target'],
  matchType: ['matchtype'],
  searchTerm: ['customersearchterm', 'searchterm', 'query'],
  impressions: ['impressions'],
  clicks: ['clicks'],
  spend: ['spend', 'cost', 'spend£', 'totalspend'],
  sales: ['7daytotalsales', '14daytotalsales', '30daytotalsales', '7daytotalsales£', 'totalsales', 'sales', 'adsales', 'attributedsales7d', 'sales7d'],
  orders: ['7daytotalorders', '14daytotalorders', '30daytotalorders', 'totalorders', 'orders', 'purchases7d', 'purchases'],
  units: ['7daytotalunits', '14daytotalunits', '30daytotalunits', 'totalunits', 'units', 'unitssoldclicks7d'],
};

const num = (v: unknown) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = String(v ?? '').replace(/[£€$,%\s]/g, '').replace(/^\((.*)\)$/, '-$1');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};
const MONTHS: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
/** Accepts 2026-11-01, 01/11/2026 (UK order), Nov 01, 2026, 1 Nov 2026 or an Excel serial number. */
export function toDay(v: unknown): string {
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  if (typeof v === 'number' && v > 30000 && v < 80000) return new Date(Math.round((v - 25569) * 86_400_000)).toISOString().slice(0, 10);
  const s = String(v ?? '').trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = s.match(/^([A-Za-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4})$/);
  if (m && MONTHS[m[1].toLowerCase()] != null) return new Date(Date.UTC(+m[3], MONTHS[m[1].toLowerCase()], +m[2])).toISOString().slice(0, 10);
  m = s.match(/^(\d{1,2}) ([A-Za-z]{3})[a-z]*\.? (\d{4})$/);
  if (m && MONTHS[m[2].toLowerCase()] != null) return new Date(Date.UTC(+m[3], MONTHS[m[2].toLowerCase()], +m[1])).toISOString().slice(0, 10);
  return '';
}

/** Turns the uploaded rows into one row per campaign + ad group + target + search term. */
export function parseReport(raw: Record<string, unknown>[]): SearchTermUpload | string {
  if (!raw.length) return 'The file has no rows.';
  const headers = Object.keys(raw[0]);
  const col: Record<string, string | undefined> = {};
  for (const [field, aliases] of Object.entries(ALIASES)) col[field] = headers.find((h) => aliases.includes(norm(h)));
  const missing = ['searchTerm', 'clicks', 'spend'].filter((f) => !col[f]);
  if (missing.length) return `This does not look like a search term report: no ${missing.map((m) => (m === 'searchTerm' ? '"Customer Search Term"' : `"${m[0].toUpperCase()}${m.slice(1)}"`)).join(', ')} column. Download it from Amazon Ads: Reports, Sponsored Products, Search term.`;

  const get = (r: Record<string, unknown>, f: string) => (col[f] ? r[col[f]!] : undefined);
  const days: string[] = [];
  const merged = new Map<string, SearchTermRow>();
  let currency = '';
  for (const r of raw) {
    const term = String(get(r, 'searchTerm') ?? '').trim();
    if (!term) continue;
    for (const f of ['date', 'startDate', 'endDate']) { const d = toDay(get(r, f)); if (d) days.push(d); }
    if (!currency && get(r, 'currency')) currency = String(get(r, 'currency'));
    const row: SearchTermRow = {
      campaign: String(get(r, 'campaign') ?? '').trim(),
      adGroup: String(get(r, 'adGroup') ?? '').trim(),
      targeting: String(get(r, 'targeting') ?? '').trim(),
      matchType: String(get(r, 'matchType') ?? '').trim().toUpperCase() || '-',
      searchTerm: term.toLowerCase(),
      impressions: num(get(r, 'impressions')),
      clicks: num(get(r, 'clicks')),
      spend: num(get(r, 'spend')),
      sales: num(get(r, 'sales')),
      orders: num(get(r, 'orders')),
      units: num(get(r, 'units')),
    };
    const k = [row.campaign, row.adGroup, row.targeting, row.matchType, row.searchTerm].join('\u0001');
    const ex = merged.get(k);
    if (ex) for (const f of ['impressions', 'clicks', 'spend', 'sales', 'orders', 'units'] as const) ex[f] += row[f];
    else merged.set(k, row);
  }
  if (!merged.size) return 'No search terms found in the file.';
  if (merged.size > 50000) return 'The report has more than 50,000 search terms. Download a shorter date range.';
  days.sort();
  const today = new Date().toISOString().slice(0, 10);
  const rows = [...merged.values()].map((r) => ({ ...r, spend: +r.spend.toFixed(2), sales: +r.sales.toFixed(2) }));
  return { periodStart: days[0] ?? today, periodEnd: days.at(-1) ?? today, rows, currency: currency || 'GBP' };
}

/** Checks a report the browser already parsed (the raw file can be too big to post). */
export function cleanUpload(v: unknown): SearchTermUpload | string {
  const u = v as Partial<SearchTermUpload> | null;
  if (!u || !Array.isArray(u.rows)) return 'No report in the request.';
  const day = /^\d{4}-\d{2}-\d{2}$/;
  if (!day.test(String(u.periodStart)) || !day.test(String(u.periodEnd))) return 'The report period is missing.';
  if (!u.rows.length) return 'No search terms found in the file.';
  if (u.rows.length > 50000) return 'The report has more than 50,000 search terms. Download a shorter date range.';
  const n = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : 0);
  const t = (x: unknown, max = 300) => String(x ?? '').trim().slice(0, max);
  const rows = u.rows.map((r) => ({
    campaign: t(r.campaign), adGroup: t(r.adGroup), targeting: t(r.targeting), matchType: t(r.matchType, 20).toUpperCase() || '-',
    searchTerm: t(r.searchTerm, 500).toLowerCase(),
    impressions: n(r.impressions), clicks: n(r.clicks), spend: +n(r.spend).toFixed(2), sales: +n(r.sales).toFixed(2), orders: n(r.orders), units: n(r.units),
  })).filter((r) => r.searchTerm);
  return { periodStart: String(u.periodStart), periodEnd: String(u.periodEnd), currency: t(u.currency, 8) || 'GBP', rows };
}

/* ── Analysis ── */

export type TermFlag = 'wasted' | 'winner' | 'bid_down' | 'ok' | 'low_data';
const isAsin = (t: string) => /^b0[a-z0-9]{8}$/i.test(t);
const pct = (a: number, b: number) => (b ? +((a / b) * 100).toFixed(1) : null);

export function analyse(rows: SearchTermRow[], targetAcos = 25) {
  // exact match keywords already running, so we do not suggest them again
  const exactKeywords = new Set(rows.filter((r) => r.matchType === 'EXACT').map((r) => r.targeting.toLowerCase().replace(/^"|"$/g, '')));
  const terms = rows.map((r) => {
    const acos = r.sales ? pct(r.spend, r.sales) : null;
    let flag: TermFlag = 'ok';
    let action = '';
    if (r.clicks >= 10 && r.orders === 0) {
      flag = 'wasted';
      action = r.matchType === 'EXACT' ? 'Lower the bid or pause this keyword' : isAsin(r.searchTerm) ? 'Add as a negative product target' : `Add "${r.searchTerm}" as a negative exact keyword`;
    } else if (r.orders >= 2 && acos != null && acos <= targetAcos && r.matchType !== 'EXACT' && !exactKeywords.has(r.searchTerm)) {
      flag = 'winner';
      action = isAsin(r.searchTerm) ? 'Target this ASIN directly in a product targeting campaign' : `Add "${r.searchTerm}" as an exact match keyword`;
    } else if (r.orders > 0 && acos != null && acos > targetAcos * 1.5) {
      flag = 'bid_down';
      action = `Lower the bid: ACoS ${acos}% against a ${targetAcos}% target`;
    } else if (r.clicks < 10 && r.orders === 0) {
      flag = 'low_data';
    }
    return {
      ...r,
      ctr: pct(r.clicks, r.impressions),
      cpc: r.clicks ? +(r.spend / r.clicks).toFixed(2) : null,
      acos,
      cvr: pct(r.orders, r.clicks),
      flag,
      action,
      negative: flag === 'wasted' && r.matchType !== 'EXACT',
    };
  });
  const sum = (f: (t: (typeof terms)[number]) => number, list = terms) => +list.reduce((a, t) => a + f(t), 0).toFixed(2);
  const wasted = terms.filter((t) => t.flag === 'wasted');
  const winners = terms.filter((t) => t.flag === 'winner');
  const spend = sum((t) => t.spend), sales = sum((t) => t.sales);
  return {
    summary: {
      terms: terms.length,
      impressions: sum((t) => t.impressions),
      clicks: sum((t) => t.clicks),
      spend, sales,
      orders: sum((t) => t.orders),
      acos: pct(spend, sales),
      wastedSpend: sum((t) => t.spend, wasted),
      wastedPct: pct(sum((t) => t.spend, wasted), spend),
      wastedTerms: wasted.length,
      winners: winners.length,
      winnerSales: sum((t) => t.sales, winners),
      bidDown: terms.filter((t) => t.flag === 'bid_down').length,
      negatives: terms.filter((t) => t.negative).length,
      targetAcos,
    },
    terms: terms.sort((a, b) => b.spend - a.spend),
  };
}

/* ── Demo report: a realistic month for the Halcyon demo brand ── */
export function demoReport(today: string): SearchTermUpload {
  const start = new Date(Date.parse(today) - 30 * 86_400_000).toISOString().slice(0, 10);
  const r = (campaign: string, adGroup: string, targeting: string, matchType: string, searchTerm: string, impressions: number, clicks: number, spend: number, sales: number, orders: number): SearchTermRow =>
    ({ campaign, adGroup, targeting, matchType, searchTerm, impressions, clicks, spend, sales, orders, units: orders });
  return {
    periodStart: start, periodEnd: today, currency: 'GBP',
    rows: [
      r('SP Oat Bites Exact', 'Oat bites', 'oat bites', 'EXACT', 'oat bites', 18400, 412, 214.24, 1118.4, 160),
      r('SP Oat Bites Exact', 'Oat bites', 'oat snack bites', 'EXACT', 'oat snack bites', 6100, 133, 74.48, 307.5, 44),
      r('SP Oat Bites Broad', 'Oat bites', 'oat snacks', 'BROAD', 'healthy oat snacks for kids', 9200, 151, 86.07, 405.6, 58),
      r('SP Oat Bites Broad', 'Oat bites', 'oat snacks', 'BROAD', 'oat bites 500g', 3900, 88, 44.0, 279.6, 40),
      r('SP Oat Bites Broad', 'Oat bites', 'oat snacks', 'BROAD', 'gluten free flapjack', 7400, 64, 41.6, 0, 0),
      r('SP Oat Bites Broad', 'Oat bites', 'oat snacks', 'BROAD', 'porridge oats 1kg', 11800, 52, 30.68, 0, 0),
      r('SP Oat Bites Broad', 'Oat bites', 'oat snacks', 'BROAD', 'oat milk', 14300, 31, 17.98, 0, 0),
      r('SP Oat Bites Phrase', 'Oat bites', 'oat bites', 'PHRASE', 'chocolate oat bites', 5200, 97, 60.14, 167.76, 24),
      r('SP Oat Bites Phrase', 'Oat bites', 'oat bites', 'PHRASE', 'oat bites dog treats', 2600, 27, 16.47, 0, 0),
      r('SP Granola Auto', 'Granola', '*', '-', 'honey granola', 8800, 119, 70.21, 391.2, 52),
      r('SP Granola Auto', 'Granola', '*', '-', 'b0rival001', 4100, 42, 26.46, 0, 0),
      r('SP Granola Auto', 'Granola', '*', '-', 'granola 750g', 6300, 74, 44.4, 112.5, 15),
      r('SP Granola Auto', 'Granola', '*', '-', 'keto granola low carb', 3500, 23, 14.03, 0, 0),
      r('SP Granola Auto', 'Granola', '*', '-', 'granola bars', 9900, 58, 34.8, 37.5, 5),
      r('SP Protein Bars', 'Protein', 'protein bars', 'BROAD', 'protein bars high protein low sugar', 12100, 166, 128.82, 287.64, 12),
      r('SP Protein Bars', 'Protein', 'protein bars', 'BROAD', 'vegan protein bars 12 pack', 4300, 71, 52.54, 263.7, 11),
      r('SP Protein Bars', 'Protein', 'protein bars', 'BROAD', 'protein powder', 8700, 38, 29.26, 0, 0),
      r('SP Brand Defence', 'Brand', 'halcyon', 'EXACT', 'halcyon', 5400, 301, 60.2, 1240.8, 171),
      r('SP Brand Defence', 'Brand', 'halcyon oat', 'PHRASE', 'halcyon oat bites', 2100, 96, 19.2, 412.0, 58),
      r('SP Seed Mix', 'Seed mix', 'seed mix', 'BROAD', 'bird seed mix', 6900, 44, 23.32, 0, 0),
      r('SP Seed Mix', 'Seed mix', 'seed mix', 'BROAD', 'mixed seeds for salads', 3100, 39, 20.67, 104.25, 15),
    ],
  };
}
