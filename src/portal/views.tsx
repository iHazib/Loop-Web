import { useState } from 'react';
import type * as M from '../../server/portal/metrics';
import type { Brand, ProtectionCase } from '../../server/portal/types';
import { CASE_LABELS } from '../../server/portal/types';
import { useView, portalFetch } from './api';
import { Card, Kpi, Badge, Empty, Table, LineChart, StackedBars, Legend, PALETTE, gbp, gbpShort, int, pct, fmt, shortDate, ago } from './ui';

type Base = { brand: Brand; demo: boolean };
type Ov = Base & ReturnType<typeof M.overview>;
type Ch = Base & ReturnType<typeof M.channels>;
type Pr = Base & ReturnType<typeof M.protection>;
type An = Base & ReturnType<typeof M.analysis>;
type Ad = Base & ReturnType<typeof M.ads>;
type Lg = Base & ReturnType<typeof M.logistics>;

function Loading() {
  return <div className="grid gap-4">{[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>;
}
function Failed({ error }: { error: string }) {
  return <Empty title="Could not load this view">{error}</Empty>;
}

/* ═════════════ Overview ═════════════ */
export function Overview({ brandId }: { brandId: string }) {
  const { data, error, loading } = useView<Ov>(`/brands/${brandId}/overview?weeks=4`);
  if (loading && !data) return <Loading />;
  if (error) return <Failed error={error} />;
  if (!data) return null;
  if (!data.hasData.sales) {
    const bsr = data.kpis.find((k) => k.key === 'bsr');
    if (!data.hasData.keepa) return <Empty title="No data yet">Import your products from ASINs under Data. Keepa data appears after the first daily check.</Empty>;
    return (
      <div className="grid gap-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi label="Average BSR (30d)" value={fmt(bsr?.value ?? null, 'int')} sub="from Keepa, lower is better" />
          <Kpi label="Risk index" value={data.risk.label} sub={`${data.risk.open} open cases`} />
          <Kpi label="Sales and margin" value="Waiting" sub="upload the weekly Sales sheet under Data" />
          <Kpi label="Ad performance" value="Waiting" sub="upload the Ads sheet under Data" />
        </div>
        <Card title="Activity">
          <ul className="space-y-3">
            {data.events.map((e, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${e.level === 'warn' ? 'bg-amber-400' : e.level === 'ok' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                <span className="text-white/80 flex-1">{e.source}: <span className="text-white/50">{e.message}</span></span>
                <span className="text-[10px] font-mono text-white/30">{ago(e.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }
  const labels = data.revenue.weeks.map(shortDate);
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {data.kpis.map((k) => (
          <Kpi key={k.key} label={k.label} value={fmt(k.value, k.format)} change={k.change} unit={k.unit} lowerIsBetter={'lowerIsBetter' in k ? Boolean(k.lowerIsBetter) : false} />
        ))}
        <Kpi label="Risk index" value={data.risk.label} sub={`${data.risk.open} open cases`} />
      </div>
      <p className="text-[11px] font-mono text-white/35 -mt-2">Last {data.period.weeks} weeks ({data.period.from && shortDate(data.period.from)} to {data.period.to && shortDate(data.period.to)}) vs the 4 weeks before. Margin = revenue ex VAT less cost, fees and ad spend.</p>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card title="Revenue by channel" right="12 weeks, £ inc VAT" className="lg:col-span-2">
          <StackedBars labels={labels} series={data.revenue.byChannel} />
        </Card>
        <Card title="Activity">
          <ul className="space-y-3.5">
            {data.events.map((e, i) => (
              <li key={i} className="flex gap-3">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${e.level === 'warn' ? 'bg-amber-400' : e.level === 'ok' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white truncate">{e.source}</div>
                  <div className="text-xs text-white/45 truncate">{e.message}</div>
                </div>
                <span className="text-[10px] font-mono text-white/30 shrink-0">{ago(e.at)}</span>
              </li>
            ))}
            {!data.events.length && <li className="text-sm text-white/40">Nothing yet.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ═════════════ Channels ═════════════ */
export function Channels({ brandId }: { brandId: string }) {
  const [weeks, setWeeks] = useState(4);
  const [channel, setChannel] = useState('All');
  const { data, error, loading } = useView<Ch>(`/brands/${brandId}/channels?weeks=${weeks}`);
  if (loading && !data) return <Loading />;
  if (error) return <Failed error={error} />;
  if (!data) return null;
  if (!data.cards.length) return <Empty title="No channel data yet">Upload the Sales tab of the manual sheet under Data.</Empty>;
  const rows = data.rows.filter((r) => channel === 'All' || r.channel === channel);
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {[4, 8, 12].map((w) => (
          <button key={w} onClick={() => setWeeks(w)} className={`px-3 py-1.5 rounded-lg text-xs border ${weeks === w ? 'border-brand-red/40 bg-brand-red/15 text-white' : 'border-white/10 text-white/50 hover:text-white'}`}>Last {w} weeks</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {data.cards.map((c) => (
          <button key={c.channel} onClick={() => setChannel(channel === c.channel ? 'All' : c.channel)}
            className={`text-left rounded-2xl border p-5 transition-colors ${channel === c.channel ? 'border-brand-red/50 bg-brand-red/10' : 'border-white/[0.07] bg-white/[0.025] hover:border-white/20'}`}>
            <div className="text-[11px] uppercase tracking-wider text-white/40 mb-3">{c.channel}</div>
            <div className="text-xl font-semibold text-white">{gbpShort(c.revenue)}</div>
            <div className="text-xs text-white/45 mt-1">{int(c.units)} units · ASP {gbp(c.asp, 2)}</div>
            <div className="mt-2 text-[11px] font-mono">
              <span className={c.change == null ? 'text-white/30' : c.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{c.change == null ? 'no prior data' : `${c.change > 0 ? '+' : ''}${c.change}%`}</span>
              <span className="text-white/30"> · returns {pct(c.returnsPct)}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card title={`Products by channel${channel !== 'All' ? `: ${channel}` : ''}`} right={`last ${weeks} weeks`} className="lg:col-span-2">
          <Table head={['Product', 'Channel', 'Revenue', 'Units', 'Growth']}
            rows={rows.slice(0, 40).map((r) => [<span title={r.sku}>{r.name}</span>, r.channel, gbp(r.revenue), int(r.units), r.growth == null ? '–' : <span className={r.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{r.growth > 0 ? '+' : ''}{r.growth}%</span>])} />
        </Card>
        <div className="grid gap-5 content-start">
          <Card title="Top 5 products">
            <Table head={['Product', 'Revenue']} rows={data.top.map((t) => [t.name, gbp(t.revenue)])} />
          </Card>
          <Card title="Bottom 5 products">
            <Table head={['Product', 'Revenue']} rows={data.bottom.map((t) => [t.name, gbp(t.revenue)])} />
          </Card>
          <Card title="Stock warnings" right="under 4 weeks cover">
            <Table head={['Product', 'Stock', 'Weeks']} empty="All products have 4+ weeks of cover."
              rows={data.stockWarnings.map((s) => [s.name, int(s.stock), <span className="text-amber-300">{s.weeksCover}</span>])} />
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═════════════ Protection ═════════════ */
export function Protection({ brandId, canEdit }: { brandId: string; canEdit: boolean }) {
  const { data, error, loading, reload } = useView<Pr>(`/brands/${brandId}/protection`);
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [type, setType] = useState('all');
  const [open, setOpen] = useState<ProtectionCase | null>(null);
  if (loading && !data) return <Loading />;
  if (error) return <Failed error={error} />;
  if (!data) return null;
  const banner = data.summary.authorisedListMissing && (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
      Seller alerts are off until you add your authorised sellers. Upload the Authorised sellers sheet under Data; until then, sellers on your listings are shown but not flagged.
    </div>
  );
  const cases = data.cases.filter((c) => (filter === 'all' || c.status === 'flagged' || c.status === 'reviewing') && (type === 'all' || c.type === type));
  return (
    <div className="grid gap-5">
      {banner}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Kpi label="Open cases" value={int(data.summary.open)} sub={`${data.summary.flagged} flagged · ${data.summary.reviewing} reviewing`} />
        <Kpi label="Unauthorised sellers" value={int(data.summary.unauthorisedSellers)} sub="on your Amazon listings now" />
        <Kpi label="Resolved" value={int(data.summary.resolved)} sub="all time" />
        <Kpi label="Last Keepa check" value={data.summary.lastCheck ? shortDate(data.summary.lastCheck) : 'Never'} sub="daily, Amazon UK" />
        <Kpi label="Rules" value="6" sub="seller, price, Buy Box, spike, listing, grey" />
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card title="Cases" className="lg:col-span-2"
          right={
            <div className="flex gap-2">
              <select value={type} onChange={(e) => setType(e.target.value)} className="bg-transparent border border-white/10 rounded-md px-2 py-1 text-white/70">
                <option value="all" className="bg-black">All types</option>
                {data.byType.map((t) => <option key={t.type} value={t.type} className="bg-black">{t.label} ({t.open})</option>)}
              </select>
              <select value={filter} onChange={(e) => setFilter(e.target.value as 'open' | 'all')} className="bg-transparent border border-white/10 rounded-md px-2 py-1 text-white/70">
                <option value="open" className="bg-black">Open</option>
                <option value="all" className="bg-black">All</option>
              </select>
            </div>
          }>
          {!cases.length ? <p className="text-sm text-white/40">No cases match. {data.summary.lastCheck ? '' : 'Run a Keepa check under Data to start monitoring.'}</p> : (
            <ul className="divide-y divide-white/[0.06]">
              {cases.map((c) => (
                <li key={c.id}>
                  <button onClick={() => setOpen(c)} className="w-full text-left py-3 flex items-start gap-3 hover:bg-white/[0.02] px-1 rounded-lg">
                    <Badge tone={c.severity}>{c.severity}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">{c.title}</div>
                      <div className="text-xs text-white/45 truncate">{CASE_LABELS[c.type]} · {c.asin} · {c.detail}</div>
                    </div>
                    <Badge tone={c.status}>{c.status}</Badge>
                    <span className="text-[10px] font-mono text-white/30 w-14 text-right">{ago(c.openedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Sellers on your listings" right="latest Keepa check">
          <Table head={['Seller', 'Listings', 'Status']} empty="No Keepa data yet."
            rows={data.sellers.map((s) => [
              <span title={s.sellerId}>{s.sellerName}</span>,
              s.listings.length,
              s.authorised ? <Badge tone="clear">authorised</Badge> : data.summary.authorisedListMissing ? <Badge tone="info">not checked</Badge> : <Badge tone="high">unauthorised</Badge>,
            ])} />
        </Card>
      </div>
      {open && <CaseDrawer c={open} brandId={brandId} canEdit={canEdit} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); reload(); }} />}
    </div>
  );
}

function CaseDrawer({ c, brandId, canEdit, onClose, onSaved }: { c: ProtectionCase; brandId: string; canEdit: boolean; onClose: () => void; onSaved: () => void }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const save = async (status?: string) => {
    setBusy(true); setErr('');
    try { await portalFetch(`/brands/${brandId}/cases/${c.id}`, { method: 'PATCH', body: JSON.stringify({ status, note }) }); onSaved(); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <aside className="w-full max-w-lg h-full overflow-y-auto bg-[#0d0d0d] border-l border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3"><Badge tone={c.severity}>{c.severity}</Badge><Badge tone={c.status}>{c.status}</Badge></div>
        <h2 className="text-lg font-semibold text-white">{c.title}</h2>
        <p className="text-sm text-white/60 mt-2">{c.detail}</p>
        <dl className="grid grid-cols-2 gap-3 mt-5 text-sm">
          {[['Type', CASE_LABELS[c.type]], ['Channel', c.channel], ['ASIN', c.asin], ['SKU', c.sku], ['Seller', c.sellerId || '–'], ['Opened', new Date(c.openedAt).toLocaleString('en-GB')]].map(([k, v]) => (
            <div key={k}><dt className="text-[11px] uppercase tracking-wider text-white/35">{k}</dt><dd className="text-white/85 break-all">{v}</dd></div>
          ))}
        </dl>
        <a href={`https://www.amazon.co.uk/dp/${c.asin}`} target="_blank" rel="noreferrer" className="inline-block mt-4 text-xs text-brand-red hover:underline">Open listing on Amazon UK ↗</a>
        <h3 className="text-sm font-semibold text-white mt-6 mb-2">Evidence</h3>
        <pre className="text-[11px] text-white/60 bg-white/[0.03] border border-white/10 rounded-lg p-3 overflow-x-auto">{JSON.stringify(c.evidence, null, 2)}</pre>
        <h3 className="text-sm font-semibold text-white mt-6 mb-2">Timeline</h3>
        <ul className="space-y-2 text-sm">
          <li className="text-white/50">{new Date(c.openedAt).toLocaleString('en-GB')} · Opened by Loop Protect</li>
          {c.actions.map((a, i) => <li key={i} className="text-white/70">{new Date(a.at).toLocaleString('en-GB')} · {a.by}: {a.note}</li>)}
        </ul>
        {canEdit ? (
          <div className="mt-6 grid gap-3">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Action taken: test buy ordered, Report a Violation filed, seller contacted…"
              className="w-full rounded-lg bg-white/[0.04] border border-white/10 p-3 text-sm text-white placeholder:text-white/30" />
            <div className="flex flex-wrap gap-2">
              <button disabled={busy} onClick={() => save()} className="px-3 py-2 rounded-lg text-xs border border-white/15 text-white hover:bg-white/5">Add note</button>
              {(['reviewing', 'clear', 'resolved'] as const).filter((s) => s !== c.status).map((s) => (
                <button key={s} disabled={busy} onClick={() => save(s)} className="px-3 py-2 rounded-lg text-xs bg-brand-red/90 hover:bg-brand-red text-white capitalize">Mark {s}</button>
              ))}
            </div>
            {err && <p className="text-xs text-rose-400">{err}</p>}
          </div>
        ) : <p className="mt-6 text-xs text-white/40">The demo is read only.</p>}
      </aside>
    </div>
  );
}

/* ═════════════ Brand Analysis ═════════════ */
export function Analysis({ brandId }: { brandId: string }) {
  const [sku, setSku] = useState('');
  const [q, setQ] = useState('');
  const { data, error, loading } = useView<An>(`/brands/${brandId}/analysis${sku ? `?sku=${encodeURIComponent(sku)}` : ''}`);
  if (loading && !data) return <Loading />;
  if (error) return <Failed error={error} />;
  if (!data) return null;
  if (!data.products.length) return <Empty title="No products yet">Upload the Products tab (with ASINs) under Data, then run a Keepa check.</Empty>;
  const s = data.selected;
  const list = data.products.filter((p) => !q || `${p.name} ${p.sku} ${p.asin}`.toLowerCase().includes(q.toLowerCase()));
  const labels = s?.bsrTrend.days.map(shortDate) ?? [];
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Kpi label="Products where we are cheapest" value={pct(data.brand.cheapestPct, 0)} sub="vs direct competitors (not compatibles)" />
        <Kpi label="New compatible listings" value={int(data.brand.newCompatiblesThisMonth)} sub="added in the last 30 days" />
        <Kpi label="ASINs tracked on Keepa" value={int(data.brand.trackedAsins)} sub="ours plus competitors" />
      </div>
      <div className="grid lg:grid-cols-4 gap-5">
        <Card title="Products" className="lg:col-span-1">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, SKU or ASIN"
            className="w-full mb-3 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30" />
          <ul className="space-y-1 max-h-[520px] overflow-y-auto">
            {list.map((p) => (
              <li key={p.sku}>
                <button onClick={() => setSku(p.sku)} className={`w-full text-left rounded-lg px-3 py-2 ${s?.product.sku === p.sku ? 'bg-brand-red/15 border border-brand-red/30' : 'hover:bg-white/[0.04] border border-transparent'}`}>
                  <div className="text-sm text-white truncate">{p.name}</div>
                  <div className="text-[11px] text-white/40 font-mono">BSR {int(p.bsr)} · {gbp(p.price, 2)} {p.cheapest ? '· cheapest' : ''}</div>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <div className="lg:col-span-3 grid gap-5 content-start">
          {s && (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <Kpi label="BSR now" value={int(s.own?.bsr)} sub={`30d avg ${int(s.own?.bsrAvg30)} · 90d avg ${int(s.own?.bsrAvg90)}`} />
                <Kpi label="Price now" value={gbp(s.own?.price, 2)} sub={`90d average ${gbp(s.own?.priceAvg90, 2)}`} />
                <Kpi label="Rating" value={s.own?.rating != null ? s.own.rating.toFixed(1) : '–'} sub={`${int(s.own?.reviews)} reviews`} />
                <Kpi label="Price position" value={s.position?.label ?? '–'}
                  sub={s.position ? `low ${gbp(s.position.lowest, 2)} · avg ${gbp(s.position.average, 2)} · high ${gbp(s.position.highest, 2)}` : 'no competitor prices yet'} />
              </div>
              <div className="grid xl:grid-cols-2 gap-5">
                <Card title="BSR, ours vs top 5 competitors" right="90 days, lower is better">
                  <LineChart labels={labels} series={s.bsrTrend.series} invert format={(v) => int(v)} />
                  <Legend items={s.bsrTrend.series.map((x, i) => ({ name: x.name, color: PALETTE[i % PALETTE.length] }))} />
                </Card>
                <Card title="Price, ours vs top 5 competitors" right="90 days">
                  <LineChart labels={labels} series={s.priceTrend.series} format={(v) => gbp(v, 2)} />
                  <Legend items={s.priceTrend.series.map((x, i) => ({ name: x.name, color: PALETTE[i % PALETTE.length] }))} />
                </Card>
              </div>
              <Card title="Competitors and compatibles" right={`${s.competitors.length} tracked`}>
                <Table head={['Brand / title', 'Kind', 'Price', '90d avg', 'BSR', 'BSR 30d', 'Bought / month', 'Reviews', '+30d']}
                  empty="No competitors yet. Add them under Data, or use Keepa search."
                  rows={s.competitors.map((c) => [
                    <a href={`https://www.amazon.co.uk/dp/${c.asin}`} target="_blank" rel="noreferrer" className="hover:text-brand-red"><span className="text-white">{c.brand || c.asin}</span> <span className="text-white/40">{c.title.slice(0, 40)}</span></a>,
                    c.kind === 'compatible' ? <Badge tone="warn">compatible</Badge> : <Badge tone="info">competitor</Badge>,
                    <span className={s.own?.price != null && c.price != null && c.price < s.own.price ? 'text-rose-300' : ''}>{gbp(c.price, 2)}</span>,
                    gbp(c.priceAvg90, 2), int(c.bsr), int(c.bsrAvg30), c.monthlySold ? `${c.monthlySold}+` : '–', int(c.reviews), c.reviewGrowth30 == null ? '–' : `+${c.reviewGrowth30}`,
                  ])} />
              </Card>
              <div className="grid xl:grid-cols-2 gap-5">
                <Card title="Compatible products" right={`${s.compatibles.count} listings · avg ${gbp(s.compatibles.avgPrice, 2)} · ${pct(s.compatibles.sharePct, 0)} of set`}>
                  <LineChart labels={labels} series={[{ name: 'Compatible listings', values: s.compatibles.trend.values, color: '#F59E0B' }]} height={160} />
                </Card>
                <Card title="Fastest climbing competitors" right="BSR change over 30 days">
                  <Table head={['Brand', 'BSR now', 'Places gained', 'Reviews +30d']} empty="Needs 30 days of Keepa history."
                    rows={s.climbers.map((c) => [c.brand || c.asin, int(c.bsr), <span className={(c.bsrChange30 ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}>{int(c.bsrChange30)}</span>, c.reviewGrowth30 == null ? '–' : `+${c.reviewGrowth30}`])} />
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═════════════ Ads ═════════════ */
export function Ads({ brandId }: { brandId: string }) {
  const { data, error, loading } = useView<Ad>(`/brands/${brandId}/ads?weeks=4`);
  if (loading && !data) return <Loading />;
  if (error) return <Failed error={error} />;
  if (!data) return null;
  if (!data.campaigns.length) return <Empty title="No ads data yet">Upload the Ads tab of the manual sheet under Data (one row per campaign per week).</Empty>;
  const k = data.kpis;
  const labels = data.weeks.map(shortDate);
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Kpi label="Spend" value={gbpShort(k.spend)} change={data.change.spend} />
        <Kpi label="Ad sales" value={gbpShort(k.adSales)} change={data.change.adSales} />
        <Kpi label="ROAS" value={k.roas != null ? `${k.roas}x` : '–'} change={data.change.roas} unit="x" />
        <Kpi label="ACoS" value={pct(k.acosPct)} change={data.change.acos} unit="pp" lowerIsBetter />
        <Kpi label="TACoS" value={pct(k.tacosPct)} sub="ad spend ÷ all revenue" />
        <Kpi label="CPC" value={gbp(k.cpc, 2)} sub="cost per click" />
        <Kpi label="Conversion" value={pct(k.cvrPct)} sub="orders ÷ clicks" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Spend by channel" right="12 weeks">
          <StackedBars labels={labels} series={data.byChannel.map((c) => ({ name: c.channel, values: c.weekly }))} />
        </Card>
        <Card title="Ad sales by channel" right="12 weeks">
          <StackedBars labels={labels} series={data.byChannel.map((c) => ({ name: c.channel, values: c.weeklySales }))} />
        </Card>
      </div>
      <Card title="PPC growth by channel" right="last 4 weeks vs the 4 before">
        <Table head={['Channel', 'Spend', 'Spend growth', 'Ad sales', 'Sales growth', 'ROAS', 'ACoS']}
          rows={data.byChannel.map((c) => [c.channel, gbp(c.spend), c.spendGrowth == null ? '–' : `${c.spendGrowth > 0 ? '+' : ''}${c.spendGrowth}%`, gbp(c.adSales),
            c.salesGrowth == null ? '–' : <span className={c.salesGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{c.salesGrowth > 0 ? '+' : ''}{c.salesGrowth}%</span>,
            c.roas != null ? `${c.roas}x` : '–', pct(c.acosPct)])} />
      </Card>
      <Card title="Campaigns" right={`last 4 weeks · flagged over ${data.targetAcosPct}% ACoS`}>
        <Table head={['Campaign', 'Channel', 'Type', 'Spend', 'Ad sales', 'Orders', 'ROAS', 'ACoS']}
          rows={data.campaigns.map((c) => [c.campaign, c.channel, c.campaignType, gbp(c.spend), gbp(c.adSales), int(c.orders), c.roas != null ? `${c.roas}x` : '–',
            <span className={c.acosPct != null && c.acosPct > data.targetAcosPct ? 'text-rose-300' : ''}>{pct(c.acosPct)}</span>])} />
      </Card>
    </div>
  );
}

/* ═════════════ Logistics & Distribution ═════════════ */
export function Logistics({ brandId }: { brandId: string }) {
  const { data, error, loading } = useView<Lg>(`/brands/${brandId}/logistics`);
  if (loading && !data) return <Loading />;
  if (error) return <Failed error={error} />;
  if (!data) return null;
  if (!data.stock.length) return <Empty title="No stock data yet">Stock comes from the Sales tab (stock on hand at week end).</Empty>;
  const locs = [...new Set(data.stock.flatMap((s) => Object.keys(s.byLocation)))];
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Units in stock" value={int(data.stock.reduce((a, s) => a + s.total, 0))} sub="all locations" />
        <Kpi label="Reorder alerts" value={int(data.reorder.length)} sub="under 4 weeks of cover" />
        <Kpi label="Wholesale units" value={int(data.wholesale.reduce((a, w) => a + w.units, 0))} sub="last 12 weeks" />
        <Kpi label="UK units sold" value={int(data.retailProof.reduce((a, r) => a + r.units, 0))} sub="last 12 weeks, retail proof" />
      </div>
      <Card title="Stock by location">
        <Table head={['Product', ...locs, 'Total', 'Weekly units', 'Weeks cover']}
          rows={data.stock.map((s) => [s.name, ...locs.map((l) => int(s.byLocation[l] ?? 0)), int(s.total), s.weeklyUnits,
            <span className={s.reorder ? 'text-amber-300' : ''}>{s.weeksCover ?? '–'}</span>])} />
      </Card>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Wholesale sales" right="12 weeks">
          <StackedBars labels={data.wholesale.map((w) => shortDate(w.week))} series={[{ name: 'Wholesale revenue', values: data.wholesale.map((w) => w.revenue) }]} />
        </Card>
        <Card title="Retail ready proof" right="UK demand, last 12 weeks">
          <Table head={['Channel', 'Units', 'Revenue']} rows={data.retailProof.map((r) => [r.channel, int(r.units), gbp(r.revenue)])} />
        </Card>
      </div>
      <Card title="Coming next">
        <ul className="text-sm text-white/55 list-disc pl-5 space-y-1">{data.pending.map((p) => <li key={p}>{p}</li>)}</ul>
      </Card>
    </div>
  );
}
