import { CHANNELS, CASE_LABELS, type Dataset, type SalesRow, type AdsRow, type KeepaSnapshot } from './types.js';
import { snapshotIndex, SEVERITY_WEIGHT, addDays } from './protection.js';

/* Turns a brand's raw rows into what each dashboard tab shows.
   Pure functions: the same code runs on demo data and on real data. */

const VAT = 1.2;
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const round = (n: number, d = 2) => (Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : 0);
const pctChange = (now: number, before: number) => (before ? round(((now - before) / before) * 100, 1) : null);
const avg = (a: number[]) => (a.length ? sum(a) / a.length : null);

function weeksOf(sales: { weekStart: string }[]): string[] {
  return [...new Set(sales.map((s) => s.weekStart))].sort();
}

/** Splits the sorted week list into the current window and the one before it. */
function windows(allWeeks: string[], size: number) {
  const cur = allWeeks.slice(-size);
  const prev = allWeeks.slice(-size * 2, -size);
  return { cur: new Set(cur), prev: new Set(prev), curList: cur, prevList: prev };
}

function salesKpis(ds: Dataset, sales: SalesRow[], ads: AdsRow[], lastWeek: string | undefined) {
  const cost = new Map(ds.products.map((p) => [p.sku, p.cost]));
  const revenue = sum(sales.map((s) => s.revenue));
  const units = sum(sales.map((s) => s.units));
  const fees = sum(sales.map((s) => s.fees));
  const cogs = sum(sales.map((s) => (cost.get(s.sku) ?? 0) * s.units));
  const adSpend = sum(ads.map((a) => a.spend));
  const revExVat = revenue / VAT;
  const stock = sum(sales.filter((s) => s.weekStart === lastWeek).map((s) => s.stock));
  return {
    gmv: round(revenue),
    units,
    marginPct: revExVat ? round(((revExVat - cogs - fees - adSpend) / revExVat) * 100, 1) : null,
    sellThroughPct: units + stock ? round((units / (units + stock)) * 100, 1) : null,
    tacosPct: revenue ? round((adSpend / revenue) * 100, 1) : null,
    adSpend: round(adSpend),
  };
}

function riskIndex(ds: Dataset) {
  const open = ds.cases.filter((c) => c.status === 'flagged' || c.status === 'reviewing');
  const score = sum(open.map((c) => SEVERITY_WEIGHT[c.severity]));
  const high = open.filter((c) => c.severity === 'high').length;
  // Any open high alert means at least Medium; many alerts or 3+ high means High.
  const label = high >= 3 || score > 15 ? 'High' : high > 0 || score > 6 ? 'Medium' : 'Low';
  return { score, open: open.length, high, label };
}

