import { Link } from 'react-router-dom';
import { FileText, Inbox, CheckCircle2, PenLine, ArrowRight } from 'lucide-react';
import { usePosts, useQueries, timeAgo, BLOG_CATEGORIES } from '../lib/store';

export default function AdminDashboard() {
  const posts = usePosts();
  const queries = useQueries();

  const published = posts.filter((p) => p.status === 'published').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;
  const unread = queries.filter((q) => q.status === 'new').length;

  const stats = [
    { label: 'Published', value: published, icon: CheckCircle2, accent: true },
    { label: 'Drafts', value: drafts, icon: PenLine, accent: false },
    { label: 'Total posts', value: posts.length, icon: FileText, accent: false },
    { label: 'New queries', value: unread, icon: Inbox, accent: true },
  ];

  const recentPosts = [...posts].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);
  const recentQueries = [...queries].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  const catCounts = BLOG_CATEGORIES.map((c) => ({ c, n: posts.filter((p) => p.category === c).length })).filter((x) => x.n > 0);
  const maxCat = Math.max(1, ...catCounts.map((x) => x.n));

  return (
    <div className="px-10 py-9 max-w-[1300px]">
      <header className="mb-9">
        <span className="font-mono text-[11px] tracking-widest text-brand-red uppercase">Overview</span>
        <h1 className="font-display font-bold tracking-tight text-brand-dark text-3xl mt-1">Dashboard</h1>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-6 border ${s.accent ? 'bg-brand-dark border-brand-dark' : 'bg-white border-black/8'}`}>
            <div className="flex items-center justify-between mb-6">
              <s.icon size={18} className={s.accent ? 'text-brand-red' : 'text-brand-dark/30'} />
            </div>
            <p className={`font-display font-bold tracking-tight leading-none ${s.accent ? 'text-white' : 'text-brand-dark'}`} style={{ fontSize: '2.4rem' }}>
              {s.value}
            </p>
            <p className={`mt-2 font-mono text-[10px] tracking-widest uppercase ${s.accent ? 'text-white/45' : 'text-brand-dark/40'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Recent posts */}
        <div className="bg-white border border-black/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-brand-dark text-lg">Recent posts</h2>
            <Link to="/admin/posts" className="text-[11px] font-mono tracking-widest text-brand-red uppercase flex items-center gap-1 hover:gap-2 transition-all">
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-black/5">
            {recentPosts.map((p) => (
              <Link key={p.id} to={`/admin/posts/${p.id}`} className="flex items-center gap-4 py-3 group">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-offwhite shrink-0">
                  {p.coverImage && <img src={p.coverImage} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-dark truncate group-hover:text-brand-red transition-colors">{p.title}</p>
                  <p className="text-[10px] font-mono tracking-widest text-brand-dark/35 uppercase">{p.category}</p>
                </div>
                <span className={`text-[9px] font-mono tracking-widest px-2 py-1 rounded-full uppercase shrink-0 ${p.status === 'published' ? 'bg-brand-red/10 text-brand-red' : 'bg-black/5 text-brand-dark/40'}`}>
                  {p.status}
                </span>
              </Link>
            ))}
            {recentPosts.length === 0 && <p className="text-brand-dark/40 text-sm py-6 text-center">No posts yet.</p>}
          </div>
        </div>

        {/* Recent queries + categories */}
        <div className="space-y-6">
          <div className="bg-white border border-black/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-brand-dark text-lg">Latest enquiries</h2>
              <Link to="/admin/inbox" className="text-[11px] font-mono tracking-widest text-brand-red uppercase flex items-center gap-1 hover:gap-2 transition-all">
                Inbox <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-black/5">
              {recentQueries.map((q) => (
                <Link key={q.id} to="/admin/inbox" className="flex items-center gap-3 py-3 group">
                  {q.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-dark truncate group-hover:text-brand-red transition-colors">{q.name}</p>
                    <p className="text-[10px] font-mono tracking-widest text-brand-dark/35 uppercase truncate">{q.category}</p>
                  </div>
                  <span className="text-[10px] font-mono text-brand-dark/30 shrink-0">{timeAgo(q.createdAt)}</span>
                </Link>
              ))}
              {recentQueries.length === 0 && <p className="text-brand-dark/40 text-sm py-6 text-center">No enquiries yet.</p>}
            </div>
          </div>

          <div className="bg-white border border-black/8 rounded-2xl p-6">
            <h2 className="font-display font-bold text-brand-dark text-lg mb-5">Posts by category</h2>
            <div className="space-y-3">
              {catCounts.map((x) => (
                <div key={x.c}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-brand-dark/70">{x.c}</span>
                    <span className="text-[10px] font-mono text-brand-dark/40">{x.n}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                    <div className="h-full bg-brand-red rounded-full" style={{ width: `${(x.n / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
              {catCounts.length === 0 && <p className="text-brand-dark/40 text-sm">No posts yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
