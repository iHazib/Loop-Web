import { useEffect, useState } from 'react';
import { Plus, Trash2, Copy, ExternalLink } from 'lucide-react';
import { useView, portalFetch } from '../portal/api';
import { input } from './AdminBrands';

/* Staff: write case studies for the public site and give prospects access codes.
   A study stays hidden until it is published. Its numbers and full text only reach a visitor with a valid code. */

type Metric = { label: string; value: string; note?: string };
type SectionT = { heading: string; body: string };
type Study = { id?: string; slug: string; title: string; brandLabel: string; sector: string; summary: string; cover: string; metrics: Metric[]; sections: SectionT[]; published: boolean; sort: number; updatedAt?: string };
type Access = { id: string; label: string; studyId: string | null; expiresAt: string; createdAt: string; lastUsed: string | null; uses: number; revoked: boolean };

const COVERS = ['boxes', 'analytics', 'amazon', 'parcel', 'aisle', 'shelves', 'rack', 'floor', 'van', 'carry', 'phone', 'team', 'port', 'loading', 'forklift', 'stacked'];
const EMPTY: Study = { slug: '', title: '', brandLabel: '', sector: '', summary: '', cover: 'boxes', metrics: [{ label: '', value: '' }], sections: [{ heading: 'The problem', body: '' }, { heading: 'What we did', body: '' }, { heading: 'The result', body: '' }], published: false, sort: 0 };

