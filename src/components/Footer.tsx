import { motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { FaLinkedinIn, FaXTwitter, FaInstagram } from 'react-icons/fa6';

const nav = [
  {
    heading: 'What We Do',
    links: ['Marketplace Control', 'Brand Protection', 'Retail Expansion', 'DTC'],
  },
  {
    heading: 'Company',
    links: ['About Us', 'Careers'],
  },
  {
    heading: 'Resources',
    links: ['Blog', 'The Loop', 'Contact'],
  },
  {
    heading: 'Legal',
    links: ['Privacy Policy', 'Cookie Policy', 'Terms'],
  },
];

const socials = [
  { icon: FaLinkedinIn, label: 'LinkedIn' },
  { icon: FaXTwitter,   label: 'Twitter'  },
  { icon: FaInstagram,  label: 'Instagram' },
];

export function Footer() {
  return (
    <footer className="w-full bg-brand-dark relative overflow-hidden">

      {/* Main grid */}
      <div className="max-w-[1200px] mx-auto px-6 pt-20 pb-16 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-16 border-b border-white/8">

        {/* Left — brand block */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <Logo size={26} />
            <span className="font-display font-bold text-lg tracking-tight text-white">Loopretail</span>
          </div>

          <p className="text-gray-400 text-sm font-light leading-relaxed max-w-[220px]">
            Operating partner for ambitious brands.
          </p>

          <div>
            <p className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-3">Get in Touch</p>
            <a
              href="mailto:hello@loopretail.io"
              className="text-white text-sm font-medium hover:text-brand-red transition-colors"
            >
              hello@loopretail.io
            </a>
          </div>

          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-brand-red/50 hover:bg-brand-red/10 transition-all duration-200"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Right — nav columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
          {nav.map((col) => (
            <div key={col.heading}>
              <p className="text-[9px] font-mono tracking-widest text-brand-red uppercase mb-5">{col.heading}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    {link === 'Marketplace Control' ? (
                      <Link
                        to="/marketplace-control"
                        className="text-sm text-gray-400 hover:text-white transition-colors font-light"
                      >
                        {link}
                      </Link>
                    ) : (
                      <a
                        href="#"
                        className="text-sm text-gray-400 hover:text-white transition-colors font-light"
                      >
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Giant wordmark */}
      <div className="relative select-none pointer-events-none overflow-hidden py-4">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-display font-bold text-[clamp(5rem,18vw,16rem)] tracking-tighter leading-none text-center"
          style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.06)' }}
        >
          Loopretail
        </motion.p>
        {/* Red glow behind wordmark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60%] h-24 bg-brand-red/10 blur-[80px] rounded-full" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/8">
        <p className="text-[11px] font-mono text-gray-600">
          ©2026 Loopretail™ — All rights reserved
        </p>
        <p className="text-[11px] font-mono text-gray-600">
          London &amp; Berlin · Working globally
        </p>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/40 hover:text-brand-red transition-colors group uppercase"
        >
          Back to top
          <span className="w-6 h-6 rounded-full border border-white/15 flex items-center justify-center group-hover:border-brand-red/50 group-hover:bg-brand-red/10 transition-all">
            <ArrowUp size={10} />
          </span>
        </button>

        <p className="text-[11px] font-mono text-gray-600 hidden sm:block">
          Operating partner for brands
        </p>
      </div>

    </footer>
  );
}
