import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { useView, portalFetch } from './api';
import { Card } from './ui';

/* A brand login picks which alert emails they get for themselves: instant, daily digest or off.
   Loopretail decides which kinds are available for the brand; anything switched off there is not shown. */

type Mode = 'off' | 'instant' | 'daily';
type View = {
  enabled: boolean; sending: boolean; email: string;
  alerts: { kind: string; label: string; help: string; allowed: boolean; brandDefault: Mode; mine: Mode }[];
  reports: { kind: string; label: string; help: string; allowed: boolean; mine: boolean }[];
};

export function MyAlerts({ brandId }: { brandId: string }) {
  const { data, error } = useView<View>(`/brands/${brandId}/my-alerts`);
  const [a, setA] = useState<Record<string, Mode>>({});
  const [r, setR] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!data) return;
    setA(Object.fromEntries(data.alerts.map((x) => [x.kind, x.mine])));
    setR(Object.fromEntries(data.reports.map((x) => [x.kind, x.mine])));
  }, [data]);
  if (error || !data) return null; // staff, demo, or not available
  const alerts = data.alerts.filter((x) => x.allowed);
  const reports = data.reports.filter((x) => x.allowed);
  if (!data.enabled || (!alerts.length && !reports.length)) return null;
  const save = async () => {
    setMsg('');
    try { await portalFetch(`/brands/${brandId}/my-alerts`, { method: 'PATCH', body: JSON.stringify({ alerts: a, reports: r }) }); setMsg('Saved.'); }
    catch (e) { setMsg((e as Error).message); }
  };
  return (
    <Card title="Your email alerts" right={<span className="inline-flex items-center gap-1.5"><Mail size={13} aria-hidden="true" />{data.email}</span>}>
      <p className="text-sm text-muted mb-3">Choose what lands in your inbox. Instant means straight after the daily check; the daily digest arrives once a day at 7am.</p>
      <ul className="divide-y divide-line">
        {alerts.map((x) => (
          <li key={x.kind} className="py-2.5 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]"><div className="text-sm text-ink font-medium">{x.label}</div><div className="text-xs text-muted">{x.help}</div></div>
            <div role="radiogroup" aria-label={x.label} className="inline-flex rounded-lg bg-canvas p-0.5 border border-line">
              {(['off', 'instant', 'daily'] as Mode[]).map((m) => (
                <button key={m} role="radio" aria-checked={a[x.kind] === m} onClick={() => setA({ ...a, [x.kind]: m })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${a[x.kind] === m ? (m === 'off' ? 'bg-surface text-ink shadow-sm' : 'bg-ink text-white') : 'text-muted'}`}>
                  {m === 'off' ? 'Off' : m === 'instant' ? 'Instant' : 'Daily'}
                </button>
              ))}
            </div>
          </li>
        ))}
        {reports.map((x) => (
          <li key={x.kind} className="py-2.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={!!r[x.kind]} onChange={(e) => setR({ ...r, [x.kind]: e.target.checked })} className="mt-1 w-4 h-4 accent-[#e6192b]" />
              <span><span className="block text-sm text-ink font-medium">{x.label}</span><span className="block text-xs text-muted">{x.help}</span></span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={save} className="rounded-lg bg-brand-red px-4 py-2 text-sm text-white">Save my alerts</button>
        {msg && <span className="text-sm text-ink/80">{msg}</span>}
        {!data.sending && <span className="text-xs text-muted">Alert emails start once Loopretail switches sending on.</span>}
      </div>
    </Card>
  );
}
