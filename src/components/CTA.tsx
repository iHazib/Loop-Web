import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type Tone = 'red' | 'dark' | 'light' | 'outline-light' | 'outline-dark';

const tones: Record<Tone, string> = {
  red: 'bg-brand-red text-white hover:bg-brand-dark',
  dark: 'bg-brand-dark text-white hover:bg-brand-red',
  light: 'bg-white text-brand-dark hover:bg-brand-red hover:text-white',
  'outline-light': 'border border-white/25 text-white hover:bg-white hover:text-brand-dark',
  'outline-dark': 'border border-brand-dark/15 text-brand-dark hover:border-brand-red hover:text-brand-red',
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
      className={`group inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${tones[tone]} ${className}`}
    >
      {label}
      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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
