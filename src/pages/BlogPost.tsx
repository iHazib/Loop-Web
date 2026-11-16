import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SitePage, WRAP, CTABand } from '../components/site/Page';
import { getPostBySlug, getPublishedPosts, usePosts, useReady, formatDate } from '../lib/store';
import { renderMarkdown } from '../lib/markdown';

const PROSE = `text-[17px] leading-[29px] text-ink/90
  [&_h2]:text-[26px] [&_h2]:leading-[32px] [&_h2]:font-semibold [&_h2]:tracking-[-0.025em] [&_h2]:text-ink [&_h2]:mt-12 [&_h2]:mb-3
  [&_h3]:text-[20px] [&_h3]:leading-[27px] [&_h3]:font-semibold [&_h3]:text-ink [&_h3]:mt-9 [&_h3]:mb-2
  [&_p]:my-5
  [&_a]:text-red-text [&_a]:underline [&_a]:underline-offset-2
  [&_strong]:font-semibold [&_strong]:text-ink
  [&_ul]:my-5 [&_ul]:grid [&_ul]:gap-2 [&_ul]:list-disc [&_ul]:pl-5
  [&_ol]:my-5 [&_ol]:grid [&_ol]:gap-2 [&_ol]:list-decimal [&_ol]:pl-5
  [&_li]:marker:text-brand-red
  [&_blockquote]:border-l-2 [&_blockquote]:border-brand-red [&_blockquote]:pl-5 [&_blockquote]:my-8 [&_blockquote]:text-[21px] [&_blockquote]:leading-[30px] [&_blockquote]:font-medium [&_blockquote]:text-ink
  [&_code]:bg-sunken [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]
  [&_hr]:my-10 [&_hr]:border-line
  [&_img]:my-8 [&_img]:rounded-2xl`;

export default function BlogPost() {
  usePosts();
  const ready = useReady();
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : null;

  if (!ready) {
    return <SitePage><p className={`${WRAP} py-32 text-center text-muted`}>Loading post</p></SitePage>;
  }

  if (!post || post.status !== 'published') {
    return (
      <SitePage>
        <div className={`${WRAP} py-28 text-center`}>
          <h1 className="text-[34px] font-semibold tracking-[-0.03em]">This post is not available.</h1>
          <p className="mt-2 text-muted">It may have been moved or unpublished.</p>
          <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-[15px] font-medium text-red-text hover:underline"><ArrowLeft size={16} /> All posts</Link>
        </div>
      </SitePage>
    );
  }

  const related = getPublishedPosts().filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);

  return (
    <SitePage>
      <article>
        <header className="max-w-[760px] mx-auto px-4 md:px-6 pt-8 md:pt-12">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-ink"><ArrowLeft size={15} /> Blog</Link>
          <p className="mt-6 text-[14px] font-medium text-red-text">{post.category}</p>
          <h1 className="mt-2 font-semibold tracking-[-0.035em] text-balance text-[34px] leading-[39px] md:text-[46px] md:leading-[50px]">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-[19px] leading-[29px] text-muted">{post.excerpt}</p>}
          <p className="mt-5 text-[14px] text-muted">{post.author} · {formatDate(post.publishedAt)} · {post.readMinutes} min read</p>
        </header>
        {post.coverImage && (
          <div className="max-w-[1040px] mx-auto px-4 md:px-6 mt-8">
            <div className="aspect-[2/1] rounded-[20px] overflow-hidden bg-sunken"><img src={post.coverImage} alt="" className="w-full h-full object-cover" /></div>
          </div>
        )}
        <div className="max-w-[680px] mx-auto px-4 md:px-6 py-8">
          <div className={PROSE} dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-line flex flex-wrap gap-2">
              {post.tags.map((t) => <span key={t} className="text-[13px] rounded-md bg-sunken px-2 py-0.5 text-muted">{t}</span>)}
            </div>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className={`${WRAP} pb-12`}>
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] mb-4">More on {post.category}</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link key={r.id} to={`/blog/${r.slug}`} className="rounded-2xl bg-surface border border-line p-5 hover:border-ink/30">
                <span className="block text-[16px] font-semibold leading-[22px]">{r.title}</span>
                <span className="block mt-2 text-[13px] text-muted">{formatDate(r.publishedAt)} · {r.readMinutes} min read</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <CTABand title="Want this looked at for your brand?" body="Tell us where you sell today and what is going wrong. We reply within one working day." topic="strategy-call" label="Talk to us" />
    </SitePage>
  );
}
