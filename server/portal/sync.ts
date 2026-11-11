import * as db from './db.js';
import * as keepa from './keepa.js';
import * as ai from './ai.js';
import { newCases, autoResolve, dayStr } from './protection.js';
import type { CompetitorLink, KeepaSnapshot, PortalEvent, Product } from './types.js';

/* Everything operational comes from Keepa (Amazon UK). No scrapers.
   - Daily check: own ASINs with offers + Buy Box, competitor ASINs without offers.
   - Seller names / ratings / country from Keepa's seller endpoint (cached 30 days).
   - Competitor discovery: Keepa search, with Gemini choosing keywords and sorting results. */

const SELLER_TTL = 30 * 86_400_000;

/** Fills in seller names and country on offers, using the cache and Keepa for the rest. */
async function enrichSellers(snaps: KeepaSnapshot[]) {
  const ids = [...new Set(snaps.flatMap((s) => s.offers.filter((o) => !o.isAmazon).map((o) => o.sellerId)))];
  if (!ids.length) return 0;
  const cached = await db.getSellers(ids);
  const fresh = new Map<string, { name: string; country: string | null }>();
  for (const r of cached) if (Date.now() - new Date(r.updated_at).getTime() < SELLER_TTL) fresh.set(r.seller_id, r.data);
  const missing = ids.filter((i) => !fresh.has(i));
  if (missing.length) {
    try {
      const got = await keepa.fetchSellers(missing);
      await db.saveSellerInfo(got.sellers);
      for (const s of got.sellers) fresh.set(s.sellerId, s);
    } catch (e) {
      console.warn('[keepa] seller lookup failed:', (e as Error).message);
    }
  }
  for (const s of snaps) for (const o of s.offers) {
    const info = fresh.get(o.sellerId);
    if (info) { o.sellerName = info.name; if (info.country) o.country = info.country; }
    if (o.isAmazon) o.sellerName = 'Amazon';
  }
  return missing.length;
}

export async function syncBrand(brandId: string) {
  const ds = await db.loadDataset(brandId);
  if (!ds) throw new Error(`Brand ${brandId} not found`);
  const day = dayStr(new Date());
  const own = ds.products.map((p) => p.asin).filter(Boolean);
  const comps = [...new Set(ds.competitors.map((c) => c.asin))].filter((a) => !own.includes(a));
  if (!own.length) throw new Error('No ASINs yet. Import products from ASINs or upload the Products sheet first.');

  const a = await keepa.fetchProducts(own, { withOffers: true, day });
  const looked = await enrichSellers(a.snapshots);
  const b = comps.length ? await keepa.fetchProducts(comps, { withOffers: false, day }) : { snapshots: [], tokensLeft: a.tokensLeft };
  const snaps = [...a.snapshots, ...b.snapshots];
  await db.saveSnapshots(snaps);

  const merged = { ...ds, snapshots: [...ds.snapshots.filter((s) => !(s.day === day && snaps.some((n) => n.asin === s.asin))), ...snaps] };
  const opened = newCases(merged);
  const resolved = autoResolve(merged);
  await db.saveCases(brandId, [...opened, ...resolved]);

  const now = new Date().toISOString();
  const events: PortalEvent[] = [
    { at: now, source: 'Keepa', message: `Daily check complete for ${snaps.length} ASINs${looked ? `, ${looked} new sellers looked up` : ''}`, level: 'ok' },
    ...opened.map((c): PortalEvent => ({ at: now, source: 'Loop Protect', message: c.title, level: 'warn' })),
    ...resolved.map((c): PortalEvent => ({ at: now, source: 'Loop Protect', message: `Resolved: ${c.title}`, level: 'ok' })),
  ];
  await db.addEvents(brandId, events);
  return { asins: snaps.length, opened: opened.length, resolved: resolved.length, tokensLeft: b.tokensLeft ?? a.tokensLeft };
}

