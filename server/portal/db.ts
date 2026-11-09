import { createClient } from '@supabase/supabase-js';
import type { Brand, Dataset, Product, SalesRow, AdsRow, AuthorisedSeller, CompetitorLink, KeepaSnapshot, ProtectionCase, PortalEvent } from './types.js';

/* Brand portal persistence (Supabase / Postgres). Tables: supabase/portal.sql */

const URL_ = (process.env.SUPABASE_URL || '').trim();
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export function dbConfigured(): boolean {
  return URL_.length > 0 && KEY.length > 0;
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
let _c: any = null;
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function sb(): any {
  if (!dbConfigured()) throw new Error('Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  if (!_c) _c = createClient(URL_, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  return _c;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function check<T>(r: { data: T | null; error: any }): T {
  if (r.error) throw new Error(r.error.message ?? String(r.error));
  return (r.data ?? ([] as unknown)) as T;
}

/** Supabase caps a select at 1000 rows by default, so page through. */
async function selectAll(table: string, filter: (q: any) => any, order = 'id'): Promise<any[]> {
  const out: any[] = [];
  for (let from = 0; ; from += 1000) {
    const rows = check<any[]>(await filter(sb().from(table).select('*')).order(order).range(from, from + 999));
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

async function upsert(table: string, rows: any[], onConflict: string) {
  for (let i = 0; i < rows.length; i += 500) {
    check(await sb().from(table).upsert(rows.slice(i, i + 500), { onConflict }));
  }
}

/* ── Brands ── */
export async function listBrands(): Promise<Brand[]> {
  const rows = check<any[]>(await sb().from('portal_brands').select('*').order('name'));
  return rows.map((r) => ({ id: r.id, name: r.name, plan: r.plan ?? '' }));
}
export async function createBrand(name: string, plan = ''): Promise<Brand> {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || `brand-${Date.now()}`;
  const r = check<any>(await sb().from('portal_brands').insert({ id, name, plan }).select().single());
  return { id: r.id, name: r.name, plan: r.plan ?? '' };
}

export async function deleteBrand(id: string) {
  // Child rows go with it (ON DELETE CASCADE).
  check(await sb().from('portal_brands').delete().eq('id', id));
}

/* ── Load everything for one brand ── */
export async function loadDataset(brandId: string): Promise<Dataset | null> {
  const b = check<any[]>(await sb().from('portal_brands').select('*').eq('id', brandId));
  if (!b.length) return null;
  const by = (q: any) => q.eq('brand_id', brandId);
  const [products, sales, ads, sellers, competitors, cases, events, d2c] = await Promise.all([
    selectAll('portal_products', by, 'sku'),
    selectAll('portal_sales', by, 'week_start'),
    selectAll('portal_ads', by, 'week_start'),
    selectAll('portal_sellers', by, 'seller_name'),
    selectAll('portal_competitors', by, 'asin'),
    selectAll('portal_cases', by, 'opened_at'),
    check<any[]>(await sb().from('portal_events').select('*').eq('brand_id', brandId).order('at', { ascending: false }).limit(50)),
    selectAll('portal_d2c', by, 'week_start'),
  ]);
  const asins = [...new Set([...products.map((p) => p.asin), ...competitors.map((c) => c.asin)].filter(Boolean))];
  const since = new Date(Date.now() - 120 * 86_400_000).toISOString().slice(0, 10);
  const snaps: any[] = [];
  for (let i = 0; i < asins.length; i += 100) {
    const part = asins.slice(i, i + 100);
    snaps.push(...(await selectAll('portal_keepa_snapshots', (q: any) => q.in('asin', part).gte('day', since), 'day')));
  }
  return {
    brand: { id: b[0].id, name: b[0].name, plan: b[0].plan ?? '' },
    products: products.map((r): Product => ({ sku: r.sku, name: r.name, asin: r.asin ?? '', ean: r.ean ?? '', cost: +r.cost || 0, rrp: +r.rrp || 0, mapPrice: +r.map_price || 0 })),
    sales: sales.map((r): SalesRow => ({ weekStart: r.week_start, channel: r.channel, sku: r.sku, units: +r.units, revenue: +r.revenue, returns: +r.returns, fees: +r.fees, stock: +r.stock })),
    ads: ads.map((r): AdsRow => ({ weekStart: r.week_start, channel: r.channel, campaign: r.campaign, campaignType: r.campaign_type ?? '', spend: +r.spend, impressions: +r.impressions, clicks: +r.clicks, orders: +r.orders, adSales: +r.ad_sales })),
    sellers: sellers.map((r): AuthorisedSeller => ({ sellerName: r.seller_name, amazonSellerId: r.amazon_seller_id ?? '', ebayUsername: r.ebay_username ?? '', skus: r.skus ?? 'All', validUntil: r.valid_until ?? '' })),
    d2c: d2c.map((r: any) => ({ weekStart: r.week_start, sessions: +r.sessions, orders: +r.orders, revenue: +r.revenue, newCustomers: +r.new_customers, returningCustomers: +r.returning_customers, refunds: +r.refunds })),
    competitors: competitors.map((r): CompetitorLink => ({ sku: r.sku, asin: r.asin, kind: r.kind, source: r.source, createdAt: String(r.created_at).slice(0, 10) })),
    snapshots: snaps.map((r) => ({ ...(r.data as KeepaSnapshot), asin: r.asin, day: r.day })),
    cases: cases.map((r): ProtectionCase => ({ ...(r.data as ProtectionCase), id: r.id, status: r.status })),
    events: events.map((r): PortalEvent => ({ at: r.at, source: r.source, message: r.message, level: r.level })),
  };
}

/* ── Writes ── */
export async function saveProducts(brandId: string, rows: Product[]) {
  await upsert('portal_products', rows.map((p) => ({ brand_id: brandId, sku: p.sku, name: p.name, asin: p.asin, ean: p.ean, cost: p.cost, rrp: p.rrp, map_price: p.mapPrice })), 'brand_id,sku');
}
export async function saveSales(brandId: string, rows: SalesRow[]) {
  await upsert('portal_sales', rows.map((s) => ({ brand_id: brandId, week_start: s.weekStart, channel: s.channel, sku: s.sku, units: s.units, revenue: s.revenue, returns: s.returns, fees: s.fees, stock: s.stock })), 'brand_id,week_start,channel,sku');
}
export async function saveAds(brandId: string, rows: AdsRow[]) {
  await upsert('portal_ads', rows.map((a) => ({ brand_id: brandId, week_start: a.weekStart, channel: a.channel, campaign: a.campaign, campaign_type: a.campaignType, spend: a.spend, impressions: a.impressions, clicks: a.clicks, orders: a.orders, ad_sales: a.adSales })), 'brand_id,week_start,channel,campaign');
}
export async function saveSellers(brandId: string, rows: AuthorisedSeller[]) {
  await upsert('portal_sellers', rows.map((s) => ({ brand_id: brandId, seller_name: s.sellerName, amazon_seller_id: s.amazonSellerId, ebay_username: s.ebayUsername, skus: s.skus, valid_until: s.validUntil || null })), 'brand_id,seller_name');
}
export async function saveD2c(brandId: string, rows: import('./types.js').D2cRow[]) {
  await upsert('portal_d2c', rows.map((d) => ({ brand_id: brandId, week_start: d.weekStart, sessions: d.sessions, orders: d.orders, revenue: d.revenue, new_customers: d.newCustomers, returning_customers: d.returningCustomers, refunds: d.refunds })), 'brand_id,week_start');
}
export async function saveCompetitors(brandId: string, rows: CompetitorLink[]) {
  await upsert('portal_competitors', rows.map((c) => ({ brand_id: brandId, sku: c.sku, asin: c.asin, kind: c.kind, source: c.source })), 'brand_id,sku,asin');
}
export async function deleteCompetitor(brandId: string, sku: string, asin: string) {
  check(await sb().from('portal_competitors').delete().eq('brand_id', brandId).eq('sku', sku).eq('asin', asin));
}
export async function saveSnapshots(rows: KeepaSnapshot[]) {
  await upsert('portal_keepa_snapshots', rows.map((s) => ({ asin: s.asin, day: s.day, data: s })), 'asin,day');
}
export async function saveCases(brandId: string, rows: ProtectionCase[]) {
  await upsert('portal_cases', rows.map((c) => ({ id: c.id, brand_id: brandId, type: c.type, status: c.status, asin: c.asin, seller_id: c.sellerId, opened_at: c.openedAt, updated_at: c.updatedAt, data: c })), 'id');
}
export async function addEvents(brandId: string, rows: PortalEvent[]) {
  if (!rows.length) return;
  check(await sb().from('portal_events').insert(rows.map((e) => ({ brand_id: brandId, at: e.at, source: e.source, message: e.message, level: e.level }))));
}

/* ── Client users, brand access, invites ── */
export interface PortalUser { email: string; name: string; passwordHash: string | null; lastLogin: string | null }

export async function getUser(email: string): Promise<PortalUser | null> {
  const rows = check<any[]>(await sb().from('portal_users').select('*').eq('email', email.toLowerCase()));
  const r = rows[0];
  return r ? { email: r.email, name: r.name ?? '', passwordHash: r.password_hash ?? null, lastLogin: r.last_login ?? null } : null;
}
export async function upsertUser(email: string, name: string, passwordHash: string) {
  check(await sb().from('portal_users').upsert({ email: email.toLowerCase(), name, password_hash: passwordHash }, { onConflict: 'email' }));
}
export async function touchLogin(email: string) {
  check(await sb().from('portal_users').update({ last_login: new Date().toISOString() }).eq('email', email.toLowerCase()));
}
export async function userBrands(email: string): Promise<Record<string, 'manager' | 'viewer'>> {
  const rows = check<any[]>(await sb().from('portal_user_brands').select('*').eq('email', email.toLowerCase()));
  return Object.fromEntries(rows.map((r) => [r.brand_id, r.role]));
}
export async function brandUsers(brandId: string) {
  const links = check<any[]>(await sb().from('portal_user_brands').select('*').eq('brand_id', brandId));
  const emails = links.map((l) => l.email);
  const users = emails.length ? check<any[]>(await sb().from('portal_users').select('email,name,last_login,password_hash').in('email', emails)) : [];
  const invites = check<any[]>(await sb().from('portal_invites').select('email,role,expires_at,used_at').eq('brand_id', brandId).is('used_at', null));
  return {
    users: links.map((l) => {
      const u = users.find((x) => x.email === l.email);
      return { email: l.email, role: l.role, name: u?.name ?? '', lastLogin: u?.last_login ?? null, active: Boolean(u?.password_hash) };
    }),
    pendingInvites: invites.filter((i) => new Date(i.expires_at) > new Date()).map((i) => ({ email: i.email, role: i.role, expiresAt: i.expires_at })),
  };
}
export async function linkUser(email: string, brandId: string, role: 'manager' | 'viewer') {
  check(await sb().from('portal_user_brands').upsert({ email: email.toLowerCase(), brand_id: brandId, role }, { onConflict: 'email,brand_id' }));
}
export async function unlinkUser(email: string, brandId: string) {
  check(await sb().from('portal_user_brands').delete().eq('email', email.toLowerCase()).eq('brand_id', brandId));
  check(await sb().from('portal_invites').delete().eq('email', email.toLowerCase()).eq('brand_id', brandId).is('used_at', null));
}
export async function createInvite(tokenHash: string, email: string, brandId: string, role: string, days = 7) {
  check(await sb().from('portal_invites').insert({ token_hash: tokenHash, email: email.toLowerCase(), brand_id: brandId, role, expires_at: new Date(Date.now() + days * 86_400_000).toISOString() }));
}
export async function getInvite(tokenHash: string) {
  const rows = check<any[]>(await sb().from('portal_invites').select('*').eq('token_hash', tokenHash));
  const r = rows[0];
  if (!r || r.used_at || new Date(r.expires_at) < new Date()) return null;
  const b = check<any[]>(await sb().from('portal_brands').select('name').eq('id', r.brand_id));
  return { email: r.email as string, brandId: r.brand_id as string, brandName: (b[0]?.name ?? r.brand_id) as string, role: r.role as 'manager' | 'viewer' };
}
export async function useInvite(tokenHash: string) {
  check(await sb().from('portal_invites').update({ used_at: new Date().toISOString() }).eq('token_hash', tokenHash));
}

/* ── Keepa seller cache ── */
export async function getSellers(ids: string[]) {
  if (!ids.length) return [] as any[];
  return check<any[]>(await sb().from('portal_keepa_sellers').select('*').in('seller_id', ids));
}
export async function saveSellerInfo(rows: { sellerId: string; name: string; rating: number | null; ratingCount: number | null; country: string | null; storefrontAsins: number | null }[]) {
  if (!rows.length) return;
  await upsert('portal_keepa_sellers', rows.map((r) => ({ seller_id: r.sellerId, data: r, updated_at: new Date().toISOString() })), 'seller_id');
}

/* ── Single product edits (cost / RRP / minimum price) ── */
export async function updateProduct(brandId: string, sku: string, patch: { name?: string; cost?: number; rrp?: number; mapPrice?: number }) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.cost !== undefined) row.cost = patch.cost;
  if (patch.rrp !== undefined) row.rrp = patch.rrp;
  if (patch.mapPrice !== undefined) row.map_price = patch.mapPrice;
  check(await sb().from('portal_products').update(row).eq('brand_id', brandId).eq('sku', sku));
}
export async function deleteProduct(brandId: string, sku: string) {
  check(await sb().from('portal_products').delete().eq('brand_id', brandId).eq('sku', sku));
}
/** Creates an empty account row if none exists (keeps an existing password). */
export async function ensureUser(email: string) {
  check(await sb().from('portal_users').upsert({ email: email.toLowerCase() }, { onConflict: 'email', ignoreDuplicates: true }));
}
export async function deleteUser(email: string) {
  check(await sb().from('portal_users').delete().eq('email', email.toLowerCase()));
}