/* ───────────── Overview ───────────── */
export function overview(ds: Dataset, period = 4) {
  const allWeeks = weeksOf(ds.sales);
  const { cur, prev, curList, prevList } = windows(allWeeks, period);
  const k = salesKpis(ds, ds.sales.filter((s) => cur.has(s.weekStart)), ds.ads.filter((a) => cur.has(a.weekStart)), curList.at(-1));
  const kp = salesKpis(ds, ds.sales.filter((s) => prev.has(s.weekStart)), ds.ads.filter((a) => prev.has(a.weekStart)), prevList.at(-1));

  const idx = snapshotIndex(ds.snapshots);
  const bsrs = ds.products.map((p) => idx.latest(p.asin)?.bsrAvg30 ?? idx.latest(p.asin)?.bsr).filter((x): x is number => x != null && x > 0);

  const chartWeeks = allWeeks.slice(-12);
  const byChannel = CHANNELS.map((ch) => ({
    name: ch,
    values: chartWeeks.map((w) => round(sum(ds.sales.filter((s) => s.weekStart === w && s.channel === ch).map((s) => s.revenue)))),
  })).filter((s) => s.values.some((v) => v > 0));
  const total = chartWeeks.map((_, i) => round(sum(byChannel.map((s) => s.values[i]))));

  return {
    period: { weeks: period, from: curList[0] ?? null, to: curList.at(-1) ?? null },
    kpis: [
      { key: 'gmv', label: 'GMV', value: k.gmv, format: 'gbp', change: pctChange(k.gmv, kp.gmv), unit: '%' },
      { key: 'units', label: 'Units sold', value: k.units, format: 'int', change: pctChange(k.units, kp.units), unit: '%' },
      { key: 'margin', label: 'Margin', value: k.marginPct, format: 'pct', change: k.marginPct != null && kp.marginPct != null ? round(k.marginPct - kp.marginPct, 1) : null, unit: 'pp' },
      { key: 'sellThrough', label: 'Sell through', value: k.sellThroughPct, format: 'pct', change: k.sellThroughPct != null && kp.sellThroughPct != null ? round(k.sellThroughPct - kp.sellThroughPct, 1) : null, unit: 'pp' },
      { key: 'tacos', label: 'TACoS', value: k.tacosPct, format: 'pct', change: k.tacosPct != null && kp.tacosPct != null ? round(k.tacosPct - kp.tacosPct, 1) : null, unit: 'pp', lowerIsBetter: true },
      { key: 'bsr', label: 'Average BSR (30d)', value: bsrs.length ? Math.round(avg(bsrs)!) : null, format: 'int', change: null, unit: '', lowerIsBetter: true },
    ],
    risk: riskIndex(ds),
    revenue: { weeks: chartWeeks, total, byChannel },
    events: [...ds.events].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8),
    hasData: { sales: ds.sales.length > 0, keepa: ds.snapshots.length > 0 },
  };
}

/* ───────────── Channels ───────────── */
export function channels(ds: Dataset, period = 4) {
  const allWeeks = weeksOf(ds.sales);
  const { cur, prev, curList } = windows(allWeeks, period);
  const name = new Map(ds.products.map((p) => [p.sku, p.name]));

  const cards = CHANNELS.map((ch) => {
    const c = ds.sales.filter((s) => s.channel === ch && cur.has(s.weekStart));
    const p = ds.sales.filter((s) => s.channel === ch && prev.has(s.weekStart));
    const rev = sum(c.map((s) => s.revenue));
    const units = sum(c.map((s) => s.units));
    return {
      channel: ch,
      revenue: round(rev),
      units,
      asp: units ? round(rev / units) : null,
      returnsPct: units ? round((sum(c.map((s) => s.returns)) / units) * 100, 1) : null,
      change: pctChange(rev, sum(p.map((s) => s.revenue))),
    };
  }).filter((c) => c.revenue > 0 || c.units > 0);

  const rowsMap = new Map<string, { sku: string; name: string; channel: string; revenue: number; units: number; prevRevenue: number }>();
  for (const s of ds.sales) {
    if (!cur.has(s.weekStart) && !prev.has(s.weekStart)) continue;
    const k = `${s.sku}|${s.channel}`;
    const r = rowsMap.get(k) ?? { sku: s.sku, name: name.get(s.sku) ?? s.sku, channel: s.channel, revenue: 0, units: 0, prevRevenue: 0 };
    if (cur.has(s.weekStart)) { r.revenue += s.revenue; r.units += s.units; } else r.prevRevenue += s.revenue;
    rowsMap.set(k, r);
  }
  const rows = [...rowsMap.values()].map((r) => ({ ...r, revenue: round(r.revenue), growth: pctChange(r.revenue, r.prevRevenue) })).sort((a, b) => b.revenue - a.revenue);

  // Stock cover: latest stock across channels ÷ average weekly units.
  const lastWeek = curList.at(-1);
  const stock = ds.products.map((p) => {
    const st = sum(ds.sales.filter((s) => s.sku === p.sku && s.weekStart === lastWeek).map((s) => s.stock));
    const weekly = sum(ds.sales.filter((s) => s.sku === p.sku && cur.has(s.weekStart)).map((s) => s.units)) / Math.max(1, curList.length);
    return { sku: p.sku, name: p.name, stock: st, weeklyUnits: round(weekly, 1), weeksCover: weekly ? round(st / weekly, 1) : null };
  });

  const bySku = new Map<string, number>();
  for (const r of rows) bySku.set(r.sku, (bySku.get(r.sku) ?? 0) + r.revenue);
  const ranked = [...bySku.entries()].sort((a, b) => b[1] - a[1]).map(([sku, revenue]) => ({ sku, name: name.get(sku) ?? sku, revenue: round(revenue) }));

  return {
    period: { weeks: period, to: lastWeek ?? null },
    cards,
    rows,
    top: ranked.slice(0, 5),
    bottom: ranked.slice(-5).reverse(),
    stockWarnings: stock.filter((s) => s.weeksCover != null && s.weeksCover < 4),
  };
}

