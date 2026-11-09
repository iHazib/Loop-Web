import { useState } from 'react';
import type { Product } from '../../server/portal/types';
import { portalFetch, parseCsv, downloadCsv, useView } from './api';
import { Card, Badge, Table, gbp } from './ui';
import type { Status } from './Portal';

type Kind = 'products' | 'sales' | 'ads' | 'sellers' | 'competitors';
const SHEETS: { kind: Kind; title: string; help: string; example: (string | number)[] }[] = [
  { kind: 'sales', title: 'Sales', help: 'Weekly. One row per SKU, per channel, per week (Amazon, TikTok Shop, eBay, Temu, D2C, Wholesale). Keepa cannot see your own sales, so this one comes from you.', example: ['2026-11-02', 'Amazon', 'HAL-OAT-500', 340, 2376.6, 6, 520, 1200] },
  { kind: 'ads', title: 'Ads', help: 'Weekly. One row per campaign, per week, from each ad platform export.', example: ['2026-11-02', 'Amazon', 'SP Oat Bites Exact', 'Sponsored Products', 180, 42000, 610, 74, 517.26] },
  { kind: 'sellers', title: 'Authorised sellers', help: 'Who is allowed to sell. Anyone else on your ASINs opens a protection case.', example: ['Halcyon Direct Ltd', 'A1XXXXXXXXXXXX', 'halcyon_direct', 'All', '2027-12-31'] },
  { kind: 'products', title: 'Products (bulk)', help: 'Optional. Easier: import from ASINs above, then fill cost and minimum price in the table.', example: ['HAL-OAT-500', 'Oat Bites 500g', 'B0XXXXXXXX', '5060000000011', 2.1, 6.99, 5.99] },
  { kind: 'competitors', title: 'Competitors (bulk)', help: 'Optional. Competitor or compatible ASINs per SKU. "Find competitors" does this for you.', example: ['HAL-OAT-500', 'B0YYYYYYYY', 'competitor'] },
];

function ProductRow({ p, brandId, canEdit, onSaved }: { p: Product; brandId: string; canEdit: boolean; onSaved: () => void }) {
  const [v, setV] = useState({ cost: String(p.cost || ''), rrp: String(p.rrp || ''), mapPrice: String(p.mapPrice || '') });
  const [state, setState] = useState<'' | 'saving' | 'saved' | string>('');
  const dirty = v.cost !== String(p.cost || '') || v.rrp !== String(p.rrp || '') || v.mapPrice !== String(p.mapPrice || '');
  const save = async () => {
    setState('saving');
    try { await portalFetch(`/brands/${brandId}/products/${encodeURIComponent(p.sku)}`, { method: 'PATCH', body: JSON.stringify({ cost: v.cost || 0, rrp: v.rrp || 0, mapPrice: v.mapPrice || 0 }) }); setState('saved'); onSaved(); }
    catch (e) { setState((e as Error).message); }
  };
  const cell = (k: keyof typeof v) => canEdit
    ? <input value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} inputMode="decimal" placeholder="0.00"
        className={`w-20 rounded-md bg-white/[0.04] border px-2 py-1 text-right text-sm ${!Number(v[k]) && k !== 'rrp' ? 'border-amber-400/40' : 'border-white/10'}`} />
    : gbp(Number(v[k]) || null, 2);
  return (
    <tr className="border-t border-white/[0.06] text-sm text-white/80">
      <td className="px-2 py-2 max-w-[260px]"><div className="truncate text-white" title={p.name}>{p.name}</div><div className="text-[11px] text-white/40 font-mono">{p.sku} · {p.asin || 'no ASIN'}</div></td>
      <td className="px-2 py-2 text-right">{cell('cost')}</td>
      <td className="px-2 py-2 text-right">{cell('rrp')}</td>
      <td className="px-2 py-2 text-right">{cell('mapPrice')}</td>
      <td className="px-2 py-2 text-right w-24">
        {canEdit && (dirty ? <button onClick={save} className="text-xs rounded-md bg-brand-red px-2.5 py-1 text-white">Save</button>
          : <span className="text-[11px] text-white/35">{state === 'saved' ? 'Saved' : state && state !== 'saving' ? <span className="text-rose-400">{state}</span> : ''}</span>)}
      </td>
    </tr>
  );
}

