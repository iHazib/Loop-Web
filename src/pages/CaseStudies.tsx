import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock, LockOpen } from 'lucide-react';
import { SitePage, PageHero, Section, Photo, Eyebrow, CTABand, WRAP, H2, type PhotoKey } from '../components/site/Page';
import { CTA, contactHref } from '../components/CTA';
import { portalFetch, useView } from '../portal/api';

/* Case studies. The list and each study's outline are public; the numbers and the full story open
   with an access code that Loopretail gives to a prospect (admin → Case studies). */

type Teaser = {
  slug: string; title: string; brandLabel: string; sector: string; summary: string; cover: string; locked: true;
  metrics: { label: string; length: number }[]; sections: { heading: string; length: number }[];
};
type Full = {
  slug: string; title: string; brandLabel: string; sector: string; summary: string; cover: string; locked: false;
  metrics: { label: string; value: string; note?: string }[]; sections: { heading: string; body: string }[];
  allStudies?: boolean; expiresAt?: string;
};

const store = {
  get: (k: string) => { try { return sessionStorage.getItem(k) ?? ''; } catch { return ''; } },
  set: (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* private mode */ } },
};
const ALL_KEY = 'lr-case-code';

/** A number that is there but not yet readable. The real value is never sent until the code is checked. */
function Hidden({ length }: { length: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="select-none blur-[7px] text-ink/80">{'£' + '8'.repeat(Math.max(2, length - 1))}</span>
      <span className="sr-only">Hidden until unlocked</span>
    </span>
  );
}

function MetricsGrid({ items }: { items: ({ label: string; value?: string; note?: string; length?: number })[] }) {
  if (!items.length) return null;
  return (
    <dl className={`grid grid-cols-2 ${['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3'][items.length] ?? 'lg:grid-cols-4'} gap-px bg-line rounded-2xl overflow-hidden border border-line`}>
      {items.map((m) => (
        <div key={m.label} className="bg-surface px-5 py-5">
          <dd className="text-[30px] leading-[34px] font-semibold tracking-[-0.03em] tnum">{m.value ?? <Hidden length={m.length ?? 4} />}</dd>
          <dt className="text-[14px] text-muted mt-1.5">{m.label}</dt>
          {m.note && <p className="text-[12px] text-muted/80 mt-1">{m.note}</p>}
        </div>
      ))}
    </dl>
  );
}