/* ───────────── Protection ───────────── */
export function protection(ds: Dataset) {
  const idx = snapshotIndex(ds.snapshots);
  const authIds = new Set(ds.sellers.map((s) => s.amazonSellerId).filter(Boolean));
  const sellerMap = new Map<string, { sellerId: string; sellerName: string; authorised: boolean; listings: { asin: string; sku: string; price: number | null; isFBA: boolean }[] }>();
  for (const p of ds.products) {
    const snap = idx.latest(p.asin);
    for (const o of snap?.offers ?? []) {
      const r = sellerMap.get(o.sellerId) ?? { sellerId: o.sellerId, sellerName: o.sellerName || (o.isAmazon ? 'Amazon' : o.sellerId), authorised: o.isAmazon || authIds.has(o.sellerId), listings: [] };
      r.listings.push({ asin: p.asin, sku: p.sku, price: o.price, isFBA: o.isFBA });
      sellerMap.set(o.sellerId, r);
    }
  }
  const cases = [...ds.cases].sort((a, b) => b.openedAt.localeCompare(a.openedAt));
  const count = (f: (c: (typeof cases)[number]) => boolean) => cases.filter(f).length;
  return {
    summary: {
      open: count((c) => c.status === 'flagged' || c.status === 'reviewing'),
      flagged: count((c) => c.status === 'flagged'),
      reviewing: count((c) => c.status === 'reviewing'),
      resolved: count((c) => c.status === 'resolved'),
      unauthorisedSellers: ds.sellers.some((s) => s.amazonSellerId) ? [...sellerMap.values()].filter((s) => !s.authorised).length : 0,
      authorisedListMissing: !ds.sellers.some((s) => s.amazonSellerId),
      lastCheck: ds.snapshots.reduce<string | null>((m, s) => (!m || s.day > m ? s.day : m), null),
    },
    byType: Object.entries(CASE_LABELS).map(([type, label]) => ({ type, label, open: count((c) => c.type === type && (c.status === 'flagged' || c.status === 'reviewing')) })),
    cases,
    sellers: [...sellerMap.values()].sort((a, b) => Number(a.authorised) - Number(b.authorised)),
  };
}

/* ───────────── Brand Analysis ───────────── */
function series(snaps: KeepaSnapshot[] | undefined, field: 'bsr' | 'price', days: string[]) {
  const m = new Map((snaps ?? []).map((s) => [s.day, s[field]]));
  return days.map((d) => m.get(d) ?? null);
}

