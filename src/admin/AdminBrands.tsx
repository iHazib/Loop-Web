import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, X, AlertTriangle, ArrowRight, Copy } from 'lucide-react';
import type * as M from '../../server/portal/metrics';
import { BRAND_STATUSES } from '../../server/portal/types';
import { useView, portalFetch } from '../portal/api';

/* Staff admin: every onboarded brand in one place. */

type Row = ReturnType<typeof M.adminSummary>;
type ListRes = { totals: { brands: number; active: number; onboarding: number; paused: number; churned: number; highCases: number; needAttention: number }; brands: Row[] };

export const STATUS_STYLE: Record<string, string> = {
  onboarding: 'bg-sky-50 text-sky-700 border-sky-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  churned: 'bg-neutral-100 text-neutral-500 border-neutral-200',
};
export const HEALTH: Record<string, { label: string; cls: string }> = {
  ok: { label: 'Healthy', cls: 'text-emerald-600' },
  setup: { label: 'Setup incomplete', cls: 'text-sky-600' },
  alerts: { label: 'Open alerts', cls: 'text-brand-red' },
  stale: { label: 'Data stale', cls: 'text-amber-600' },
};
export const input = 'w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-brand-dark focus:border-brand-red/50 outline-none';
const gbp = (n: number | null | undefined) => (n == null ? '–' : `£${Math.round(n).toLocaleString('en-GB')}`);
export const ago = (d: string | null) => {
  if (!d) return 'never';
  const days = Math.floor((Date.now() - new Date(d.slice(0, 10) + 'T00:00:00Z').getTime()) / 86_400_000);
  return days <= 0 ? 'today' : days === 1 ? '1 day ago' : `${days} days ago`;
};