const Box = ({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <section className="bg-white border border-black/8 rounded-2xl p-6">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><h2 className="font-display font-bold text-brand-dark text-lg">{title}</h2>{right}</div>
    {children}
  </section>
);

function Editor({ start, onSaved, onCancel }: { start: Study; onSaved: () => void; onCancel: () => void }) {
  const [s, setS] = useState<Study>(start);
  const [msg, setMsg] = useState('');
  useEffect(() => setS(start), [start]);
  const set = <K extends keyof Study>(k: K, v: Study[K]) => setS((x) => ({ ...x, [k]: v }));
  const save = async (published?: boolean) => {
    setMsg('');
    try {
      const r = await portalFetch<Study>('/admin/case-studies', { method: 'POST', body: JSON.stringify({ ...s, published: published ?? s.published }) });
      setS({ ...s, ...r }); setMsg(published === undefined ? 'Saved.' : published ? 'Published. It is now listed on /case-studies.' : 'Unpublished. It is hidden from the site.'); onSaved();
    } catch (e) { setMsg((e as Error).message); }
  };
  return (
    <Box title={s.id ? `Edit: ${s.title || 'untitled'}` : 'New case study'} right={<button onClick={onCancel} className="text-sm text-brand-dark/50 hover:text-brand-dark">Close</button>}>
      <div className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="grid gap-1 text-xs text-brand-dark/60">Title<input className={input} value={s.title} onChange={(e) => set('title', e.target.value)} placeholder="Grey stock cleared in six weeks" /></label>
          <label className="grid gap-1 text-xs text-brand-dark/60">Link name<input className={`${input} font-mono`} value={s.slug} onChange={(e) => set('slug', e.target.value)} placeholder="made from the title if empty" /></label>
          <label className="grid gap-1 text-xs text-brand-dark/60">How the brand is described publicly<input className={input} value={s.brandLabel} onChange={(e) => set('brandLabel', e.target.value)} placeholder="German kitchenware brand" /></label>
          <label className="grid gap-1 text-xs text-brand-dark/60">Sector<input className={input} value={s.sector} onChange={(e) => set('sector', e.target.value)} placeholder="Home and kitchen" /></label>
        </div>
        <label className="grid gap-1 text-xs text-brand-dark/60">Public summary (shown to everyone, no numbers)<textarea className={input} rows={2} maxLength={400} value={s.summary} onChange={(e) => set('summary', e.target.value)} /></label>
        <label className="grid gap-1 text-xs text-brand-dark/60 w-56">Cover photo
          <select className={input} value={s.cover} onChange={(e) => set('cover', e.target.value)}>{COVERS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </label>

        <div>
          <div className="text-xs font-semibold text-brand-dark/70 mb-2">Headline numbers (blurred until unlocked, up to 8)</div>
          <div className="grid gap-2">
            {s.metrics.map((m, i) => (
              <div key={i} className="grid grid-cols-[1fr_140px_1fr_auto] gap-2">
                <input className={input} value={m.label} placeholder="Amazon UK sales, month 6" onChange={(e) => set('metrics', s.metrics.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                <input className={input} value={m.value} placeholder="£84k" onChange={(e) => set('metrics', s.metrics.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                <input className={input} value={m.note ?? ''} placeholder="Note, optional" onChange={(e) => set('metrics', s.metrics.map((x, j) => j === i ? { ...x, note: e.target.value } : x))} />
                <button onClick={() => set('metrics', s.metrics.filter((_, j) => j !== i))} aria-label="Remove number" className="text-brand-dark/40 hover:text-brand-red px-1"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
          {s.metrics.length < 8 && <button onClick={() => set('metrics', [...s.metrics, { label: '', value: '' }])} className="mt-2 text-xs text-brand-red inline-flex items-center gap-1"><Plus size={13} /> Add a number</button>}
        </div>

        <div>
          <div className="text-xs font-semibold text-brand-dark/70 mb-2">Full study (locked until unlocked). Leave a blank line between paragraphs.</div>
          <div className="grid gap-3">
            {s.sections.map((x, i) => (
              <div key={i} className="rounded-xl border border-black/8 p-3 grid gap-2">
                <div className="flex gap-2">
                  <input className={input} value={x.heading} placeholder="Heading" onChange={(e) => set('sections', s.sections.map((y, j) => j === i ? { ...y, heading: e.target.value } : y))} />
                  <button onClick={() => set('sections', s.sections.filter((_, j) => j !== i))} aria-label="Remove section" className="text-brand-dark/40 hover:text-brand-red px-1"><Trash2 size={15} /></button>
                </div>
                <textarea className={input} rows={5} value={x.body} onChange={(e) => set('sections', s.sections.map((y, j) => j === i ? { ...y, body: e.target.value } : y))} />
              </div>
            ))}
          </div>
          {s.sections.length < 10 && <button onClick={() => set('sections', [...s.sections, { heading: '', body: '' }])} className="mt-2 text-xs text-brand-red inline-flex items-center gap-1"><Plus size={13} /> Add a section</button>}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button onClick={() => save()} disabled={!s.title} className="rounded-lg bg-brand-dark text-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Save</button>
          {s.published
            ? <button onClick={() => save(false)} className="rounded-lg border border-black/10 px-4 py-2 text-sm">Unpublish</button>
            : <button onClick={() => save(true)} disabled={!s.title} className="rounded-lg bg-brand-red text-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Publish</button>}
          {s.id && s.published && <a href={`/case-studies/${s.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-dark/60 hover:text-brand-dark"><ExternalLink size={14} /> View on site</a>}
          {msg && <span className="text-sm text-brand-dark/75">{msg}</span>}
        </div>
      </div>
    </Box>
  );
}

function Codes({ studies }: { studies: Study[] }) {
  const [rev, setRev] = useState(0);
  const { data, error } = useView<Access[]>(`/admin/case-studies/access?r=${rev}`);
  const [f, setF] = useState({ label: '', studyId: '', days: 14 });
  const [made, setMade] = useState<{ code: string; expiresAt: string; label: string } | null>(null);
  const [msg, setMsg] = useState('');
  const create = async () => {
    setMsg(''); setMade(null);
    try {
      const r = await portalFetch<{ code: string; expiresAt: string }>('/admin/case-studies/access', { method: 'POST', body: JSON.stringify(f) });
      setMade({ ...r, label: f.label }); setF({ ...f, label: '' }); setRev((x) => x + 1);
    } catch (e) { setMsg((e as Error).message); }
  };
  const revoke = async (id: string) => { await portalFetch(`/admin/case-studies/access?id=${id}`, { method: 'DELETE' }).catch((e: Error) => setMsg(e.message)); setRev((x) => x + 1); };
  const name = (id: string | null) => (id ? studies.find((s) => s.id === id)?.title ?? 'Deleted study' : 'Every study');
  const state = (a: Access) => a.revoked ? ['Revoked', 'text-brand-dark/40'] : new Date(a.expiresAt) < new Date() ? ['Expired', 'text-amber-600'] : ['Active', 'text-emerald-600'];
  return (
    <Box title="Access codes" right={<span className="text-xs text-brand-dark/40">One code per prospect. The code is shown once.</span>}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-xs text-brand-dark/60">Who it is for<input className={`${input} w-64`} value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="Acme Foods, Sarah (buyer)" /></label>
        <label className="grid gap-1 text-xs text-brand-dark/60">Opens<select className={`${input} w-64`} value={f.studyId} onChange={(e) => setF({ ...f, studyId: e.target.value })}><option value="">Every published study</option>{studies.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
        <label className="grid gap-1 text-xs text-brand-dark/60">Expires after<select className={`${input} w-36`} value={f.days} onChange={(e) => setF({ ...f, days: Number(e.target.value) })}>{[7, 14, 30, 60, 90].map((d) => <option key={d} value={d}>{d} days</option>)}</select></label>
        <button onClick={create} disabled={!f.label.trim()} className="rounded-lg bg-brand-red text-white px-4 py-2 text-sm font-semibold disabled:opacity-40">Create code</button>
      </div>
      {msg && <p className="mt-3 text-sm text-brand-red">{msg}</p>}
      {made && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <p className="text-emerald-800">Code for {made.label}, valid until {new Date(made.expiresAt).toLocaleDateString('en-GB')}. Copy it now, it is not shown again.</p>
          <div className="mt-2 flex items-center gap-3"><code className="text-2xl font-mono tracking-widest text-brand-dark">{made.code}</code>
            <button onClick={() => navigator.clipboard?.writeText(`${made.code}\n${window.location.origin}/case-studies`)} className="inline-flex items-center gap-1 text-brand-dark/60 hover:text-brand-dark"><Copy size={14} /> Copy code and link</button></div>
        </div>
      )}
      <div className="mt-5">
        {error ? <p className="text-sm text-brand-red">{error}</p> : !data?.length ? <p className="text-sm text-brand-dark/40">No codes yet.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-brand-dark/40">{['For', 'Opens', 'Expires', 'Used', 'Status', ''].map((h) => <th key={h} className="px-2 pb-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {data.map((a) => { const [l, cls] = state(a); return (
                <tr key={a.id} className="border-t border-black/5">
                  <td className="px-2 py-2.5 text-brand-dark font-medium">{a.label}</td>
                  <td className="px-2 py-2.5">{name(a.studyId)}</td>
                  <td className="px-2 py-2.5">{a.expiresAt.slice(0, 10)}</td>
                  <td className="px-2 py-2.5">{a.uses ? `${a.uses} time${a.uses === 1 ? '' : 's'}, last ${a.lastUsed?.slice(0, 10)}` : 'Not yet'}</td>
                  <td className={`px-2 py-2.5 ${cls}`}>{l}</td>
                  <td className="px-2 py-2.5 text-right">{!a.revoked && <button onClick={() => revoke(a.id)} className="text-xs text-brand-dark/40 hover:text-brand-red">Revoke</button>}</td>
                </tr>
              ); })}
            </tbody>
          </table>
        )}
      </div>
    </Box>
  );
}

export default function AdminCaseStudies() {
  const [rev, setRev] = useState(0);
  const { data, error, loading } = useView<Study[]>(`/admin/case-studies?r=${rev}`);
  const [editing, setEditing] = useState<Study | null>(null);
  const del = async (s: Study) => {
    if (!window.confirm(`Delete "${s.title}"? Codes made only for it stop working.`)) return;
    await portalFetch(`/admin/case-studies?id=${s.id}`, { method: 'DELETE' }); if (editing?.id === s.id) setEditing(null); setRev((x) => x + 1);
  };
  return (
    <div className="px-6 md:px-10 py-9 max-w-[1200px] grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">Website</span>
          <h1 className="font-display font-bold tracking-tight text-brand-dark text-3xl mt-1">Case studies</h1>
          <p className="text-sm text-brand-dark/55 mt-1 max-w-[620px]">Everyone sees the title, sector and summary at /case-studies. The numbers and the full study open with an access code you create below and send to the prospect.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY, sections: EMPTY.sections.map((x) => ({ ...x })), metrics: [{ label: '', value: '' }] })} className="inline-flex items-center gap-2 rounded-lg bg-brand-red text-white px-4 py-2.5 text-sm font-semibold"><Plus size={16} /> New case study</button>
      </header>
      {editing && <Editor start={editing} onSaved={() => setRev((x) => x + 1)} onCancel={() => setEditing(null)} />}
      <Box title="Studies">
        {error ? <p className="text-sm text-brand-red">{error}</p> : loading && !data ? <p className="text-sm text-brand-dark/40">Loading…</p> : !data?.length ? <p className="text-sm text-brand-dark/40">No case studies yet. Add one with real numbers and the brand's permission.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-brand-dark/40">{['Study', 'Described as', 'Numbers', 'Status', 'Updated', ''].map((h) => <th key={h} className="px-2 pb-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="border-t border-black/5">
                  <td className="px-2 py-2.5"><button onClick={() => setEditing(s)} className="text-brand-dark font-medium hover:text-brand-red text-left">{s.title}</button><div className="text-[11px] font-mono text-brand-dark/40">/case-studies/{s.slug}</div></td>
                  <td className="px-2 py-2.5">{[s.brandLabel, s.sector].filter(Boolean).join(', ') || '–'}</td>
                  <td className="px-2 py-2.5">{s.metrics.length}</td>
                  <td className={`px-2 py-2.5 ${s.published ? 'text-emerald-600' : 'text-brand-dark/45'}`}>{s.published ? 'Published' : 'Draft'}</td>
                  <td className="px-2 py-2.5 text-brand-dark/60">{s.updatedAt?.slice(0, 10) ?? '–'}</td>
                  <td className="px-2 py-2.5 text-right whitespace-nowrap"><button onClick={() => setEditing(s)} className="text-xs text-brand-dark/60 hover:text-brand-dark mr-3">Edit</button><button onClick={() => del(s)} className="text-xs text-brand-dark/40 hover:text-brand-red">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
      <Codes studies={data ?? []} />
    </div>
  );
}
