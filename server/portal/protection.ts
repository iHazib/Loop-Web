import type { Dataset, KeepaSnapshot, Offer, Product, ProtectionCase, CaseType, Severity } from './types.js';

/* Loop Protect rules engine.
   Runs on the latest Keepa snapshot of each of the brand's own ASINs and opens
   cases for anything that breaks a rule. Cases are de-duplicated: an open case
   with the same type + ASIN + seller is not opened twice.

   Note on minimum prices: UK competition law generally treats pressuring
   resellers to sell at or above a set price as resale price maintenance.
   So price alerts are only raised for sellers who are NOT authorised. */

// Amazon's own seller IDs (UK and US) are treated as authorised.
const AMAZON_IDS = new Set(['A3P5ROKL5A1OLE', 'ATVPDKIKX0DER']);

export function dayStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function addDays(day: string, n: number): string {
  const d = new Date(day + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return dayStr(d);
}

function authorisedFor(ds: Dataset, sku: string, today: string): Set<string> {
  const set = new Set<string>(AMAZON_IDS);
  for (const s of ds.sellers) {
    if (!s.amazonSellerId) continue;
    if (s.validUntil && s.validUntil < today) continue;
    const skus = s.skus.trim().toLowerCase();
    if (!skus || skus === 'all' || skus.split(/[;,|]/).map((x) => x.trim().toLowerCase()).includes(sku.toLowerCase())) {
      set.add(s.amazonSellerId.trim());
    }
  }
  return set;
}

/** Latest snapshot per ASIN, plus the one closest to N days before it. */
export function snapshotIndex(snaps: KeepaSnapshot[]) {
  const byAsin = new Map<string, KeepaSnapshot[]>();
  for (const s of snaps) {
    const arr = byAsin.get(s.asin) ?? [];
    arr.push(s);
    byAsin.set(s.asin, arr);
  }
  for (const arr of byAsin.values()) arr.sort((a, b) => a.day.localeCompare(b.day));
  return {
    byAsin,
    latest(asin: string): KeepaSnapshot | undefined {
      const a = byAsin.get(asin);
      return a?.[a.length - 1];
    },
    before(asin: string, days: number): KeepaSnapshot | undefined {
      const a = byAsin.get(asin);
      if (!a?.length) return undefined;
      const target = addDays(a[a.length - 1].day, -days);
      let best: KeepaSnapshot | undefined;
      for (const s of a) if (s.day <= target) best = s;
      return best;
    },
  };
}

type Draft = Omit<ProtectionCase, 'id' | 'openedAt' | 'updatedAt' | 'actions' | 'status'> & { status?: ProtectionCase['status'] };

function draft(type: CaseType, severity: Severity, p: Product, snap: KeepaSnapshot, sellerId: string, title: string, detail: string, evidence: Record<string, unknown>, status?: ProtectionCase['status']): Draft {
  return { type, severity, channel: 'Amazon', asin: snap.asin, sku: p.sku, sellerId, title, detail, evidence: { day: snap.day, ...evidence }, status };
}

const gbp = (n: number) => `£${n.toFixed(2)}`;

export function evaluate(ds: Dataset): Draft[] {
  const idx = snapshotIndex(ds.snapshots);
  const out: Draft[] = [];
  // Without an authorised seller list every seller would look unauthorised, so seller rules wait for it.
  const hasList = ds.sellers.some((s) => s.amazonSellerId);

  for (const p of ds.products) {
    if (!p.asin) continue;
    const snap = idx.latest(p.asin);
    if (!snap) continue;
    const prev = idx.before(p.asin, 1);
    const weekAgo = idx.before(p.asin, 7);
    const auth = authorisedFor(ds, p.sku, snap.day);
    const isAuth = (o: Offer) => o.isAmazon || auth.has(o.sellerId);
    const sellersWeekAgo = new Set((weekAgo?.offers ?? []).map((o) => o.sellerId));

    for (const o of hasList ? snap.offers : []) {
      if (isAuth(o)) continue;
      const name = o.sellerName || o.sellerId;
      const ev = { sellerId: o.sellerId, sellerName: o.sellerName ?? '', price: o.price, isFBA: o.isFBA, condition: o.condition };

      out.push(draft('unauthorised_seller', 'high', p, snap, o.sellerId,
        `Unauthorised seller on ${p.name}`,
        `${name} is selling ${p.sku} on Amazon UK at ${o.price != null ? gbp(o.price) : 'unknown price'} (${o.isFBA ? 'FBA' : 'FBM'}) and is not on the authorised list.`, ev));

      let gap = 0;
      if (o.price != null && p.mapPrice > 0 && o.price < p.mapPrice) {
        gap = (p.mapPrice - o.price) / p.mapPrice;
        out.push(draft('price_below_min', gap > 0.15 ? 'high' : 'medium', p, snap, o.sellerId,
          `${gbp(p.mapPrice - o.price)} below minimum on ${p.name}`,
          `${name} is at ${gbp(o.price)}, ${(gap * 100).toFixed(1)}% under the ${gbp(p.mapPrice)} minimum.`,
          { ...ev, minimum: p.mapPrice, gapPct: +(gap * 100).toFixed(1) }));
      }

      // Grey market signal score.
      const signals: string[] = ['Not authorised'];
      if (gap > 0.15) signals.push('More than 15% under minimum');
      if (o.isFBA && weekAgo && !sellersWeekAgo.has(o.sellerId)) signals.push('New to this ASIN with FBA stock');
      if (o.country && o.country.toUpperCase() !== 'GB' && o.country.toUpperCase() !== 'UK') signals.push(`Seller based in ${o.country}`);
      if (o.price != null && p.cost > 0 && o.price < p.cost * 1.6) signals.push('Price close to our landed cost');
      if (signals.length >= 3) {
        out.push(draft('grey_market', 'medium', p, snap, o.sellerId,
          `Grey market signal on ${p.name}`,
          `${name} scores ${signals.length} grey market signals. Confirm with a test buy (batch codes, packaging, language).`,
          { ...ev, signals }, 'reviewing'));
      }
    }

    if (hasList && snap.buyBoxSellerId && !AMAZON_IDS.has(snap.buyBoxSellerId) && !auth.has(snap.buyBoxSellerId)) {
      const holder = snap.offers.find((o) => o.sellerId === snap.buyBoxSellerId)?.sellerName || snap.buyBoxSellerId;
      out.push(draft('buybox_lost', 'high', p, snap, snap.buyBoxSellerId,
        `Buy Box lost on ${p.name}`,
        `The Buy Box is held by ${holder}, which is not an authorised seller.`,
        { buyBoxSellerId: snap.buyBoxSellerId, price: snap.price }));
    }

    if (weekAgo && snap.offerCount != null && weekAgo.offerCount != null && snap.offerCount - weekAgo.offerCount >= 3) {
      out.push(draft('seller_spike', 'medium', p, snap, '',
        `Seller count jumped on ${p.name}`,
        `New offers went from ${weekAgo.offerCount} to ${snap.offerCount} in 7 days.`,
        { from: weekAgo.offerCount, to: snap.offerCount, since: weekAgo.day }));
    }

    if (prev && prev.day !== snap.day) {
      const changed: string[] = [];
      if (prev.title && snap.title && prev.title !== snap.title) changed.push('title');
      if (prev.brand && snap.brand && prev.brand !== snap.brand) changed.push('brand');
      if (prev.images && snap.images && prev.images !== snap.images) changed.push('images');
      if (changed.length) {
        out.push(draft('listing_changed', 'high', p, snap, '',
          `Listing changed on ${p.name}`,
          `Changed since ${prev.day}: ${changed.join(', ')}.`,
          { changed, before: { title: prev.title, brand: prev.brand, images: prev.images }, after: { title: snap.title, brand: snap.brand, images: snap.images } }));
      }
    }
  }
  return out;
}

const key = (c: { type: string; asin: string; sellerId: string }) => `${c.type}|${c.asin}|${c.sellerId}`;

/** Returns only the cases that are new (no open case with the same key). */
export function newCases(ds: Dataset, now = new Date()): ProtectionCase[] {
  const open = new Set(ds.cases.filter((c) => c.status === 'flagged' || c.status === 'reviewing').map(key));
  const at = now.toISOString();
  const seen = new Set<string>();
  return evaluate(ds)
    .filter((d) => {
      const k = key(d);
      if (open.has(k) || seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map((d, i) => ({
      ...d,
      id: `${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      status: d.status ?? 'flagged',
      openedAt: at,
      updatedAt: at,
      actions: [],
    }));
}

/** Open cases whose cause has gone (e.g. the seller left the listing) → resolved. */
export function autoResolve(ds: Dataset, now = new Date()): ProtectionCase[] {
  const live = new Set(evaluate(ds).map(key));
  const at = now.toISOString();
  return ds.cases
    .filter((c) => (c.status === 'flagged' || c.status === 'reviewing') && ['unauthorised_seller', 'price_below_min', 'buybox_lost'].includes(c.type) && !live.has(key(c)))
    .map((c) => ({ ...c, status: 'resolved' as const, updatedAt: at, actions: [...c.actions, { at, by: 'Loop Protect', note: 'No longer seen on the listing in the latest Keepa check.' }] }));
}

export const SEVERITY_WEIGHT: Record<Severity, number> = { high: 3, medium: 2, low: 1 };
