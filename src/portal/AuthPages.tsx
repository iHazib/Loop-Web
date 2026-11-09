import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { portalFetch } from './api';

function Shell({ title, sub, children }: { title: string; sub?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center font-display text-xl font-bold tracking-tight mb-10">Loop<span className="text-brand-red">retail</span></Link>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <h1 className="text-xl font-semibold">{title}</h1>
          {sub && <p className="text-sm text-white/50 mt-1.5">{sub}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

const input = 'w-full rounded-lg bg-white/[0.05] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-brand-red/60 outline-none';
const button = 'w-full rounded-lg bg-brand-red py-2.5 text-sm font-semibold text-white hover:bg-[#c0001f] disabled:opacity-50';

export function PortalLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const r = await portalFetch<{ brands: string[] }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      nav(`/portal/${r.brands[0]}/overview`);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <Shell title="Brand dashboard" sub="Sign in to see your brand's sales, protection and competitor data.">
      <form onSubmit={submit} className="grid gap-3">
        <input className={input} type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {err && <p className="text-xs text-rose-400">{err}</p>}
        <button className={button} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="text-xs text-white/40 mt-6 leading-relaxed">
        Forgot your password? Ask your Loopretail account manager to send a new invite link.<br />
        Loopretail team: <Link to="/admin" className="text-brand-red hover:underline">staff sign in</Link> · <Link to="/portal/demo/overview" className="text-brand-red hover:underline">view the demo</Link>
      </p>
    </Shell>
  );
}

export function PortalInvite() {
  const { token = '' } = useParams();
  const nav = useNavigate();
  const [info, setInfo] = useState<{ email: string; brandName: string; role: string; hasPassword: boolean } | null>(null);
  const [loadErr, setLoadErr] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    portalFetch<typeof info>(`/auth/invite/${encodeURIComponent(token)}`).then(setInfo).catch((e: Error) => setLoadErr(e.message));
  }, [token]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setErr('The two passwords do not match.'); return; }
    setBusy(true); setErr('');
    try {
      const r = await portalFetch<{ brandId: string }>(`/auth/invite/${encodeURIComponent(token)}`, { method: 'POST', body: JSON.stringify({ name, password }) });
      nav(`/portal/${r.brandId}/overview`);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  if (loadErr) return <Shell title="Invite not valid" sub={loadErr}><Link to="/portal/login" className="text-sm text-brand-red hover:underline">Go to sign in</Link></Shell>;
  if (!info) return <Shell title="Checking your invite…"><div className="h-10" /></Shell>;
  return (
    <Shell title={`Join ${info.brandName}`} sub={<>You've been invited as a <b className="text-white/80">{info.role}</b>. {info.hasPassword ? 'Set a new password for' : 'Create your password for'} <b className="text-white/80">{info.email}</b>.</>}>
      <form onSubmit={submit} className="grid gap-3">
        <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={input} type="password" autoComplete="new-password" placeholder="Password (10+ characters, with a number)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input className={input} type="password" autoComplete="new-password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        {err && <p className="text-xs text-rose-400">{err}</p>}
        <button className={button} disabled={busy}>{busy ? 'Saving…' : 'Open my dashboard'}</button>
      </form>
    </Shell>
  );
}
