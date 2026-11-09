import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BarChart3, Store, Shield, Search, Megaphone, Truck, Database, Plus, ArrowLeft, Sparkles, LogOut, X } from 'lucide-react';
import type { Brand } from '../../server/portal/types';
import { useView, portalFetch } from './api';
import { Overview, Channels, Protection, Analysis, Ads, Logistics } from './views';
import { DataTab } from './DataTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'channels', label: 'Channels', icon: Store },
  { id: 'protection', label: 'Protection', icon: Shield },
  { id: 'analysis', label: 'Brand Analysis', icon: Search },
  { id: 'ads', label: 'Ads', icon: Megaphone },
  { id: 'logistics', label: 'Logistics & Distribution', icon: Truck },
  { id: 'data', label: 'Data', icon: Database },
] as const;

export type Principal = { kind: 'staff' | 'client'; email: string; name: string; brands: Record<string, 'manager' | 'viewer'> | null };
export type Status = { signedIn: boolean; db: boolean; keepa: boolean; ai: boolean; principal: Principal | null; keepaTokens?: { tokensLeft?: number; error?: string } | null };

function AskBar({ brandId, enabled }: { brandId: string; enabled: boolean }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<{ answer: string; tab: string; skus: string[] } | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { setAnswer(null); setErr(''); }, [brandId]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true); setErr(''); setAnswer(null);
    try { setAnswer(await portalFetch(`/brands/${brandId}/ask`, { method: 'POST', body: JSON.stringify({ question: q }) })); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const examples = ['Which products lost the Buy Box?', 'Where are competitors cheaper than us?', 'Which channel grew fastest this month?', 'Which campaigns are over target ACoS?'];
  return (
    <div className="mb-6">
      <form onSubmit={submit} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 focus-within:border-brand-red/50">
        <Sparkles size={16} className="text-brand-red shrink-0" />
        <input value={q} onChange={(e) => setQ(e.target.value)} disabled={!enabled}
          placeholder={enabled ? 'Ask anything about this brand, e.g. "which sellers are undercutting us?"' : 'AI search switches on once GEMINI_API_KEY is set'}
          className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/35 outline-none py-1" />
        <button disabled={!enabled || busy} className="rounded-lg bg-brand-red px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40">{busy ? 'Thinking…' : 'Ask'}</button>
      </form>
      {enabled && !answer && !err && !busy && (
        <div className="flex flex-wrap gap-2 mt-2">
          {examples.map((x) => <button key={x} onClick={() => setQ(x)} className="text-[11px] text-white/45 border border-white/10 rounded-full px-2.5 py-1 hover:text-white hover:border-white/25">{x}</button>)}
        </div>
      )}
      {(answer || err) && (
        <div className="mt-3 rounded-2xl border border-brand-red/25 bg-brand-red/[0.06] p-4 relative">
          <button onClick={() => { setAnswer(null); setErr(''); }} className="absolute top-3 right-3 text-white/40 hover:text-white"><X size={14} /></button>
          {err ? <p className="text-sm text-rose-300">{err}</p> : answer && (
            <>
              <p className="text-sm text-white/90 whitespace-pre-line pr-6">{answer.answer}</p>
              <button onClick={() => nav(`/portal/${brandId}/${answer.tab}`)} className="mt-3 text-xs text-brand-red hover:underline">Open {TABS.find((t) => t.id === answer.tab)?.label ?? 'tab'} →</button>
            </>
          )}
          <p className="text-[10px] text-white/30 mt-2">AI answer from this dashboard's data. Check the figures in the tab before acting.</p>
        </div>
      )}
    </div>
  );
}

