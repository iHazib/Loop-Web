import { useState, type ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Pencil, Star, ExternalLink } from 'lucide-react';
import {
  getPostById, savePost, slugify, readingTime, BLOG_CATEGORIES,
  type BlogCategory, type PostStatus,
} from '../lib/store';
import { renderMarkdown } from '../lib/markdown';

export default function AdminPostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const existing = id ? getPostById(id) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [slug, setSlug] = useState(existing?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!!existing);
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [coverImage, setCoverImage] = useState(existing?.coverImage ?? '');
  const [category, setCategory] = useState<BlogCategory>(existing?.category ?? 'Marketplace Control');
  const [tags, setTags] = useState(existing?.tags.join(', ') ?? '');
  const [author, setAuthor] = useState(existing?.author ?? 'Loop Retail');
  const [featured, setFeatured] = useState(existing?.featured ?? false);
  const [seoTitle, setSeoTitle] = useState(existing?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(existing?.seoDescription ?? '');
  const [preview, setPreview] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  const [saving, setSaving] = useState(false);

  const persist = async (status: PostStatus) => {
    if (!title.trim()) { alert('Please add a title.'); return; }
    setSaving(true);
    try {
      const saved = await savePost({
        id: existing?.id,
        title: title.trim(),
        slug: effectiveSlug || slugify(title),
        excerpt, content, coverImage, category, author, featured, seoTitle, seoDescription,
        status,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      navigate(status === 'published' ? `/blog/${saved.slug}` : '/admin/posts');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not save the post.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-black/8 px-10 py-4 flex items-center gap-4">
        <Link to="/admin/posts" className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-brand-dark/40 hover:text-brand-dark uppercase transition-colors">
          <ArrowLeft size={14} /> Posts
        </Link>
        <span className="font-display font-bold text-brand-dark truncate flex-1">
          {existing ? 'Edit post' : 'New post'}
        </span>
        <button onClick={() => setPreview((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-brand-dark text-xs font-medium hover:bg-black/5 transition-colors">
          {preview ? <Pencil size={13} /> : <Eye size={13} />} {preview ? 'Edit' : 'Preview'}
        </button>
        <button onClick={() => persist('draft')} disabled={saving}
          className="px-4 py-2 rounded-full border border-black/10 text-brand-dark text-xs font-semibold hover:bg-black/5 transition-colors disabled:opacity-50">
          Save draft
        </button>
        <button onClick={() => persist('published')} disabled={saving}
          className="px-5 py-2 rounded-full bg-brand-red text-white text-xs font-semibold hover:bg-[#c0001f] transition-colors disabled:opacity-60">
          {saving ? 'Saving…' : existing?.status === 'published' ? 'Update' : 'Publish'}
        </button>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] flex-1">
        {/* Main editor */}
        <div className="px-10 py-9 max-w-[760px]">
          {preview ? (
            <article>
              {coverImage && <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8"><img src={coverImage} alt="" className="w-full h-full object-cover" /></div>}
              <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase">{category}</span>
              <h1 className="font-display font-bold tracking-tight text-brand-dark text-4xl mt-3 mb-4 leading-tight">{title || 'Untitled'}</h1>
              <p className="text-brand-dark/55 font-light text-lg mb-8">{excerpt}</p>
              <div
                className="text-brand-dark/75 leading-[1.75]
                  [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-brand-dark [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-4
                  [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-brand-dark [&_h3]:text-lg [&_h3]:mt-8 [&_h3]:mb-2
                  [&_p]:mb-5 [&_a]:text-brand-red [&_a]:underline [&_strong]:text-brand-dark [&_strong]:font-semibold
                  [&_ul]:my-5 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-5 [&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:marker:text-brand-red/50
                  [&_blockquote]:border-l-2 [&_blockquote]:border-brand-red [&_blockquote]:pl-5 [&_blockquote]:my-6 [&_blockquote]:font-display [&_blockquote]:text-brand-dark [&_blockquote]:text-lg
                  [&_code]:bg-surface-offwhite [&_code]:text-brand-red [&_code]:px-1.5 [&_code]:rounded [&_code]:font-mono [&_hr]:my-8 [&_hr]:border-black/8 [&_img]:rounded-xl [&_img]:my-6"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            </article>
          ) : (
            <>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title"
                className="w-full font-display font-bold tracking-tight text-brand-dark bg-transparent focus:outline-none placeholder:text-brand-dark/20 leading-tight mb-4"
                style={{ fontSize: '2.2rem' }} />
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short excerpt — shown on the blog index and previews." rows={2}
                className="w-full bg-transparent text-brand-dark/55 font-light text-lg focus:outline-none placeholder:text-brand-dark/25 resize-none mb-8 border-b border-black/8 pb-6" />
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[10px] tracking-widest text-brand-dark/40 uppercase">Content</span>
                <span className="font-mono text-[10px] text-brand-dark/30">· Markdown · {readingTime(content)} min read</span>
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={22}
                placeholder={'## A heading\n\nWrite your post in **markdown**. Use - for lists, > for quotes, [links](https://…) and ![images](url).'}
                className="w-full bg-surface-offwhite/60 border border-black/8 rounded-2xl p-5 text-sm text-brand-dark/80 font-mono leading-relaxed focus:outline-none focus:border-brand-red/30 resize-y" />
            </>
          )}
        </div>

        {/* Settings sidebar */}
        <aside className="border-l border-black/8 bg-white px-7 py-9 space-y-7">
          <Group title="Status">
            {existing && (
              <span className={`inline-block text-[9px] font-mono tracking-widest px-2.5 py-1 rounded-full uppercase mb-3 ${existing.status === 'published' ? 'bg-brand-red/10 text-brand-red' : 'bg-black/5 text-brand-dark/40'}`}>
                Currently {existing.status}
              </span>
            )}
            <button onClick={() => setFeatured((v) => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${featured ? 'bg-brand-red/5 border-brand-red/30 text-brand-dark' : 'border-black/10 text-brand-dark/60 hover:bg-black/5'}`}>
              <span className="flex items-center gap-2"><Star size={14} className={featured ? 'text-brand-red fill-brand-red' : 'text-brand-dark/30'} /> Featured post</span>
              <span className={`w-9 h-5 rounded-full transition-colors relative ${featured ? 'bg-brand-red' : 'bg-black/15'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${featured ? 'left-[1.15rem]' : 'left-0.5'}`} />
              </span>
            </button>
          </Group>

          <Group title="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as BlogCategory)} className={selectCls}>
              {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Group>

          <Group title="Cover image URL">
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://…" className={inputCls} />
            {coverImage && <div className="mt-3 rounded-xl overflow-hidden aspect-[16/9] border border-black/8"><img src={coverImage} alt="" className="w-full h-full object-cover" /></div>}
          </Group>

          <Group title="Tags">
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma, separated, tags" className={inputCls} />
          </Group>

          <Group title="Author">
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls} />
          </Group>

          <Group title="URL slug">
            <div className="flex items-center gap-1 bg-surface-offwhite/60 border border-black/8 rounded-xl px-3">
              <span className="text-brand-dark/30 text-xs font-mono">/blog/</span>
              <input value={effectiveSlug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                className="flex-1 bg-transparent py-2.5 text-xs text-brand-dark font-mono focus:outline-none" />
            </div>
            {existing?.status === 'published' && (
              <Link to={`/blog/${existing.slug}`} target="_blank" className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono tracking-widest text-brand-red uppercase">
                View live <ExternalLink size={11} />
              </Link>
            )}
          </Group>

          <Group title="SEO">
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO title" className={`${inputCls} mb-2`} />
            <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} placeholder="Meta description" className={`${inputCls} resize-none`} />
          </Group>
        </aside>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-surface-offwhite/60 border border-black/8 rounded-xl px-3 py-2.5 text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:border-brand-red/40 transition-colors';
const selectCls = inputCls;

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-widest text-brand-dark/40 uppercase mb-2.5">{title}</p>
      {children}
    </div>
  );
}
