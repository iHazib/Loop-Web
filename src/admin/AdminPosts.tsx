import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Star, Pencil, Trash2 } from 'lucide-react';
import { usePosts, deletePost, formatDate, type PostStatus } from '../lib/store';

const filters: Array<'all' | PostStatus> = ['all', 'published', 'draft'];

export default function AdminPosts() {
  const posts = usePosts();
  const [filter, setFilter] = useState<'all' | PostStatus>('all');
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);

  const list = useMemo(() => {
    return [...posts]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter((p) => (filter === 'all' ? true : p.status === filter))
      .filter((p) => {
        const t = q.trim().toLowerCase();
        return !t || p.title.toLowerCase().includes(t) || p.tags.some((x) => x.toLowerCase().includes(t));
      });
  }, [posts, filter, q]);

  return (
    <div className="px-10 py-9 max-w-[1300px]">
      <header className="flex items-center justify-between mb-9">
        <div>
          <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">Journal</span>
          <h1 className="font-display font-bold tracking-tight text-brand-dark text-3xl mt-1">Posts</h1>
        </div>
        <Link to="/admin/posts/new"
          className="flex items-center gap-2 bg-brand-red text-white px-5 py-3 rounded-full font-semibold text-sm hover:bg-[#c0001f] transition-colors">
          <Plus size={15} /> New post
        </Link>
      </header>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-1.5 bg-white border border-black/8 rounded-full p-1">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-medium px-4 py-1.5 rounded-full capitalize transition-colors ${
                filter === f ? 'bg-brand-dark text-white' : 'text-brand-dark/50 hover:text-brand-dark'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/30" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…"
            className="w-full bg-white border border-black/8 rounded-full pl-10 pr-4 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-red/40" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_140px_120px_110px_90px] gap-4 px-6 py-3 border-b border-black/8 bg-surface-offwhite/50">
          {['Title', 'Category', 'Updated', 'Status', ''].map((h, i) => (
            <span key={i} className="font-mono text-[9px] tracking-widest text-brand-dark/40 uppercase">{h}</span>
          ))}
        </div>

        {list.map((p) => (
          <div key={p.id} className="grid md:grid-cols-[1fr_140px_120px_110px_90px] gap-4 px-6 py-4 border-b border-black/5 last:border-0 items-center hover:bg-surface-offwhite/40 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-offwhite shrink-0">
                {p.coverImage && <img src={p.coverImage} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-dark truncate flex items-center gap-1.5">
                  {p.featured && <Star size={12} className="text-brand-red fill-brand-red shrink-0" />}
                  {p.title}
                </p>
                <p className="text-[11px] text-brand-dark/35 truncate">/{p.slug}</p>
              </div>
            </div>
            <span className="text-xs text-brand-dark/55 hidden md:block">{p.category}</span>
            <span className="text-xs text-brand-dark/45 hidden md:block">{formatDate(p.updatedAt)}</span>
            <div className="hidden md:block">
              <span className={`text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-full uppercase ${p.status === 'published' ? 'bg-brand-red/10 text-brand-red' : 'bg-black/5 text-brand-dark/40'}`}>
                {p.status}
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <Link to={`/admin/posts/${p.id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-dark/40 hover:text-brand-dark hover:bg-black/5 transition-colors" title="Edit">
                <Pencil size={14} />
              </Link>
              <button onClick={() => setConfirm(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-dark/40 hover:text-brand-red hover:bg-brand-red/5 transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>

            {/* Quick publish toggle on mobile shows status inline */}
          </div>
        ))}

        {list.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-display font-semibold text-brand-dark/40 text-lg">No posts here.</p>
            <Link to="/admin/posts/new" className="text-brand-red text-sm font-medium mt-2 inline-block">Create your first post →</Link>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm px-6" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-brand-dark text-lg mb-2">Delete this post?</h3>
            <p className="text-brand-dark/50 text-sm mb-6">This permanently removes the post. This can't be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-black/10 text-brand-dark text-sm font-medium hover:bg-black/5 transition-colors">Cancel</button>
              <button onClick={() => { deletePost(confirm); setConfirm(null); }} className="flex-1 py-2.5 rounded-xl bg-brand-red text-white text-sm font-semibold hover:bg-[#c0001f] transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
