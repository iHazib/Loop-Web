import '../env.js';
import * as db from '../portal/db.js';
import { handlePortal } from '../portal/handler.js';
import { keepaConfigured } from '../portal/keepa.js';
import { aiConfigured } from '../portal/ai.js';

/* End to end check of the brand portal against the real database.
   Run:  npm run test:portal
   Creates a temporary brand, uploads sample sheets, reads every tab, then deletes it. */

const user = { email: 'smoke-test@loopretail.local', name: 'Smoke test' };
const call = async (method: string, path: string, body: Record<string, unknown> = {}, as: { cookie?: string; anon?: boolean } = {}) => {
  const r = await handlePortal({ method, path: `/api/portal${path.split('?')[0]}`, query: Object.fromEntries(new URL('http://x' + path).searchParams), body, user: as.cookie || as.anon ? null : user, cookieHeader: as.cookie });
  if (!r) throw new Error(`No route for ${path}`);
  if (r.status >= 400) throw new Error(`${method} ${path} → ${r.status}: ${JSON.stringify(r.data)}`);
  return r.data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
};
const ok = (m: string) => console.log(`  ✓ ${m}`);
/** Expects a call to be refused with the given status. */
const refused = async (status: number, label: string, f: () => Promise<unknown>) => {
  try { await f(); } catch (e) { if ((e as Error).message.includes(`→ ${status}`)) return ok(label); throw e; }
  throw new Error(`Expected ${status}: ${label}`);
};
const clientEmail = `smoke+${Date.now()}@example.com`;
let otherBrand = '';

const monday = (weeksAgo: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - 7 * weeksAgo);
  return d.toISOString().slice(0, 10);
};