export default function Portal() {
  const { brandId: paramBrand, tab = 'overview' } = useParams();
  const nav = useNavigate();
  const [rev, setRev] = useState(0);
  const { data: status, loading: statusLoading } = useView<Status>(`/status?r=${rev}`);
  const { data: brands, reload: reloadBrands } = useView<Brand[]>(`/brands?r=${rev}`);
  const p = status?.principal ?? null;
  const isStaff = p?.kind === 'staff';
  const brandId = paramBrand ?? (p?.kind === 'client' && brands?.length ? brands[0].id : 'demo');
  const brand = brands?.find((b) => b.id === brandId);
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const canEdit = brandId !== 'demo' && (isStaff || p?.brands?.[brandId] === 'manager');

  // Clients go straight to their own brand; nobody signed in lands on the demo.
  useEffect(() => {
    if (!paramBrand && p?.kind === 'client' && brands?.length) nav(`/portal/${brands[0].id}/overview`, { replace: true });
  }, [paramBrand, p, brands, nav]);

  const addBrand = async () => {
    const name = window.prompt('Brand name');
    if (!name) return;
    try {
      const b = await portalFetch<Brand>('/brands', { method: 'POST', body: JSON.stringify({ name }) });
      reloadBrands();
      nav(`/portal/${b.id}/data`);
    } catch (e) { window.alert((e as Error).message); }
  };
  const signOut = async () => {
    if (p?.kind === 'client') await portalFetch('/auth/logout', { method: 'POST', body: '{}' }).catch(() => null);
    else await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => null);
    setRev((r) => r + 1);
    nav('/portal/login');
  };

  const noAccess = !statusLoading && brandId !== 'demo' && brands && !brand;
  const key = `${brandId}-${rev}`;
  const view = noAccess ? (
    <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
      <p className="text-white font-medium">{p ? 'You do not have access to this brand.' : 'Sign in to view this brand.'}</p>
      <Link to={p ? '/portal' : '/portal/login'} className="text-sm text-brand-red hover:underline mt-2 inline-block">{p ? 'Go to your brands' : 'Sign in'}</Link>
    </div>
  ) : (() => {
    switch (current.id) {
      case 'overview': return <Overview key={key} brandId={brandId} />;
      case 'channels': return <Channels key={key} brandId={brandId} />;
      case 'protection': return <Protection key={key} brandId={brandId} canEdit={canEdit} />;
      case 'analysis': return <Analysis key={key} brandId={brandId} />;
      case 'ads': return <Ads key={key} brandId={brandId} />;
      case 'logistics': return <Logistics key={key} brandId={brandId} />;
      case 'data': return <DataTab key={brandId} brandId={brandId} status={status} canEdit={canEdit} isStaff={isStaff} onChanged={() => setRev((r) => r + 1)} />;
    }
  })();

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col md:flex-row">
      <aside className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.07] p-4 md:p-5 flex flex-col gap-5 md:min-h-screen md:sticky md:top-0 md:h-screen">
        <Link to="/" className="flex items-center gap-2 text-xs text-white/40 hover:text-white"><ArrowLeft size={14} /> loopretail.io</Link>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Brand</div>
          <div className="flex gap-2">
            <select value={brandId} onChange={(e) => nav(`/portal/${e.target.value}/${current.id}`)}
              className="flex-1 min-w-0 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm">
              {(brands ?? []).map((b) => <option key={b.id} value={b.id} className="bg-black">{b.name}</option>)}
            </select>
            {isStaff && status?.db && (
              <button onClick={addBrand} title="Add brand" className="rounded-lg border border-white/10 px-2.5 hover:border-brand-red/50"><Plus size={15} /></button>
            )}
          </div>
          {brand?.plan && <div className="text-[10px] font-mono uppercase tracking-widest text-brand-red mt-2">{brand.plan}</div>}
        </div>
        <nav className="flex md:flex-col gap-1 overflow-x-auto -mx-1 px-1">
          {TABS.map((t) => (
            <Link key={t.id} to={`/portal/${brandId}/${t.id}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors ${current.id === t.id ? 'bg-brand-red/15 text-white border border-brand-red/25' : 'text-white/55 hover:text-white hover:bg-white/[0.04] border border-transparent'}`}>
              <t.icon size={16} /> {t.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden md:block text-xs text-white/40">
          {p ? (
            <>
              <div className="text-white/70 truncate">{p.name || p.email}</div>
              <div className="truncate">{p.kind === 'staff' ? 'Loopretail staff' : p.brands?.[brandId] === 'manager' ? 'Brand manager' : 'Viewer'}</div>
              <button onClick={signOut} className="mt-3 inline-flex items-center gap-1.5 text-white/50 hover:text-white"><LogOut size={13} /> Sign out</button>
            </>
          ) : (
            <>Viewing the demo.<br /><Link to="/portal/login" className="text-brand-red hover:underline">Client sign in</Link> · <Link to="/admin" className="text-brand-red hover:underline">Staff</Link></>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8 [&_.grid>*]:min-w-0">
        <header className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/35">{brand?.name ?? brandId}</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{current.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            {brandId === 'demo' && <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 border border-amber-300/30 rounded-md px-2 py-1">Illustrative data</span>}
            {!p && <Link to="/portal/login" className="md:hidden text-xs text-brand-red">Sign in</Link>}
          </div>
        </header>
        {!noAccess && current.id !== 'data' && <AskBar brandId={brandId} enabled={Boolean(status?.ai)} />}
        {view}
      </main>
    </div>
  );
}
