import { brandSettings } from './types.js';
import type { Dataset, KeepaSnapshot, Offer, Product, ProtectionCase, CaseType, Severity, TestBuyVerdict } from './types.js';

/* Loop Protect rules engine.
   Runs on the latest Keepa snapshot of each of the brand's own ASINs and opens
   cases for anything that breaks a rule. Cases are de-duplicated: an open case
   with the same type + ASIN + seller is not opened twice.

   Note on minimum prices: UK competition law generally treats pressuring
   resellers to sell at or above a set price as resale price maintenance.
   So price alerts are only raised for sellers who are NOT authorised.

   Two seller case types, two rule sets:
   - Unauthorised seller: not on the authorised list and selling UK stock, bought
     from the brand or one of its resellers.
   - Grey market stock: not on the authorised list and the stock most likely came
     from Europe or elsewhere. Decided by weighted signals (seller country, the same
     ASIN much cheaper on Amazon DE/FR/IT/ES, deep undercut, new FBA stock, price
     near landed cost), or confirmed by a test buy.
   Each unauthorised offer opens exactly one of the two. A test buy verdict always wins. */

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

export interface GreySignal { key: string; label: string; weight: number }

/** The latest test buy verdict per ASIN + seller, across every case. */
function verdicts(ds: Dataset) {
  const m = new Map<string, { verdict: TestBuyVerdict; at: string }>();
  for (const c of ds.cases) for (const t of c.testBuys ?? []) {
    const k = `${c.asin}|${c.sellerId}`;
    const cur = m.get(k);
    if (!cur || t.at > cur.at) m.set(k, { verdict: t.verdict, at: t.at });
  }
  return m;
}


/** Weighted signs that an unauthorised offer is grey market stock. */
export function greySignals(p: Product, snap: KeepaSnapshot, o: Offer, newThisWeek: boolean): { signals: GreySignal[]; score: number; cheapestEu: { market: string; gbp: number; gapPct: number } | null } {
  const signals: GreySignal[] = [];
  const country = (o.country ?? '').toUpperCase();
  if (country && country !== 'GB' && country !== 'UK') signals.push({ key: 'country', label: `Seller is based in ${country}, not the UK`, weight: 2 });

  // Same ASIN on Amazon EU: a big gap is what makes importing stock worth it.
  const ukRef = p.mapPrice > 0 ? p.mapPrice : snap.price ?? 0;
  let cheapestEu: { market: string; gbp: number; gapPct: number } | null = null;
  for (const e of snap.eu ?? []) if (e.gbp != null && (!cheapestEu || e.gbp < cheapestEu.gbp)) cheapestEu = { market: e.market, gbp: e.gbp, gapPct: 0 };
  if (cheapestEu && ukRef > 0) {
    cheapestEu.gapPct = +(((ukRef - cheapestEu.gbp) / ukRef) * 100).toFixed(1);
    if (cheapestEu.gapPct >= 20) signals.push({ key: 'eu_price', label: `Same ASIN is ${gbp(cheapestEu.gbp)} on Amazon ${cheapestEu.market}, ${cheapestEu.gapPct}% under the UK price`, weight: 2 });
    else if (cheapestEu.gapPct >= 10) signals.push({ key: 'eu_price', label: `Same ASIN is ${gbp(cheapestEu.gbp)} on Amazon ${cheapestEu.market}, ${cheapestEu.gapPct}% under the UK price`, weight: 1 });
  }
  if (o.price != null && p.mapPrice > 0 && o.price < p.mapPrice * 0.85) signals.push({ key: 'undercut', label: 'More than 15% under your minimum price', weight: 1 });
  if (o.isFBA && newThisWeek) signals.push({ key: 'new_fba', label: 'New to this listing this week with FBA stock', weight: 1 });
  if (o.price != null && p.cost > 0 && o.price < p.cost * 1.6) signals.push({ key: 'near_cost', label: 'Price is close to your landed cost', weight: 1 });
  return { signals, score: signals.reduce((a, x) => a + x.weight, 0), cheapestEu };
}

