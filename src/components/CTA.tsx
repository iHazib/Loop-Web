import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type Tone = 'red' | 'dark' | 'light' | 'outline-light' | 'outline-dark';

/* Button: 10px corners, sentence case, label plus a round arrow badge. */
const tones: Record<Tone, string> = {
  red: 'bg-brand-red text-white hover:bg-brand-red-hover',
  dark: 'bg-ink text-white hover:bg-black',
  light: 'bg-white text-ink hover:bg-white/90',
  'outline-light': 'border border-white/30 text-white hover:bg-white/10',
  'outline-dark': 'bg-surface border border-control/60 text-ink hover:border-ink',
};
const badge: Record<Tone, string> = {
  red: 'bg-white text-brand-red',
  dark: 'bg-brand-red text-white',
  light: 'bg-brand-red text-white',
  'outline-light': 'bg-white text-ink',
  'outline-dark': 'bg-ink text-white',
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
      className={`group inline-flex items-center gap-3 pl-[18px] pr-[7px] py-[7px] rounded-[10px] text-[15px] font-medium whitespace-nowrap transition-colors duration-300 ${tones[tone]} ${className}`}
    >
      {label}
      <span aria-hidden="true" className={`w-7 h-7 rounded-full grid place-items-center shrink-0 ${badge[tone]}`}>
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
      {note && <p className={`text-sm ${dark ? 'text-white/70' : 'text-muted'}`}>{note}</p>}
      <CTA {...rest} />
    </div>
  );
}
