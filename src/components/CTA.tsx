import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type Tone = 'red' | 'dark' | 'light' | 'outline-light' | 'outline-dark';

/* Button: 12px corners, sentence case, label plus a round arrow badge. */
const tones: Record<Tone, string> = {
  red: 'bg-brand-red text-white hover:bg-[#c91424]',
  dark: 'bg-brand-dark text-white hover:bg-black',
  light: 'bg-white text-brand-dark hover:bg-white/90',
  'outline-light': 'bg-white/[0.06] border border-white/20 text-white hover:bg-white/[0.14] backdrop-blur-sm',
  'outline-dark': 'bg-white border border-brand-dark/12 text-brand-dark hover:border-brand-dark/30',
};
const badge: Record<Tone, string> = {
  red: 'bg-white text-brand-red',
  dark: 'bg-brand-red text-white',
  light: 'bg-brand-red text-white',
  'outline-light': 'bg-white text-brand-dark',
  'outline-dark': 'bg-brand-dark text-white',
};

/** Contact link with the enquiry topic pre-selected (read by the contact form). */
export const contactHref = (topic: string) => `/contact?topic=${encodeURIComponent(topic)}`;

export function CTA({
  to,
  label,
  tone = 'red',
  id,
  className = '',
}: {
  to: string;
  label: string;
  tone?: Tone;
  /** Analytics id, e.g. "home-hero". */
  id?: string;
  className?: string;
}) {
  const track = () => {
    try {
      const w = window as unknown as { gtag?: (...a: unknown[]) => void; va?: (...a: unknown[]) => void };
      w.gtag?.('event', 'cta_click', { cta_id: id ?? label, cta_to: to });
      w.va?.('event', { name: 'cta_click', data: { id: id ?? label } });
    } catch { /* analytics optional */ }
  };
  return (
    <Link
      to={to}
      onClick={track}
      data-cta={id}
      className={`group inline-flex items-center gap-3 pl-5 pr-2 py-2 rounded-xl text-[15px] font-medium transition-colors duration-300 ${tones[tone]} ${className}`}
    >
      {label}
      <span className={`w-7 h-7 rounded-full grid place-items-center shrink-0 ${badge[tone]}`}>
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  );
}

/** A centred row that sits at the bottom of a section. */
export function SectionCTA(props: Parameters<typeof CTA>[0] & { note?: string; dark?: boolean }) {
  const { note, dark, ...rest } = props;
  return (
    <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
      {note && <p className={`text-sm font-light ${dark ? 'text-white/50' : 'text-brand-dark/50'}`}>{note}</p>}
      <CTA {...rest} />
    </div>
  );
}