function Team({ brandId }: { brandId: string }) {
  const { data, reload } = useView<{ users: { email: string; role: string; name: string; lastLogin: string | null; active: boolean }[]; pendingInvites: { email: string; role: string; expiresAt: string }[] }>(`/brands/${brandId}/users`);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'manager' | 'viewer'>('manager');
  const [link, setLink] = useState('');
  const [err, setErr] = useState('');
  const invite = async () => {
    setErr(''); setLink('');
    try {
      const r = await portalFetch<{ invitePath: string }>(`/brands/${brandId}/users`, { method: 'POST', body: JSON.stringify({ email, role }) });
      setLink(window.location.origin + r.invitePath); setEmail(''); reload();
    } catch (e) { setErr((e as Error).message); }
  };
  const remove = async (e: string) => {
    if (!window.confirm(`Remove ${e}'s access to this brand?`)) return;
    await portalFetch(`/brands/${brandId}/users?email=${encodeURIComponent(e)}`, { method: 'DELETE' }).catch((x: Error) => setErr(x.message));
    reload();
  };
  return (
    <Card title="Brand logins" right="staff only">
      <p className="text-sm text-white/50 mb-4">Invite people from the brand. Managers can upload sheets, edit products and work cases. Viewers can only look. Send them the link yourself; it works once and expires in 7 days. Sending a new link to an existing user resets their password.</p>
      <div className="flex flex-wrap gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@brand.com" className="flex-1 min-w-[200px] rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm" />
        <select value={role} onChange={(e) => setRole(e.target.value as 'manager' | 'viewer')} className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm">
          <option value="manager" className="bg-black">Manager</option><option value="viewer" className="bg-black">Viewer</option>
        </select>
        <button onClick={invite} disabled={!email} className="rounded-lg bg-brand-red px-4 py-2 text-sm text-white disabled:opacity-40">Create invite link</button>
      </div>
      {err && <p className="text-xs text-rose-400 mt-2">{err}</p>}
      {link && (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
          <p className="text-emerald-300 mb-1">Invite link (copy it now, it is shown once):</p>
          <div className="flex gap-2"><code className="flex-1 break-all text-white/80">{link}</code><button onClick={() => navigator.clipboard?.writeText(link)} className="text-brand-red shrink-0">Copy</button></div>
        </div>
      )}
      <div className="mt-4">
        <Table head={['User', 'Role', 'Status', '']} empty="Nobody invited yet."
          rows={[
            ...(data?.users ?? []).map((u) => [<span>{u.name ? `${u.name} · ` : ''}{u.email}</span>, u.role, u.active ? <Badge tone="ok">{u.lastLogin ? `active` : 'set up'}</Badge> : <Badge tone="warn">invited</Badge>, <button onClick={() => remove(u.email)} className="text-xs text-white/40 hover:text-rose-400">Remove</button>]),
          ]} />
      </div>
    </Card>
  );
}

