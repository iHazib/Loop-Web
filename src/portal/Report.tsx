import { Link, useParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import type * as M from '../../server/portal/metrics';
import type { Brand } from '../../server/portal/types';
import { CASE_LABELS } from '../../server/portal/types';
import { useView } from './api';
import { gbp, int, pct, fmt, shortDate } from './ui';

/* Weekly brand report: one printable page per brand. "Save as PDF" from the print dialog. */

type Base = { brand: Brand; demo: boolean };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[11px] font-mono uppercase tracking-widest text-[#e6192b] mt-8 mb-3 break-after-avoid">{children}</h2>;
}
function T({ head, rows, empty = 'Nothing to report.' }: { head: string[]; rows: (string | number)[][]; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-neutral-500">{empty}</p>;
  return (
    <table className="w-full text-[12px] border-collapse break-inside-avoid">
      <thead><tr>{head.map((h, i) => <th key={h} className={`border-b border-neutral-300 py-1.5 font-semibold text-neutral-600 ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={`border-b border-neutral-100 py-1.5 ${j ? 'text-right tabular-nums' : ''}`}>{c}</td>)}</tr>)}</tbody>
    </table>
  );
}
const chg = (v: number | null | undefined, unit = '%') => (v == null ? '' : ` (${v > 0 ? '+' : ''}${v}${unit})`);

export default function Report() {
  const { brandId = 'demo' } = useParams();
  const ov = useView<Base & ReturnType<typeof M.overview>>(`/brands/${brandId}/overview?weeks=4`);
  const ch = useView<Base & ReturnType<typeof M.channels>>(`/brands/${brandId}/channels?weeks=4`);
  const pr = useView<Base & ReturnType<typeof M.protection>>(`/brands/${brandId}/protection`);
  const an = useView<Base & ReturnType<typeof M.analysis>>(`/brands/${brandId}/analysis`);
  const ad = useView<Base & ReturnType<typeof M.ads>>(`/brands/${brandId}/ads?weeks=4`);
  const dc = useView<Base & ReturnType<typeof M.d2c>>(`/brands/${brandId}/d2c?weeks=4`);
  const err = ov.error || ch.error || pr.error;
  const ready = ov.data && ch.data && pr.data && an.data && ad.data && dc.data;

  if (err) return <div className="p-10 text-sm">Could not load the report: {err} <Link to="/portal/login" className="text-[#e6192b] underline">Sign in</Link></div>;
  if (!ready) return <div className="p-10 text-sm text-neutral-500">Preparing report…</div>;

  const o = ov.data!, c = ch.data!, p = pr.data!, a = an.data!, d = ad.data!, s = dc.data!;
  const open = p.cases.filter((x) => x.status === 'flagged' || x.status === 'reviewing');
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white text-neutral-900 font-sans">
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between">
        <Link to={`/portal/${brandId}/overview`} className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black"><ArrowLeft size={15} /> Back to dashboard</Link>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-[#e6192b] px-4 py-2 text-sm font-semibold text-white"><Printer size={15} /> Save as PDF</button>
      </div>

      <article className="mx-auto my-8 print:my-0 max-w-[820px] bg-white shadow-sm print:shadow-none px-10 py-10 print:px-0 print:py-0">
        <header className="flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">Weekly brand report</p>
            <h1 className="text-2xl font-bold mt-1">{o.brand.name}</h1>
            <p className="text-sm text-neutral-600 mt-1">
              {o.period.from && o.period.to ? `Last 4 weeks: ${shortDate(o.period.from)} to ${shortDate(o.period.to)}, compared with the 4 weeks before.` : 'No sales weeks uploaded yet.'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">Loop<span className="text-[#e6192b]">retail</span></p>
            <p className="text-[11px] text-neutral-500">{today}</p>
            {o.demo && <p className="text-[10px] font-mono uppercase text-amber-600 mt-1">Illustrative data</p>}
          </div>
        </header>

        <H>Headline numbers</H>
        <div className="grid grid-cols-4 gap-3">
          {[...o.kpis, { key: 'risk', label: 'Risk index', value: null as number | null, format: 'int', change: null, unit: '' }].slice(0, 8).map((k) => (
            <div key={k.key} className="border border-neutral-200 rounded-lg p-3 break-inside-avoid">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">{k.label}</p>
              <p className="text-lg font-bold mt-1">{k.key === 'risk' ? `${o.risk.label}` : fmt(k.value, k.format)}</p>
              <p className="text-[11px] text-neutral-500">{k.key === 'risk' ? `${o.risk.open} open cases` : k.change == null ? '' : `${k.change > 0 ? '+' : ''}${k.change}${k.unit} vs prior`}</p>
            </div>
          ))}
        </div>

        <H>Channels</H>
        <T head={['Channel', 'Revenue', 'Units', 'Avg price', 'Returns', 'Change']}
          rows={c.cards.map((x) => [x.channel, gbp(x.revenue), int(x.units), gbp(x.asp, 2), pct(x.returnsPct), x.change == null ? '' : `${x.change > 0 ? '+' : ''}${x.change}%`])} empty="No sales uploaded for this period." />
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div><p className="text-[11px] font-semibold text-neutral-600 mb-1">Top products</p><T head={['Product', 'Revenue']} rows={c.top.map((t) => [t.name, gbp(t.revenue)])} /></div>
          <div><p className="text-[11px] font-semibold text-neutral-600 mb-1">Stock under 4 weeks cover</p><T head={['Product', 'Stock', 'Weeks']} rows={c.stockWarnings.map((x) => [x.name, int(x.stock), x.weeksCover ?? ''])} empty="All products have 4+ weeks of cover." /></div>
        </div>

        {s.hasData && (
          <>
            <H>D2C store</H>
            <T head={['Revenue', 'Orders', 'Conversion', 'AOV', 'Repeat customers', 'Cost per new customer']}
              rows={[[gbp(s.kpis.revenue) + chg(s.change.revenue), int(s.kpis.orders), pct(s.kpis.conversionPct, 2) + chg(s.change.conversion, 'pp'), gbp(s.kpis.aov, 2), pct(s.kpis.repeatPct), gbp(s.kpis.cpa, 2)]]} />
          </>
        )}

        <H>Advertising</H>
        <T head={['Channel', 'Spend', 'Ad sales', 'ROAS', 'ACoS', 'Spend change']}
          rows={d.byChannel.map((x) => [x.channel, gbp(x.spend), gbp(x.adSales), x.roas != null ? `${x.roas}x` : '', pct(x.acosPct), x.spendGrowth == null ? '' : `${x.spendGrowth > 0 ? '+' : ''}${x.spendGrowth}%`])} empty="No ads uploaded for this period." />
        {d.campaigns.some((x) => (x.acosPct ?? 0) > d.targetAcosPct) && (
          <p className="text-[12px] text-neutral-600 mt-2">Over {d.targetAcosPct}% ACoS: {d.campaigns.filter((x) => (x.acosPct ?? 0) > d.targetAcosPct).map((x) => `${x.campaign} (${x.acosPct}%)`).join(', ')}.</p>
        )}

        <H>Brand protection (Amazon UK)</H>
        <p className="text-[12px] text-neutral-600 mb-2">
          {open.length} open cases, {p.summary.unauthorisedSellers} unauthorised sellers on your listings, {p.summary.resolved} resolved to date.
          {p.summary.lastCheck ? ` Last Keepa check ${shortDate(p.summary.lastCheck)}.` : ' No Keepa check yet.'}
          {p.summary.authorisedListMissing ? ' Seller alerts are off until your authorised seller list is uploaded.' : ''}
        </p>
        <T head={['Case', 'Type', 'Severity', 'Status']} rows={open.slice(0, 15).map((x) => [x.title, CASE_LABELS[x.type], x.severity, x.status])} empty="No open cases." />

        <H>Price position and rank</H>
        <T head={['Product', 'BSR', 'BSR 90d avg', 'Our price', 'Lowest rival', 'Cheapest?']}
          rows={a.products.map((x) => [x.name, int(x.bsr), int(x.bsrAvg90), gbp(x.price, 2), gbp(x.lowestCompetitor, 2), x.cheapest == null ? '' : x.cheapest ? 'Yes' : 'No'])} empty="No Keepa data yet." />
        <p className="text-[11px] text-neutral-500 mt-2">Products where we are the cheapest vs direct competitors: {pct(a.brand.cheapestPct, 0)}. New compatible listings in the last 30 days: {a.brand.newCompatiblesThisMonth}.</p>

        <footer className="mt-10 pt-3 border-t border-neutral-200 text-[10px] text-neutral-500 flex justify-between">
          <span>Market data: Keepa (Amazon UK). Sales, ads and D2C: brand weekly sheets.</span>
          <span>loopretail.io</span>
        </footer>
      </article>
      <style>{`@media print { @page { size: A4; margin: 14mm; } }`}</style>
    </div>
  );
}