let brandId = '';
try {
  console.log('\nBrand portal smoke test\n');
  if (!db.dbConfigured()) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set in .env.local');
  ok('Supabase env found');

  try { await db.listBrands(); } catch (e) {
    const m = (e as Error).message;
    if (/fetch failed|ENOTFOUND|ECONN|network/i.test(m)) throw new Error(`Cannot reach Supabase from this machine (${m}). Check the internet connection and SUPABASE_URL.`);
    throw new Error(`Portal tables missing. Run supabase/portal.sql in the Supabase SQL editor first. (${m})`);
  }
  ok('Portal tables exist');

  const brand = await call('POST', '/brands', { name: `Smoke Test ${Date.now()}`, plan: 'test' });
  brandId = brand.id;
  ok(`Created brand ${brandId}`);

  const products = [
    { 'SKU': 'SMK-1', 'Product name': 'Smoke Product One', 'ASIN': 'B000000001', 'EAN': '5000000000001', 'Cost price (£)': '2.00', 'RRP (£)': '7.99', 'MAP / minimum price (£)': '6.49' },
    { 'SKU': 'SMK-2', 'Product name': 'Smoke Product Two', 'ASIN': 'B000000002', 'EAN': '5000000000002', 'Cost price (£)': '4.50', 'RRP (£)': '14.99', 'MAP / minimum price (£)': '12.99' },
  ];
  let r = await call('POST', `/brands/${brandId}/upload/products`, { rows: products });
  if (r.accepted !== 2) throw new Error(`Products: expected 2 accepted, got ${JSON.stringify(r)}`);
  ok('Products uploaded (2)');

  const sales = [];
  for (let w = 7; w >= 0; w--) for (const sku of ['SMK-1', 'SMK-2']) for (const ch of ['Amazon', 'TikTok Shop', 'D2C']) {
    const units = 20 + (7 - w) * 3;
    sales.push({ 'Week starting': monday(w + 1), 'Channel': ch, 'SKU': sku, 'Units sold': units, 'Revenue (£, inc VAT)': (units * 7.5).toFixed(2), 'Returns (units)': 1, 'Marketplace fees (£)': (units * 1.2).toFixed(2), 'Stock on hand at week end': 300 - (7 - w) * 10 });
  }
  sales.push({ 'Week starting': 'not a date', 'Channel': 'Amazon', 'SKU': 'SMK-1' }); // must be rejected
  r = await call('POST', `/brands/${brandId}/upload/sales`, { rows: sales });
  if (r.accepted !== sales.length - 1 || r.rejected.length !== 1) throw new Error(`Sales: ${JSON.stringify({ accepted: r.accepted, rejected: r.rejected })}`);
  ok(`Sales uploaded (${r.accepted}), bad row rejected: "${r.rejected[0].reason}"`);

  r = await call('POST', `/brands/${brandId}/upload/ads`, { rows: [0, 1, 2, 3].map((w) => ({ 'Week starting': monday(w + 1), 'Channel': 'Amazon', 'Campaign name': 'SP Test', 'Campaign type': 'Sponsored Products', 'Spend (£)': 50, 'Impressions': 9000, 'Clicks': 120, 'Orders': 18, 'Ad sales (£)': 190 })) });
  ok(`Ads uploaded (${r.accepted})`);
  r = await call('POST', `/brands/${brandId}/upload/sellers`, { rows: [{ 'Seller name': 'Smoke Direct', 'Amazon seller ID': 'A1SMOKEDIRECT', 'Authorised SKUs': 'All', 'Valid until': '2030-01-01' }] });
  ok(`Sellers uploaded (${r.accepted})`);
  r = await call('POST', `/brands/${brandId}/upload/competitors`, { rows: [{ 'Our SKU': 'SMK-1', 'Competitor ASIN': 'B000000009', 'Kind': 'competitor' }] });
  ok(`Competitors uploaded (${r.accepted})`);

  r = await call('POST', `/brands/${brandId}/upload/d2c`, { rows: [0, 1, 2, 3, 4, 5, 6, 7].map((w) => ({ 'Week starting': monday(w + 1), 'Sessions': 4000 + w * 50, 'Orders': 90 + w, 'Revenue (£, inc VAT)': 2200 + w * 30, 'New customers': 70, 'Returning customers': 20 + w, 'Refunded orders': 2 })) });
  ok(`D2C weeks uploaded (${r.accepted})`);
  const dcv = await call('GET', `/brands/${brandId}/d2c?weeks=4`);
  if (!dcv.hasData || dcv.kpis.conversionPct == null) throw new Error(`D2C view: ${JSON.stringify(dcv.kpis)}`);
  ok(`D2C: conversion ${dcv.kpis.conversionPct}%, AOV £${dcv.kpis.aov}, repeat ${dcv.kpis.repeatPct}%`);
  const ov = await call('GET', `/brands/${brandId}/overview?weeks=4`);
  ok(`Overview: GMV £${ov.kpis[0].value}, margin ${ov.kpis[2].value}%, ${ov.events.length} events`);
  const ch = await call('GET', `/brands/${brandId}/channels?weeks=4`);
  ok(`Channels: ${ch.cards.map((c: { channel: string }) => c.channel).join(', ')}`);
  const ad = await call('GET', `/brands/${brandId}/ads?weeks=4`);
  ok(`Ads: spend £${ad.kpis.spend}, ROAS ${ad.kpis.roas}x`);
  const pr = await call('GET', `/brands/${brandId}/protection`);
  ok(`Protection: ${pr.summary.open} open cases (0 expected until Keepa runs)`);
  const an = await call('GET', `/brands/${brandId}/analysis`);
  ok(`Brand Analysis: ${an.products.length} products, ${an.selected?.competitors.length ?? 0} competitors linked`);
  const lg = await call('GET', `/brands/${brandId}/logistics`);
  ok(`Logistics: ${lg.stock.length} products with stock`);

  const liveAsin = (process.env.SMOKE_ASIN || '').trim().toUpperCase();
  /* ── Client login flow ── */
  const inv = await call('POST', `/brands/${brandId}/users`, { email: clientEmail, role: 'viewer' });
  const token = String(inv.invitePath).split('/').pop()!;
  const info = await call('GET', `/auth/invite/${token}`, {}, { anon: true });
  if (info.email !== clientEmail) throw new Error('Invite lookup returned the wrong email');
  ok('Staff created an invite link; link resolves to the right email and brand');
  await refused(400, 'Weak password rejected', () => call('POST', `/auth/invite/${token}`, { name: 'Smoke', password: 'short' }, { anon: true }));
  const acceptRes = await handlePortal({ method: 'POST', path: `/api/portal/auth/invite/${token}`, query: {}, body: { name: 'Smoke Client', password: 'smoke-pass-123' }, user: null });
  if (!acceptRes?.setCookie) throw new Error('Accepting the invite did not sign the client in');
  const cookie = acceptRes.setCookie.split(';')[0];
  ok('Client accepted invite, set a password and was signed in');
  await refused(404, 'Invite link cannot be used twice', () => call('GET', `/auth/invite/${token}`, {}, { anon: true }));

  const st = await call('GET', '/status', {}, { cookie });
  if (st.principal?.kind !== 'client' || st.principal.brands[brandId] !== 'viewer') throw new Error(`Bad client status: ${JSON.stringify(st.principal)}`);
  const list = await call('GET', '/brands', {}, { cookie });
  if (list.length !== 1 || list[0].id !== brandId) throw new Error(`Client should see exactly one brand, saw ${JSON.stringify(list)}`);
  ok('Client sees only their own brand');
  await call('GET', `/brands/${brandId}/overview`, {}, { cookie });
  ok('Client can open their dashboard');
  otherBrand = (await call('POST', '/brands', { name: `Smoke Other ${Date.now()}` })).id;
  await refused(403, "Client is blocked from another brand's data", () => call('GET', `/brands/${otherBrand}/overview`, {}, { cookie }));
  await refused(403, 'Viewer cannot upload sheets', () => call('POST', `/brands/${brandId}/upload/sales`, { rows: [{}] }, { cookie }));
  await refused(403, 'Client cannot add brands', () => call('POST', '/brands', { name: 'nope' }, { cookie }));
  await refused(403, 'Client cannot manage logins', () => call('GET', `/brands/${brandId}/users`, {}, { cookie }));
  await refused(401, 'Signed-out visitor is blocked from real brands', () => call('GET', `/brands/${brandId}/overview`, {}, { anon: true }));
  await call('GET', '/brands/demo/overview', {}, { anon: true });
  ok('Demo stays open to everyone');

  await call('POST', `/brands/${brandId}/users`, { email: clientEmail, role: 'manager' });
  await call('PATCH', `/brands/${brandId}/products/SMK-1`, { cost: 2.25 }, { cookie });
  const prods = await call('GET', `/brands/${brandId}/products`, {}, { cookie });
  if (prods.find((p: { sku: string }) => p.sku === 'SMK-1').cost !== 2.25) throw new Error('Product edit did not save');
  ok('Promoted to manager: can edit product cost');

  await refused(401, 'Wrong password rejected', () => call('POST', '/auth/login', { email: clientEmail, password: 'wrong-pass-999' }, { anon: true }));
  const login = await handlePortal({ method: 'POST', path: '/api/portal/auth/login', query: {}, body: { email: clientEmail, password: 'smoke-pass-123' }, user: null });
  if (login?.status !== 200 || !login.setCookie) throw new Error(`Login failed: ${JSON.stringify(login?.data)}`);
  ok('Client can sign in with email and password');
  await call('DELETE', `/brands/${brandId}/users?email=${encodeURIComponent(clientEmail)}`);
  await refused(403, 'Removed client loses access straight away', () => call('GET', `/brands/${brandId}/overview`, {}, { cookie }));

  if (keepaConfigured() && liveAsin) {
    console.log(`\n  Keepa key found: testing with ${liveAsin}…`);
    const imp = await call('POST', `/brands/${brandId}/products/import`, { asins: liveAsin });
    if (imp.imported !== 1) throw new Error(`ASIN import: ${JSON.stringify(imp)}`);
    ok(`Imported ${liveAsin} from Keepa`);
    const s = await call('POST', `/brands/${brandId}/keepa/sync`);
    ok(`Keepa check: ${s.asins} ASINs, ${s.opened} cases opened, tokens left ${s.tokensLeft}`);
    const pr2 = await call('GET', `/brands/${brandId}/protection`);
    ok(`Sellers on the listing: ${pr2.sellers.map((x: { sellerName: string; authorised: boolean }) => `${x.sellerName}${x.authorised ? '' : ' (unauthorised)'}`).join(', ') || 'none'}`);
    const d = await call('POST', `/brands/${brandId}/keepa/discover`, { sku: liveAsin });
    ok(`Find competitors: ${d.competitors} competitors, ${d.compatibles} compatibles, sorted by ${d.method} (searched: ${d.searched.join(' · ')})`);
    const an2 = await call('GET', `/brands/${brandId}/analysis?sku=${liveAsin}`);
    ok(`Brand Analysis for ${liveAsin}: BSR ${an2.selected?.own?.bsr ?? '–'}, price £${an2.selected?.own?.price ?? '–'}, ${an2.selected?.competitors.length ?? 0} competitors`);
  } else {
    console.log('\n  Keepa skipped. To test it: set KEEPA_API_KEY in .env.local and run  SMOKE_ASIN=<a real Amazon UK ASIN> npm run test:portal');
  }
  if (aiConfigured()) {
    const a = await call('POST', `/brands/${brandId}/ask`, { question: 'Which channel sells the most?' });
    ok(`AI answer: "${String(a.answer).slice(0, 120)}" (tab: ${a.tab})`);
  } else {
    console.log('  AI skipped (GEMINI_API_KEY not set)');
  }

  console.log('\nAll checks passed.');
} catch (e) {
  console.error(`\n  ✗ ${(e as Error).message}\n`);
  process.exitCode = 1;
} finally {
  if (otherBrand) await db.deleteBrand(otherBrand).catch(() => null);
  await db.deleteUser(clientEmail).catch(() => null);
  if (brandId) {
    await db.deleteBrand(brandId).then(() => console.log(`  (test brand ${brandId} deleted)`)).catch((e) => console.error('  could not delete test brand:', e.message));
  }
}