function CreateBrand({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', plan: '', status: 'onboarding', accountManager: '', accountManagerEmail: '', contactEmail: '', notes: '', inviteEmail: '', inviteRole: 'manager' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<{ id: string; name: string; invitePath: string | null; warning?: string } | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const body: Record<string, string> = {};
    for (const [k, v] of Object.entries(f)) if (v.trim()) body[k] = v.trim();
    try { const r = await portalFetch<{ id: string; name: string; invitePath: string | null; warning?: string }>('/brands', { method: 'POST', body: JSON.stringify(body) }); setDone(r); onCreated(); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const link = done?.invitePath ? window.location.origin + done.invitePath : '';
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-10 px-4" onClick={onClose}>
      <div className="w-full max-w-xl bg-white rounded-2xl p-7 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-brand-dark">{done ? 'Brand created' : 'Add a brand'}</h2>
          <button onClick={onClose} className="text-brand-dark/40 hover:text-brand-dark"><X size={18} /></button>
        </div>
        {done ? (
          <div className="grid gap-4">
            <p className="text-sm text-brand-dark/70"><b>{done.name}</b> is set up with status <b>onboarding</b>.</p>
            {done.warning && <p className="text-sm text-amber-700">{done.warning}</p>}
            {link && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-800 mb-2">Send this invite link to the client (works once, expires in 7 days):</p>
                <div className="flex gap-2 items-start"><code className="flex-1 break-all text-xs text-brand-dark/80">{link}</code><button onClick={() => navigator.clipboard?.writeText(link)} className="text-brand-red shrink-0"><Copy size={15} /></button></div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => nav(`/admin/brands/${done.id}`)} className="rounded-lg bg-brand-dark text-white px-4 py-2 text-sm">Open brand</button>
              <button onClick={() => nav(`/portal/${done.id}/data`)} className="rounded-lg border border-black/10 px-4 py-2 text-sm">Add products in the portal</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-3">
            <label className="grid gap-1 text-xs text-brand-dark/60">Brand name *<input className={input} value={f.name} onChange={(e) => set('name', e.target.value)} required /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs text-brand-dark/60">Plan<input className={input} value={f.plan} onChange={(e) => set('plan', e.target.value)} placeholder="e.g. Run" /></label>
              <label className="grid gap-1 text-xs text-brand-dark/60">Status<select className={input} value={f.status} onChange={(e) => set('status', e.target.value)}>{BRAND_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
              <label className="grid gap-1 text-xs text-brand-dark/60">Account manager<input className={input} value={f.accountManager} onChange={(e) => set('accountManager', e.target.value)} placeholder="Defaults to you" /></label>
              <label className="grid gap-1 text-xs text-brand-dark/60">Account manager email<input className={input} type="email" value={f.accountManagerEmail} onChange={(e) => set('accountManagerEmail', e.target.value)} placeholder="Defaults to you" /></label>
            </div>
            <label className="grid gap-1 text-xs text-brand-dark/60">Brand contact email<input className={input} type="email" value={f.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} /></label>
            <label className="grid gap-1 text-xs text-brand-dark/60">Notes (staff only)<textarea className={input} rows={2} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></label>
            <div className="rounded-xl bg-surface-offwhite p-3 grid sm:grid-cols-[1fr_auto] gap-2">
              <label className="grid gap-1 text-xs text-brand-dark/60">Invite first client login (optional)<input className={input} type="email" value={f.inviteEmail} onChange={(e) => set('inviteEmail', e.target.value)} placeholder="name@brand.com" /></label>
              <label className="grid gap-1 text-xs text-brand-dark/60">Role<select className={input} value={f.inviteRole} onChange={(e) => set('inviteRole', e.target.value)}><option value="manager">Manager</option><option value="viewer">Viewer</option></select></label>
            </div>
            {err && <p className="text-sm text-brand-red">{err}</p>}
            <button disabled={busy} className="rounded-lg bg-brand-red text-white py-2.5 text-sm font-semibold disabled:opacity-50">{busy ? 'Creating…' : 'Create brand'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminBrands() {
  const [rev, setRev] = useState(0);
  const { data, error, loading } = useView<ListRes>(`/admin/brands?r=${rev}`);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const rows = useMemo(() => (data?.brands ?? [])
    .filter((r) => status === 'all' || r.brand.status === status)
    .filter((r) => !q || `${r.brand.name} ${r.brand.accountManager} ${r.brand.contactEmail}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.highCases - a.highCases) || a.brand.name.localeCompare(b.brand.name)), [data, status, q]);
  const t = data?.totals;

  return (
    <div className="px-6 md:px-10 py-9 max-w-[1400px]">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">Clients</span>
          <h1 className="font-display font-bold tracking-tight text-brand-dark text-3xl mt-1">Brands</h1>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-red text-white px-4 py-2.5 text-sm font-semibold"><Plus size={16} /> Add brand</button>
      </header>

      {error && <p className="text-sm text-brand-red mb-6">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { l: 'Brands', v: t?.brands, dark: true },
          { l: 'Active', v: t?.active },
          { l: 'Onboarding', v: t?.onboarding },
          { l: 'Need attention', v: t?.needAttention },
          { l: 'High alerts', v: t?.highCases, dark: true },
        ].map((c) => (
          <div key={c.l} className={`rounded-2xl p-5 border ${c.dark ? 'bg-brand-dark border-brand-dark' : 'bg-white border-black/8'}`}>
            <p className={`font-display font-bold leading-none ${c.dark ? 'text-white' : 'text-brand-dark'}`} style={{ fontSize: '2rem' }}>{loading && !data ? '…' : c.v ?? 0}</p>
            <p className={`mt-2 font-mono text-[10px] tracking-widest uppercase ${c.dark ? 'text-white/45' : 'text-brand-dark/40'}`}>{c.l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {['all', ...BRAND_STATUSES].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-xs capitalize border ${status === s ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-brand-dark/60 border-black/10 hover:text-brand-dark'}`}>{s}</button>
        ))}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/30" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands" className="rounded-lg border border-black/10 bg-white pl-8 pr-3 py-2 text-sm w-56" />
        </div>
      </div>

      <div className="bg-white border border-black/8 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[980px]">
          <thead>
            <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-brand-dark/40 border-b border-black/5">
              {['Brand', 'Status', 'Account manager', 'Setup', 'Logins', 'Alerts', 'Keepa', 'Sales', 'GMV 4 wks', 'Health', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {loading && !data && <tr><td colSpan={11} className="px-4 py-8 text-center text-brand-dark/40">Loading brands…</td></tr>}
            {data && !rows.length && <tr><td colSpan={11} className="px-4 py-10 text-center text-brand-dark/40">{data.brands.length ? 'No brands match.' : 'No brands yet. Add your first one.'}</td></tr>}
            {rows.map((r) => (
              <tr key={r.brand.id} className="hover:bg-surface-offwhite/60">
                <td className="px-4 py-3"><Link to={`/admin/brands/${r.brand.id}`} className="font-semibold text-brand-dark hover:text-brand-red">{r.brand.name}</Link><div className="text-[11px] text-brand-dark/40">{r.brand.plan || 'No plan'} · {r.products} products</div></td>
                <td className="px-4 py-3"><span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] capitalize ${STATUS_STYLE[r.brand.status ?? 'active']}`}>{r.brand.status}</span></td>
                <td className="px-4 py-3 text-brand-dark/70">{r.brand.accountManager || '–'}</td>
                <td className="px-4 py-3 w-36"><div className="h-1.5 rounded-full bg-black/5 overflow-hidden"><div className="h-full bg-brand-red" style={{ width: `${r.setupPct}%` }} /></div><div className="text-[11px] text-brand-dark/40 mt-1">{r.setupDone}/{r.setupTotal} steps</div></td>
                <td className="px-4 py-3 text-brand-dark/70">{r.users}</td>
                <td className="px-4 py-3">{r.highCases ? <span className="inline-flex items-center gap-1 text-brand-red font-semibold"><AlertTriangle size={13} />{r.highCases} high</span> : <span className="text-brand-dark/40">{r.openCases ? `${r.openCases} open` : 'none'}</span>}</td>
                <td className="px-4 py-3 text-brand-dark/60 text-xs">{ago(r.lastKeepa)}</td>
                <td className="px-4 py-3 text-brand-dark/60 text-xs">{ago(r.lastSales)}</td>
                <td className="px-4 py-3 text-brand-dark/80">{gbp(r.gmv4w)}{r.gmvChange != null && <span className={`ml-1 text-[11px] ${r.gmvChange >= 0 ? 'text-emerald-600' : 'text-brand-red'}`}>{r.gmvChange > 0 ? '+' : ''}{r.gmvChange}%</span>}</td>
                <td className={`px-4 py-3 text-xs font-semibold ${HEALTH[r.health].cls}`} title={r.stale.length ? `Stale: ${r.stale.join(', ')}` : ''}>{HEALTH[r.health].label}</td>
                <td className="px-4 py-3"><Link to={`/admin/brands/${r.brand.id}`} className="text-brand-dark/30 hover:text-brand-red"><ArrowRight size={16} /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-brand-dark/40 mt-3">Health: setup incomplete (under 4 of 7 steps), open high alerts, or stale data (Keepa older than 2 days, sheets older than 14 days).</p>

      {creating && <CreateBrand onClose={() => setCreating(false)} onCreated={() => setRev((x) => x + 1)} />}
    </div>
  );
}