export function analysis(ds: Dataset, sku?: string) {
  const idx = snapshotIndex(ds.snapshots);
  const latestDay = ds.snapshots.reduce<string | null>((m, s) => (!m || s.day > m ? s.day : m), null);

  const productRows = ds.products.map((p) => {
    const s = idx.latest(p.asin);
    const comps = ds.competitors.filter((c) => c.sku === p.sku && c.kind === 'competitor').map((c) => idx.latest(c.asin)?.price).filter((x): x is number => x != null);
    const lowest = comps.length ? Math.min(...comps) : null;
    return {
      sku: p.sku, name: p.name, asin: p.asin,
      bsr: s?.bsr ?? null, bsrAvg30: s?.bsrAvg30 ?? null, bsrAvg90: s?.bsrAvg90 ?? null,
      price: s?.price ?? null, priceAvg90: s?.priceAvg90 ?? null,
      rating: s?.rating ?? null, reviews: s?.reviews ?? null,
      lowestCompetitor: lowest,
      cheapest: s?.price != null && lowest != null ? s.price <= lowest : null,
      competitors: ds.competitors.filter((c) => c.sku === p.sku).length,
    };
  });

  const monthAgo = latestDay ? addDays(latestDay, -30) : '';
  const brandView = {
    cheapestPct: (() => {
      const r = productRows.filter((p) => p.cheapest != null);
      return r.length ? round((r.filter((p) => p.cheapest).length / r.length) * 100, 0) : null;
    })(),
    newCompatiblesThisMonth: ds.competitors.filter((c) => c.kind === 'compatible' && c.createdAt >= monthAgo).length,
    trackedAsins: new Set([...ds.products.map((p) => p.asin), ...ds.competitors.map((c) => c.asin)]).size,
  };

  const p = ds.products.find((x) => x.sku === sku) ?? ds.products[0];
  if (!p) return { products: productRows, brand: brandView, selected: null };

  const own = idx.latest(p.asin);
  const links = ds.competitors.filter((c) => c.sku === p.sku);
  const compRows = links.map((c) => {
    const s = idx.latest(c.asin);
    const s30 = idx.before(c.asin, 30);
    return {
      asin: c.asin, kind: c.kind, source: c.source,
      title: s?.title ?? '', brand: s?.brand ?? '',
      price: s?.price ?? null, priceAvg90: s?.priceAvg90 ?? null,
      bsr: s?.bsr ?? null, bsrAvg30: s?.bsrAvg30 ?? null,
      monthlySold: s?.monthlySold ?? null, reviews: s?.reviews ?? null, rating: s?.rating ?? null,
      reviewGrowth30: s?.reviews != null && s30?.reviews != null ? s.reviews - s30.reviews : null,
      bsrChange30: s?.bsr != null && s30?.bsr != null ? s30.bsr - s.bsr : null, // positive = climbing
    };
  });
  const prices = compRows.map((c) => c.price).filter((x): x is number => x != null);
  const position = own?.price != null && prices.length
    ? (() => {
        const lo = Math.min(...prices), hi = Math.max(...prices), av = avg(prices)!;
        const label = own.price! <= lo ? 'Cheapest' : own.price! >= hi ? 'Premium' : own.price! <= av ? 'Below average' : 'Above average';
        return { ours: own.price, lowest: round(lo), average: round(av), highest: round(hi), label };
      })()
    : null;

  const days: string[] = [];
  if (latestDay) for (let i = 89; i >= 0; i--) days.push(addDays(latestDay, -i));
  const top5 = [...compRows].filter((c) => c.kind === 'competitor').sort((a, b) => (a.bsr ?? 1e12) - (b.bsr ?? 1e12)).slice(0, 5);
  const named = (asin: string, fallback: string) => {
    const s = idx.latest(asin);
    return (s?.brand || fallback).slice(0, 24);
  };
  const compatByDay = days.map((d) => links.filter((l) => l.kind === 'compatible' && (idx.byAsin.get(l.asin) ?? []).some((s) => s.day <= d)).length);

  return {
    products: productRows,
    brand: brandView,
    selected: {
      product: p,
      own: own ?? null,
      position,
      competitors: compRows.sort((a, b) => (a.bsr ?? 1e12) - (b.bsr ?? 1e12)),
      bsrTrend: { days, series: [{ name: 'Ours', values: series(idx.byAsin.get(p.asin), 'bsr', days) }, ...top5.map((c) => ({ name: named(c.asin, c.asin), values: series(idx.byAsin.get(c.asin), 'bsr', days) }))] },
      priceTrend: { days, series: [{ name: 'Ours', values: series(idx.byAsin.get(p.asin), 'price', days) }, ...top5.map((c) => ({ name: named(c.asin, c.asin), values: series(idx.byAsin.get(c.asin), 'price', days) }))] },
      compatibles: {
        count: links.filter((l) => l.kind === 'compatible').length,
        avgPrice: (() => { const a = compRows.filter((c) => c.kind === 'compatible').map((c) => c.price).filter((x): x is number => x != null); return a.length ? round(avg(a)!) : null; })(),
        sharePct: links.length ? round((links.filter((l) => l.kind === 'compatible').length / links.length) * 100, 0) : null,
        trend: { days, values: compatByDay },
      },
      climbers: [...compRows].filter((c) => c.bsrChange30 != null).sort((a, b) => (b.bsrChange30 ?? 0) - (a.bsrChange30 ?? 0)).slice(0, 5),
    },
  };
}

