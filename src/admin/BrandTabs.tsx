import { Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Eye, X, Mail } from 'lucide-react';
import type * as M from '../../server/portal/metrics';
import { useView, portalFetch } from '../portal/api';
import { input } from './AdminBrands';

/* Two staff tabs on the admin brand page:
   - Products and listings: add ASINs, set cost and minimum price, see each ASIN on every marketplace.
   - Emails: which alerts and reports go to the brand, who gets them, previews and the sent log. */

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
  const [edit, setEdit] = useState<Record<string, { cost: string; mapPrice: string }>>({});

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
      await portalFetch(`/brands/${brandId}/products/${encodeURIComponent(sku)}`, { method: 'PATCH', body: JSON.stringify({ cost: Number(e.cost) || 0, mapPrice: Number(e.mapPrice) || 0 }) });
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

      <Box title="Products on every marketplace" right={<span className="text-xs text-brand-dark/40">Amazon UK and EU from Keepa ({data?.euMarkets || 'DE,FR,IT,ES'}), other channels from the sales sheet</span>}>
        {error ? <p className="text-sm text-brand-red">{error}</p> : loading && !data ? <p className="text-sm text-brand-dark/40">Loading…</p> : !data?.listings.length ? <p className="text-sm text-brand-dark/40">No products yet. Add ASINs above.</p> : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[980px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-brand-dark/40">
                  {['', 'Product', 'ASIN', 'UK price', 'BSR', 'Sellers', 'Buy Box', 'EU cheapest', 'Cost £', 'Min price £', ''].map((h, i) => <th key={i} className="px-2 pb-2 font-medium whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.listings.map((l) => {
                  const open = openSku === l.sku;
                  const e = edit[l.sku] ?? { cost: String(l.cost || ''), mapPrice: String(l.mapPrice || '') };
                  const dirty = edit[l.sku] && (Number(e.cost) !== l.cost || Number(e.mapPrice) !== l.mapPrice);
                  const cheapest = l.eu.filter((x) => x.gbp != null).sort((a, b) => a.gbp! - b.gbp!)[0];
                  return (
                    <Fragment key={l.sku}>
                      <tr className="border-t border-black/5 align-middle">
                        <td className="px-2 py-2.5"><button onClick={() => setOpenSku(open ? null : l.sku)} aria-label={open ? 'Hide marketplaces' : 'Show marketplaces'} className="text-brand-dark/50 hover:text-brand-dark">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button></td>
                        <td className="px-2 py-2.5"><div className="text-brand-dark font-medium">{l.name}</div><div className="text-[11px] text-brand-dark/40">{l.sku}</div></td>
                        <td className="px-2 py-2.5 font-mono text-xs">{l.asin || '–'}</td>
                        <td className="px-2 py-2.5">{money(l.uk?.price)}</td>
                        <td className="px-2 py-2.5">{l.uk?.bsr?.toLocaleString('en-GB') ?? '–'}</td>
                        <td className="px-2 py-2.5">{l.uk ? <>{l.uk.sellers}{l.uk.unauthorised ? <span className="ml-1 text-brand-red">({l.uk.unauthorised} not authorised)</span> : null}</> : '–'}</td>
                        <td className="px-2 py-2.5">{l.uk?.buyBoxOk == null ? '–' : l.uk.buyBoxOk ? <span className="text-emerald-600">Ours</span> : <span className="text-brand-red">Lost</span>}</td>
                        <td className="px-2 py-2.5">{cheapest ? <span className={cheapest.gapPct != null && cheapest.gapPct >= 20 ? 'text-violet-700' : ''}>{money(cheapest.gbp)} {cheapest.market}{cheapest.gapPct != null ? ` (${cheapest.gapPct > 0 ? '-' : '+'}${Math.abs(cheapest.gapPct)}%)` : ''}</span> : '–'}</td>
                        <td className="px-2 py-2.5"><input className={`${input} w-20`} inputMode="decimal" value={e.cost} onChange={(ev) => setEdit({ ...edit, [l.sku]: { ...e, cost: ev.target.value } })} aria-label={`Cost for ${l.sku}`} /></td>
                        <td className="px-2 py-2.5"><input className={`${input} w-20`} inputMode="decimal" value={e.mapPrice} onChange={(ev) => setEdit({ ...edit, [l.sku]: { ...e, mapPrice: ev.target.value } })} aria-label={`Minimum price for ${l.sku}`} /></td>
                        <td className="px-2 py-2.5">{dirty && <button onClick={() => saveRow(l.sku)} className="rounded-lg bg-brand-dark text-white px-3 py-1.5 text-xs">Save</button>}</td>
                      </tr>
                      {open && (
                        <tr className="bg-surface-offwhite/60">
                          <td colSpan={11} className="px-4 py-4">
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
