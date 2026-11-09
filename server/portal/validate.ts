import { CHANNELS, type Product, type SalesRow, type AdsRow, type AuthorisedSeller, type CompetitorLink, type Channel } from './types.js';

/* Validates rows uploaded from the manual sheet.
   Rows arrive as objects keyed by the sheet's column headers (any case/spacing).
   Bad rows are rejected with a reason instead of breaking the dashboard. */

export type UploadKind = 'products' | 'sales' | 'ads' | 'sellers' | 'competitors';
export interface Rejected { row: number; reason: string }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Header aliases → field name. */
const FIELDS: Record<UploadKind, Record<string, string[]>> = {
  products: { sku: ['sku'], name: ['productname', 'name'], asin: ['asin'], ean: ['ean', 'barcode'], cost: ['costprice', 'cost', 'costprice£'], rrp: ['rrp', 'rrp£'], mapPrice: ['mapminimumprice', 'mapprice', 'map', 'minimumprice', 'mapminimumprice£', 'map£'] },
  sales: { weekStart: ['weekstarting', 'weekstart', 'week'], channel: ['channel'], sku: ['sku'], units: ['unitssold', 'units'], revenue: ['revenueincvat', 'revenue', 'revenue£incvat', 'revenue£'], returns: ['returnsunits', 'returns'], fees: ['marketplacefees', 'fees', 'marketplacefees£', 'fees£'], stock: ['stockonhandatweekend', 'stock', 'stockonhand'] },
  ads: { weekStart: ['weekstarting', 'weekstart', 'week'], channel: ['channel'], campaign: ['campaignname', 'campaign'], campaignType: ['campaigntype', 'type'], spend: ['spend', 'spend£'], impressions: ['impressions'], clicks: ['clicks'], orders: ['orders'], adSales: ['adsales', 'adsales£', 'sales'] },
  sellers: { sellerName: ['sellername', 'name'], amazonSellerId: ['amazonsellerid', 'sellerid'], ebayUsername: ['ebayusernameoptional', 'ebayusername', 'ebay'], skus: ['authorisedskus', 'skus'], validUntil: ['validuntil'] },
  competitors: { sku: ['oursku', 'sku'], asin: ['competitorasin', 'asin'], kind: ['kind', 'type'] },
};

function mapRow(kind: UploadKind, raw: Record<string, unknown>): Record<string, string> {
  const byNorm = new Map(Object.entries(raw).map(([k, v]) => [norm(k), String(v ?? '').trim()]));
  const out: Record<string, string> = {};
  for (const [field, aliases] of Object.entries(FIELDS[kind])) {
    for (const a of aliases) if (byNorm.has(a)) { out[field] = byNorm.get(a)!; break; }
  }
  return out;
}

