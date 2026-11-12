import type { Dataset, Product, SalesRow, AdsRow, AuthorisedSeller, CompetitorLink, KeepaSnapshot, Offer, PortalEvent, Channel, D2cRow } from './types.js';
import { newCases, addDays, dayStr } from './protection.js';

/* Illustrative demo brand. Deterministic (seeded), so screenshots stay stable.
   Used by /portal/demo and whenever the database is not configured. */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function monday(d: Date): string {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const wd = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - wd);
  return dayStr(x);
}

const PRODUCTS: Product[] = [
  { sku: 'HAL-OAT-500', name: 'Oat Bites 500g', asin: 'B0DEMO0001', ean: '5060000000011', cost: 2.1, rrp: 6.99, mapPrice: 5.99 },
  { sku: 'HAL-GRA-750', name: 'Honey Granola 750g', asin: 'B0DEMO0002', ean: '5060000000028', cost: 2.8, rrp: 8.49, mapPrice: 7.49 },
  { sku: 'HAL-PRO-12', name: 'Protein Bar 12 pack', asin: 'B0DEMO0003', ean: '5060000000035', cost: 6.4, rrp: 17.99, mapPrice: 15.99 },
  { sku: 'HAL-NUT-1K', name: 'Mixed Nuts 1kg', asin: 'B0DEMO0004', ean: '5060000000042', cost: 5.9, rrp: 14.99, mapPrice: 12.99 },
  { sku: 'HAL-SED-300', name: 'Seed Mix 300g', asin: 'B0DEMO0005', ean: '5060000000059', cost: 1.6, rrp: 4.99, mapPrice: 4.29 },
  { sku: 'HAL-SNK-24', name: 'Snack Box 24 pack', asin: 'B0DEMO0006', ean: '5060000000066', cost: 9.2, rrp: 24.99, mapPrice: 21.99 },
];

const SELLERS: AuthorisedSeller[] = [
  { sellerName: 'Halcyon Direct Ltd', amazonSellerId: 'A1HALCYONDIRECT', ebayUsername: 'halcyon_direct', skus: 'All', validUntil: '2027-12-31' },
  { sellerName: 'Loopretail', amazonSellerId: 'A2LOOPRETAILUK', ebayUsername: 'loopretail', skus: 'All', validUntil: '2027-12-31' },
];

const COMP_BRANDS = ['Nature Valley', 'Jordans', 'Grenade', 'KIND', 'Eat Natural', 'Graze', 'Whitworths', 'Bounce'];

const CHANNEL_SHARE: [Channel, number][] = [
  ['Amazon', 0.46], ['TikTok Shop', 0.17], ['eBay', 0.09], ['Temu', 0.05], ['D2C', 0.15], ['Wholesale', 0.08],
];

