import { GoogleGenAI, Type } from '@google/genai';
import type { Dataset } from './types.js';
import * as metrics from './metrics.js';

/* Built-in AI (Google Gemini, free tier is enough for this load).
   Used for: the "Ask" search box, competitor keyword ideas, and sorting
   Keepa search results into competitor / compatible / not relevant.
   Set GEMINI_API_KEY (Google AI Studio). Model is configurable. */

const MODEL = (process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite').trim();
const key = () => (process.env.GEMINI_API_KEY || '').trim();
export const aiConfigured = () => key().length > 0 && key() !== 'MY_GEMINI_API_KEY';

let _ai: GoogleGenAI | null = null;
function client() {
  if (!aiConfigured()) throw new Error('AI is not configured. Add GEMINI_API_KEY to the server environment.');
  if (!_ai) {
    const baseUrl = (process.env.GEMINI_BASE_URL || '').trim(); // override only for tests
    _ai = new GoogleGenAI({ apiKey: key(), ...(baseUrl ? { httpOptions: { baseUrl } } : {}) });
  }
  return _ai;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function json<T>(prompt: string, schema: any, system: string): Promise<T> {
  const r = await client().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { systemInstruction: system, responseMimeType: 'application/json', responseSchema: schema, temperature: 0.2 },
  });
  const text = r.text ?? '';
  try { return JSON.parse(text) as T; } catch { throw new Error('The AI returned an unreadable answer. Try again.'); }
}

/* Per-user rate limit so the free tier is never exhausted by one person. */
const calls = new Map<string, number[]>();
export function aiAllowed(who: string, perHour = 40): boolean {
  const now = Date.now();
  const list = (calls.get(who) ?? []).filter((t) => now - t < 3600_000);
  if (list.length >= perHour) { calls.set(who, list); return false; }
  list.push(now); calls.set(who, list);
  return true;
}

/** Compact snapshot of the brand for the model (keeps tokens low). */
function context(ds: Dataset) {
  const ov = metrics.overview(ds, 4);
  const ch = metrics.channels(ds, 4);
  const an = metrics.analysis(ds);
  const pr = metrics.protection(ds);
  const ad = metrics.ads(ds, 4);
  return {
    brand: ds.brand.name,
    period: ov.period,
    kpis: ov.kpis.map((k) => ({ [k.label]: k.value, change: k.change })),
    risk: ov.risk,
    channels: ch.cards,
    stockWarnings: ch.stockWarnings,
    topProducts: ch.top,
    bottomProducts: ch.bottom,
    products: an.products.map((p) => ({ sku: p.sku, name: p.name, asin: p.asin, bsr: p.bsr, bsrAvg30: p.bsrAvg30, bsrAvg90: p.bsrAvg90, price: p.price, priceAvg90: p.priceAvg90, rating: p.rating, reviews: p.reviews, lowestCompetitorPrice: p.lowestCompetitor, weAreCheapest: p.cheapest, competitorsTracked: p.competitors })),
    competitors: ds.competitors.map((c) => {
      const s = ds.snapshots.filter((x) => x.asin === c.asin).sort((a, b) => b.day.localeCompare(a.day))[0];
      return { forSku: c.sku, asin: c.asin, kind: c.kind, brand: s?.brand, title: s?.title?.slice(0, 80), price: s?.price, bsr: s?.bsr, monthlySold: s?.monthlySold };
    }),
    openCases: pr.cases.filter((c) => c.status === 'flagged' || c.status === 'reviewing').slice(0, 40).map((c) => ({ type: c.type, severity: c.severity, sku: c.sku, title: c.title, detail: c.detail, opened: c.openedAt.slice(0, 10) })),
    sellersOnListings: pr.sellers.map((s) => ({ seller: s.sellerName, authorised: s.authorised, listings: s.listings.length })),
    ads: { kpis: ad.kpis, byChannel: ad.byChannel.map((c) => ({ channel: c.channel, spend: c.spend, adSales: c.adSales, roas: c.roas, acosPct: c.acosPct, spendGrowth: c.spendGrowth })), campaigns: ad.campaigns.slice(0, 15) },
  };
}

const TABS = ['overview', 'channels', 'protection', 'analysis', 'ads', 'logistics'];

export async function ask(ds: Dataset, question: string) {
  const system = [
    'You are the analyst inside Loopretail\'s brand dashboard for UK marketplaces.',
    'Answer ONLY from the JSON data provided. If the data does not contain the answer, say what is missing and which sheet or Keepa check would provide it.',
    'Money is GBP (£). BSR: lower is better. Be specific with numbers, product names and SKUs.',
    'Keep it short: 2 to 5 sentences, or a few bullet lines when listing items. No preamble.',
  ].join(' ');
  const prompt = `DATA:\n${JSON.stringify(context(ds))}\n\nQUESTION: ${question.slice(0, 500)}`;
  return json<{ answer: string; tab: string; skus: string[] }>(prompt, {
    type: Type.OBJECT,
    properties: {
      answer: { type: Type.STRING },
      tab: { type: Type.STRING, enum: TABS, description: 'The dashboard tab where the user can see this in detail' },
      skus: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'SKUs the answer is about, if any' },
    },
    required: ['answer', 'tab', 'skus'],
  }, system);
}

/** Two or three Amazon UK search phrases a shopper would type to find rivals to this product. */
export async function keywordIdeas(product: { name: string; title?: string; brand: string }) {
  const r = await json<{ keywords: string[] }>(
    `Our product: "${product.title || product.name}" by ${product.brand}.\nGive 3 Amazon UK search phrases a shopper would type when looking for this kind of product (generic, no brand names), plus 1 phrase that finds "compatible with ${product.brand}" style listings.`,
    { type: Type.OBJECT, properties: { keywords: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['keywords'] },
    'You write short Amazon UK search queries. Reply with JSON only.',
  );
  return r.keywords.map((k) => k.trim()).filter(Boolean).slice(0, 4);
}

/** Sorts Keepa search results relative to our product. */
export async function classify(product: { name: string; title?: string; brand: string }, items: { asin: string; title: string; brand: string; price: number | null }[]) {
  if (!items.length) return [];
  const r = await json<{ results: { asin: string; kind: 'competitor' | 'compatible' | 'irrelevant' }[] }>(
    `Our product: "${product.title || product.name}" by ${product.brand}.\nCandidates:\n${items.map((i) => `${i.asin} | ${i.brand} | ${i.title.slice(0, 120)} | ${i.price ?? '?'}`).join('\n')}\n\nFor each ASIN: "competitor" = a different brand selling the same kind of product to the same shopper; "compatible" = a listing that says it is compatible with / a replacement for / for use with our brand; "irrelevant" = anything else (accessories for other things, different category, our own brand).`,
    {
      type: Type.OBJECT,
      properties: { results: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { asin: { type: Type.STRING }, kind: { type: Type.STRING, enum: ['competitor', 'compatible', 'irrelevant'] } }, required: ['asin', 'kind'] } } },
      required: ['results'],
    },
    'You classify Amazon listings for a brand protection team. Reply with JSON only.',
  );
  const valid = new Set(items.map((i) => i.asin));
  return r.results.filter((x) => valid.has(x.asin));
}
