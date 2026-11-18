import { useMemo, useRef, useState } from 'react';
import { Upload, Download, Trash2 } from 'lucide-react';
import { parseReport, type SearchTermUpload } from '../../server/portal/searchterms';
import type * as ST from '../../server/portal/searchterms';
import { useView, portalFetch, parseCsv, downloadCsv } from './api';
import { Card, Kpi, Badge, gbp, int, pct } from './ui';

/* Sponsored Products by search term. Upload Amazon Ads' search term report (CSV or XLSX);
   it is read in the browser, totalled per term and only the totals are sent. */

type View = {
  ready: boolean;
  periods: { periodStart: string; periodEnd: string; uploadedAt: string; terms: number }[];
  period: { periodStart: string; periodEnd: string } | null;
  summary: ReturnType<typeof ST.analyse>['summary'] | null;
  terms: ReturnType<typeof ST.analyse>['terms'];
};

const FLAGS = [
  { key: 'all', label: 'All terms' },
  { key: 'wasted', label: 'Wasted spend' },
  { key: 'winner', label: 'Move to exact' },
  { key: 'bid_down', label: 'Bid down' },
  { key: 'negative', label: 'Negatives' },
] as const;
const FLAG_BADGE: Record<string, [string, string]> = {
  wasted: ['high', 'wasted'], winner: ['clear', 'winner'], bid_down: ['medium', 'bid down'], low_data: ['resolved', 'few clicks'], ok: ['info', 'ok'],
};

async function readFile(file: File): Promise<Record<string, unknown>[]> {
  if (/\.xlsx$/i.test(file.name)) {
    const { readSheet } = await import('read-excel-file/browser');
    const grid = (await readSheet(file)) as unknown[][];
    const head = (grid[0] ?? []).map((h) => String(h ?? ''));
    return grid.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] instanceof Date ? (r[i] as Date).toISOString().slice(0, 10) : r[i]])));
  }
  return parseCsv(await file.text());
}

