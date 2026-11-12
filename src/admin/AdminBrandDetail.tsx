import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, RefreshCw, Trash2, CheckCircle2, Circle, Copy } from 'lucide-react';
import type * as M from '../../server/portal/metrics';
import type { Brand, ProtectionCase } from '../../server/portal/types';
import { BRAND_STATUSES, CASE_LABELS } from '../../server/portal/types';
import { useView, portalFetch } from '../portal/api';
import { STATUS_STYLE, HEALTH, input, ago } from './AdminBrands';

type Detail = {
  brand: Brand;
  summary: ReturnType<typeof M.adminSummary>;
  home: ReturnType<typeof M.home>;
  users: { users: { email: string; role: string; name: string; lastLogin: string | null; active: boolean }[]; pendingInvites: { email: string; role: string; expiresAt: string }[] };
  openCases: ProtectionCase[];
};

function Box({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-black/8 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4"><h2 className="font-display font-bold text-brand-dark text-lg">{title}</h2>{right}</div>
      {children}
    </section>
  );
}

export default function AdminBrandDetail() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [rev, setRev] = useState(0);
  const { data, error, loading } = useView<Detail>(`/admin/brands/${encodeURIComponent(id)}?r=${rev}`);
  const reload = () => setRev((x) => x + 1);
  const [f, setF] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState('');
  const [invite, setInvite] = useState({ email: '', role: 'manager' });
  const [link, setLink] = useState('');

  useEffect(() => {
    if (!data) return;
    const b = data.brand;
    setF({ name: b.name, plan: b.plan, status: b.status ?? 'active', accountManager: b.accountManager ?? '', accountManagerEmail: b.accountManagerEmail ?? '', contactEmail: b.contactEmail ?? '', notes: b.notes ?? '' });
  }, [data]);

  const run = async (key: string, fn: () => Promise<string | void>) => {
    setBusy(key); setMsg('');
    try { const m = await fn(); if (m) setMsg(m); } catch (e) { setMsg((e as Error).message); } finally { setBusy(''); }
  };
  const save = (e: FormEvent) => { e.preventDefault(); void run('save', async () => { await portalFetch(`/admin/brands/${id}`, { method: 'PATCH', body: JSON.stringify(f) }); reload(); return 'Saved.'; }); };
  const keepa = () => run('keepa', async () => {
    const r = await portalFetch<{ asins: number; opened: number; resolved: number; tokensLeft: number | null }>(`/brands/${id}/keepa/sync`, { method: 'POST', body: '{}' });
    reload(); return `Keepa check done: ${r.asins} ASINs, ${r.opened} new cases, ${r.resolved} resolved. Tokens left ${r.tokensLeft ?? 'unknown'}.`;
  });
  const del = () => {
    const typed = window.prompt(`This permanently deletes ${data?.brand.name} and all its data (products, sales, cases, logins). Type the brand id "${id}" to confirm.`);
    if (typed !== id) return;
    void run('delete', async () => { await portalFetch(`/admin/brands/${id}?confirm=${encodeURIComponent(id)}`, { method: 'DELETE' }); nav('/admin/brands'); });
  };
  const sendInvite = () => run('invite', async () => {
    const r = await portalFetch<{ invitePath: string }>(`/brands/${id}/users`, { method: 'POST', body: JSON.stringify(invite) });
    setLink(window.location.origin + r.invitePath); setInvite({ email: '', role: 'manager' }); reload();
  });
  const removeUser = (email: string) => {
    if (!window.confirm(`Remove ${email}'s access to ${data?.brand.name}?`)) return;
    void run('remove', async () => { await portalFetch(`/brands/${id}/users?email=${encodeURIComponent(email)}`, { method: 'DELETE' }); reload(); });
  };

  if (error) return <div className="px-10 py-9"><Link to="/admin/brands" className="text-sm text-brand-dark/50">← Brands</Link><p className="mt-6 text-brand-red">{error}</p></div>;
  if (loading && !data) return <div className="px-10 py-9 text-brand-dark/40">Loading…</div>;
  if (!data) return null;
  const { brand, summary: s, home: h } = data;
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));

  return (
    <div className="px-6 md:px-10 py-9 max-w-[1300px]">
      <Link to="/admin/brands" className="inline-flex items-center gap-1.5 text-sm text-brand-dark/50 hover:text-brand-dark"><ArrowLeft size={14} /> Brands</Link>
      <header className="mt-4 mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold tracking-tight text-brand-dark text-3xl">{brand.name}</h1>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs capitalize ${STATUS_STYLE[brand.status ?? 'active']}`}>{brand.status}</span>
          </div>
          <p className="text-sm text-brand-dark/50 mt-1">{brand.plan || 'No plan'} · id <code>{brand.id}</code>{brand.createdAt ? ` · added ${brand.createdAt.slice(0, 10)}` : ''} · <span className={HEALTH[s.health].cls}>{HEALTH[s.health].label}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/portal/${id}/home`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"><ExternalLink size={14} /> Open portal</a>
          <a href={`/portal/${id}/report`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"><FileText size={14} /> Weekly report</a>
          <button onClick={keepa} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-dark text-white px-3 py-2 text-sm disabled:opacity-50"><RefreshCw size={14} className={busy === 'keepa' ? 'animate-spin' : ''} /> Run Keepa check</button>
        </div>
      </header>
      {msg && <div className="mb-6 rounded-xl border border-black/10 bg-surface-offwhite px-4 py-3 text-sm text-brand-dark/80">{msg}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        {[['Setup', `${s.setupDone}/${s.setupTotal}`], ['Products', s.products], ['Logins', s.users], ['Open cases', s.openCases], ['Keepa', ago(s.lastKeepa)], ['Sales sheet', ago(s.lastSales)]].map(([k, v]) => (
          <div key={k as string} className="rounded-xl bg-white border border-black/8 p-4"><p className="text-[10px] font-mono uppercase tracking-widest text-brand-dark/40">{k}</p><p className="font-display font-bold text-brand-dark text-xl mt-1">{v}</p></div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="grid gap-6 content-start">
          <Box title="Brand details">
            <form onSubmit={save} className="grid gap-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="grid gap-1 text-xs text-brand-dark/60 sm:col-span-2">Name<input className={input} value={f.name ?? ''} onChange={(e) => set('name', e.target.value)} /></label>
                <label className="grid gap-1 text-xs text-brand-dark/60">Status<select className={input} value={f.status ?? 'active'} onChange={(e) => set('status', e.target.value)}>{BRAND_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></label>
                <label className="grid gap-1 text-xs text-brand-dark/60">Plan<input className={input} value={f.plan ?? ''} onChange={(e) => set('plan', e.target.value)} /></label>
                <label className="grid gap-1 text-xs text-brand-dark/60">Account manager<input className={input} value={f.accountManager ?? ''} onChange={(e) => set('accountManager', e.target.value)} /></label>
                <label className="grid gap-1 text-xs text-brand-dark/60">Account manager email<input className={input} type="email" value={f.accountManagerEmail ?? ''} onChange={(e) => set('accountManagerEmail', e.target.value)} /></label>
              </div>
              <label className="grid gap-1 text-xs text-brand-dark/60">Brand contact email<input className={input} type="email" value={f.contactEmail ?? ''} onChange={(e) => set('contactEmail', e.target.value)} /></label>
              <label className="grid gap-1 text-xs text-brand-dark/60">Notes (staff only, never shown to the client)<textarea className={input} rows={3} value={f.notes ?? ''} onChange={(e) => set('notes', e.target.value)} /></label>
              <div><button disabled={!!busy} className="rounded-lg bg-brand-red text-white px-4 py-2 text-sm font-semibold disabled:opacity-50">{busy === 'save' ? 'Saving…' : 'Save changes'}</button></div>
            </form>
          </Box>

          <Box title="Open protection cases" right={<a href={`/portal/${id}/protection`} target="_blank" rel="noreferrer" className="text-xs text-brand-red">Open in portal →</a>}>
            {!data.openCases.length ? <p className="text-sm text-brand-dark/40">No open cases.</p> : (
              <ul className="divide-y divide-black/5">
                {data.openCases.map((c) => (
                  <li key={c.id} className="py-2.5 flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full ${c.severity === 'high' ? 'bg-brand-red' : c.severity === 'medium' ? 'bg-amber-400' : 'bg-sky-400'}`} />
                    <span className="flex-1 text-brand-dark/80">{c.title}</span>
                    <span className="text-[11px] text-brand-dark/40">{CASE_LABELS[c.type]} · {c.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </Box>
        </div>

        <div className="grid gap-6 content-start">
          <Box title="Client logins">
            <div className="flex flex-wrap gap-2 mb-3">
              <input className={`${input} flex-1 min-w-[180px]`} type="email" placeholder="name@brand.com" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
              <select className={`${input} w-auto`} value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}><option value="manager">Manager</option><option value="viewer">Viewer</option></select>
              <button onClick={sendInvite} disabled={!invite.email || !!busy} className="rounded-lg bg-brand-dark text-white px-3 py-2 text-sm disabled:opacity-40">Invite</button>
            </div>
            {link && <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs"><p className="text-emerald-800 mb-1">Invite link (shown once, expires in 7 days):</p><div className="flex gap-2"><code className="flex-1 break-all">{link}</code><button onClick={() => navigator.clipboard?.writeText(link)} className="text-brand-red"><Copy size={14} /></button></div></div>}
            <ul className="divide-y divide-black/5">
              {data.users.users.map((u) => (
                <li key={u.email} className="py-2.5 flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0"><div className="text-brand-dark truncate">{u.name ? `${u.name} · ` : ''}{u.email}</div><div className="text-[11px] text-brand-dark/40">{u.role} · {u.active ? (u.lastLogin ? `last login ${u.lastLogin.slice(0, 10)}` : 'password set') : 'invite pending'}</div></div>
                  <button onClick={() => removeUser(u.email)} className="text-xs text-brand-dark/40 hover:text-brand-red">Remove</button>
                </li>
              ))}
              {!data.users.users.length && <li className="py-2 text-sm text-brand-dark/40">No logins yet.</li>}
            </ul>
          </Box>

          <Box title="Setup checklist" right={<span className="text-xs text-brand-dark/40">{h.setup.pct}%</span>}>
            <ul className="grid gap-2">
              {h.setup.steps.map((st) => (
                <li key={st.key} className="flex items-start gap-2.5 text-sm">
                  {st.done ? <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> : <Circle size={16} className="text-brand-dark/20 mt-0.5 shrink-0" />}
                  <div><div className={st.done ? 'text-brand-dark/50' : 'text-brand-dark'}>{st.label}</div><div className="text-[11px] text-brand-dark/40">{st.detail}</div></div>
                </li>
              ))}
            </ul>
          </Box>

          <Box title="Data freshness">
            <ul className="grid gap-2 text-sm">
              {h.freshness.map((x) => (
                <li key={x.label} className="flex justify-between gap-3"><span className="text-brand-dark/70">{x.label}</span><span className={x.status === 'ok' ? 'text-emerald-600' : x.status === 'stale' ? 'text-amber-600' : 'text-brand-dark/40'}>{x.last ? ago(x.last) : 'never'}</span></li>
              ))}
            </ul>
          </Box>

          <Box title="Danger zone">
            <p className="text-sm text-brand-dark/55 mb-3">Set the status to churned to keep the history. Deleting removes the brand, its data and its logins permanently.</p>
            <button onClick={del} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg border border-brand-red/40 text-brand-red px-3 py-2 text-sm hover:bg-brand-red/5"><Trash2 size={14} /> Delete brand</button>
          </Box>
        </div>
      </div>
    </div>
  );
}