export function evaluate(ds: Dataset): Draft[] {
  const idx = snapshotIndex(ds.snapshots);
  const out: Draft[] = [];
  // Without an authorised seller list every seller would look unauthorised, so seller rules wait for it.
  const hasList = ds.sellers.some((s) => s.amazonSellerId);
  const tested = verdicts(ds);
  const GREY_THRESHOLD = brandSettings(ds.brand).greyThreshold;

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
      const priceTxt = o.price != null ? gbp(o.price) : 'an unknown price';
      const ev = { sellerId: o.sellerId, sellerName: o.sellerName ?? '', price: o.price, isFBA: o.isFBA, condition: o.condition, country: o.country ?? '' };
      const g = greySignals(p, snap, o, Boolean(weekAgo) && !sellersWeekAgo.has(o.sellerId));
      const test = tested.get(`${p.asin}|${o.sellerId}`);
      const grey = test?.verdict === 'grey_stock' || (test?.verdict !== 'uk_stock' && g.score >= GREY_THRESHOLD);
      const basis = test && (test.verdict === 'grey_stock' || test.verdict === 'uk_stock') ? 'test_buy' : 'signals';
      const evidence = { ...ev, signals: g.signals, greyScore: g.score, greyThreshold: GREY_THRESHOLD, eu: snap.eu ?? [], cheapestEu: g.cheapestEu, classifiedBy: basis };

      if (grey) {
        const confirmed = test?.verdict === 'grey_stock';
        out.push(draft('grey_market', confirmed || g.score >= 4 ? 'high' : 'medium', p, snap, o.sellerId,
          `Grey market stock on ${p.name}`,
          confirmed
            ? `${name} is selling ${p.sku} at ${priceTxt}. A test buy confirmed the stock was not meant for the UK.`
            : `${name} is selling ${p.sku} at ${priceTxt} and is not authorised. ${g.signals.length} signs point to stock from outside the UK: ${g.signals.map((x) => x.label.charAt(0).toLowerCase() + x.label.slice(1)).join('; ')}. Confirm with a test buy (packaging language, batch code, importer address).`,
          evidence));
      } else {
        out.push(draft('unauthorised_seller', 'high', p, snap, o.sellerId,
          `Unauthorised seller on ${p.name}`,
          `${name} is selling ${p.sku} on Amazon UK at ${priceTxt} (${o.isFBA ? 'FBA' : 'FBM'}) and is not on the authorised list.${test?.verdict === 'uk_stock' ? ' A test buy showed UK stock, so it was bought from you or one of your resellers.' : ' The signs point to UK stock bought from you or one of your resellers.'}`,
          evidence));
      }

      if (o.price != null && p.mapPrice > 0 && o.price < p.mapPrice) {
        const gap = (p.mapPrice - o.price) / p.mapPrice;
        out.push(draft('price_below_min', gap > 0.15 ? 'high' : 'medium', p, snap, o.sellerId,
          `${gbp(p.mapPrice - o.price)} below minimum on ${p.name}`,
          `${name} is at ${gbp(o.price)}, ${(gap * 100).toFixed(1)}% under the ${gbp(p.mapPrice)} minimum.`,
          { ...ev, minimum: p.mapPrice, gapPct: +(gap * 100).toFixed(1) }));
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
    .map((d, i) => {
      // carry the test buy log over when a seller case is re-opened under the other type
      const carried = ds.cases.filter((c) => c.asin === d.asin && c.sellerId === d.sellerId && d.sellerId && c.testBuys?.length).flatMap((c) => c.testBuys ?? []);
      return {
        ...d,
        id: `${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        status: d.status ?? 'flagged',
        openedAt: at,
        updatedAt: at,
        actions: [],
        ...(carried.length && (d.type === 'grey_market' || d.type === 'unauthorised_seller') ? { testBuys: carried } : {}),
      };
    });
}

/** Open cases whose cause has gone (e.g. the seller left the listing) → resolved.
    A seller case that moved to the other type (unauthorised ↔ grey) is closed with a note saying so. */
export function autoResolve(ds: Dataset, now = new Date()): ProtectionCase[] {
  const drafts = evaluate(ds);
  const live = new Set(drafts.map(key));
  const at = now.toISOString();
  const SELLER = ['unauthorised_seller', 'grey_market'];
  return ds.cases
    .filter((c) => (c.status === 'flagged' || c.status === 'reviewing') && [...SELLER, 'price_below_min', 'buybox_lost'].includes(c.type) && !live.has(key(c)))
    .map((c) => {
      const moved = SELLER.includes(c.type) && drafts.find((d) => SELLER.includes(d.type) && d.type !== c.type && d.asin === c.asin && d.sellerId === c.sellerId);
      const note = moved
        ? `Moved to ${moved.type === 'grey_market' ? 'a grey market stock' : 'an unauthorised seller'} case${moved.evidence.classifiedBy === 'test_buy' ? ' after the test buy' : ' as the signals changed'}.`
        : 'No longer seen on the listing in the latest Keepa check.';
      return { ...c, status: 'resolved' as const, updatedAt: at, actions: [...c.actions, { at, by: 'Loop Protect', note }] };
    });
}

export const SEVERITY_WEIGHT: Record<Severity, number> = { high: 3, medium: 2, low: 1 };