/** Adds products to the brand straight from ASINs (Keepa fills name, EAN, RRP). */
export async function importAsins(brandId: string, asins: string[]) {
  const ds = await db.loadDataset(brandId);
  if (!ds) throw new Error(`Brand ${brandId} not found`);
  if (!asins.length) throw new Error('Paste at least one ASIN.');
  if (asins.length > 300) throw new Error('Import at most 300 ASINs at a time.');
  const got = await keepa.fetchProductInfo(asins);
  const byAsin = new Map(ds.products.map((p) => [p.asin, p]));
  const rows: Product[] = got.products.map((g) => {
    const ex = byAsin.get(g.asin);
    return {
      sku: ex?.sku ?? g.asin,
      name: ex?.name || g.title.slice(0, 90) || g.asin,
      asin: g.asin,
      ean: ex?.ean || g.ean,
      cost: ex?.cost ?? 0,
      rrp: ex?.rrp || g.listPrice || g.price || 0,
      mapPrice: ex?.mapPrice ?? 0,
    };
  });
  await db.saveProducts(brandId, rows);
  await db.saveSnapshots(got.products.map((g) => g.snapshot));
  const notFound = asins.map((a) => a.trim().toUpperCase()).filter((a) => !got.products.some((g) => g.asin === a));
  await db.addEvents(brandId, [{ at: new Date().toISOString(), source: 'Keepa', message: `Imported ${rows.length} products from ASINs`, level: 'ok' }]);
  return { imported: rows.length, notFound, needCost: rows.filter((r) => !r.cost || !r.mapPrice).map((r) => r.sku), tokensLeft: got.tokensLeft };
}

/** Builds a product's competitor set: Keepa search, with AI picking keywords and sorting results. */
export async function discoverCompetitors(brandId: string, sku: string, keywords: string) {
  const ds = await db.loadDataset(brandId);
  if (!ds) throw new Error(`Brand ${brandId} not found`);
  const p = ds.products.find((x) => x.sku === sku);
  if (!p) throw new Error(`SKU ${sku} not found`);
  const day = dayStr(new Date());
  const ownAsins = new Set(ds.products.map((x) => x.asin));
  const ownSnap = ds.snapshots.filter((s) => s.asin === p.asin).sort((a, b) => b.day.localeCompare(a.day))[0];
  const brandName = ownSnap?.brand || ds.brand.name;
  const product = { name: p.name, title: ownSnap?.title, brand: brandName };

  const useAi = ai.aiConfigured();
  let phrases: string[] = keywords.trim() ? [keywords.trim()] : [];
  if (useAi && phrases.length < 2) {
    try { phrases = [...phrases, ...(await ai.keywordIdeas(product))]; } catch (e) { console.warn('[ai] keywords failed:', (e as Error).message); }
  }
  if (!phrases.length) phrases = [p.name];
  if (!phrases.some((k) => /compatible/i.test(k))) phrases.push(`compatible with ${brandName}`);
  phrases = [...new Set(phrases)].slice(0, 3); // 10 tokens per search

  const pool = new Map<string, KeepaSnapshot>();
  let tokensLeft: number | null = null;
  for (const k of phrases) {
    const r = await keepa.searchProducts(k, day);
    tokensLeft = r.tokensLeft ?? tokensLeft;
    for (const s of r.snapshots) if (!ownAsins.has(s.asin) && !pool.has(s.asin)) pool.set(s.asin, s);
  }
  const candidates = [...pool.values()].filter((s) => s.brand.toLowerCase() !== brandName.toLowerCase());

  let picked: { asin: string; kind: 'competitor' | 'compatible' }[];
  let method = 'keyword match';
  if (useAi && candidates.length) {
    try {
      const res = await ai.classify(product, candidates.slice(0, 40).map((s) => ({ asin: s.asin, title: s.title, brand: s.brand, price: s.price })));
      picked = res.filter((r) => r.kind !== 'irrelevant') as typeof picked;
      method = 'AI';
    } catch (e) {
      console.warn('[ai] classify failed:', (e as Error).message);
      picked = candidates.map((s) => ({ asin: s.asin, kind: /compatible|replacement|for use with/i.test(s.title) ? 'compatible' : 'competitor' }));
    }
  } else {
    picked = candidates.map((s) => ({ asin: s.asin, kind: /compatible|replacement|for use with/i.test(s.title) ? 'compatible' : 'competitor' }));
  }
  picked = [...picked.filter((x) => x.kind === 'competitor').slice(0, 20), ...picked.filter((x) => x.kind === 'compatible').slice(0, 10)];

  const links: CompetitorLink[] = picked.map((x) => ({ sku, asin: x.asin, kind: x.kind, source: 'auto', createdAt: day }));
  await db.saveSnapshots([...pool.values()].filter((s) => picked.some((x) => x.asin === s.asin)));
  await db.saveCompetitors(brandId, links);
  await db.addEvents(brandId, [{ at: new Date().toISOString(), source: 'Keepa', message: `Found ${links.length} competitors for ${p.name} (${method})`, level: 'info' }]);
  return { added: links.length, competitors: links.filter((l) => l.kind === 'competitor').length, compatibles: links.filter((l) => l.kind === 'compatible').length, searched: phrases, method, tokensLeft };
}