export function DataTab({ brandId, status, canEdit, isStaff, onChanged }: { brandId: string; status: Status | null; canEdit: boolean; isStaff: boolean; onChanged: () => void }) {
  const isDemo = brandId === 'demo';
  const { data: templates } = useView<Record<Kind, string[]>>('/templates');
  const { data: products, reload: reloadProducts } = useView<Product[]>(`/brands/${brandId}/products`);
  const [result, setResult] = useState<Record<string, { accepted: number; rejected: { row: number; reason: string }[] } | { error: string }>>({});
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [asins, setAsins] = useState('');
  const [sku, setSku] = useState('');
  const [kw, setKw] = useState('');
  const say = (k: string, m: string) => setMsg((x) => ({ ...x, [k]: m }));

  const upload = async (kind: Kind, file: File) => {
    setBusy(kind);
    try {
      const rows = parseCsv(await file.text());
      const r = await portalFetch<{ accepted: number; rejected: { row: number; reason: string }[] }>(`/brands/${brandId}/upload/${kind}`, { method: 'POST', body: JSON.stringify({ rows }) });
      setResult((x) => ({ ...x, [kind]: r }));
      if (kind === 'products') reloadProducts();
      onChanged();
    } catch (e) { setResult((x) => ({ ...x, [kind]: { error: (e as Error).message } })); } finally { setBusy(''); }
  };
  const runImport = async () => {
    setBusy('import'); say('import', '');
    try {
      const r = await portalFetch<{ imported: number; notFound: string[]; needCost: string[] }>(`/brands/${brandId}/products/import`, { method: 'POST', body: JSON.stringify({ asins }) });
      say('import', `Imported ${r.imported} products from Keepa.${r.notFound.length ? ` Not found on Amazon UK: ${r.notFound.join(', ')}.` : ''}${r.needCost.length ? ` Add cost and minimum price for ${r.needCost.length} products below.` : ''}`);
      setAsins(''); reloadProducts(); onChanged();
    } catch (e) { say('import', (e as Error).message); } finally { setBusy(''); }
  };
  const runSync = async () => {
    setBusy('sync'); say('sync', '');
    try {
      const r = await portalFetch<{ asins: number; opened: number; resolved: number; tokensLeft: number | null }>(`/brands/${brandId}/keepa/sync`, { method: 'POST', body: '{}' });
      say('sync', `Checked ${r.asins} ASINs. ${r.opened} new cases, ${r.resolved} resolved. Keepa tokens left: ${r.tokensLeft ?? 'unknown'}.`);
      onChanged();
    } catch (e) { say('sync', (e as Error).message); } finally { setBusy(''); }
  };
  const discover = async () => {
    setBusy('discover'); say('discover', '');
    try {
      const r = await portalFetch<{ competitors: number; compatibles: number; searched: string[]; method: string }>(`/brands/${brandId}/keepa/discover`, { method: 'POST', body: JSON.stringify({ sku, keywords: kw }) });
      say('discover', `Added ${r.competitors} competitors and ${r.compatibles} compatibles (searched: ${r.searched.join(' · ')}; sorted by ${r.method}). They are tracked from the next daily Keepa check.`);
      onChanged();
    } catch (e) { say('discover', (e as Error).message); } finally { setBusy(''); }
  };

  const keepaOn = Boolean(status?.keepa);
  const missing = (products ?? []).filter((p) => !p.cost || !p.mapPrice).length;

  return (
    <div className="grid gap-5">
      <Card title="Where the data comes from">
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-white">Keepa (automatic)</span>{keepaOn ? <Badge tone="ok">on</Badge> : <Badge tone="warn">not set</Badge>}</div>
            <p className="text-xs text-white/45">Daily: BSR, prices, averages, Buy Box, every seller, reviews, competitor tracking. Amazon UK.</p>
            {isStaff && status?.keepaTokens?.tokensLeft != null && <p className="text-[11px] font-mono text-white/40 mt-2">{status.keepaTokens.tokensLeft} tokens left</p>}
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-white">You (weekly sheet)</span><Badge tone="info">manual</Badge></div>
            <p className="text-xs text-white/45">Your own sales by channel, ad spend, product costs and the authorised seller list. Keepa cannot see these.</p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-white">AI (built in)</span>{status?.ai ? <Badge tone="ok">on</Badge> : <Badge tone="warn">not set</Badge>}</div>
            <p className="text-xs text-white/45">The Ask box, keyword ideas for competitor search, and sorting results into competitor or compatible.</p>
          </div>
        </div>
        {isDemo && <p className="text-xs text-white/45 mt-4">This is the demo brand, so changes are switched off. Templates still download.</p>}
        {!isDemo && !canEdit && <p className="text-xs text-white/45 mt-4">Your login can view this brand. Ask your account manager for manager access to upload or edit.</p>}
      </Card>

      <Card title="Products" right={missing ? <span className="text-amber-300">{missing} need cost or minimum price</span> : `${products?.length ?? 0} products`}>
        {canEdit && (
          <div className="mb-5">
            <p className="text-sm text-white/50 mb-2">Paste your ASINs (one per line or comma separated). Keepa fills the name, EAN and RRP; you add cost and minimum price.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea value={asins} onChange={(e) => setAsins(e.target.value)} rows={2} placeholder="B0XXXXXXXX, B0YYYYYYYY"
                className="flex-1 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm font-mono" />
              <button onClick={runImport} disabled={!keepaOn || !asins.trim() || !!busy} className="rounded-lg bg-brand-red px-4 py-2 text-sm text-white disabled:opacity-40 sm:self-start">
                {busy === 'import' ? 'Importing…' : 'Import from Keepa'}
              </button>
            </div>
            {msg.import && <p className="text-xs text-white/70 mt-2">{msg.import}</p>}
          </div>
        )}
        {products?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-left text-[11px] uppercase tracking-wider text-white/35">
                <th className="px-2 pb-2 font-medium">Product</th><th className="px-2 pb-2 font-medium text-right">Cost £</th><th className="px-2 pb-2 font-medium text-right">RRP £</th><th className="px-2 pb-2 font-medium text-right">Minimum £</th><th />
              </tr></thead>
              <tbody>{products.map((p) => <ProductRow key={p.sku} p={p} brandId={brandId} canEdit={canEdit} onSaved={onChanged} />)}</tbody>
            </table>
          </div>
        ) : <p className="text-sm text-white/40">No products yet.</p>}
      </Card>

      {canEdit && (
        <Card title="Find competitors" right={status?.ai ? 'Keepa search + AI' : 'Keepa search'}>
          <p className="text-sm text-white/50 mb-3">Searches Amazon UK through Keepa. AI picks the search phrases and keeps only real competitors and "compatible with" listings. About 30 Keepa tokens per product.</p>
          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
            <select value={sku} onChange={(e) => setSku(e.target.value)} className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm">
              <option value="" className="bg-black">Pick a product…</option>
              {(products ?? []).map((p) => <option key={p.sku} value={p.sku} className="bg-black">{p.name}</option>)}
            </select>
            <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Optional: your own search phrase" className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm" />
            <button disabled={!keepaOn || !sku || !!busy} onClick={discover} className="rounded-lg bg-brand-red px-4 py-2 text-sm text-white disabled:opacity-40">{busy === 'discover' ? 'Searching…' : 'Find'}</button>
          </div>
          {msg.discover && <p className="text-xs text-white/70 mt-2">{msg.discover}</p>}
        </Card>
      )}

      {isStaff && !isDemo && <Team brandId={brandId} />}

      {isStaff && !isDemo && (
        <Card title="Keepa check" right="runs automatically every day">
          <button disabled={!keepaOn || !!busy} onClick={runSync} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-40">{busy === 'sync' ? 'Checking…' : 'Run Keepa check now'}</button>
          {msg.sync && <p className="text-xs text-white/70 mt-2">{msg.sync}</p>}
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {SHEETS.map((k) => {
          const r = result[k.kind];
          const can = canEdit && !busy;
          return (
            <Card key={k.kind} title={k.title}
              right={<button onClick={() => templates && downloadCsv(`loopretail-${k.kind}-template.csv`, templates[k.kind], [k.example])} className="text-brand-red hover:underline">Download template</button>}>
              <p className="text-sm text-white/50 mb-4">{k.help}</p>
              <label className={`flex items-center justify-center rounded-xl border border-dashed p-5 text-sm text-center ${can ? 'border-white/20 text-white/60 hover:border-brand-red/50 cursor-pointer' : 'border-white/10 text-white/25 cursor-not-allowed'}`}>
                {busy === k.kind ? 'Uploading…' : 'Choose CSV file (export the Google Sheet tab as CSV)'}
                <input type="file" accept=".csv,text/csv" disabled={!can} className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(k.kind, f); e.currentTarget.value = ''; }} />
              </label>
              {r && ('error' in r ? <p className="text-xs text-rose-400 mt-3">{r.error}</p> : (
                <div className="mt-3 text-xs">
                  <p className="text-emerald-400">{r.accepted} rows saved.</p>
                  {r.rejected.length > 0 && (
                    <div className="mt-2">
                      <p className="text-amber-300 mb-1">{r.rejected.length} rows rejected:</p>
                      <Table head={['Row', 'Reason']} rows={r.rejected.slice(0, 20).map((x) => [x.row, <span className="text-white/60 whitespace-normal">{x.reason}</span>])} />
                    </div>
                  )}
                </div>
              ))}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
