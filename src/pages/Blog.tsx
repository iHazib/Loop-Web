import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { SitePage, Eyebrow, WRAP, CTABand, photo } from '../components/site/Page';
import { getPublishedPosts, usePosts, useReady, formatDate, BLOG_CATEGORIES, type BlogPost } from '../lib/store';

/* Blog index: a featured post, category filter, search, then a grid. */

const fallbackCover = (i: number) => photo((['aisle', 'boxes', 'analytics', 'parcel', 'port', 'stacked'] as const)[i % 6], 900, 560);

function PostCard({ post, i }: { post: BlogPost; i: number }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group flex flex-col rounded-2xl bg-surface border border-line overflow-hidden hover:border-ink/30">
      <div className="aspect-[16/10] bg-sunken overflow-hidden">
        <img src={post.coverImage || fallbackCover(i)} alt="" loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <span className="text-[13px] font-medium text-red-text">{post.category}</span>
        <h3 className="text-[18px] leading-[24px] font-semibold tracking-[-0.015em] group-hover:underline decoration-1 underline-offset-4">{post.title}</h3>
        <p className="text-[14px] leading-[21px] text-muted line-clamp-3">{post.excerpt}</p>
        <p className="mt-auto pt-3 text-[13px] text-muted">{formatDate(post.publishedAt)} · {post.readMinutes} min read</p>
      </div>
    </Link>
  );
}

export default function Blog() {
  usePosts();
  const ready = useReady();
  const all = getPublishedPosts();
  const [active, setActive] = useState<string>('All');
  const [q, setQ] = useState('');

  const filtered = useMemo<BlogPost[]>(() => all.filter((p) => {
    const catOk = active === 'All' || p.category === active;
    const term = q.trim().toLowerCase();
    const qOk = !term || p.title.toLowerCase().includes(term) || p.excerpt.toLowerCase().includes(term) || p.tags.some((t) => t.toLowerCase().includes(term));
    return catOk && qOk;
  }), [all, active, q]);

  const lead = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p.id !== lead?.id);

  return (
    <SitePage>
      <section className={`${WRAP} pt-8 md:pt-12 pb-8`}>
        <div className="flex flex-col gap-4 max-w-[720px]">
          <Eyebrow>Blog</Eyebrow>
          <h1 className="font-semibold tracking-[-0.04em] text-[38px] leading-[42px] md:text-[54px] md:leading-[56px]">Notes on selling in the UK.</h1>
          <p className="text-[17px] leading-[27px] text-muted">Marketplaces, brand protection, retail and direct stores, written from the work we do for brands.</p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {['All', ...BLOG_CATEGORIES].map((c) => (
              <button key={c} type="button" onClick={() => setActive(c)} aria-pressed={active === c}
                className={`text-[14px] font-medium rounded-full px-3.5 py-1.5 border transition-colors ${active === c ? 'bg-ink text-white border-ink' : 'bg-surface border-line text-ink hover:border-ink/40'}`}>
                {c}
              </button>
            ))}
          </div>
          <label className="relative md:w-72">
            <span className="sr-only">Search posts</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts"
              className="w-full bg-surface border border-control/60 rounded-[10px] pl-9 pr-3 py-2 text-[15px] focus:outline-none focus:border-ink" />
          </label>
        </div>
      </section>

      <section className={`${WRAP} pb-14`}>
        {!ready ? (
          <p className="py-24 text-center text-muted">Loading posts</p>
        ) : !lead ? (
          <div className="py-20 text-center">
            <p className="text-[18px] font-semibold">No posts match.</p>
            <button type="button" onClick={() => { setActive('All'); setQ(''); }} className="mt-2 text-[15px] font-medium text-red-text hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid gap-4">
            <Link to={`/blog/${lead.slug}`} className="group grid lg:grid-cols-[1.3fr_1fr] rounded-[20px] bg-surface border border-line overflow-hidden hover:border-ink/30">
              <div className="aspect-[16/9] lg:aspect-auto bg-sunken overflow-hidden"><img src={lead.coverImage || fallbackCover(0)} alt="" className="w-full h-full object-cover" /></div>
              <div className="p-6 md:p-8 flex flex-col gap-3 justify-center">
                <span className="text-[13px] font-medium text-red-text">{lead.category}</span>
                <h2 className="text-[26px] leading-[31px] md:text-[32px] md:leading-[37px] font-semibold tracking-[-0.03em] text-balance group-hover:underline decoration-1 underline-offset-4">{lead.title}</h2>
                <p className="text-[16px] leading-[25px] text-muted">{lead.excerpt}</p>
                <p className="text-[13px] text-muted">{lead.author} · {formatDate(lead.publishedAt)} · {lead.readMinutes} min read</p>
              </div>
            </Link>
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((p, i) => <PostCard key={p.id} post={p} i={i + 1} />)}
              </div>
            )}
          </div>
        )}
      </section>

      <CTABand title="Have a UK selling problem we should look at?" body="Tell us what is happening on your listings or in your channels. We reply within one working day." topic="strategy-call" label="Talk to us" />
    </SitePage>
  );
}
