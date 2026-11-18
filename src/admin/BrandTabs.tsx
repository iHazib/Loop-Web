import { Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Eye, X, Mail } from 'lucide-react';
import type * as M from '../../server/portal/metrics';
import { useView, portalFetch } from '../portal/api';
import { input } from './AdminBrands';

/* Staff tabs on the admin brand page. Everything a brand sees on its dashboard is set from here:
   settings and visible tabs, products and listings, authorised sellers, competitors, uploaded weeks,
   protection cases, ads and search terms, and which emails go out. */

const money = (n: number | null | undefined, c = '£') => (n == null ? '–' : `${c}${n.toFixed(2)}`);
const Box = ({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <section className="bg-white border border-black/8 rounded-2xl p-6">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><h2 className="font-display font-bold text-brand-dark text-lg">{title}</h2>{right}</div>
    {children}
  </section>
);

/* ═════════ Products and listings ═════════ */

type Listing = ReturnType<typeof M.listings>[number];

export function ProductsTab({ brandId }: { brandId: string }) {
  const [rev, setRev] = useState(0);
  const { data, error, loading } = useView<{ listings: Listing[]; euMarkets: string }>(`/admin/brands/${encodeURIComponent(brandId)}/listings?r=${rev}`);
  const [asins, setAsins] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [openSku, setOpenSku] = useState<string | null>(null);
  const [edit, setEdit] = useState<Record<string, { name: string; rrp: string; cost: string; mapPrice: string }>>({});
  const [add, setAdd] = useState({ sku: '', name: '', asin: '', ean: '', rrp: '', cost: '', mapPrice: '' });
  const addProduct = async () => {
    setMsg('');
    try {
      await portalFetch(`/admin/brands/${brandId}/products`, { method: 'POST', body: JSON.stringify(add) });
      setMsg(`Added ${add.name}.`); setAdd({ sku: '', name: '', asin: '', ean: '', rrp: '', cost: '', mapPrice: '' }); setRev((x) => x + 1);
    } catch (e) { setMsg((e as Error).message); }
  };
  const removeProduct = async (sku: string, name: string) => {
    if (!window.confirm(`Remove ${name}? Its sales rows stay, but it leaves the product list and the daily Keepa check.`)) return;
    try { await portalFetch(`/brands/${brandId}/products/${encodeURIComponent(sku)}`, { method: 'DELETE' }); setMsg(`Removed ${name}.`); setRev((x) => x + 1); }
    catch (e) { setMsg((e as Error).message); }
  };

  const parsed = [...new Set(asins.toUpperCase().split(/[\s,;]+/).filter((a) => /^[A-Z0-9]{10}$/.test(a)))];
  const runImport = async () => {
    setBusy(true); setMsg('');
    try {
      const r = await portalFetch<{ imported: number; notFound: string[]; needCost: string[]; tokensLeft: number | null }>(`/brands/${brandId}/products/import`, { method: 'POST', body: JSON.stringify({ asins: parsed }) });
      setMsg(`Imported ${r.imported} products from Keepa.${r.notFound.length ? ` Not found on Amazon UK: ${r.notFound.join(', ')}.` : ''}${r.needCost.length ? ` Add cost and minimum price for ${r.needCost.length} of them below.` : ''} Keepa tokens left: ${r.tokensLeft ?? 'unknown'}.`);
      setAsins(''); setRev((x) => x + 1);
    } catch (e) { setMsg((e as Error).message); }
    finally { setBusy(false); }
  };
  const saveRow = async (sku: string) => {
    const e = edit[sku]; if (!e) return;
    try {
      await portalFetch(`/brands/${brandId}/products/${encodeURIComponent(sku)}`, { method: 'PATCH', body: JSON.stringify({ name: e.name.trim() || undefined, rrp: Number(e.rrp) || 0, cost: Number(e.cost) || 0, mapPrice: Number(e.mapPrice) || 0 }) });
      setMsg(`Saved ${sku}.`); setRev((x) => x + 1);
    } catch (err) { setMsg((err as Error).message); }
  };

  return (
    <div className="grid gap-6">
      <Box title="Add ASINs" right={<span className="text-xs text-brand-dark/40">1 Keepa token per ASIN</span>}>
        <p className="text-sm text-brand-dark/55 mb-3">Paste ASINs separated by spaces, commas or new lines. Keepa fills in the name, EAN and RRP, and the ASINs join the daily check straight away.</p>
        <textarea className={input} rows={4} value={asins} onChange={(e) => setAsins(e.target.value)} placeholder={'B0XXXXXXXX\nB0YYYYYYYY'} />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={runImport} disabled={busy || !parsed.length} className="rounded-lg bg-brand-red text-white px-4 py-2 text-sm font-semibold disabled:opacity-40">{busy ? 'Importing…' : `Import ${parsed.length || ''} ASIN${parsed.length === 1 ? '' : 's'}`}</button>
          {asins && !parsed.length && <span className="text-xs text-brand-dark/50">No valid ASINs found yet (10 letters and numbers each).</span>}
        </div>
        {msg && <p className="mt-3 text-sm text-brand-dark/75">{msg}</p>}
      </Box>

      <Box title="Add a product by hand" right={<span className="text-xs text-brand-dark/40">For products not on Amazon, or before the listing is live</span>}>
        <div className="grid sm:grid-cols-3 lg:grid-cols-8 gap-3">
          {([['sku', 'SKU'], ['name', 'Product name'], ['asin', 'ASIN (optional)'], ['ean', 'EAN'], ['rrp', 'RRP £'], ['cost', 'Cost £'], ['mapPrice', 'Min price £']] as const).map(([k, l]) => (
            <label key={k} className={`grid gap-1 text-xs text-brand-dark/60 ${k === 'name' ? 'lg:col-span-2' : ''}`}>{l}
              <input className={input} value={add[k]} inputMode={['rrp', 'cost', 'mapPrice'].includes(k) ? 'decimal' : undefined} onChange={(e) => setAdd({ ...add, [k]: k === 'asin' ? e.target.value.toUpperCase() : e.target.value })} />
            </label>
          ))}
        </div>
        <button onClick={addProduct} disabled={!add.sku || !add.name} className="mt-3 rounded-lg bg-brand-red text-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Add product</button>
      </Box>

      <Box title="Products on every marketplace" right={<span className="text-xs text-brand-dark/40">Amazon UK and EU from Keepa ({data?.euMarkets || 'DE,FR,IT,ES'}), other channels from the sales sheet</span>}>
        {error ? <p className="text-sm text-brand-red">{error}</p> : loading && !data ? <p className="text-sm text-brand-dark/40">Loading…</p> : !data?.listings.length ? <p className="text-sm text-brand-dark/40">No products yet. Add ASINs above.</p> : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[1200px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-brand-dark/40">
                  {['', 'Product', 'ASIN', 'UK price', 'BSR', 'Sellers', 'Buy Box', 'EU cheapest', 'RRP £', 'Cost £', 'Min price £', ''].map((h, i) => <th key={i} className="px-2 pb-2 font-medium whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.listings.map((l) => {
                  const open = openSku === l.sku;
                  const e = edit[l.sku] ?? { name: l.name, rrp: String(l.rrp || ''), cost: String(l.cost || ''), mapPrice: String(l.mapPrice || '') };
                  const dirty = edit[l.sku] && (e.name !== l.name || Number(e.rrp) !== l.rrp || Number(e.cost) !== l.cost || Number(e.mapPrice) !== l.mapPrice);
                  const cheapest = l.eu.filter((x) => x.gbp != null).sort((a, b) => a.gbp! - b.gbp!)[0];
                  return (
                    <Fragment key={l.sku}>
                      <tr className="border-t border-black/5 align-middle">
                        <td className="px-2 py-2.5"><button onClick={() => setOpenSku(open ? null : l.sku)} aria-label={open ? 'Hide marketplaces' : 'Show marketplaces'} className="text-brand-dark/50 hover:text-brand-dark">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button></td>
                        <td className="px-2 py-2.5"><input className={`${input} w-56 font-medium`} value={e.name} onChange={(ev) => setEdit({ ...edit, [l.sku]: { ...e, name: ev.target.value } })} aria-label={`Name for ${l.sku}`} /><div className="text-[11px] text-brand-dark/40 mt-0.5">{l.sku}</div></td>
                        <td className="px-2 py-2.5 font-mono text-xs">{l.asin || '–'}</td>
                        <td className="px-2 py-2.5">{money(l.uk?.price)}</td>
                        <td className="px-2 py-2.5">{l.uk?.bsr?.toLocaleString('en-GB') ?? '–'}</td>
                        <td className="px-2 py-2.5">{l.uk ? <>{l.uk.sellers}{l.uk.unauthorised ? <span className="ml-1 text-brand-red">({l.uk.unauthorised} not authorised)</span> : null}</> : '–'}</td>
                        <td className="px-2 py-2.5">{l.uk?.buyBoxOk == null ? '–' : l.uk.buyBoxOk ? <span className="text-emerald-600">Ours</span> : <span className="text-brand-red">Lost</span>}</td>
                        <td className="px-2 py-2.5">{cheapest ? <span className={cheapest.gapPct != null && cheapest.gapPct >= 20 ? 'text-violet-700' : ''}>{money(cheapest.gbp)} {cheapest.market}{cheapest.gapPct != null ? ` (${cheapest.gapPct > 0 ? '-' : '+'}${Math.abs(cheapest.gapPct)}%)` : ''}</span> : '–'}</td>
                        <td className="px-2 py-2.5"><input className={`${input} w-20`} inputMode="decimal" value={e.rrp} onChange={(ev) => setEdit({ ...edit, [l.sku]: { ...e, rrp: ev.target.value } })} aria-label={`RRP for ${l.sku}`} /></td>
                        <td className="px-2 py-2.5"><input className={`${input} w-20`} inputMode="decimal" value={e.cost} onChange={(ev) => setEdit({ ...edit, [l.sku]: { ...e, cost: ev.target.value } })} aria-label={`Cost for ${l.sku}`} /></td>
                        <td className="px-2 py-2.5"><input className={`${input} w-20`} inputMode="decimal" value={e.mapPrice} onChange={(ev) => setEdit({ ...edit, [l.sku]: { ...e, mapPrice: ev.target.value } })} aria-label={`Minimum price for ${l.sku}`} /></td>
                        <td className="px-2 py-2.5 whitespace-nowrap">{dirty ? <button onClick={() => saveRow(l.sku)} className="rounded-lg bg-brand-dark text-white px-3 py-1.5 text-xs">Save</button> : <button onClick={() => removeProduct(l.sku, l.name)} className="text-xs text-brand-dark/40 hover:text-brand-red">Remove</button>}</td>
                      </tr>
                      {open && (
                        <tr className="bg-surface-offwhite/60">
                          <td colSpan={12} className="px-4 py-4">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              <MarketCard title="Amazon UK" href={l.uk?.url} rows={l.uk ? [['Price', money(l.uk.price)], ['BSR', l.uk.bsr?.toLocaleString('en-GB') ?? '–'], ['Rating', l.uk.rating != null ? `${l.uk.rating} (${l.uk.reviews ?? 0})` : '–'], ['Checked', l.uk.day]] : [['Status', 'Not checked yet']]} />
                              {l.eu.map((x) => (
                                <MarketCard key={x.market} title={`Amazon ${x.market}`} href={x.url} accent={x.gapPct != null && x.gapPct >= 20}
                                  rows={[['Price', money(x.price, '€')], ['In £', money(x.gbp)], ['vs UK', x.gapPct == null ? '–' : x.gapPct > 0 ? `${x.gapPct}% cheaper` : `${Math.abs(x.gapPct)}% dearer`]]} />
                              ))}
                              {!l.eu.length && <MarketCard title="Amazon EU" rows={[['Status', 'Checked from the next daily Keepa run']]} />}
                              {l.channels.filter((c) => c.channel !== 'Amazon').map((c) => (
                                <MarketCard key={c.channel} title={c.channel} rows={[['Units, 4 weeks', c.units4w.toLocaleString('en-GB')], ['Revenue, 4 weeks', `£${c.revenue4w.toLocaleString('en-GB')}`], ['Stock', c.stock.toLocaleString('en-GB')], ['Last sheet week', c.lastWeek ?? '–']]} />
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </div>
  );
}

function MarketCard({ title, href, rows, accent }: { title: string; href?: string; rows: [string, string][]; accent?: boolean }) {
  return (
    <div className={`rounded-xl border bg-white p-3 ${accent ? 'border-violet-300' : 'border-black/8'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-brand-dark">{title}</span>
        {href && <a href={href} target="_blank" rel="noreferrer" className="text-brand-dark/40 hover:text-brand-red" aria-label={`Open on ${title}`}><ExternalLink size={13} /></a>}
      </div>
      <dl className="grid gap-1 text-xs">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-brand-dark/45">{k}</dt><dd className="text-brand-dark/80 text-right">{v}</dd></div>)}
      </dl>
    </div>
  );
}

/* ═════════ Emails ═════════ */

type Mode = 'off' | 'instant' | 'daily';
type Settings = { enabled: boolean; recipients: string[]; alerts: Record<string, Mode>; reports: Record<string, boolean>; updatedAt?: string; updatedBy?: string };
type EmailView = {
  settings: Settings; available: string[]; ready: boolean; sending: boolean;
  labels: Record<string, { label: string; help: string }>; alertKinds: string[]; reportKinds: string[];
  log: { at: string; kind: string; subject: string; recipients: string[]; status: string; detail: string }[];
};

export function EmailsTab({ brandId }: { brandId: string }) {
  const { data, error, loading } = useView<EmailView>(`/admin/brands/${encodeURIComponent(brandId)}/email`);
  const [s, setS] = useState<Settings | null>(null);
  const [add, setAdd] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ subject: string; html: string; items: number; kind: string } | null>(null);
  useEffect(() => { if (data) setS(data.settings); }, [data]);
  if (error) return <p className="text-sm text-brand-red">{error}</p>;
  if (loading || !data || !s) return <p className="text-sm text-brand-dark/40">Loading…</p>;

  const save = async () => {
    setBusy(true); setMsg('');
    try { const r = await portalFetch<Settings>(`/admin/brands/${brandId}/email`, { method: 'PATCH', body: JSON.stringify(s) }); setS(r); setMsg('Saved.'); }
    catch (e) { setMsg((e as Error).message); }
    finally { setBusy(false); }
  };
  const show = async (kind: string) => {
    try { setPreview({ ...(await portalFetch<{ subject: string; html: string; items: number }>(`/admin/brands/${brandId}/email/preview?kind=${kind}`)), kind }); }
    catch (e) { setMsg((e as Error).message); }
  };
  const addRecipient = (v: string) => {
    const e = v.trim().toLowerCase();
    if (!e || s.recipients.includes(e)) return;
    setS({ ...s, recipients: [...s.recipients, e] }); setAdd('');
  };

  return (
    <div className="grid gap-6">
      {!data.ready && <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">The database needs the email settings update. Run <code>supabase/portal.sql</code> again in Supabase, then reload this page.</div>}
      {!data.sending && <div className="rounded-xl border border-black/10 bg-surface-offwhite px-4 py-3 text-sm text-brand-dark/75">Emails are not being sent yet: the email provider is not set up (task 8). These settings are saved now and used as soon as sending is switched on.</div>}

      <Box title="Email permissions" right={
        <label className="inline-flex items-center gap-2 text-sm text-brand-dark">
          <input type="checkbox" checked={s.enabled} onChange={(e) => setS({ ...s, enabled: e.target.checked })} className="w-4 h-4 accent-[#e6192b]" />
          Send emails to this brand
        </label>
      }>
        <h3 className="text-sm font-semibold text-brand-dark mb-2">Recipients</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {s.recipients.map((r) => (
            <span key={r} className="inline-flex items-center gap-1.5 rounded-full bg-surface-offwhite border border-black/8 pl-3 pr-1.5 py-1 text-xs text-brand-dark">
              {r}<button onClick={() => setS({ ...s, recipients: s.recipients.filter((x) => x !== r) })} aria-label={`Remove ${r}`} className="text-brand-dark/40 hover:text-brand-red"><X size={13} /></button>
            </span>
          ))}
          {!s.recipients.length && <span className="text-xs text-brand-dark/40">No recipients yet.</span>}
        </div>
        <div className="flex flex-wrap gap-2 mb-1">
          <input className={`${input} max-w-xs`} type="email" placeholder="name@brand.com" value={add} onChange={(e) => setAdd(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRecipient(add); } }} />
          <button onClick={() => addRecipient(add)} className="rounded-lg border border-black/10 px-3 py-2 text-sm">Add</button>
          {data.available.filter((a) => !s.recipients.includes(a)).map((a) => <button key={a} onClick={() => addRecipient(a)} className="rounded-full border border-dashed border-black/15 px-3 py-1 text-xs text-brand-dark/60 hover:border-brand-red/50">+ {a}</button>)}
        </div>

        <h3 className="text-sm font-semibold text-brand-dark mt-6 mb-2">Alerts</h3>
        <ul className="divide-y divide-black/5">
          {data.alertKinds.map((k) => (
            <li key={k} className="py-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[220px]"><div className="text-sm text-brand-dark font-medium">{data.labels[k].label}</div><div className="text-xs text-brand-dark/50">{data.labels[k].help}</div></div>
              <div role="radiogroup" aria-label={data.labels[k].label} className="inline-flex rounded-lg bg-surface-offwhite p-0.5 border border-black/8">
                {(['off', 'instant', 'daily'] as Mode[]).map((m) => (
                  <button key={m} role="radio" aria-checked={s.alerts[k] === m} onClick={() => setS({ ...s, alerts: { ...s.alerts, [k]: m } })}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${s.alerts[k] === m ? (m === 'off' ? 'bg-white text-brand-dark shadow-sm' : 'bg-brand-dark text-white') : 'text-brand-dark/55'}`}>
                    {m === 'off' ? 'Off' : m === 'instant' ? 'Instant' : 'Daily digest'}
                  </button>
                ))}
              </div>
              <button onClick={() => show(k)} className="inline-flex items-center gap-1 text-xs text-brand-red"><Eye size={13} /> Preview</button>
            </li>
          ))}
        </ul>

        <h3 className="text-sm font-semibold text-brand-dark mt-6 mb-2">Reports</h3>
        <ul className="divide-y divide-black/5">
          {data.reportKinds.map((k) => (
            <li key={k} className="py-3 flex flex-wrap items-center gap-3">
              <label className="flex-1 min-w-[220px] flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={s.reports[k]} onChange={(e) => setS({ ...s, reports: { ...s.reports, [k]: e.target.checked } })} className="mt-1 w-4 h-4 accent-[#e6192b]" />
                <span><span className="block text-sm text-brand-dark font-medium">{data.labels[k].label}</span><span className="block text-xs text-brand-dark/50">{data.labels[k].help}</span></span>
              </label>
              <button onClick={() => show(k)} className="inline-flex items-center gap-1 text-xs text-brand-red"><Eye size={13} /> Preview</button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={save} disabled={busy || !data.ready} className="rounded-lg bg-brand-red text-white px-4 py-2 text-sm font-semibold disabled:opacity-40">{busy ? 'Saving…' : 'Save email permissions'}</button>
          {s.updatedAt && <span className="text-xs text-brand-dark/45">Last changed {new Date(s.updatedAt).toLocaleString('en-GB')}{s.updatedBy ? ` by ${s.updatedBy}` : ''}</span>}
          {msg && <span className="text-sm text-brand-dark/75">{msg}</span>}
        </div>
      </Box>

      <Box title="Sent log">
        {!data.log.length ? <p className="text-sm text-brand-dark/40">No emails sent to this brand yet.</p> : (
          <ul className="divide-y divide-black/5">
            {data.log.map((l, i) => (
              <li key={i} className="py-2.5 flex flex-wrap items-center gap-3 text-sm">
                <Mail size={14} className="text-brand-dark/40" />
                <span className="flex-1 min-w-[200px] text-brand-dark/80">{l.subject}<span className="block text-[11px] text-brand-dark/40">{data.labels[l.kind]?.label ?? l.kind} · {l.recipients.join(', ')}</span></span>
                <span className={`text-xs ${l.status === 'sent' ? 'text-emerald-600' : l.status === 'failed' ? 'text-brand-red' : 'text-brand-dark/45'}`}>{l.status}</span>
                <span className="text-xs text-brand-dark/45">{new Date(l.at).toLocaleString('en-GB')}</span>
              </li>
            ))}
          </ul>
        )}
      </Box>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-black/8">
              <div><p className="text-[11px] uppercase tracking-wider text-brand-dark/40">Preview, from today's data · {preview.items} item{preview.items === 1 ? '' : 's'}</p><p className="text-sm font-semibold text-brand-dark mt-0.5">{preview.subject}</p></div>
              <button onClick={() => setPreview(null)} aria-label="Close preview" className="text-brand-dark/50 hover:text-brand-dark"><X size={18} /></button>
            </div>
            <iframe title="Email preview" srcDoc={preview.html} className="w-full flex-1 min-h-[520px] bg-[#f3f4f2]" sandbox="" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════ Settings: what the brand's dashboard shows and how it judges things ═════════ */

type Settings2 = { targetAcosPct: number; stockWarnWeeks: number; greyThreshold: number; hiddenTabs: string[]; welcome: string };
type DataView = {
  settings: Settings2; tabs: string[];
  sellers: { sellerName: string; amazonSellerId: string; ebayUsername: string; skus: string; validUntil: string }[];
  competitors: { sku: string; asin: string; kind: 'competitor' | 'compatible'; source: string; createdAt: string; title: string; price: number | null; product: string }[];
  products: { sku: string; name: string }[];
  sheets: Record<'sales' | 'ads' | 'd2c', { week: string; rows: number; total: number }[]>;
};
const TAB_LABEL: Record<string, string> = { overview: 'Overview', channels: 'Channels', protection: 'Protection', analysis: 'Brand Analysis', ads: 'Ads', logistics: 'Logistics & Distribution', data: 'Data' };

function useBrandData(brandId: string) {
  const [rev, setRev] = useState(0);
  const v = useView<DataView>(`/admin/brands/${encodeURIComponent(brandId)}/data?r=${rev}`);
  return { ...v, reload: () => setRev((x) => x + 1) };
}

export function SettingsTab({ brandId }: { brandId: string }) {
  const { data, error, loading } = useBrandData(brandId);
  const [s, setS] = useState<Settings2 | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { if (data) setS(data.settings); }, [data]);
  if (error) return <p className="text-sm text-brand-red">{error}</p>;
  if (loading || !data || !s) return <p className="text-sm text-brand-dark/40">Loading…</p>;
  const save = async () => {
    setMsg('');
    try { setS(await portalFetch<Settings2>(`/admin/brands/${brandId}/settings`, { method: 'PATCH', body: JSON.stringify(s) })); setMsg('Saved. The brand sees the change on their next page load.'); }
    catch (e) { setMsg((e as Error).message); }
  };
  const numField = (k: 'targetAcosPct' | 'stockWarnWeeks' | 'greyThreshold', label: string, help: string, suffix: string) => (
    <label className="grid gap-1 text-xs text-brand-dark/60">
      {label}
      <span className="flex items-center gap-2"><input type="number" className={`${input} w-28`} value={s[k]} onChange={(e) => setS({ ...s, [k]: Number(e.target.value) })} /><span className="text-brand-dark/50">{suffix}</span></span>
      <span className="text-[11px] text-brand-dark/40">{help}</span>
    </label>
  );
  return (
    <div className="grid gap-6">
      <Box title="Dashboard rules">
        <div className="grid sm:grid-cols-3 gap-5">
          {numField('targetAcosPct', 'Target ACoS', 'Campaigns and search terms above this are flagged.', '%')}
          {numField('stockWarnWeeks', 'Stock warning', 'Products with less cover than this show as low stock.', 'weeks')}
          {numField('greyThreshold', 'Grey market score', 'Signal score that makes an unauthorised seller a grey market case. Default 3.', 'points')}
        </div>
      </Box>
      <Box title="Tabs the brand sees">
        <p className="text-sm text-brand-dark/55 mb-3">Untick a tab to hide it from this brand's logins. Home is always shown. Staff always see every tab.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {data.tabs.map((t) => (
            <label key={t} className="flex items-center gap-2.5 rounded-lg border border-black/8 px-3 py-2 text-sm text-brand-dark cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-[#e6192b]" checked={!s.hiddenTabs.includes(t)} onChange={(e) => setS({ ...s, hiddenTabs: e.target.checked ? s.hiddenTabs.filter((x) => x !== t) : [...s.hiddenTabs, t] })} />
              {TAB_LABEL[t] ?? t}
            </label>
          ))}
        </div>
      </Box>
      <Box title="Note on the brand's Home">
        <textarea className={input} rows={3} maxLength={600} value={s.welcome} onChange={(e) => setS({ ...s, welcome: e.target.value })} placeholder="e.g. This week we are filing two Brand Registry reports and launching the TikTok Shop listings." />
        <p className="mt-1 text-[11px] text-brand-dark/40">Shown at the top of their Home page, signed by the account manager. Leave empty to hide it.</p>
      </Box>
      <div className="flex items-center gap-3">
        <button onClick={save} className="rounded-lg bg-brand-red text-white px-4 py-2 text-sm font-semibold">Save settings</button>
        {msg && <span className="text-sm text-brand-dark/75">{msg}</span>}
      </div>
    </div>
  );
}

/* ═════════ Authorised sellers ═════════ */

const EMPTY_SELLER = { sellerName: '', amazonSellerId: '', ebayUsername: '', skus: 'All', validUntil: '', originalName: '' };

export function SellersTab({ brandId }: { brandId: string }) {
  const { data, error, loading, reload } = useBrandData(brandId);
  const [f, setF] = useState(EMPTY_SELLER);
  const [msg, setMsg] = useState('');
  if (error) return <p className="text-sm text-brand-red">{error}</p>;
  if (loading && !data) return <p className="text-sm text-brand-dark/40">Loading…</p>;
  if (!data) return null;
  const save = async () => {
    setMsg('');
    try { await portalFetch(`/admin/brands/${brandId}/sellers`, { method: 'POST', body: JSON.stringify(f) }); setMsg(`Saved ${f.sellerName}. Run a Keepa check to re-sort open cases.`); setF(EMPTY_SELLER); reload(); }
    catch (e) { setMsg((e as Error).message); }
  };
  const del = async (name: string) => {
    if (!window.confirm(`Remove ${name} from the authorised list? Their listings will open cases at the next check.`)) return;
    await portalFetch(`/admin/brands/${brandId}/sellers?name=${encodeURIComponent(name)}`, { method: 'DELETE' }).catch((e: Error) => setMsg(e.message));
    reload();
  };
  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });
  return (
    <div className="grid gap-6">
      <Box title={f.originalName ? `Edit ${f.originalName}` : 'Add an authorised seller'}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <label className="grid gap-1 text-xs text-brand-dark/60">Seller name<input className={input} value={f.sellerName} onChange={(e) => set('sellerName', e.target.value)} /></label>
          <label className="grid gap-1 text-xs text-brand-dark/60">Amazon seller ID<input className={input} value={f.amazonSellerId} onChange={(e) => set('amazonSellerId', e.target.value)} placeholder="A1B2C3D4E5F6G7" /></label>
          <label className="grid gap-1 text-xs text-brand-dark/60">eBay username<input className={input} value={f.ebayUsername} onChange={(e) => set('ebayUsername', e.target.value)} /></label>
          <label className="grid gap-1 text-xs text-brand-dark/60">SKUs<input className={input} value={f.skus} onChange={(e) => set('skus', e.target.value)} placeholder="All, or SKU1;SKU2" /></label>
          <label className="grid gap-1 text-xs text-brand-dark/60">Valid until<input type="date" className={input} value={f.validUntil} onChange={(e) => set('validUntil', e.target.value)} /></label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={save} disabled={!f.sellerName} className="rounded-lg bg-brand-red text-white px-4 py-2 text-sm font-semibold disabled:opacity-40">{f.originalName ? 'Save changes' : 'Add seller'}</button>
          {f.originalName && <button onClick={() => setF(EMPTY_SELLER)} className="text-sm text-brand-dark/60">Cancel</button>}
          {msg && <span className="text-sm text-brand-dark/75">{msg}</span>}
        </div>
      </Box>
      <Box title="Authorised sellers" right={<span className="text-xs text-brand-dark/40">{data.sellers.length} {data.sellers.length === 1 ? "seller" : "sellers"}, anyone else on the listings opens a case</span>}>
        {!data.sellers.length ? <p className="text-sm text-brand-dark/40">No authorised sellers yet, so seller alerts are off for this brand.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-brand-dark/40">{['Seller', 'Amazon ID', 'eBay', 'SKUs', 'Valid until', ''].map((h) => <th key={h} className="px-2 pb-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {data.sellers.map((x) => {
                const expired = x.validUntil && x.validUntil < new Date().toISOString().slice(0, 10);
                return (
                  <tr key={x.sellerName} className="border-t border-black/5">
                    <td className="px-2 py-2.5 text-brand-dark font-medium">{x.sellerName}</td>
                    <td className="px-2 py-2.5 font-mono text-xs">{x.amazonSellerId || <span className="text-amber-600">missing</span>}</td>
                    <td className="px-2 py-2.5">{x.ebayUsername || '–'}</td>
                    <td className="px-2 py-2.5 max-w-[220px] truncate" title={x.skus}>{x.skus}</td>
                    <td className={`px-2 py-2.5 ${expired ? 'text-brand-red' : ''}`}>{x.validUntil || 'No end date'}{expired ? ' (expired)' : ''}</td>
                    <td className="px-2 py-2.5 text-right whitespace-nowrap">
                      <button onClick={() => setF({ ...EMPTY_SELLER, ...x, originalName: x.sellerName })} className="text-xs text-brand-dark/60 hover:text-brand-dark mr-3">Edit</button>
                      <button onClick={() => del(x.sellerName)} className="text-xs text-brand-dark/40 hover:text-brand-red">Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Box>
    </div>
  );
}

/* ═════════ Competitors ═════════ */

export function CompetitorsTab({ brandId }: { brandId: string }) {
  const { data, error, loading, reload } = useBrandData(brandId);
  const [f, setF] = useState({ sku: '', asin: '', kind: 'competitor' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  if (error) return <p className="text-sm text-brand-red">{error}</p>;
  if (loading && !data) return <p className="text-sm text-brand-dark/40">Loading…</p>;
  if (!data) return null;
  const add = async () => {
    setMsg('');
    try { await portalFetch(`/admin/brands/${brandId}/competitors`, { method: 'POST', body: JSON.stringify(f) }); setF({ ...f, asin: '' }); setMsg('Added. Its price and rank fill in at the next Keepa check.'); reload(); }
    catch (e) { setMsg((e as Error).message); }
  };
  const discover = async () => {
    if (!f.sku) { setMsg('Pick a product first.'); return; }
    setBusy(true); setMsg('');
    try {
      const r = await portalFetch<{ added: number; method: string }>(`/brands/${brandId}/keepa/discover`, { method: 'POST', body: JSON.stringify({ sku: f.sku, keywords: '' }) });
      setMsg(`Found ${r.added} competitors (${r.method}).`); reload();
    } catch (e) { setMsg((e as Error).message); }
    finally { setBusy(false); }
  };
  const del = async (sku: string, asin: string) => {
    await portalFetch(`/brands/${brandId}/competitors?sku=${encodeURIComponent(sku)}&asin=${asin}`, { method: 'DELETE' }).catch((e: Error) => setMsg(e.message));
    reload();
  };
  const rows = data.competitors.filter((c) => !filter || c.sku === filter);
  return (
    <div className="grid gap-6">
      <Box title="Add competitors">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs text-brand-dark/60">Product<select className={`${input} w-64`} value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })}><option value="">Pick a product</option>{data.products.map((p) => <option key={p.sku} value={p.sku}>{p.name}</option>)}</select></label>
          <label className="grid gap-1 text-xs text-brand-dark/60">Their ASIN<input className={`${input} w-40 font-mono`} value={f.asin} onChange={(e) => setF({ ...f, asin: e.target.value.toUpperCase() })} placeholder="B0XXXXXXXX" /></label>
          <label className="grid gap-1 text-xs text-brand-dark/60">Type<select className={`${input} w-40`} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}><option value="competitor">Competitor</option><option value="compatible">Compatible</option></select></label>
          <button onClick={add} disabled={!f.sku || f.asin.length !== 10} className="rounded-lg bg-brand-red text-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Add</button>
          <button onClick={discover} disabled={busy || !f.sku} className="rounded-lg border border-black/10 px-4 py-2 text-sm disabled:opacity-40">{busy ? 'Searching…' : 'Find them for me'}</button>
        </div>
        {msg && <p className="mt-3 text-sm text-brand-dark/75">{msg}</p>}
      </Box>
      <Box title="Competitor list" right={
        <select className={`${input} w-56`} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by product"><option value="">All products ({data.competitors.length})</option>{data.products.map((p) => <option key={p.sku} value={p.sku}>{p.name}</option>)}</select>
      }>
        {!rows.length ? <p className="text-sm text-brand-dark/40">No competitors yet.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-brand-dark/40">{['Their listing', 'For', 'Type', 'Price', 'Added', ''].map((h) => <th key={h} className="px-2 pb-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.sku + c.asin} className="border-t border-black/5">
                  <td className="px-2 py-2.5"><div className="text-brand-dark truncate max-w-[360px]" title={c.title}>{c.title || 'Not checked yet'}</div><a href={`https://www.amazon.co.uk/dp/${c.asin}`} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-brand-dark/45 hover:text-brand-red">{c.asin}</a></td>
                  <td className="px-2 py-2.5">{c.product}</td>
                  <td className="px-2 py-2.5 capitalize">{c.kind}<span className="block text-[11px] text-brand-dark/40">{c.source}</span></td>
                  <td className="px-2 py-2.5">{money(c.price)}</td>
                  <td className="px-2 py-2.5 text-brand-dark/60">{c.createdAt.slice(0, 10)}</td>
                  <td className="px-2 py-2.5 text-right"><button onClick={() => del(c.sku, c.asin)} className="text-xs text-brand-dark/40 hover:text-brand-red">Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
    </div>
  );
}

/* ═════════ Sheets loaded: see and delete weeks ═════════ */

export function SheetsLoaded({ brandId }: { brandId: string }) {
  const { data, error, loading, reload } = useBrandData(brandId);
  const [kind, setKind] = useState<'sales' | 'ads' | 'd2c'>('sales');
  const [msg, setMsg] = useState('');
  if (error) return <p className="text-sm text-brand-red">{error}</p>;
  if (loading && !data) return null;
  if (!data) return null;
  const weeks = data.sheets[kind];
  const del = async (week: string) => {
    if (!window.confirm(`Delete every ${kind} row for the week starting ${week}? Upload the sheet again to replace it.`)) return;
    try { await portalFetch(`/admin/brands/${brandId}/rows?kind=${kind}&week=${week}`, { method: 'DELETE' }); setMsg(`Deleted ${kind} for ${week}.`); reload(); }
    catch (e) { setMsg((e as Error).message); }
  };
  return (
    <Box title="Weeks loaded" right={
      <div className="inline-flex rounded-lg bg-surface-offwhite p-0.5 border border-black/8">
        {([['sales', 'Sales'], ['ads', 'Ads'], ['d2c', 'D2C store']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setKind(k)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${kind === k ? 'bg-brand-dark text-white' : 'text-brand-dark/55'}`}>{l}</button>
        ))}
      </div>
    }>
      {msg && <p className="mb-3 text-sm text-brand-dark/75">{msg}</p>}
      {!weeks.length ? <p className="text-sm text-brand-dark/40">Nothing loaded for this sheet yet.</p> : (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-brand-dark/40">{['Week starting', 'Rows', kind === 'ads' ? 'Spend' : 'Revenue', ''].map((h) => <th key={h} className="px-2 pb-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.week} className="border-t border-black/5">
                <td className="px-2 py-2">{w.week}</td>
                <td className="px-2 py-2">{w.rows}</td>
                <td className="px-2 py-2">£{w.total.toLocaleString('en-GB')}</td>
                <td className="px-2 py-2 text-right"><button onClick={() => del(w.week)} className="text-xs text-brand-dark/40 hover:text-brand-red">Delete week</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Box>
  );
}
