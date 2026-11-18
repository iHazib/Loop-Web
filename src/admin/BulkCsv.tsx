import { useRef, useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { portalFetch, parseCsv, downloadCsv, useView } from '../portal/api';

/* Bulk CSV upload with its template, for any admin list.
   Sheet kinds go through the same validated upload as the brand's Data tab;
   "brands" goes to the staff bulk brand import. Rows with the same key are updated, not duplicated. */

export type BulkKind = 'products' | 'sales' | 'ads' | 'sellers' | 'competitors' | 'd2c' | 'brands';

const EXAMPLES: Record<BulkKind, (string | number)[][]> = {
  products: [['NF-OAT-500', 'Oat Bites 500g', 'B0XXXXXXXX', '5060000000011', 1.8, 6.99, 5.99], ['NF-GRN-400', 'Honey Granola 400g', '', '5060000000028', 1.6, 5.49, 4.79]],
  sales: [['2026-11-02', 'Amazon', 'NF-OAT-500', 340, 2376.6, 6, 520, 1200], ['2026-11-02', 'TikTok Shop', 'NF-OAT-500', 80, 559.2, 1, 70, 1200]],
  ads: [['2026-11-02', 'Amazon', 'SP Oat Bites Exact', 'Sponsored Products', 180, 42000, 610, 74, 517.26], ['2026-11-02', 'TikTok Shop', 'Spark Ads Oat Bites', 'Spark Ads', 60, 31000, 420, 18, 125.82]],
  sellers: [['Northfield Direct', 'A1XXXXXXXXXXXX', 'northfield_direct', 'All', ''], ['Wholesale Partner Ltd', 'A2YYYYYYYYYYYY', '', 'NF-OAT-500;NF-GRN-400', '2027-12-31']],
  competitors: [['NF-OAT-500', 'B0YYYYYYYY', 'competitor'], ['NF-OAT-500', 'B0ZZZZZZZZ', 'compatible']],
  d2c: [['2026-11-02', 5400, 112, 2890.5, 84, 28, 2]],
  brands: [['Northfield Pantry', 'Growth', 'onboarding', 'Ousman', 'ousman@loopretail.io', 'buyer@northfield.co.uk', 'Signed 12 Nov'], ['Halcyon Foods', '', 'active', '', '', '', '']],
};
const BRAND_HEADERS = ['Brand name', 'Plan', 'Status (onboarding, active, paused, churned)', 'Account manager', 'Account manager email', 'Brand contact email', 'Notes'];

type Result = { accepted: number; rejected: { row: number; reason: string }[] } | { error: string };

export function BulkCsv({ kind, brandId, label, help, onDone }: { kind: BulkKind; brandId?: string; label?: string; help?: string; onDone?: () => void }) {
  const { data: templates } = useView<Record<string, string[]>>('/templates');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const headers = kind === 'brands' ? BRAND_HEADERS : templates?.[kind];

  const upload = async (file: File) => {
    setBusy(true); setRes(null);
    try {
      const rows = parseCsv(await file.text()).filter((r) => Object.values(r).some((v) => String(v).trim()));
      const url = kind === 'brands' ? '/admin/brands/bulk' : `/brands/${encodeURIComponent(brandId!)}/upload/${kind}`;
      const r = await portalFetch<{ accepted: number; rejected: { row: number; reason: string }[] }>(url, { method: 'POST', body: JSON.stringify({ rows }) });
      setRes(r); onDone?.();
    } catch (e) { setRes({ error: (e as Error).message }); }
    finally { setBusy(false); if (ref.current) ref.current.value = ''; }
  };

  return (
    <div className="rounded-xl border border-dashed border-black/15 bg-surface-offwhite/60 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="text-sm font-semibold text-brand-dark">{label ?? 'Bulk upload from CSV'}</div>
          {help && <div className="text-xs text-brand-dark/50 mt-0.5">{help}</div>}
        </div>
        <button onClick={() => headers && downloadCsv(`loopretail-${kind}-template.csv`, headers, EXAMPLES[kind])} disabled={!headers}
          className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium text-brand-dark disabled:opacity-40">
          <Download size={13} aria-hidden="true" /> Download template
        </button>
        <input ref={ref} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
        <button onClick={() => ref.current?.click()} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-dark text-white px-3 py-2 text-xs font-medium disabled:opacity-50">
          <Upload size={13} aria-hidden="true" /> {busy ? 'Uploading…' : 'Upload CSV'}
        </button>
      </div>
      {res && ('error' in res ? <p className="mt-2 text-xs text-brand-red">{res.error}</p> : (
        <div className="mt-2 text-xs">
          <span className="text-emerald-700">{res.accepted} row{res.accepted === 1 ? '' : 's'} saved.</span>
          {res.rejected.length > 0 && (
            <div className="mt-1.5">
              <span className="text-amber-700">{res.rejected.length} row{res.rejected.length === 1 ? '' : 's'} rejected:</span>
              <ul className="mt-1 grid gap-0.5 text-brand-dark/60">{res.rejected.slice(0, 15).map((x) => <li key={x.row}>Row {x.row}: {x.reason}</li>)}</ul>
              {res.rejected.length > 15 && <p className="text-brand-dark/40">and {res.rejected.length - 15} more.</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
