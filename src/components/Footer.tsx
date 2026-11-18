import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const COLS: { heading: string; links: [string, string][] }[] = [
  { heading: 'Services', links: [['All services', '/services'], ['Marketplace Control', '/marketplace-control'], ['Brand Protection', '/brand-protection'], ['DTC Growth', '/dtc-growth'], ['Retail Expansion', '/retail-expansion'], ['UK Market Entry', '/uk-market-entry']] },
  { heading: 'Tools', links: [['All tools', '/tools'], ['Brand Dashboard', '/tools/brand-dashboard'], ['Loop Protect', '/tools/loop-protect'], ['Competitor Analysis', '/tools/competitor-analysis'], ['Client login', '/portal/login']] },
  { heading: 'Company', links: [['About', '/about'], ['How it works', '/how-it-works'], ['Case studies', '/case-studies'], ['Blog', '/blog'], ['Contact', '/contact']] },
];

export function Footer() {
  return (
    <footer className="bg-surface border-t border-line mt-3">
      <div className="max-w-[1248px] mx-auto px-4 md:px-6 py-14 grid gap-10 md:grid-cols-[1.3fr_2fr]">
        <div className="flex flex-col gap-5 max-w-sm">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-semibold text-[17px] tracking-[-0.02em]">Loopretail</span>
          </Link>
          <p className="text-[15px] text-muted leading-relaxed">
            We run UK marketplaces, direct stores, fulfilment and brand protection for brands that want growth without losing control of price or sellers.
          </p>
          <div>
            <p className="text-[13px] text-muted">Talk to us</p>
            <a href="mailto:hello@loopretail.io" className="text-[15px] font-medium text-ink hover:text-red-text">hello@loopretail.io</a>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {COLS.map((c) => (
            <div key={c.heading}>
              <p className="text-[13px] font-semibold text-ink mb-3">{c.heading}</p>
              <ul className="grid gap-2">
                {c.links.map(([label, to]) => (
                  <li key={to + label}><Link to={to} className="text-[14px] text-muted hover:text-ink">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="max-w-[1248px] mx-auto px-4 md:px-6 py-5 flex flex-wrap gap-x-6 gap-y-2 justify-between text-[13px] text-muted">
          <span>© {new Date().getFullYear()} Loopretail. United Kingdom.</span>
          <span>Market data from Keepa. Client numbers shown on this site are illustrative unless stated.</span>
        </div>
      </div>
    </footer>
  );
}
