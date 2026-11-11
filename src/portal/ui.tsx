import { useEffect, useRef, useState, type ReactNode } from 'react';

/* ── Formatting ── */
export const gbp = (n: number | null | undefined, dp = 0) =>
  n == null ? '–' : `£${n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
export const gbpShort = (n: number | null | undefined) => {
  if (n == null) return '–';
  if (Math.abs(n) >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 10_000) return `£${(n / 1000).toFixed(1)}k`;
  return gbp(n);
};
export const int = (n: number | null | undefined) => (n == null ? '–' : Math.round(n).toLocaleString('en-GB'));
export const pct = (n: number | null | undefined, dp = 1) => (n == null ? '–' : `${n.toFixed(dp)}%`);
export const fmt = (v: number | null | undefined, f: string) => (f === 'gbp' ? gbpShort(v) : f === 'pct' ? pct(v) : int(v));
export const shortDate = (d: string) => new Date(d + (d.length === 10 ? 'T00:00:00Z' : '')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
export const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
};

export const PALETTE = ['#E6192B', '#60A5FA', '#F59E0B', '#34D399', '#A78BFA', '#F472B6', '#94A3B8'];

/* ── Layout pieces ── */
export function Card({ title, right, children, className = '' }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 ${className}`}>
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 mb-4">
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
          {right && <div className="text-[11px] font-mono text-white/40">{right}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Change({ value, unit = '%', lowerIsBetter = false }: { value: number | null | undefined; unit?: string; lowerIsBetter?: boolean }) {
  if (value == null) return <span className="text-[11px] font-mono text-white/30">no prior data</span>;
  const good = lowerIsBetter ? value <= 0 : value >= 0;
  return (
    <span className={`text-[11px] font-mono ${good ? 'text-emerald-400' : 'text-rose-400'}`}>
      {value > 0 ? '+' : ''}{value}{unit}
    </span>
  );
}

export function Kpi({ label, value, change, unit, lowerIsBetter, sub }: { label: string; value: string; change?: number | null; unit?: string; lowerIsBetter?: boolean; sub?: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="text-[11px] uppercase tracking-wider text-white/40 mb-3">{label}</div>
      <div className={`${value.length > 9 ? 'text-xl' : 'text-2xl'} font-semibold text-white tracking-tight break-words`}>{value}</div>
      <div className="mt-2 min-h-4">{change !== undefined ? <Change value={change} unit={unit} lowerIsBetter={lowerIsBetter} /> : <span className="text-[11px] text-white/35">{sub}</span>}</div>
    </div>
  );
}

const BADGE: Record<string, string> = {
  high: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  low: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  flagged: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  reviewing: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  clear: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  resolved: 'bg-white/5 text-white/50 border-white/10',
  ok: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  warn: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  info: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
};
export function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider ${BADGE[tone] ?? BADGE.info}`}>{children}</span>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
      <p className="text-white font-medium">{title}</p>
      {children && <div className="text-sm text-white/45 mt-2">{children}</div>}
    </div>
  );
}

export function Table({ head, rows, empty = 'No rows yet.' }: { head: ReactNode[]; rows: ReactNode[][]; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-white/40">{empty}</p>;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-white/35">
            {head.map((h, i) => <th key={i} className={`px-2 pb-2 font-medium whitespace-nowrap ${i ? 'text-right' : ''}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-white/[0.06] text-white/80">
              {r.map((c, j) => <td key={j} className={`px-2 py-2.5 whitespace-nowrap ${j ? 'text-right tabular-nums' : ''}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
      {items.map((s) => (
        <span key={s.name} className="inline-flex items-center gap-1.5 text-[11px] text-white/55">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />{s.name}
        </span>
      ))}
    </div>
  );
}

/* ── Charts (hand-rolled SVG, sized to their container) ── */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.floor(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p / 2) * 2 * p;
}

export function LineChart({ labels, series, height = 220, format = (v: number) => int(v), invert = false, labelEvery }: {
  labels: string[];
  series: { name: string; values: (number | null)[]; color?: string }[];
  height?: number;
  format?: (v: number) => string;
  invert?: boolean; // e.g. BSR: lower is better, draw it higher
  labelEvery?: number;
}) {
  const { ref, w } = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 52, r: 12, t: 10, b: 24 };
  const all = series.flatMap((s) => s.values).filter((v): v is number => v != null);
  if (!all.length) return <div ref={ref} className="w-full min-w-0"><Empty title="No data for this chart yet" /></div>;
  let lo = Math.min(...all), hi = Math.max(...all);
  if (!invert) lo = Math.min(0, lo);
  if (hi === lo) hi = lo + 1;
  if (!invert) hi = niceMax(hi);
  const iw = w - pad.l - pad.r, ih = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length <= 1 ? 0 : (i / (labels.length - 1)) * iw);
  const y = (v: number) => pad.t + (invert ? (v - lo) / (hi - lo) : 1 - (v - lo) / (hi - lo)) * ih;
  const ticks = [0, 0.5, 1].map((t) => lo + t * (hi - lo));
  const every = labelEvery ?? Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor(iw / 70))));
  const path = (vals: (number | null)[]) => {
    let d = '', pen = false;
    vals.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
      pen = true;
    });
    return d;
  };
  return (
    <div ref={ref} className="relative w-full min-w-0 overflow-hidden">
      <svg className="block" width={w} height={height} onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const i = Math.round(((e.clientX - r.left - pad.l) / iw) * (labels.length - 1));
          setHover(i >= 0 && i < labels.length ? i : null);
        }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.35)">{format(t)}</text>
          </g>
        ))}
        {labels.map((l, i) => i % every === 0 && (
          <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.35)">{l}</text>
        ))}
        {series.map((s, si) => (
          <path key={s.name} d={path(s.values)} fill="none" stroke={s.color ?? PALETTE[si % PALETTE.length]} strokeWidth={si === 0 ? 2.2 : 1.5} strokeOpacity={si === 0 ? 1 : 0.8} />
        ))}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="rgba(255,255,255,0.2)" />}
      </svg>
      {hover != null && (
        <div className="absolute top-2 pointer-events-none rounded-lg border border-white/10 bg-[#141414] px-3 py-2 text-[11px] shadow-xl"
          style={{ left: Math.min(x(hover) + 10, w - 170) }}>
          <div className="text-white/50 mb-1">{labels[hover]}</div>
          {series.map((s, si) => (
            <div key={s.name} className="flex justify-between gap-4">
              <span style={{ color: s.color ?? PALETTE[si % PALETTE.length] }}>{s.name}</span>
              <span className="text-white tabular-nums">{s.values[hover] == null ? '–' : format(s.values[hover]!)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StackedBars({ labels, series, height = 220, format = (v: number) => gbpShort(v) }: {
  labels: string[];
  series: { name: string; values: number[] }[];
  height?: number;
  format?: (v: number) => string;
}) {
  const { ref, w } = useWidth();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 52, r: 8, t: 10, b: 24 };
  const totals = labels.map((_, i) => series.reduce((a, s) => a + (s.values[i] ?? 0), 0));
  const hi = niceMax(Math.max(0, ...totals));
  const iw = w - pad.l - pad.r, ih = height - pad.t - pad.b;
  const bw = (iw / Math.max(1, labels.length)) * 0.68;
  const x = (i: number) => pad.l + (i + 0.5) * (iw / labels.length);
  const h = (v: number) => (v / hi) * ih;
  const every = Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor(iw / 56))));
  if (!labels.length) return <div ref={ref} className="w-full min-w-0"><Empty title="No data for this chart yet" /></div>;
  return (
    <div ref={ref} className="relative w-full min-w-0 overflow-hidden">
      <svg className="block" width={w} height={height} onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={pad.t + ih - t * ih} y2={pad.t + ih - t * ih} stroke="rgba(255,255,255,0.06)" />
            <text x={pad.l - 8} y={pad.t + ih - t * ih + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.35)">{format(t * hi)}</text>
          </g>
        ))}
        {labels.map((l, i) => {
          let acc = 0;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <rect x={x(i) - (iw / labels.length) / 2} y={pad.t} width={iw / labels.length} height={ih} fill="transparent" />
              {series.map((s, si) => {
                const v = s.values[i] ?? 0;
                const y0 = pad.t + ih - h(acc + v);
                acc += v;
                return <rect key={s.name} x={x(i) - bw / 2} y={y0} width={bw} height={Math.max(0, h(v) - 1)} fill={PALETTE[si % PALETTE.length]} opacity={hover == null || hover === i ? 0.9 : 0.45} rx={1.5} />;
              })}
              {i % every === 0 && <text x={x(i)} y={height - 6} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.35)">{l}</text>}
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div className="absolute top-2 pointer-events-none rounded-lg border border-white/10 bg-[#141414] px-3 py-2 text-[11px] shadow-xl" style={{ left: Math.min(x(hover) + 14, w - 180) }}>
          <div className="text-white/50 mb-1">{labels[hover]} · {format(totals[hover])}</div>
          {series.map((s, si) => (
            <div key={s.name} className="flex justify-between gap-4">
              <span style={{ color: PALETTE[si % PALETTE.length] }}>{s.name}</span>
              <span className="text-white tabular-nums">{format(s.values[hover] ?? 0)}</span>
            </div>
          ))}
        </div>
      )}
      <Legend items={series.map((s, si) => ({ name: s.name, color: PALETTE[si % PALETTE.length] }))} />
    </div>
  );
}