export function CaseStudiesIndex() {
  const { data, loading } = useView<Teaser[]>('/case-studies');
  return (
    <SitePage>
      <PageHero
        eyebrow="Case studies"
        title="Real brands, real numbers, shared one to one."
        lead="Our case studies use real sales, margin and seller numbers, so we share them with prospects directly. Read the outline here, then use the access code we send you to open the full study."
        ctas={<><CTA to={contactHref('case-study')} label="Ask for access" tone="red" id="cases-hero" /><CTA to="/how-it-works" label="How we work" tone="outline-dark" id="cases-hero-how" /></>}
        image="analytics"
        imageAlt="Charts on a laptop screen"
      />
      <Section eyebrow="Studies" title="Pick a study to read the outline.">
        {loading && !data ? <p className="text-muted">Loading…</p> : !data?.length ? (
          <div className="rounded-2xl border border-line bg-surface p-8 max-w-[640px]">
            <h3 className="text-[19px] font-semibold">Studies are shared on request.</h3>
            <p className="text-muted mt-2">Tell us your category and the channels you sell on, and we will send the studies closest to your brand with an access code.</p>
            <div className="mt-5"><CTA to={contactHref('case-study')} label="Ask for access" tone="dark" id="cases-empty" /></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {data.map((c) => (
              <Link key={c.slug} to={`/case-studies/${c.slug}`} className="group flex flex-col rounded-2xl bg-surface border border-line overflow-hidden hover:border-ink/30 transition-colors">
                <div className="aspect-[16/8] bg-sunken overflow-hidden"><Photo k={c.cover as PhotoKey} alt="" w={900} h={450} /></div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    {c.sector && <span className="rounded-md px-2 py-0.5 bg-red-tint text-red-text font-medium">{c.sector}</span>}
                    {c.brandLabel && <span className="text-muted">{c.brandLabel}</span>}
                  </div>
                  <h3 className="text-[21px] leading-[27px] font-semibold tracking-[-0.015em]">{c.title}</h3>
                  {c.summary && <p className="text-[15px] leading-[23px] text-muted">{c.summary}</p>}
                  {c.metrics.length > 0 && (
                    <div className="mt-auto pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-line">
                      {c.metrics.slice(0, 3).map((m) => (
                        <div key={m.label}><div className="text-[20px] font-semibold"><Hidden length={m.length} /></div><div className="text-[12px] text-muted">{m.label}</div></div>
                      ))}
                    </div>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-red-text"><Lock size={14} aria-hidden="true" /> Open with your access code</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
      <CTABand title="Want to see the numbers?" body="Tell us about your brand. We will send the studies closest to it with an access code, usually the same working day." topic="case-study" label="Ask for access" />
    </SitePage>
  );
}

export function CaseStudyPage() {
  const { slug = '' } = useParams();
  const { data: teaser, error } = useView<Teaser>(`/case-studies/${encodeURIComponent(slug)}`);
  const [full, setFull] = useState<Full | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const unlock = async (c: string, quiet = false) => {
    if (!c.trim()) return;
    setBusy(true); if (!quiet) setMsg('');
    try {
      const r = await portalFetch<Full>(`/case-studies/${encodeURIComponent(slug)}/unlock`, { method: 'POST', body: JSON.stringify({ code: c }) });
      setFull(r); store.set(`lr-case-${slug}`, c); if (r.allStudies) store.set(ALL_KEY, c);
    } catch (e) { if (!quiet) setMsg((e as Error).message); }
    finally { setBusy(false); }
  };
  // A code entered earlier in this visit opens the study straight away.
  useEffect(() => { setFull(null); const c = store.get(`lr-case-${slug}`) || store.get(ALL_KEY); if (c) void unlock(c, true); }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e: FormEvent) => { e.preventDefault(); void unlock(code); };
  const c = full ?? teaser;
  if (error) return (
    <SitePage>
      <Section eyebrow="Case studies" title="This case study is not available.">
        <p className="text-muted max-w-[560px]">It may have been taken down or the link is wrong.</p>
        <div className="mt-6"><CTA to="/case-studies" label="All case studies" tone="dark" id="case-missing" /></div>
      </Section>
    </SitePage>
  );
  if (!c) return <SitePage><div className={`${WRAP} py-24 text-muted`}>Loading…</div></SitePage>;

  return (
    <SitePage>
      <section className={`${WRAP} pt-8 md:pt-12 pb-10`}>
        <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-muted">
          <Link to="/case-studies" className="hover:text-ink">Case studies</Link> <span aria-hidden="true">/</span> <span className="text-ink">{c.title}</span>
        </nav>
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div className="flex flex-col gap-5 min-w-0">
            <Eyebrow>{[c.sector, c.brandLabel].filter(Boolean).join(', ') || 'Case study'}</Eyebrow>
            <h1 className="font-semibold tracking-[-0.04em] text-balance text-[36px] leading-[40px] md:text-[50px] md:leading-[54px]">{c.title}</h1>
            {c.summary && <p className="text-[17px] leading-[28px] text-muted max-w-[560px]">{c.summary}</p>}
          </div>
          <div className="rounded-[24px] overflow-hidden aspect-[5/3.6] bg-sunken"><Photo k={c.cover as PhotoKey} alt="" w={1000} h={720} eager /></div>
        </div>
      </section>

      <section className={`${WRAP} pb-6`}>
        <MetricsGrid items={full ? full.metrics : teaser!.metrics} />
      </section>

      {!full && (
        <section className={`${WRAP} py-6`}>
          <div className="rounded-2xl bg-petrol text-white p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-[14px]"><Lock size={15} aria-hidden="true" /> The numbers and the full study are locked</div>
              <p className="text-[17px] mt-2 max-w-[560px]">Enter the access code we sent you. No code yet? Ask for one and we will send it, usually the same working day.</p>
            </div>
            <form onSubmit={submit} className="flex flex-wrap gap-2">
              <label htmlFor="case-code" className="sr-only">Access code</label>
              <input id="case-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" autoComplete="off"
                className="w-40 rounded-[10px] bg-white text-ink px-3.5 py-2.5 text-[15px] font-mono tracking-wider outline-none focus:ring-2 focus:ring-brand-red/60" />
              <button disabled={busy || !code.trim()} className="rounded-[10px] bg-brand-red px-4 py-2.5 text-[15px] font-medium disabled:opacity-50">{busy ? 'Checking…' : 'Unlock'}</button>
              <Link to={`${contactHref('case-study')}&study=${encodeURIComponent(c.title)}`} className="rounded-[10px] border border-white/30 px-4 py-2.5 text-[15px] font-medium hover:bg-white/10">Ask for access</Link>
              {msg && <p role="alert" className="basis-full text-[14px] text-white/90 mt-1">{msg}</p>}
            </form>
          </div>
        </section>
      )}

      <section className={`${WRAP} py-10 md:py-14`}>
        <div className="max-w-[760px] grid gap-10">
          {full && (
            <p className="flex items-center gap-2 text-[13px] text-muted"><LockOpen size={14} aria-hidden="true" /> Unlocked{full.expiresAt ? ` until ${new Date(full.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}. Please keep these numbers to yourself.</p>
          )}
          {(full ? full.sections : teaser!.sections).map((s, i) => (
            <div key={i}>
              {s.heading && <h2 className={`${H2} !text-[26px] !leading-[32px] md:!text-[30px] md:!leading-[36px]`}>{s.heading}</h2>}
              {'body' in s ? (
                <div className="mt-4 grid gap-4 text-[17px] leading-[28px] text-ink/85">
                  {s.body.split(/\n{2,}/).map((p, j) => <p key={j} className="whitespace-pre-line">{p}</p>)}
                </div>
              ) : (
                <div aria-hidden="true" className="mt-4 grid gap-3 select-none blur-[5px]">
                  {Array.from({ length: Math.max(2, Math.min(6, Math.round(s.length / 180))) }, (_, j) => (
                    <div key={j} className="h-4 rounded bg-ink/15" style={{ width: `${[96, 88, 92, 70, 84, 60][j % 6]}%` }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <CTABand title="Want results like these?" body="Tell us where you sell today. We will show you which model fits and what to fix first." topic="strategy-call" secondary={{ to: '/case-studies', label: 'More case studies' }} />
    </SitePage>
  );
}