/* ───────────── Ads ───────────── */
export function ads(ds: Dataset, period = 4) {
  const allWeeks = [...new Set([...ds.ads.map((a) => a.weekStart), ...ds.sales.map((s) => s.weekStart)])].sort();
  const { cur, prev } = windows(allWeeks, period);
  const pick = (set: Set<string>) => ds.ads.filter((a) => set.has(a.weekStart));
  const k = (rows: AdsRow[], salesRev: number) => {
    const spend = sum(rows.map((r) => r.spend)), adSales = sum(rows.map((r) => r.adSales));
    const clicks = sum(rows.map((r) => r.clicks)), orders = sum(rows.map((r) => r.orders));
    return {
      spend: round(spend), adSales: round(adSales),
      roas: spend ? round(adSales / spend) : null,
      acosPct: adSales ? round((spend / adSales) * 100, 1) : null,
      tacosPct: salesRev ? round((spend / salesRev) * 100, 1) : null,
      cpc: clicks ? round(spend / clicks) : null,
      cvrPct: clicks ? round((orders / clicks) * 100, 1) : null,
    };
  };
  const rev = (set: Set<string>) => sum(ds.sales.filter((s) => set.has(s.weekStart)).map((s) => s.revenue));
  const now = k(pick(cur), rev(cur));
  const before = k(pick(prev), rev(prev));

  const chans = [...new Set(ds.ads.map((a) => a.channel))];
  const chartWeeks = allWeeks.slice(-12);
  const byChannel = chans.map((ch) => {
    const c = k(pick(cur).filter((a) => a.channel === ch), 0);
    const p = k(pick(prev).filter((a) => a.channel === ch), 0);
    return {
      channel: ch, ...c,
      spendGrowth: pctChange(c.spend, p.spend),
      salesGrowth: pctChange(c.adSales, p.adSales),
      weekly: chartWeeks.map((w) => round(sum(ds.ads.filter((a) => a.channel === ch && a.weekStart === w).map((a) => a.spend)))),
      weeklySales: chartWeeks.map((w) => round(sum(ds.ads.filter((a) => a.channel === ch && a.weekStart === w).map((a) => a.adSales)))),
    };
  });

  const camp = new Map<string, AdsRow>();
  for (const a of pick(cur)) {
    const key = `${a.channel}|${a.campaign}`;
    const r = camp.get(key) ?? { ...a, spend: 0, impressions: 0, clicks: 0, orders: 0, adSales: 0 };
    r.spend += a.spend; r.impressions += a.impressions; r.clicks += a.clicks; r.orders += a.orders; r.adSales += a.adSales;
    camp.set(key, r);
  }
  const campaigns = [...camp.values()].map((c) => ({
    channel: c.channel, campaign: c.campaign, campaignType: c.campaignType,
    spend: round(c.spend), adSales: round(c.adSales), orders: c.orders, clicks: c.clicks,
    roas: c.spend ? round(c.adSales / c.spend) : null,
    acosPct: c.adSales ? round((c.spend / c.adSales) * 100, 1) : null,
  })).sort((a, b) => b.spend - a.spend);

  return {
    kpis: now,
    change: {
      spend: pctChange(now.spend, before.spend),
      adSales: pctChange(now.adSales, before.adSales),
      roas: now.roas != null && before.roas != null ? round(now.roas - before.roas) : null,
      acos: now.acosPct != null && before.acosPct != null ? round(now.acosPct - before.acosPct, 1) : null,
    },
    weeks: chartWeeks,
    byChannel,
    campaigns,
    targetAcosPct: 25,
  };
}

