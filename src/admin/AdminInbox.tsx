import { useState, useMemo } from 'react';
import { Search, Trash2, Reply, Archive, CheckCheck, Mail } from 'lucide-react';
import {
  useQueries, updateQuery, deleteQuery, timeAgo, formatDate,
  QUERY_CATEGORIES, type QueryStatus, type ContactQuery,
} from '../lib/store';

const statusTabs: Array<'all' | QueryStatus> = ['all', 'new', 'read', 'replied', 'archived'];

const statusStyle: Record<QueryStatus, string> = {
  new: 'bg-brand-red/10 text-brand-red',
  read: 'bg-black/5 text-brand-dark/50',
  replied: 'bg-green-500/10 text-green-600',
  archived: 'bg-black/5 text-brand-dark/35',
};

export default function AdminInbox() {
  const queries = useQueries();
  const [status, setStatus] = useState<'all' | QueryStatus>('all');
  const [category, setCategory] = useState<string>('All');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useMemo(() => {
    return [...queries]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((x) => (status === 'all' ? true : x.status === status))
      .filter((x) => (category === 'All' ? true : x.category === category))
      .filter((x) => {
        const t = q.trim().toLowerCase();
        return !t || x.name.toLowerCase().includes(t) || x.email.toLowerCase().includes(t) ||
          x.subject.toLowerCase().includes(t) || x.message.toLowerCase().includes(t) || x.company.toLowerCase().includes(t);
      });
  }, [queries, status, category, q]);

  const selected = queries.find((x) => x.id === selectedId) ?? null;

  const open = (item: ContactQuery) => {
    setSelectedId(item.id);
    if (item.status === 'new') updateQuery(item.id, { status: 'read' });
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: queries.length };
    statusTabs.slice(1).forEach((s) => (c[s] = queries.filter((x) => x.status === s).length));
    return c;
  }, [queries]);

  return (
    <div className="px-10 py-9 max-w-[1300px]">
      <header className="mb-7">
        <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">Enquiries</span>
        <h1 className="font-display font-bold tracking-tight text-brand-dark text-3xl mt-1">Inbox</h1>
      </header>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div className="flex gap-1.5 bg-white border border-black/8 rounded-full p-1 w-fit">
          {statusTabs.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full capitalize transition-colors flex items-center gap-1.5 ${
                status === s ? 'bg-brand-dark text-white' : 'text-brand-dark/50 hover:text-brand-dark'
              }`}>
              {s}
              <span className={`text-[9px] font-mono ${status === s ? 'text-white/60' : 'text-brand-dark/30'}`}>{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-black/8 rounded-full px-4 py-2.5 text-xs font-medium text-brand-dark/70 focus:outline-none focus:border-brand-red/40">
            <option value="All">All categories</option>
            {QUERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative w-56">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
              className="w-full bg-white border border-black/8 rounded-full pl-10 pr-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-red/40" />
          </div>
        </div>
      </div>

      {/* Master-detail */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_1.1fr] gap-5">
        {/* List */}
        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
          {list.length === 0 ? (
            <div className="py-20 text-center">
              <Mail size={22} className="text-brand-dark/20 mx-auto mb-3" />
              <p className="text-brand-dark/40 text-sm">No enquiries match these filters.</p>
            </div>
          ) : list.map((item) => (
            <button key={item.id} onClick={() => open(item)}
              className={`w-full text-left px-5 py-4 border-b border-black/5 last:border-0 transition-colors relative ${
                selectedId === item.id ? 'bg-surface-offwhite' : 'hover:bg-surface-offwhite/50'
              }`}>
              {selectedId === item.id && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-red" />}
              <div className="flex items-center gap-2 mb-1">
                {item.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />}
                <span className={`text-sm truncate ${item.status === 'new' ? 'font-bold text-brand-dark' : 'font-medium text-brand-dark/75'}`}>{item.name}</span>
                <span className="ml-auto text-[10px] font-mono text-brand-dark/30 shrink-0">{timeAgo(item.createdAt)}</span>
              </div>
              <p className="text-xs text-brand-dark/55 truncate mb-2">{item.subject || item.message}</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono tracking-widest text-brand-dark/40 uppercase bg-black/4 px-2 py-0.5 rounded-full">{item.category}</span>
                <span className={`text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-full uppercase ${statusStyle[item.status]}`}>{item.status}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="bg-white border border-black/8 rounded-2xl p-7 min-h-[400px]">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <Mail size={26} className="text-brand-dark/20 mb-3" />
              <p className="text-brand-dark/40 text-sm">Select an enquiry to read it.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-black/8">
                <div className="min-w-0">
                  <h2 className="font-display font-bold tracking-tight text-brand-dark text-xl">{selected.name}</h2>
                  <a href={`mailto:${selected.email}`} className="text-sm text-brand-red hover:underline">{selected.email}</a>
                  {selected.company && <p className="text-xs text-brand-dark/45 mt-0.5">{selected.company}</p>}
                </div>
                <span className={`text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-full uppercase shrink-0 ${statusStyle[selected.status]}`}>{selected.status}</span>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-2 py-4 border-b border-black/8">
                <Meta k="Category" v={selected.category} />
                <Meta k="Received" v={`${formatDate(selected.createdAt)} · ${timeAgo(selected.createdAt)}`} />
                {selected.subject && <Meta k="Subject" v={selected.subject} />}
              </div>

              <p className="py-6 text-brand-dark/75 text-[0.95rem] leading-relaxed whitespace-pre-wrap">{selected.message}</p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-black/8">
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Your enquiry to Loop Retail')}`}
                  onClick={() => updateQuery(selected.id, { status: 'replied' })}
                  className="flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#c0001f] transition-colors">
                  <Reply size={14} /> Reply
                </a>
                {selected.status !== 'replied' && (
                  <button onClick={() => updateQuery(selected.id, { status: 'replied' })}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/10 text-brand-dark text-sm font-medium hover:bg-black/5 transition-colors">
                    <CheckCheck size={14} /> Mark replied
                  </button>
                )}
                <button onClick={() => updateQuery(selected.id, { status: 'archived' })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/10 text-brand-dark text-sm font-medium hover:bg-black/5 transition-colors">
                  <Archive size={14} /> Archive
                </button>
                <button onClick={() => { deleteQuery(selected.id); setSelectedId(null); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-black/10 text-brand-dark/60 text-sm font-medium hover:text-brand-red hover:border-brand-red/30 transition-colors ml-auto">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] tracking-widest text-brand-dark/35 uppercase mb-0.5">{k}</p>
      <p className="text-sm font-medium text-brand-dark">{v}</p>
    </div>
  );
}