const money = (s: string | undefined): number | null => {
  if (s == null || s === '') return 0;
  const n = Number(s.replace(/[£,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const int = (s: string | undefined): number | null => {
  const n = money(s);
  return n == null ? null : Math.round(n);
};

/** Accepts YYYY-MM-DD or DD/MM/YYYY and snaps to that week's Monday. */
export function toMonday(s: string): string | null {
  let d: Date | null = null;
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const uk = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (iso) d = new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]));
  else if (uk) d = new Date(Date.UTC(+uk[3], +uk[2] - 1, +uk[1]));
  if (!d || Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

function channelOf(s: string): Channel | null {
  const n = norm(s);
  const alias: Record<string, Channel> = { amazon: 'Amazon', amazonuk: 'Amazon', tiktok: 'TikTok Shop', tiktokshop: 'TikTok Shop', ebay: 'eBay', ebayuk: 'eBay', temu: 'Temu', d2c: 'D2C', dtc: 'D2C', website: 'D2C', shopify: 'D2C', wholesale: 'Wholesale' };
  return alias[n] ?? (CHANNELS.find((c) => norm(c) === n) ?? null);
}

export function validate(kind: UploadKind, rows: Record<string, unknown>[], knownSkus: Set<string>) {
  const rejected: Rejected[] = [];
  const bad = (row: number, reason: string) => { rejected.push({ row, reason }); return null; };
  const today = new Date().toISOString().slice(0, 10);

  const parsed = rows.map((raw, i) => {
    const r = mapRow(kind, raw);
    const n = i + 2; // sheet row number (row 1 = headers)
    if (kind === 'products') {
      if (!r.sku) return bad(n, 'SKU is missing');
      if (!r.name) return bad(n, 'Product name is missing');
      const cost = money(r.cost), rrp = money(r.rrp), mapPrice = money(r.mapPrice);
      if (cost == null || rrp == null || mapPrice == null) return bad(n, 'Cost, RRP and MAP must be numbers');
      if (r.asin && !/^[A-Z0-9]{10}$/i.test(r.asin)) return bad(n, `ASIN "${r.asin}" should be 10 letters or digits`);
      return { sku: r.sku, name: r.name, asin: (r.asin ?? '').toUpperCase(), ean: r.ean ?? '', cost, rrp, mapPrice } satisfies Product;
    }
    if (kind === 'sales') {
      const week = toMonday(r.weekStart ?? '');
      if (!week) return bad(n, 'Week starting is not a date (use YYYY-MM-DD)');
      if (week > today) return bad(n, 'Week starting is in the future');
      const ch = channelOf(r.channel ?? '');
      if (!ch) return bad(n, `Unknown channel "${r.channel ?? ''}" (use ${CHANNELS.join(', ')})`);
      if (!r.sku || !knownSkus.has(r.sku)) return bad(n, `SKU "${r.sku ?? ''}" is not in the Products tab`);
      const units = int(r.units), revenue = money(r.revenue), returns = int(r.returns), fees = money(r.fees), stock = int(r.stock);
      if ([units, revenue, returns, fees, stock].some((x) => x == null)) return bad(n, 'Units, revenue, returns, fees and stock must be numbers');
      return { weekStart: week, channel: ch, sku: r.sku, units: units!, revenue: revenue!, returns: returns!, fees: fees!, stock: stock! } satisfies SalesRow;
    }
    if (kind === 'ads') {
      const week = toMonday(r.weekStart ?? '');
      if (!week) return bad(n, 'Week starting is not a date (use YYYY-MM-DD)');
      if (!r.channel) return bad(n, 'Channel is missing');
      if (!r.campaign) return bad(n, 'Campaign name is missing');
      const nums = [money(r.spend), int(r.impressions), int(r.clicks), int(r.orders), money(r.adSales)];
      if (nums.some((x) => x == null)) return bad(n, 'Spend, impressions, clicks, orders and ad sales must be numbers');
      const [spend, impressions, clicks, orders, adSales] = nums as number[];
      return { weekStart: week, channel: r.channel, campaign: r.campaign, campaignType: r.campaignType ?? '', spend, impressions, clicks, orders, adSales } satisfies AdsRow;
    }
    if (kind === 'sellers') {
      if (!r.sellerName) return bad(n, 'Seller name is missing');
      if (!r.amazonSellerId && !r.ebayUsername) return bad(n, 'Give an Amazon seller ID or an eBay username');
      const valid = r.validUntil ? toMonday(r.validUntil) && r.validUntil : '';
      if (r.validUntil && !valid) return bad(n, 'Valid until is not a date');
      return { sellerName: r.sellerName, amazonSellerId: (r.amazonSellerId ?? '').toUpperCase(), ebayUsername: r.ebayUsername ?? '', skus: r.skus || 'All', validUntil: r.validUntil ?? '' } satisfies AuthorisedSeller;
    }
    // competitors
    if (!r.sku || !knownSkus.has(r.sku)) return bad(n, `SKU "${r.sku ?? ''}" is not in the Products tab`);
    if (!r.asin || !/^[A-Z0-9]{10}$/i.test(r.asin)) return bad(n, 'Competitor ASIN should be 10 letters or digits');
    const k = norm(r.kind ?? 'competitor');
    return { sku: r.sku, asin: r.asin.toUpperCase(), kind: k.startsWith('compat') ? 'compatible' : 'competitor', source: 'manual', createdAt: today } satisfies CompetitorLink;
  });

  return { accepted: parsed.filter((x) => x != null), rejected };
}

/** Column headers for each downloadable template. */
export const TEMPLATES: Record<UploadKind, string[]> = {
  products: ['SKU', 'Product name', 'ASIN', 'EAN', 'Cost price (£)', 'RRP (£)', 'MAP / minimum price (£)'],
  sales: ['Week starting', 'Channel', 'SKU', 'Units sold', 'Revenue (£, inc VAT)', 'Returns (units)', 'Marketplace fees (£)', 'Stock on hand at week end'],
  ads: ['Week starting', 'Channel', 'Campaign name', 'Campaign type', 'Spend (£)', 'Impressions', 'Clicks', 'Orders', 'Ad sales (£)'],
  sellers: ['Seller name', 'Amazon seller ID', 'eBay username (optional)', 'Authorised SKUs', 'Valid until'],
  competitors: ['Our SKU', 'Competitor ASIN', 'Kind'],
};
