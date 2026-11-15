import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { CTA, contactHref } from './CTA';

/* Light top bar on every public page. Solid surface, never transparent over content. */

export const SERVICES = [
  { label: 'Marketplace Control', desc: 'Amazon, TikTok Shop, eBay and Temu run day to day.', href: '/marketplace-control' },
  { label: 'Brand Protection', desc: 'Unauthorised sellers and grey stock taken off your listings.', href: '/brand-protection' },
  { label: 'DTC Growth', desc: 'A UK direct store with local stock and returns.', href: '/dtc-growth' },
  { label: 'Retail Expansion', desc: 'Get buyer ready for UK chains and independents.', href: '/retail-expansion' },
  { label: 'UK Market Entry', desc: 'For overseas brands launching in the UK.', href: '/uk-market-entry' },
];

const LINKS = [
  { label: 'Tools', to: '/tools' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
];

export function NavBar(_props: { darkHero?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [svc, setSvc] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); setSvc(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setSvc(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const inServices = SERVICES.some((s) => pathname.startsWith(s.href)) || pathname === '/services';
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-[14px] font-medium transition-colors ${isActive ? 'text-ink' : 'text-muted hover:text-ink'}`;

  return (
    <header className={`sticky top-0 z-50 bg-surface/95 backdrop-blur border-b transition-colors ${scrolled ? 'border-line' : 'border-transparent'}`}>
      <div className="max-w-[1248px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Loopretail home">
          <Logo size={26} />
          <span className="font-semibold text-[17px] tracking-[-0.02em] text-ink">Loopretail</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setSvc((v) => !v)}
              aria-expanded={svc}
              className={`inline-flex items-center gap-1 text-[14px] font-medium ${inServices ? 'text-ink' : 'text-muted hover:text-ink'}`}
            >
              Services <ChevronDown size={15} className={`transition-transform ${svc ? 'rotate-180' : ''}`} />
            </button>
            {svc && (
              <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+14px)] w-[560px] bg-surface border border-line rounded-2xl shadow-[0_18px_50px_-20px_rgba(18,22,20,0.35)] p-2 grid grid-cols-2 gap-1">
                {SERVICES.map((s) => (
                  <Link key={s.href} to={s.href} className="rounded-xl p-3 hover:bg-canvas">
                    <span className="block text-[14px] font-semibold text-ink">{s.label}</span>
                    <span className="block text-[13px] text-muted mt-0.5 leading-snug">{s.desc}</span>
                  </Link>
                ))}
                <Link to="/services" className="rounded-xl p-3 bg-canvas hover:bg-sunken">
                  <span className="block text-[14px] font-semibold text-ink">All services</span>
                  <span className="block text-[13px] text-muted mt-0.5 leading-snug">Compare what we run and how we charge.</span>
                </Link>
              </div>
            )}
          </div>
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} className={linkCls}>{l.label}</NavLink>)}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link to="/portal/login" className="text-[14px] font-medium text-ink hover:text-red-text">Client login</Link>
          <CTA to={contactHref('strategy-call')} label="Book a call" id="nav-book" />
        </div>

        <button type="button" className="lg:hidden w-10 h-10 grid place-items-center rounded-lg text-ink" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-line bg-surface max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-4 py-4 grid gap-1">
            <p className="text-[13px] font-medium text-muted px-2 pt-1 pb-2">Services</p>
            {SERVICES.map((s) => (
              <Link key={s.href} to={s.href} className="rounded-xl px-2 py-2.5 hover:bg-canvas">
                <span className="block text-[15px] font-semibold">{s.label}</span>
                <span className="block text-[13px] text-muted">{s.desc}</span>
              </Link>
            ))}
            <div className="h-px bg-line my-2" />
            {[{ label: 'All services', to: '/services' }, ...LINKS, { label: 'Contact', to: '/contact' }, { label: 'Client login', to: '/portal/login' }].map((l) => (
              <Link key={l.to} to={l.to} className="rounded-xl px-2 py-2.5 text-[15px] font-medium hover:bg-canvas">{l.label}</Link>
            ))}
            <div className="pt-3"><CTA to={contactHref('strategy-call')} label="Book a strategy call" id="nav-mobile-book" /></div>
          </div>
        </div>
      )}
    </header>
  );
}
