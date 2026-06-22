import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { getPublishedPosts, usePosts, useReady, formatDate, BLOG_CATEGORIES, type BlogPost } from '../lib/store';

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/* ── A standard column article ── */
function ColumnArticle({ post, withImage }: { post: BlogPost; withImage: boolean }) {
  return (
    <article className="break-inside-avoid mb-9 pb-9 border-b border-black/15">
      <Link to={`/blog/${post.slug}`} className="group block">
        {withImage && post.coverImage && (
          <div className="aspect-[16/10] overflow-hidden mb-4 border border-black/10">
            <img src={post.coverImage} alt={post.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
          </div>
        )}
        <span className="text-[9px] font-mono tracking-widest text-brand-red uppercase">{post.category}</span>
        <h3 className="font-display font-bold tracking-tight text-brand-dark leading-[1.1] mt-1.5 mb-2 text-xl group-hover:text-brand-red transition-colors">
          {post.title}
        </h3>
        <p className="text-brand-dark/60 font-light text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
        <p className="mt-3 text-[9px] font-mono tracking-widest text-brand-dark/40 uppercase">
          By {post.author} · {post.readMinutes} min
        </p>
      </Link>
    </article>
  );
}

export default function Blog() {
  usePosts();
  const ready = useReady();
  const all = getPublishedPosts();
  const [active, setActive] = useState<string>('All');
  const [q, setQ] = useState('');

  const filtered = useMemo<BlogPost[]>(() => {
    return all.filter((p) => {
      const catOk = active === 'All' || p.category === active;
      const term = q.trim().toLowerCase();
      const qOk = !term || p.title.toLowerCase().includes(term) || p.excerpt.toLowerCase().includes(term) || p.tags.some((t) => t.toLowerCase().includes(term));
      return catOk && qOk;
    });
  }, [all, active, q]);

  const lead = filtered.find((p) => p.featured) ?? filtered[0];
  const afterLead = filtered.filter((p) => p.id !== lead?.id);
  const spotlight = afterLead[0]; // red sidebar feature
  const columnPosts = afterLead.slice(spotlight ? 1 : 0);

  const catCounts = BLOG_CATEGORIES.map((c) => ({ c, n: all.filter((p) => p.category === c).length }));

  return (
    <div className="w-full min-h-screen bg-[#f6f5f1] font-sans">
      <NavBar />

      <div className="max-w-[1200px] mx-auto px-6 pt-28 pb-20">

        {/* ─────────── Masthead ─────────── */}
        <header>
          <div className="flex items-center justify-between border-y-2 border-black py-1.5 text-[10px] font-mono tracking-widest uppercase text-brand-dark">
            <span className="hidden sm:block">{today}</span>
            <span className="text-brand-red">● UK Retail Journal</span>
            <span>Est. 2025</span>
          </div>

          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="font-display font-black tracking-tighter text-brand-dark text-center leading-[0.9] my-5"
            style={{ fontSize: 'clamp(2.8rem, 9vw, 7rem)' }}>
            The Loop Journal
          </motion.h1>

          <div className="flex items-center justify-center gap-3 border-t border-black pt-2 text-[10px] font-mono tracking-widest uppercase text-brand-dark/55">
            <span>Marketplaces</span><span className="text-brand-red">·</span>
            <span>Brand Protection</span><span className="text-brand-red">·</span>
            <span>Retail</span><span className="text-brand-red">·</span>
            <span>DTC</span>
          </div>
        </header>

        {/* ─────────── Sections + search ─────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 mb-10 border-b-2 border-black pb-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-brand-dark/40 uppercase">Sections:</span>
            {['All', ...BLOG_CATEGORIES].map((c) => (
              <button key={c} onClick={() => setActive(c)}
                className={`text-xs font-medium tracking-tight transition-colors ${
                  active === c ? 'text-brand-red underline underline-offset-4 decoration-2' : 'text-brand-dark/70 hover:text-brand-red'
                }`}>
                {c}
              </button>
            ))}
          </div>
          <div className="relative shrink-0 md:w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/30" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the archive…"
              className="w-full bg-transparent border border-black/20 rounded-none pl-9 pr-3 py-2 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-red" />
          </div>
        </div>

        {/* ─────────── Loading / empty ─────────── */}
        {!ready ? (
          <p className="py-32 text-center font-mono text-[11px] tracking-widest text-brand-dark/30 uppercase animate-pulse">Setting the press…</p>
        ) : !lead ? (
          <p className="py-32 text-center font-display font-semibold text-brand-dark/40 text-xl">No stories match this section.</p>
        ) : (
          <>
            {/* ─────────── Lead story ─────────── */}
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <Link to={`/blog/${lead.slug}`} className="group block">
                {lead.coverImage && (
                  <div className="aspect-[21/9] overflow-hidden border border-black/10 mb-6">
                    <img src={lead.coverImage} alt={lead.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                )}
                <div className="max-w-3xl mx-auto text-center">
                  <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase">{lead.category} · Lead Story</span>
                  <h2 className="font-display font-bold tracking-tight text-brand-dark leading-[1.02] mt-3 mb-4 group-hover:text-brand-red transition-colors"
                    style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3.6rem)' }}>
                    {lead.title}
                  </h2>
                  <p className="text-brand-dark/65 font-light text-lg leading-relaxed">{lead.excerpt}</p>
                  <p className="mt-4 text-[10px] font-mono tracking-widest text-brand-dark/45 uppercase">
                    By {lead.author} · {formatDate(lead.publishedAt)} · {lead.readMinutes} min read
                  </p>
                </div>
              </Link>
            </motion.section>

            <div className="border-t-2 border-black mb-10" />

            {/* ─────────── Body: columns + sidebar ─────────── */}
            <div className="grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-12">
              {/* Article columns */}
              <div className="md:columns-2 gap-10">
                {columnPosts.length === 0 ? (
                  <p className="text-brand-dark/40 text-sm font-light">More stories coming to this section.</p>
                ) : (
                  columnPosts.map((p, i) => <ColumnArticle key={p.id} post={p} withImage={i % 2 === 0} />)
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:border-l lg:border-black/15 lg:pl-12 space-y-10">
                {/* Editor's pick — red feature */}
                {spotlight && (
                  <Link to={`/blog/${spotlight.slug}`} className="group block bg-brand-red text-white p-6 -mt-1">
                    <p className="text-[9px] font-mono tracking-widest uppercase text-white/70 mb-4 border-b border-white/25 pb-2">Editor's Pick</p>
                    {spotlight.coverImage && (
                      <div className="aspect-[16/10] overflow-hidden mb-4">
                        <img src={spotlight.coverImage} alt={spotlight.title} className="w-full h-full object-cover grayscale contrast-125 opacity-90 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <h3 className="font-display font-bold text-xl leading-tight mb-2">{spotlight.title}</h3>
                    <p className="text-white/80 text-sm font-light leading-relaxed line-clamp-3">{spotlight.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase">
                      Read <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                )}

                {/* Sections index */}
                <div>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-brand-dark/50 mb-3 border-b-2 border-black pb-2">In This Edition</p>
                  <ul>
                    {catCounts.map(({ c, n }) => (
                      <li key={c}>
                        <button onClick={() => setActive(c)}
                          className="w-full flex items-center justify-between py-2 border-b border-black/10 text-left group">
                          <span className="text-sm text-brand-dark/75 group-hover:text-brand-red transition-colors">{c}</span>
                          <span className="text-[10px] font-mono text-brand-dark/35">{String(n).padStart(2, '0')}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Big number */}
                <div className="text-center border-y-2 border-black py-5">
                  <p className="font-display font-black tracking-tighter text-brand-dark leading-none" style={{ fontSize: '4.5rem' }}>
                    {String(all.length).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-brand-dark/50 mt-1">Stories in print</p>
                </div>

                {/* Contact CTA */}
                <div className="bg-brand-dark text-white p-6">
                  <p className="text-[9px] font-mono tracking-widest uppercase text-brand-red mb-3">From the Desk</p>
                  <p className="font-display font-bold text-lg leading-tight mb-4">Have a UK retail challenge worth writing about?</p>
                  <Link to="/contact" className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-white hover:text-brand-red transition-colors">
                    Talk to Loop Retail <ArrowRight size={12} />
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