export function demoDataset(now = new Date()): Dataset {
  const r = rng(42);
  const today = dayStr(now);
  const lastMonday = monday(now);
  const weeks = Array.from({ length: 16 }, (_, i) => addDays(lastMonday, -7 * (15 - i)));

  /* Sales: steady growth, TikTok growing fastest. */
  const sales: SalesRow[] = [];
  PRODUCTS.forEach((p, pi) => {
    const base = [260, 140, 70, 90, 210, 40][pi];
    weeks.forEach((w, wi) => {
      const growth = 1 + wi * 0.035;
      for (const [ch, share] of CHANNEL_SHARE) {
        const chGrowth = ch === 'TikTok Shop' ? 1 + wi * 0.06 : ch === 'Temu' ? 1 + wi * 0.02 : 1;
        const units = Math.max(0, Math.round(base * share * growth * chGrowth * (0.88 + r() * 0.24)));
        const price = ch === 'Wholesale' ? p.rrp * 0.55 : ch === 'Temu' ? p.rrp * 0.86 : p.rrp * (0.93 + r() * 0.05);
        const revenue = +(units * price).toFixed(2);
        const feeRate = ch === 'Amazon' ? 0.3 : ch === 'TikTok Shop' ? 0.09 : ch === 'eBay' ? 0.13 : ch === 'Temu' ? 0.12 : ch === 'D2C' ? 0.04 : 0;
        const stockBase = ch === 'Amazon' ? 900 : ch === 'Wholesale' ? 300 : ch === 'D2C' ? 400 : 0;
        const stock = stockBase ? Math.max(0, Math.round(stockBase * (pi === 3 ? 0.35 : 1) - wi * 8 + r() * 60)) : 0;
        sales.push({ weekStart: w, channel: ch, sku: p.sku, units, revenue, returns: Math.round(units * (0.01 + r() * 0.02)), fees: +(revenue * feeRate).toFixed(2), stock });
      }
    });
  });

  /* Ads. */
  const ads: AdsRow[] = [];
  const campaigns: [string, string, string, number, number][] = [
    ['Amazon', 'SP Oat Bites Exact', 'Sponsored Products', 160, 4.6],
    ['Amazon', 'SB Brand Defence', 'Sponsored Brands', 70, 6.8],
    ['Amazon', 'SP Competitor Conquest', 'Sponsored Products', 90, 2.1],
    ['TikTok', 'GMV Max Always On', 'GMV Max', 120, 3.9],
    ['eBay', 'Promoted Listings Standard', 'Promoted Listings', 30, 7.5],
    ['Google', 'D2C Shopping', 'Shopping', 85, 3.4],
    ['Meta', 'D2C Prospecting', 'Advantage+', 60, 2.6],
  ];
  weeks.forEach((w, wi) => {
    for (const [ch, name, type, spendBase, roas] of campaigns) {
      const spend = +(spendBase * (1 + wi * 0.03) * (0.85 + r() * 0.3)).toFixed(2);
      const adSales = +(spend * roas * (0.85 + r() * 0.3)).toFixed(2);
      const clicks = Math.round(spend / (0.45 + r() * 0.4));
      const orders = Math.round(adSales / 9.5);
      ads.push({ weekStart: w, channel: ch, campaign: name, campaignType: type, spend, impressions: clicks * Math.round(55 + r() * 40), clicks, orders, adSales });
    }
  });

  /* Competitors: 4 per product, the last one compatible. */
  const competitors: CompetitorLink[] = [];
  const compMeta = new Map<string, { brand: string; title: string; basePrice: number; baseBsr: number; trend: number; reviews: number }>();
  PRODUCTS.forEach((p, pi) => {
    for (let c = 0; c < 4; c++) {
      const asin = `B0COMP${pi}${c}${'XYZW'[c]}0`.slice(0, 10);
      const kind = c === 3 ? 'compatible' : 'competitor';
      const brand = kind === 'compatible' ? 'Generic' : COMP_BRANDS[(pi + c) % COMP_BRANDS.length];
      competitors.push({ sku: p.sku, asin, kind, source: c === 2 ? 'manual' : 'auto', createdAt: addDays(today, kind === 'compatible' ? -12 - pi : -120) });
      compMeta.set(asin, {
        brand,
        title: kind === 'compatible' ? `${p.name.split(' ')[0]} snack compatible with Halcyon` : `${brand} ${p.name}`,
        basePrice: p.rrp * (kind === 'compatible' ? 0.62 : 0.85 + c * 0.12),
        baseBsr: 1800 + c * 2600 + pi * 900,
        trend: c === 1 ? -0.45 : kind === 'compatible' ? -0.6 : 0.1,
        reviews: 300 + c * 900,
      });
    }
  });

  /* Keepa snapshots: 90 days. */
  const snapshots: KeepaSnapshot[] = [];
  const days = Array.from({ length: 90 }, (_, i) => addDays(today, -(89 - i)));
  PRODUCTS.forEach((p, pi) => {
    let reviews = 420 + pi * 180;
    days.forEach((d, di) => {
      const t = di / 89;
      const bsr = Math.round((2600 + pi * 1100) * (1 - 0.35 * t) * (0.97 + r() * 0.06));
      const price = +(p.rrp * (di % 14 < 3 ? 0.9 : 0.94)).toFixed(2);
      reviews += r() < 0.5 ? 1 : 0;
      const offers: Offer[] = [
        { sellerId: 'A1HALCYONDIRECT', sellerName: 'Halcyon Direct Ltd', price, isFBA: true, isAmazon: false, condition: 'New' },
        { sellerId: 'A2LOOPRETAILUK', sellerName: 'Loopretail', price: +(price + 0.2).toFixed(2), isFBA: true, isAmazon: false, condition: 'New' },
      ];
      // Two rogue sellers appear in the last 5 days on two products.
      if (pi === 0 && di >= 85) offers.push({ sellerId: 'A9QUICKDEALS', sellerName: 'QuickDeals Trading', price: +(p.mapPrice * 0.83).toFixed(2), isFBA: true, isAmazon: false, condition: 'New', country: 'DE' });
      if (pi === 2 && di >= 87) offers.push({ sellerId: 'A7GLOBALSUPPLY', sellerName: 'Global Supply Hub', price: +(p.mapPrice * 0.78).toFixed(2), isFBA: true, isAmazon: false, condition: 'New', country: 'CN' });
      const buyBox = pi === 2 && di >= 88 ? 'A7GLOBALSUPPLY' : 'A1HALCYONDIRECT';
      snapshots.push({
        asin: p.asin, day: d, title: pi === 4 && di >= 89 ? 'Seed Mix 300g Bulk Value Pack Assorted' : `Halcyon ${p.name}`, brand: 'Halcyon Foods', images: pi === 4 && di >= 89 ? 'img-new-1.jpg,img-new-2.jpg' : `${p.sku}-1.jpg,${p.sku}-2.jpg`,
        bsr, bsrAvg30: Math.round(bsr * 1.05), bsrAvg90: Math.round(bsr * 1.18),
        price, priceAvg30: +(p.rrp * 0.94).toFixed(2), priceAvg90: +(p.rrp * 0.95).toFixed(2),
        buyBoxSellerId: buyBox, offerCount: offers.length, offers,
        monthlySold: [400, 200, 100, 100, 300, 50][pi], rating: 4.5 + (pi % 3) * 0.1, reviews,
      });
    });
  });
  for (const [asin, m] of compMeta) {
    let reviews = m.reviews;
    days.forEach((d, di) => {
      const t = di / 89;
      reviews += r() < (m.trend < 0 ? 0.9 : 0.4) ? 1 : 0;
      const bsr = Math.round(m.baseBsr * (1 + m.trend * t) * (0.97 + r() * 0.06));
      snapshots.push({
        asin, day: d, title: m.title, brand: m.brand, images: `${asin}.jpg`,
        bsr, bsrAvg30: Math.round(bsr * 1.03), bsrAvg90: Math.round(m.baseBsr),
        price: +(m.basePrice * (di % 21 < 4 ? 0.92 : 1)).toFixed(2), priceAvg30: +m.basePrice.toFixed(2), priceAvg90: +(m.basePrice * 1.02).toFixed(2),
        buyBoxSellerId: null, offerCount: 3, offers: [], monthlySold: m.trend < 0 ? 200 : 100, rating: 4.2, reviews,
      });
    });
  }

  const events: PortalEvent[] = [
    { at: new Date(now.getTime() - 2 * 60_000).toISOString(), source: 'Keepa', message: 'Daily check complete for 30 ASINs', level: 'ok' },
    { at: new Date(now.getTime() - 3 * 3600_000).toISOString(), source: 'Manual sheet', message: 'Sales sheet uploaded (576 rows)', level: 'ok' },
    { at: new Date(now.getTime() - 26 * 3600_000).toISOString(), source: 'TikTok Shop', message: 'Revenue up 18% week on week', level: 'info' },
  ];

  /* D2C store: revenue matches the D2C channel in the sales rows. */
  const d2c: D2cRow[] = weeks.map((w, wi) => {
    const revenue = +sales.filter((s) => s.weekStart === w && s.channel === 'D2C').reduce((a, s) => a + s.revenue, 0).toFixed(2);
    const orders = Math.max(1, Math.round(revenue / (24 + r() * 4)));
    const conv = 0.019 + wi * 0.0006 + r() * 0.002;
    const returning = Math.round(orders * (0.22 + wi * 0.006));
    return { weekStart: w, sessions: Math.round(orders / conv), orders, revenue, newCustomers: orders - returning, returningCustomers: returning, refunds: Math.round(orders * (0.02 + r() * 0.015)) };
  });

  const ds: Dataset = {
    brand: { id: 'demo', name: 'Halcyon Foods (demo)', plan: 'Scale plan', status: 'active', accountManager: 'Your Loopretail account manager', accountManagerEmail: 'hello@loopretail.io', contactEmail: '' },
    products: PRODUCTS, sales, ads, sellers: SELLERS, competitors, d2c, snapshots, cases: [], events,
  };
  ds.cases = newCases(ds, now);
  for (const c of ds.cases) ds.events.push({ at: c.openedAt, source: 'Loop Protect', message: c.title, level: 'warn' });
  return ds;
}