export function SearchTerms({ brandId, canEdit }: { brandId: string; canEdit: boolean }) {
  const [period, setPeriod] = useState('');
  const [rev, setRev] = useState(0);
  const { data, error, loading } = useView<View>(`/brands/${brandId}/searchterms?period=${period}&r=${rev}`);
  const [flag, setFlag] = useState<(typeof FLAGS)[number]['key']>('all');
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const terms = useMemo(() => (data?.terms ?? []).filter((t) =>
    (flag === 'all' || (flag === 'negative' ? t.negative : t.flag === flag)) &&
    (!q.trim() || t.searchTerm.includes(q.trim().toLowerCase()) || t.campaign.toLowerCase().includes(q.trim().toLowerCase()))), [data, flag, q]);

  const upload = async (file: File) => {
    setBusy(true); setMsg('');
    try {
      const rep = parseReport(await readFile(file));
      if (typeof rep === 'string') throw new Error(rep);
      const r = await portalFetch<{ terms: number; periodStart: string; periodEnd: string }>(`/brands/${brandId}/searchterms`, { method: 'POST', body: JSON.stringify({ report: rep satisfies SearchTermUpload }) });
      setMsg(`Uploaded ${r.terms.toLocaleString('en-GB')} search terms for ${r.periodStart} to ${r.periodEnd}.`);
      setPeriod(`${r.periodStart}_${r.periodEnd}`); setRev((x) => x + 1);
    } catch (e) { setMsg((e as Error).message); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };
  const remove = async () => {
    if (!data?.period || !window.confirm(`Delete the search term report for ${data.period.periodStart} to ${data.period.periodEnd}?`)) return;
    try { await portalFetch(`/brands/${brandId}/searchterms?period=${data.period.periodStart}_${data.period.periodEnd}`, { method: 'DELETE' }); setPeriod(''); setRev((x) => x + 1); }
    catch (e) { setMsg((e as Error).message); }
  };
  const exportNegatives = () => {
    const neg = (data?.terms ?? []).filter((t) => t.negative);
    downloadCsv('negative-keywords.csv', ['Campaign', 'Ad group', 'Keyword or product', 'Match type', 'Clicks', 'Spend (£)'],
      neg.map((t) => [t.campaign, t.adGroup, t.searchTerm, /^b0[a-z0-9]{8}$/i.test(t.searchTerm) ? 'Negative product target' : 'Negative exact', t.clicks, t.spend]));
  };

  const uploadBtn = canEdit && (
    <>
      <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
      <button onClick={() => fileRef.current?.click()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red text-white px-3 py-2 text-xs font-medium disabled:opacity-50">
        <Upload size={14} aria-hidden="true" />{busy ? 'Reading the report…' : 'Upload search term report'}
      </button>
    </>
  );

  if (loading && !data) return <Card title="Search terms"><p className="text-sm text-muted">Loading…</p></Card>;
  if (error) return <Card title="Search terms"><p className="text-sm text-rose-700">{error}</p></Card>;
  if (!data) return null;
  if (!data.ready) return <Card title="Search terms"><p className="text-sm text-muted">Search term reports need a database update: run supabase/portal.sql again.</p></Card>;

  const s = data.summary;
  return (
    <div className="grid gap-5">
      <Card title="Sponsored Products by search term"
        right={
          <div className="flex flex-wrap items-center gap-2">
            {data.periods.length > 0 && (
              <select value={data.period ? `${data.period.periodStart}_${data.period.periodEnd}` : ''} onChange={(e) => setPeriod(e.target.value)} className="bg-transparent border border-line rounded-md px-2 py-1 text-ink/80" aria-label="Report period">
                {data.periods.map((p) => <option key={`${p.periodStart}_${p.periodEnd}`} value={`${p.periodStart}_${p.periodEnd}`}>{p.periodStart} to {p.periodEnd} ({p.terms} terms)</option>)}
              </select>
            )}
            {uploadBtn}
          </div>
        }>
        {msg && <p className="mb-3 text-sm text-ink/80">{msg}</p>}
        {!s ? (
          <div className="text-sm text-muted grid gap-2">
            <p>No search term report yet. In Amazon Ads go to Measurement and reporting, Sponsored ads reports, create a Sponsored Products report with report type <span className="text-ink">Search term</span>, then upload the CSV or XLSX here.</p>
            <p>You will see every customer search with its spend and sales, which searches waste money, which to move to exact match, and a ready list of negative keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Kpi label="Spend" value={gbp(s.spend)} sub={`${int(s.clicks)} clicks · ${int(s.terms)} terms`} />
            <Kpi label="Sales" value={gbp(s.sales)} sub={`${int(s.orders)} orders`} />
            <Kpi label="ACoS" value={pct(s.acos)} sub={`target ${s.targetAcos}%`} />
            <Kpi label="Wasted spend" value={gbp(s.wastedSpend)} sub={`${pct(s.wastedPct)} of spend · ${s.wastedTerms} terms`} />
            <Kpi label="Move to exact" value={int(s.winners)} sub={`${gbp(s.winnerSales)} sales from them`} />
          </div>
        )}
      </Card>

      {s && (
        <Card title="Search terms"
          right={
            <div className="flex flex-wrap items-center gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms or campaigns" className="bg-transparent border border-line rounded-md px-2 py-1 text-ink/80 w-48" aria-label="Filter search terms" />
              {s.negatives > 0 && <button onClick={exportNegatives} className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-ink/80 hover:bg-canvas"><Download size={12} aria-hidden="true" />Negatives CSV ({s.negatives})</button>}
              {canEdit && data.period && <button onClick={remove} className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-ink/60 hover:text-rose-700" aria-label="Delete this report"><Trash2 size={12} aria-hidden="true" /></button>}
            </div>
          }>
          <div role="group" aria-label="Filter by flag" className="flex flex-wrap gap-1.5 mb-3">
            {FLAGS.map((f) => {
              const n = f.key === 'all' ? data.terms.length : f.key === 'negative' ? s.negatives : data.terms.filter((t) => t.flag === f.key).length;
              return (
                <button key={f.key} onClick={() => setFlag(f.key)} aria-pressed={flag === f.key}
                  className={`rounded-full px-3 py-1 text-xs font-medium border ${flag === f.key ? 'bg-ink text-white border-ink' : 'border-line text-ink/70 hover:border-ink/40'}`}>{f.label} ({n})</button>
              );
            })}
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[980px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  {['Search term', 'Campaign', 'Match', 'Impr.', 'Clicks', 'CTR', 'Spend', 'Sales', 'Orders', 'ACoS', 'Flag', 'What to do'].map((h, i) => <th key={h} className={`px-2 pb-2 font-medium whitespace-nowrap ${i >= 3 && i <= 9 ? 'text-right' : ''}`}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {terms.slice(0, 500).map((t, i) => {
                  const [tone, label] = FLAG_BADGE[t.flag];
                  return (
                    <tr key={i} className="border-t border-line text-ink/80 align-top">
                      <td className="px-2 py-2 text-ink font-medium">{t.searchTerm}</td>
                      <td className="px-2 py-2"><div className="truncate max-w-[200px]" title={t.campaign}>{t.campaign}</div><div className="text-[11px] text-muted truncate max-w-[200px]">{t.adGroup}{t.targeting && t.targeting !== '*' ? ` · ${t.targeting}` : ''}</div></td>
                      <td className="px-2 py-2 text-[11px] font-mono">{t.matchType === '-' ? 'auto' : t.matchType.toLowerCase()}</td>
                      <td className="px-2 py-2 text-right tnum">{int(t.impressions)}</td>
                      <td className="px-2 py-2 text-right tnum">{int(t.clicks)}</td>
                      <td className="px-2 py-2 text-right tnum">{pct(t.ctr)}</td>
                      <td className="px-2 py-2 text-right tnum">£{t.spend.toFixed(2)}</td>
                      <td className="px-2 py-2 text-right tnum">£{t.sales.toFixed(2)}</td>
                      <td className="px-2 py-2 text-right tnum">{int(t.orders)}</td>
                      <td className={`px-2 py-2 text-right tnum ${t.acos != null && t.acos > s.targetAcos ? 'text-rose-700' : ''}`}>{pct(t.acos)}</td>
                      <td className="px-2 py-2"><Badge tone={tone}>{label}</Badge></td>
                      <td className="px-2 py-2 text-[13px] max-w-[260px]">{t.action || <span className="text-muted">–</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {terms.length > 500 && <p className="mt-2 text-xs text-muted">Showing the 500 terms with the most spend. Use the search box to find others.</p>}
            {!terms.length && <p className="py-4 text-sm text-muted">No terms match.</p>}
          </div>
          <p className="mt-3 text-xs text-muted">Wasted spend: 10 or more clicks with no orders. Move to exact: 2 or more orders at or under the target ACoS, not yet an exact keyword. Bid down: ACoS more than 1.5 times the target.</p>
        </Card>
      )}
    </div>
  );
}