/* ───────────── Logistics & Distribution ───────────── */
export function logistics(ds: Dataset) {
  const allWeeks = weeksOf(ds.sales);
  const last = allWeeks.at(-1);
  const last4 = new Set(allWeeks.slice(-4));
  const stock = ds.products.map((p) => {
    const rows = ds.sales.filter((s) => s.sku === p.sku && s.weekStart === last);
    const byLoc: Record<string, number> = {};
    for (const r of rows) {
      const loc = r.channel === 'Amazon' ? 'FBA' : r.channel === 'Wholesale' ? 'Wholesale stock' : 'Warehouse';
      byLoc[loc] = (byLoc[loc] ?? 0) + r.stock;
    }
    const total = sum(Object.values(byLoc));
    const weekly = sum(ds.sales.filter((s) => s.sku === p.sku && last4.has(s.weekStart)).map((s) => s.units)) / 4;
    const cover = weekly ? round(total / weekly, 1) : null;
    return { sku: p.sku, name: p.name, byLocation: byLoc, total, weeklyUnits: round(weekly, 1), weeksCover: cover, reorder: cover != null && cover < 4 };
  });
  const wholesale = allWeeks.slice(-12).map((w) => ({
    week: w,
    units: sum(ds.sales.filter((s) => s.channel === 'Wholesale' && s.weekStart === w).map((s) => s.units)),
    revenue: round(sum(ds.sales.filter((s) => s.channel === 'Wholesale' && s.weekStart === w).map((s) => s.revenue))),
  }));
  const proof = CHANNELS.filter((c) => c !== 'Wholesale').map((ch) => {
    const r = ds.sales.filter((s) => s.channel === ch && allWeeks.slice(-12).includes(s.weekStart));
    return { channel: ch, units: sum(r.map((s) => s.units)), revenue: round(sum(r.map((s) => s.revenue))) };
  }).filter((r) => r.units > 0);
  return {
    stock,
    reorder: stock.filter((s) => s.reorder),
    wholesale,
    retailProof: proof,
    pending: ['Dispatch performance (connect Laneverse or courier data)', 'Courier mix and cost per order', 'Inbound FBA shipments', 'Retail and wholesale accounts list'],
  };
}

/* ───────────── D2C store ───────────── */
export function d2c(ds: Dataset, period = 4) {
  const rows = [...ds.d2c].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const weeks = rows.map((r) => r.weekStart);
  const cur = rows.slice(-period), prev = rows.slice(-period * 2, -period);
  const paidSpend = (list: typeof rows) => {
    const set = new Set(list.map((r) => r.weekStart));
    return sum(ds.ads.filter((a) => set.has(a.weekStart) && /google|meta|facebook|instagram|d2c|shopify/i.test(a.channel)).map((a) => a.spend));
  };
  const k = (list: typeof rows) => {
    const sessions = sum(list.map((r) => r.sessions)), orders = sum(list.map((r) => r.orders)), revenue = sum(list.map((r) => r.revenue));
    const nw = sum(list.map((r) => r.newCustomers)), ret = sum(list.map((r) => r.returningCustomers)), refunds = sum(list.map((r) => r.refunds));
    const spend = paidSpend(list);
    return {
      revenue: round(revenue), orders, sessions,
      conversionPct: sessions ? round((orders / sessions) * 100, 2) : null,
      aov: orders ? round(revenue / orders) : null,
      repeatPct: nw + ret ? round((ret / (nw + ret)) * 100, 1) : null,
      cpa: nw && spend ? round(spend / nw) : null,
      refundPct: orders ? round((refunds / orders) * 100, 1) : null,
      newCustomers: nw, paidSpend: round(spend),
    };
  };
  const now = k(cur), before = k(prev);
  const last12 = rows.slice(-12);
  return {
    hasData: rows.length > 0,
    period: { weeks: period, from: cur[0]?.weekStart ?? null, to: cur.at(-1)?.weekStart ?? null },
    kpis: now,
    change: {
      revenue: pctChange(now.revenue, before.revenue),
      orders: pctChange(now.orders, before.orders),
      conversion: now.conversionPct != null && before.conversionPct != null ? round(now.conversionPct - before.conversionPct, 2) : null,
      aov: pctChange(now.aov ?? 0, before.aov ?? 0),
      repeat: now.repeatPct != null && before.repeatPct != null ? round(now.repeatPct - before.repeatPct, 1) : null,
      cpa: now.cpa != null && before.cpa != null ? pctChange(now.cpa, before.cpa) : null,
    },
    trend: {
      weeks: last12.map((r) => r.weekStart),
      revenue: last12.map((r) => round(r.revenue)),
      conversionPct: last12.map((r) => (r.sessions ? round((r.orders / r.sessions) * 100, 2) : null)),
      newCustomers: last12.map((r) => r.newCustomers),
      returningCustomers: last12.map((r) => r.returningCustomers),
    },
    weeksAvailable: weeks.length,
  };
}

