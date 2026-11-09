import type { KeepaSnapshot, Offer } from './types.js';

/* Keepa API client (Amazon UK = domain 2).
   Docs: https://keepa.com/#!discuss/t/product-object/116
   - Prices are in pence (cents); -1 means "no data".
   - Product: 1 token per ASIN. offers=N adds 6 tokens per page of 10 offers.
   - Search: 10 tokens per page of 10 results. */

const BASE = (process.env.KEEPA_BASE_URL || 'https://api.keepa.com').replace(/\/$/, ''); // override only for tests
const DOMAIN_UK = 2;

// csv / stats array indices
const AMAZON = 0, NEW = 1, SALES = 3, LIST_PRICE = 4, COUNT_NEW = 11, RATING = 16, COUNT_REVIEWS = 17, BUY_BOX = 18;

export function keepaKey(): string {
  return (process.env.KEEPA_API_KEY || '').trim();
}
export function keepaConfigured(): boolean {
  return keepaKey().length > 0;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function call(path: string, params: Record<string, string | number>): Promise<any> {
  const key = keepaKey();
  if (!key) throw new Error('Keepa is not configured. Set KEEPA_API_KEY.');
  const qs = new URLSearchParams({ key, domain: String(DOMAIN_UK), ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const res = await fetch(`${BASE}/${path}?${qs}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(`Keepa ${path} failed (${res.status}): ${data?.error?.message ?? data?.error ?? res.statusText}`);
  }
  return data;
}

const pence = (v: unknown): number | null => (typeof v === 'number' && v >= 0 ? v / 100 : null);
const num = (v: unknown): number | null => (typeof v === 'number' && v >= 0 ? v : null);
const at = (arr: unknown, i: number): unknown => (Array.isArray(arr) ? arr[i] : undefined);

function offerFrom(o: any): Offer {
  const csv: number[] = Array.isArray(o.offerCSV) ? o.offerCSV : [];
  // offerCSV = [time, price, shipping, time, price, shipping, ...]
  const price = csv.length >= 3 ? csv[csv.length - 2] : -1;
  const ship = csv.length >= 3 ? Math.max(0, csv[csv.length - 1]) : 0;
  return {
    sellerId: String(o.sellerId ?? ''),
    price: price >= 0 ? (price + ship) / 100 : null,
    isFBA: Boolean(o.isFBA),
    isAmazon: Boolean(o.isAmazon),
    condition: o.condition === 1 ? 'New' : `Condition ${o.condition ?? '?'}`,
  };
}

export function toSnapshot(p: any, day: string): KeepaSnapshot {
  const st = p.stats ?? {};
  const cur = st.current ?? [];
  const live: number[] = Array.isArray(p.liveOffersOrder) ? p.liveOffersOrder : [];
  const allOffers: any[] = Array.isArray(p.offers) ? p.offers : [];
  const offers = (live.length ? live.map((i) => allOffers[i]).filter(Boolean) : allOffers).map(offerFrom).filter((o) => o.sellerId);
  const bbHist: string[] = Array.isArray(p.buyBoxSellerIdHistory) ? p.buyBoxSellerIdHistory : [];
  const buyBox = st.buyBoxSellerId ?? (bbHist.length ? bbHist[bbHist.length - 1] : null);
  const rating = num(at(cur, RATING));
  return {
    asin: String(p.asin),
    day,
    title: String(p.title ?? ''),
    brand: String(p.brand ?? ''),
    images: String(p.imagesCSV ?? ''),
    bsr: num(at(cur, SALES)),
    bsrAvg30: num(at(st.avg30, SALES)),
    bsrAvg90: num(at(st.avg90, SALES)),
    price: pence(at(cur, BUY_BOX)) ?? pence(at(cur, NEW)) ?? pence(at(cur, AMAZON)),
    priceAvg30: pence(at(st.avg30, BUY_BOX)) ?? pence(at(st.avg30, NEW)),
    priceAvg90: pence(at(st.avg90, BUY_BOX)) ?? pence(at(st.avg90, NEW)),
    buyBoxSellerId: typeof buyBox === 'string' && buyBox && buyBox !== '-1' ? buyBox : null,
    offerCount: num(at(cur, COUNT_NEW)) ?? (offers.length || null),
    offers,
    monthlySold: num(p.monthlySold),
    rating: rating != null ? rating / 10 : null,
    reviews: num(at(cur, COUNT_REVIEWS)),
  };
}

/** Fetch up to 100 ASINs per request. withOffers costs extra tokens, so use it for own ASINs only. */
export async function fetchProducts(asins: string[], opts: { withOffers: boolean; day: string }) {
  const out: KeepaSnapshot[] = [];
  let tokensLeft: number | null = null;
  const clean = [...new Set(asins.map((a) => a.trim().toUpperCase()).filter((a) => /^[A-Z0-9]{10}$/.test(a)))];
  for (let i = 0; i < clean.length; i += 100) {
    const batch = clean.slice(i, i + 100);
    const params: Record<string, string | number> = { asin: batch.join(','), stats: 90, rating: 1, history: 0 };
    if (opts.withOffers) { params.offers = 20; params.buybox = 1; }
    const data = await call('product', params);
    tokensLeft = data.tokensLeft ?? tokensLeft;
    for (const p of data.products ?? []) out.push(toSnapshot(p, opts.day));
  }
  return { snapshots: out, tokensLeft };
}

/** Keyword search on Amazon UK. Returns ASINs plus a snapshot for each result. */
export async function searchProducts(term: string, day: string, page = 0) {
  const data = await call('search', { type: 'product', term, page, stats: 30 });
  const products: any[] = data.products ?? [];
  return {
    snapshots: products.map((p) => toSnapshot(p, day)),
    asins: products.map((p) => String(p.asin)).concat((data.asinList ?? []).map(String)).filter((v, i, a) => a.indexOf(v) === i),
    tokensLeft: data.tokensLeft ?? null,
  };
}

export async function tokenStatus() {
  const data = await call('token', {});
  return { tokensLeft: data.tokensLeft ?? null, refillRate: data.refillRate ?? null, refillIn: data.refillIn ?? null };
}

export interface KeepaSeller { sellerId: string; name: string; rating: number | null; ratingCount: number | null; country: string | null; storefrontAsins: number | null }

/** Seller names, ratings and (where Keepa has it) country. 1 token per seller, up to 100 per request. */
export async function fetchSellers(ids: string[]) {
  const out: KeepaSeller[] = [];
  let tokensLeft: number | null = null;
  const clean = [...new Set(ids.filter((i) => /^[A-Z0-9]{8,20}$/.test(i)))];
  for (let i = 0; i < clean.length; i += 100) {
    const data = await call('seller', { seller: clean.slice(i, i + 100).join(',') });
    tokensLeft = data.tokensLeft ?? tokensLeft;
    for (const [id, s] of Object.entries<any>(data.sellers ?? {})) {
      const addr = Array.isArray(s.address) ? s.address : [];
      const last = String(addr[addr.length - 1] ?? s.country ?? '').trim().toUpperCase();
      out.push({
        sellerId: id,
        name: String(s.sellerName ?? s.businessName ?? id),
        rating: num(s.currentRating),
        ratingCount: num(s.currentRatingCount),
        country: /^[A-Z]{2}$/.test(last) ? last : null,
        storefrontAsins: Array.isArray(s.asinList) ? s.asinList.length : num(s.totalStorefrontAsinsCSV?.[s.totalStorefrontAsinsCSV.length - 1]),
      });
    }
  }
  return { sellers: out, tokensLeft };
}

/** Product details for import: title, brand, EAN, list price. 1 token per ASIN. */
export async function fetchProductInfo(asins: string[]) {
  const clean = [...new Set(asins.map((a) => a.trim().toUpperCase()).filter((a) => /^[A-Z0-9]{10}$/.test(a)))];
  const out: { asin: string; title: string; brand: string; ean: string; listPrice: number | null; price: number | null; snapshot: KeepaSnapshot }[] = [];
  let tokensLeft: number | null = null;
  const day = new Date().toISOString().slice(0, 10);
  for (let i = 0; i < clean.length; i += 100) {
    const data = await call('product', { asin: clean.slice(i, i + 100).join(','), stats: 90, rating: 1, history: 0 });
    tokensLeft = data.tokensLeft ?? tokensLeft;
    for (const p of data.products ?? []) {
      const snap = toSnapshot(p, day);
      out.push({
        asin: String(p.asin),
        title: String(p.title ?? ''),
        brand: String(p.brand ?? ''),
        ean: Array.isArray(p.eanList) && p.eanList.length ? String(p.eanList[0]) : '',
        listPrice: pence(at(p.stats?.current, LIST_PRICE)),
        price: snap.price,
        snapshot: snap,
      });
    }
  }
  return { products: out, tokensLeft };
}
