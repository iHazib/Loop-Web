import { useState, useEffect, useRef, type FormEvent } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, FileText, Inbox, LogOut, ArrowUpRight, Lock, ShieldCheck, AtSign, Mail, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useQueries, refresh, type ContactQuery } from '../lib/store';
import {
  GOOGLE_CLIENT_ID, fetchSession, loginWithGoogle, checkEmail, loginWithEmail, logout, loadGsi, decodeIdToken,
  type SessionUser, type GoogleProfile,
} from '../lib/auth';

/* ─────────────────────────  Login  ───────────────────────── */
function LoginScreen({ onAuthed }: { onAuthed: (u: SessionUser) => void }) {
  const [step, setStep] = useState<'choose' | 'passcode'>('choose');
  const [mode, setMode] = useState<'google' | 'email'>('google');
  const [credential, setCredential] = useState('');
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);

  // Render the Google button on the choose step
  useEffect(() => {
    if (step !== 'choose' || !GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    const onCredential = (resp: { credential: string }) => {
      setMode('google');
      setCredential(resp.credential);
      setProfile(decodeIdToken(resp.credential)); // display only
      setErr('');
      setStep('passcode');
    };
    loadGsi()
      .then(() => {
        if (cancelled || !window.google) return;
        window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onCredential });
        if (btnRef.current) {
          window.google.accounts.id.renderButton(btnRef.current, {
            theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with', width: 300,
          });
        }
      })
      .catch(() => setErr('Could not load Google Sign-In.'));
    return () => { cancelled = true; };
  }, [step]);

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setErr('Enter a valid email address.'); return; }
    setEmailBusy(true);
    setErr('');
    try {
      await checkEmail(email.trim()); // 403 if not on the allowlist
      setMode('email');
      setStep('passcode');
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'This email is not authorised.');
    } finally {
      setEmailBusy(false);
    }
  };

  const submitPasscode = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const user = mode === 'google'
        ? await loginWithGoogle(credential, code)
        : await loginWithEmail(email.trim(), code);
      await refresh(); // re-hydrate posts (incl. drafts) + queries with the new session
      onAuthed(user);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Sign-in failed.');
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setStep('choose'); setMode('google'); setCredential(''); setProfile(null); setCode(''); setErr(''); };

  return (
    <div className="w-full min-h-screen bg-brand-dark flex items-center justify-center px-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(125% 125% at 50% 0%, #171717 0%, #0b0b0b 50%, #050505 100%)' }} />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(230,25,43,0.18) 0%, transparent 60%)', filter: 'blur(60px)' }} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <Logo size={26} />
          <span className="font-display font-bold text-white tracking-tight">Loopretail</span>
          <span className="ml-auto font-mono text-[10px] tracking-widest text-brand-red uppercase">Admin</span>
        </div>

        {step === 'choose' ? (
          <div>
            <div className="w-11 h-11 rounded-full bg-brand-red/15 border border-brand-red/25 flex items-center justify-center mb-5">
              <ShieldCheck size={17} className="text-brand-red" />
            </div>
            <h1 className="font-display font-bold tracking-tight text-white text-2xl mb-1">Admin access</h1>
            <p className="text-white/45 font-light text-sm mb-6">Sign in with an authorised account to continue.</p>

            {GOOGLE_CLIENT_ID && (
              <>
                <div ref={btnRef} className="flex justify-center [color-scheme:light]" />
                <div className="flex items-center gap-3 my-5">
                  <span className="flex-1 h-px bg-white/10" />
                  <span className="font-mono text-[9px] tracking-widest text-white/30 uppercase">or</span>
                  <span className="flex-1 h-px bg-white/10" />
                </div>
              </>
            )}

            <form onSubmit={submitEmail}>
              <div className="relative">
                <AtSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }}
                  placeholder="Admin email"
                  className="w-full bg-white/5 border border-white/12 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-brand-red/50 transition-colors" />
              </div>
              <button type="submit" disabled={emailBusy}
                className="w-full mt-3 border border-white/15 text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/5 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {emailBusy ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />} Continue with email
              </button>
            </form>

            {err && <p className="text-brand-red text-xs mt-4 text-center">{err}</p>}
            <p className="mt-6 text-center font-mono text-[9px] tracking-widest text-white/25 uppercase">Step 1 of 2 · Identity</p>
          </div>
        ) : (
          <div>
            {/* Verified identity */}
            <div className="flex items-center gap-3 mb-6 bg-white/5 border border-white/10 rounded-xl p-3">
              {mode === 'google' && profile?.picture ? (
                <img src={profile.picture} alt="" className="w-9 h-9 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-red/20 flex items-center justify-center text-white text-xs font-bold">
                  {mode === 'google' ? (profile?.name.slice(0, 1) || '?') : <Mail size={15} className="text-brand-red" />}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{mode === 'google' ? (profile?.name || 'Google account') : 'Email authorised'}</p>
                <p className="text-[11px] text-white/40 truncate">{mode === 'google' ? profile?.email : email}</p>
              </div>
              <ShieldCheck size={15} className="text-green-400 ml-auto shrink-0" />
            </div>

            <div className="w-11 h-11 rounded-full bg-brand-red/15 border border-brand-red/25 flex items-center justify-center mb-5">
              <Lock size={17} className="text-brand-red" />
            </div>
            <h1 className="font-display font-bold tracking-tight text-white text-2xl mb-1">Enter passcode</h1>
            <p className="text-white/45 font-light text-sm mb-6">
              {mode === 'google' ? 'The server will verify your account and passcode.' : 'Email authorised. Enter the admin passcode to finish.'}
            </p>

            <form onSubmit={submitPasscode}>
              <input type="password" autoFocus value={code} onChange={(e) => { setCode(e.target.value); setErr(''); }}
                placeholder="Passcode"
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none transition-colors ${err ? 'border-brand-red' : 'border-white/12 focus:border-brand-red/50'}`} />
              {err && <p className="text-brand-red text-xs mt-2">{err}</p>}
              <button type="submit" disabled={busy}
                className="w-full mt-5 bg-brand-red text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#c0001f] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {busy && <Loader2 size={15} className="animate-spin" />} Enter dashboard
              </button>
            </form>
            <button onClick={reset}
              className="block mt-5 mx-auto font-mono text-[10px] tracking-widest text-white/30 hover:text-white/60 uppercase transition-colors">
              ← Use a different method
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────  Layout  ───────────────────────── */
const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/posts', label: 'Posts', icon: FileText, end: false },
  { to: '/admin/inbox', label: 'Inbox', icon: Inbox, end: false },
];

export default function AdminLayout() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const queries = useQueries();
  const unread = queries.filter((q: ContactQuery) => q.status === 'new').length;

  useEffect(() => {
    fetchSession().then((u) => {
      setUser(u);
      setChecking(false);
      if (u) void refresh();
    });
  }, []);

  if (checking) {
    return (
      <div className="w-full min-h-screen bg-brand-dark flex items-center justify-center">
        <Loader2 size={22} className="text-brand-red animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginScreen onAuthed={(u) => setUser(u)} />;

  return (
    <div className="w-full min-h-screen bg-[#f4f4f4] font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-brand-dark min-h-screen sticky top-0 h-screen flex flex-col px-5 py-7">
        <Link to="/admin" className="flex items-center gap-2.5 mb-10 px-2">
          <Logo size={26} />
          <span className="font-display font-bold text-white tracking-tight">Loopretail</span>
          <span className="ml-auto font-mono text-[9px] tracking-widest text-brand-red uppercase">CMS</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-red text-white' : 'text-white/55 hover:text-white hover:bg-white/5'
                }`
              }>
              <item.icon size={16} />
              <span>{item.label}</span>
              {item.label === 'Inbox' && unread > 0 && (
                <span className="ml-auto text-[10px] font-mono bg-white text-brand-red rounded-full px-2 py-0.5">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/8">
          <div className="flex items-center gap-2.5 px-2 mb-3">
            {user.picture
              ? <img src={user.picture} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              : <div className="w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center text-white text-[11px] font-bold">{user.name.slice(0, 1)}</div>}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name || 'Admin'}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white hover:bg-white/5 transition-colors">
            <ArrowUpRight size={16} /> View site
          </a>
          <button onClick={async () => { await logout(); setUser(null); navigate('/admin'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white hover:bg-white/5 transition-colors text-left">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