/* ───────────── Home (client landing) ───────────── */
const daysSince = (day: string | null | undefined, now: Date) => (day ? Math.floor((now.getTime() - new Date(day.slice(0, 10) + 'T00:00:00Z').getTime()) / 86_400_000) : null);

export function home(ds: Dataset, now = new Date()) {
  const latest = (xs: string[]) => xs.reduce<string | null>((m, x) => (!m || x > m ? x : m), null);
  const lastKeepa = latest(ds.snapshots.map((s) => s.day));
  const lastSales = latest(ds.sales.map((s) => s.weekStart));
  const lastAds = latest(ds.ads.map((a) => a.weekStart));
  const lastD2c = latest(ds.d2c.map((d) => d.weekStart));
  const withAsin = ds.products.filter((p) => p.asin);
  const priced = ds.products.filter((p) => p.cost > 0 && p.mapPrice > 0);

  const steps = [
    { key: 'products', label: 'Import your products from ASINs', done: withAsin.length > 0, detail: withAsin.length ? `${withAsin.length} products` : 'Paste your ASINs under Data', tab: 'data' },
    { key: 'pricing', label: 'Add cost and minimum price for every product', done: ds.products.length > 0 && priced.length === ds.products.length, detail: ds.products.length ? `${priced.length} of ${ds.products.length} done` : 'After products are in', tab: 'data' },
    { key: 'sellers', label: 'Upload your authorised seller list', done: ds.sellers.some((s) => s.amazonSellerId), detail: ds.sellers.length ? `${ds.sellers.length} sellers` : 'Switches on seller alerts', tab: 'data' },
    { key: 'keepa', label: 'First Keepa check', done: Boolean(lastKeepa), detail: lastKeepa ? `Last check ${lastKeepa}` : 'Runs daily once products are in', tab: 'protection' },
    { key: 'competitors', label: 'Build competitor sets', done: ds.competitors.length > 0, detail: ds.competitors.length ? `${ds.competitors.length} tracked` : 'Use Find competitors under Data', tab: 'data' },
    { key: 'sales', label: 'Upload weekly sales', done: Boolean(lastSales), detail: lastSales ? `Latest week ${lastSales}` : 'From the Sales template', tab: 'data' },
    { key: 'ads', label: 'Upload weekly ads', done: Boolean(lastAds), detail: lastAds ? `Latest week ${lastAds}` : 'From the Ads template', tab: 'data' },
  ];
  const done = steps.filter((s) => s.done).length;

  const fresh = (label: string, day: string | null, maxDays: number, tab: string) => {
    const age = daysSince(day, now);
    return { label, last: day, ageDays: age, status: age == null ? 'missing' : age > maxDays ? 'stale' : 'ok', tab };
  };
  const freshness = [
    fresh('Keepa market data', lastKeepa, 2, 'protection'),
    fresh('Sales sheet', lastSales, 14, 'data'),
    fresh('Ads sheet', lastAds, 14, 'data'),
    ...(ds.d2c.length ? [fresh('D2C sheet', lastD2c, 14, 'data')] : []),
  ];

  const open = ds.cases.filter((c) => c.status === 'flagged' || c.status === 'reviewing');
  const ch = ds.sales.length ? channels(ds, 4) : null;
  const ad = ds.ads.length ? ads(ds, 4) : null;
  const an = analysis(ds);
  const attention = [
    ...open.filter((c) => c.severity === 'high').slice(0, 5).map((c) => ({ kind: 'case', level: 'high', title: c.title, detail: c.detail, tab: 'protection' })),
    ...(ch?.stockWarnings ?? []).slice(0, 3).map((s) => ({ kind: 'stock', level: 'medium', title: `${s.name}: ${s.weeksCover} weeks of stock left`, detail: `${s.stock} units, selling about ${s.weeklyUnits} a week`, tab: 'channels' })),
    ...(ad ? ad.campaigns.filter((c) => (c.acosPct ?? 0) > ad.targetAcosPct).slice(0, 3).map((c) => ({ kind: 'ads', level: 'medium', title: `${c.campaign} is at ${c.acosPct}% ACoS`, detail: `${c.channel}, £${c.spend} spend in 4 weeks`, tab: 'ads' })) : []),
    ...an.products.filter((p) => p.cheapest === false && p.price != null && p.lowestCompetitor != null && p.price - p.lowestCompetitor > 0.5).slice(0, 3).map((p) => ({ kind: 'price', level: 'low', title: `Undercut on ${p.name}`, detail: `You £${p.price?.toFixed(2)}, lowest rival £${p.lowestCompetitor?.toFixed(2)}`, tab: 'analysis' })),
  ];

  const ov = overview(ds, 4);
  return {
    brandInfo: { status: ds.brand.status ?? 'active', plan: ds.brand.plan, accountManager: ds.brand.accountManager ?? '', accountManagerEmail: ds.brand.accountManagerEmail ?? '' },
    setup: { steps, done, total: steps.length, pct: Math.round((done / steps.length) * 100) },
    freshness,
    attention,
    counts: { products: ds.products.length, competitors: ds.competitors.length, openCases: open.length, highCases: open.filter((c) => c.severity === 'high').length },
    // Without a sales sheet there is no GMV yet: show "–" rather than £0.
    kpis: ov.kpis.filter((k) => ['gmv', 'margin', 'tacos', 'bsr'].includes(k.key)).map((k) => (k.key === 'gmv' && !ds.sales.length ? { ...k, value: null } : k)),
    risk: ov.risk,
    events: ov.events.slice(0, 5),
  };
}

/** One row per brand for the staff admin list. */
export function adminSummary(ds: Dataset, users: number, now = new Date()) {
  const h = home(ds, now);
  const stale = h.freshness.filter((f) => f.status !== 'ok').map((f) => f.label);
  const health = h.setup.done < 4 ? 'setup' : h.counts.highCases > 0 ? 'alerts' : stale.length ? 'stale' : 'ok';
  const ov = ds.sales.length ? overview(ds, 4) : null;
  return {
    brand: ds.brand,
    users,
    setupPct: h.setup.pct,
    setupDone: h.setup.done,
    setupTotal: h.setup.total,
    products: h.counts.products,
    openCases: h.counts.openCases,
    highCases: h.counts.highCases,
    lastKeepa: h.freshness[0].last,
    lastSales: h.freshness[1].last,
    stale,
    health,
    gmv4w: ov ? ov.kpis.find((k) => k.key === 'gmv')?.value ?? null : null,
    gmvChange: ov ? ov.kpis.find((k) => k.key === 'gmv')?.change ?? null : null,
  };
}
