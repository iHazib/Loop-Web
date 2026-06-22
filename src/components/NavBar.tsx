import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

/* ─── Sub-services under "Services" ─── */
const services = [
  {
    label: 'Marketplace Control',
    desc: 'Own your listings, pricing and sellers.',
    href: '/marketplace-control',
    tag: 'Live',
  },
  {
    label: 'Brand Protection',
    desc: 'Stop counterfeits before they damage trust.',
    href: '/brand-protection',
    tag: null,
  },
  {
    label: 'Retail Expansion',
    desc: 'Scale into new channels without losing control.',
    href: '/retail-expansion',
    tag: null,
  },
  {
    label: 'DTC Growth',
    desc: 'Own the customer relationship end-to-end.',
    href: '/dtc-growth',
    tag: null,
  },
];

const navLinks = ['Services', 'About', 'Blog', 'Contact'];
const navRoutes: Record<string, string> = {
  About: '/about',
  Blog: '/blog',
  Contact: '/contact',
};

export function NavBar({ darkHero = false }: { darkHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  const isLight = scrolled || !darkHero;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <Logo size={28} />
          <span className={`font-display font-bold text-base tracking-tight transition-colors duration-500 ${isLight ? 'text-brand-dark' : 'text-white'}`}>
            Loopretail
          </span>
        </Link>

        {/* Center pill nav */}
        <div className={`hidden md:flex items-center rounded-full px-2 py-1.5 gap-1 border transition-all duration-500 ${
          isLight ? 'bg-black/5 border-black/8' : 'bg-white shadow-lg border-transparent'
        }`}>
          {navLinks.map((link) => {
            const isServices = link === 'Services';

            if (isServices) {
              return (
                <div
                  key={link}
                  ref={servicesRef}
                  className="relative"
                  onMouseEnter={() => { setActiveLink(link); setServicesOpen(true); }}
                  onMouseLeave={() => { setActiveLink(null); setServicesOpen(false); }}
                >
                  <button
                    className="relative flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150"
                  >
                    <AnimatePresence>
                      {activeLink === link && (
                        <motion.span
                          layoutId="navPillShared"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          className="absolute inset-0 bg-brand-red rounded-full"
                          style={{ zIndex: 0 }}
                        />
                      )}
                    </AnimatePresence>
                    <span className={`relative transition-colors duration-150 ${activeLink === link ? 'text-white' : isLight ? 'text-brand-dark/70' : 'text-brand-dark/75'}`}
                      style={{ zIndex: 1 }}>
                      {link}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`relative transition-all duration-200 ${activeLink === link ? 'text-white rotate-180' : isLight ? 'text-brand-dark/40' : 'text-brand-dark/40'}`}
                      style={{ zIndex: 1 }}
                    />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-[340px] bg-white rounded-2xl border border-black/8 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)] overflow-hidden"
                      >
                        {/* Header strip */}
                        <div className="px-4 pt-4 pb-2 border-b border-black/5">
                          <p className="text-[9px] font-mono tracking-widest text-brand-red uppercase">Our Services</p>
                        </div>

                        {/* Service rows */}
                        <div className="p-2">
                          {services.map((s) => (
                            <Link
                              key={s.label}
                              to={s.href}
                              onClick={() => setServicesOpen(false)}
                              className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-surface-offwhite group transition-colors"
                            >
                              {/* Red dot */}
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-red/30 group-hover:bg-brand-red shrink-0 mt-[5px] transition-colors" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-display font-semibold text-sm text-brand-dark group-hover:text-brand-red transition-colors">
                                    {s.label}
                                  </span>
                                  {s.tag && (
                                    <span className="text-[8px] font-mono tracking-widest bg-brand-red/10 text-brand-red px-1.5 py-0.5 rounded-full">
                                      {s.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-brand-dark/45 font-light mt-0.5">{s.desc}</p>
                              </div>
                              <ArrowRight size={12} className="text-brand-dark/20 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                            </Link>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-black/5 bg-surface-offwhite/60">
                          <p className="text-[9px] font-mono text-brand-dark/35 tracking-wide">
                            One operating model · Every channel
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={link}
                to={navRoutes[link] ?? '/'}
                onMouseEnter={() => setActiveLink(link)}
                onMouseLeave={() => setActiveLink(null)}
                className="relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150"
              >
                <AnimatePresence>
                  {activeLink === link && (
                    <motion.span
                      layoutId="navPillShared"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="absolute inset-0 bg-brand-red rounded-full"
                      style={{ zIndex: 0 }}
                    />
                  )}
                </AnimatePresence>
                <span
                  className={`relative transition-colors duration-150 ${activeLink === link ? 'text-white' : isLight ? 'text-brand-dark/70' : 'text-brand-dark/75'}`}
                  style={{ zIndex: 1 }}
                >
                  {link}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <a
            href="/"
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-300 group ${
              isLight
                ? 'bg-brand-dark text-white hover:bg-brand-red'
                : 'bg-white text-brand-dark hover:bg-brand-red hover:text-white shadow-md'
            }`}
          >
            Get Started
            <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${
            isLight ? 'bg-black/5 border-black/8 text-brand-dark' : 'bg-white border-white/0 text-brand-dark'
          }`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-black/5 overflow-hidden"
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {/* Services expanded in mobile */}
              <p className="text-[9px] font-mono tracking-widest text-brand-red uppercase px-2 pt-2 pb-1">Services</p>
              {services.map((s) => (
                <Link
                  key={s.label}
                  to={s.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-offwhite transition-colors group"
                >
                  <div className="w-1 h-1 rounded-full bg-brand-red/40 group-hover:bg-brand-red transition-colors shrink-0" />
                  <span className="text-sm font-medium text-brand-dark/75 group-hover:text-brand-red transition-colors">{s.label}</span>
                  {s.tag && (
                    <span className="text-[8px] font-mono bg-brand-red/10 text-brand-red px-1.5 py-0.5 rounded-full">{s.tag}</span>
                  )}
                </Link>
              ))}

              <div className="h-px bg-black/6 my-2" />

              {['About', 'Blog', 'Contact'].map((link) => (
                <Link key={link} to={navRoutes[link] ?? '/'} onClick={() => setMenuOpen(false)}
                  className="text-brand-dark/60 text-sm font-medium hover:text-brand-red transition-colors px-2 py-2.5">
                  {link}
                </Link>
              ))}

              <a href="/" className="mt-3 flex items-center justify-center gap-1.5 bg-brand-dark text-white text-sm font-semibold px-4 py-3 rounded-full hover:bg-brand-red transition-colors">
                Get Started <ArrowUpRight size={13} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
