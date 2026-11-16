
import { motion } from 'motion/react';
import { CTA, contactHref } from '../components/CTA';
import { SitePage, PageHero, Section, CardGrid, Steps, FAQ, CTABand, Related, Eyebrow, H2, WRAP, Split } from '../components/site/Page';

/* Brand Protection service page. The radar is the one moving element: it shows what Loop Protect watches. */

function CaseProof() {
  return (
    <div className="p-4 grid gap-2">
      <div className="flex items-center justify-between"><span className="text-[13px] font-semibold">Loop Protect cases</span><span className="text-[12px] text-muted">Example brand</span></div>
      {[
        ['High', 'Unauthorised seller on Oat Bites 500g', 'QuickDeals Trading, £4.97 via FBA'],
        ['High', 'Grey market stock on Protein Bar 12 pack', 'Ships from Germany, 21% under your minimum'],
        ['Medium', 'Buy Box lost on Oat Bites 500g', 'Global Supply Hub won it at £4.88'],
      ].map(([sev, t, d]) => (
        <div key={t} className="flex gap-2.5 rounded-xl border border-line p-2.5">
          <span className={`text-[11px] font-semibold rounded px-1.5 py-0.5 h-fit ${sev === 'High' ? 'bg-red-tint text-danger' : 'bg-sunken text-warning'}`}>{sev}</span>
          <p className="text-[13px] leading-[18px]"><span className="font-medium">{t}</span><br /><span className="text-muted">{d}</span></p>
        </div>
      ))}
    </div>
  );
}

function SignalRadar() {
  const dots = [
    { label: 'Authorised seller', x: 26, y: 26, color: '#4cc79a' },
    { label: 'Price below minimum', x: 80, y: 40, color: '#ff6b77' },
    { label: 'Ships from abroad', x: 40, y: 78, color: '#f0a54a' },
  ];
  return (
    <div className="relative mx-auto aspect-square w-[min(100%,360px)]" role="img" aria-label="Radar showing an authorised seller, a price breach and a seller shipping from abroad">
      {[100, 66, 33].map((s) => (
        <div key={s} className="absolute rounded-full border border-white/15" style={{ width: `${s}%`, height: `${s}%`, left: `${(100 - s) / 2}%`, top: `${(100 - s) / 2}%` }} />
      ))}
      <motion.div className="absolute inset-0 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        style={{ background: 'conic-gradient(from 0deg, rgba(230,25,43,0.5), rgba(230,25,43,0) 60deg, transparent 360deg)' }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white grid place-items-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E6192B" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" /></svg>
      </div>
      {dots.map((d) => (
        <div key={d.label} className="absolute" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
          <span className="block w-3 h-3 -ml-1.5 -mt-1.5 rounded-full ring-4 ring-white/10" style={{ background: d.color }} />
          <span className="absolute left-3 -top-2.5 whitespace-nowrap text-[12px] font-medium text-white bg-white/10 rounded px-1.5 py-0.5">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function BrandProtection() {
  return (
    <SitePage>
      <PageHero
        crumb={{ label: 'Services', to: '/services' }}
        eyebrow="Brand Protection"
        title="Keep your price and your listings yours."
        lead="We check every listing daily, find unauthorised sellers and grey market stock, gather the evidence and take them down. You see every case in your dashboard."
        ctas={<><CTA to={contactHref('protection-audit')} label="Get a free seller audit" id="bp-hero" /><CTA to="/tools/loop-protect" label="How Loop Protect works" tone="outline-dark" id="bp-hero-tool" /></>}
        image="parcel"
        imageAlt="A sealed cardboard parcel ready for a test buy check"
        aside={<CaseProof />}
      />

      <Section tone="panel" eyebrow="Two threats" title="Unauthorised sellers and grey market stock are different problems."
        lead="They look the same on a listing. They start in different places, so we treat them with different rules.">
        <CardGrid cols={2} items={[
          { tag: 'Unauthorised seller', title: 'Someone who buys your stock and resells it on Amazon without permission.', body: 'Usually a retailer clearing stock, a distributor with overflow, or a trade account that was never meant to sell online.', points: ['Checked against your authorised seller list', 'Seller, price, fulfilment and stock level seen daily', 'Notice first, then a Brand Registry report'] },
          { tag: 'Grey market', title: 'Genuine stock brought in from Europe or elsewhere and sold here without consent.', body: 'It arrives cheaper, often with the wrong labels and no UK contact details, at prices your UK partners cannot match.', points: ['Seller location and ship from country', 'Price gaps against Amazon DE, FR, IT and ES', 'Label and packaging evidence from test buys'] },
        ]} />
      </Section>

      <section className="px-2 md:px-3 my-3">
        <div className="rounded-[24px] bg-petrol text-white overflow-hidden">
          <div className={`${WRAP} py-12 md:py-[72px] grid lg:grid-cols-[1fr_1fr] gap-10 items-center`}>
            <div className="flex flex-col gap-4">
              <Eyebrow dark>Loop Protect</Eyebrow>
              <h2 className={H2}>Your brand creates the demand. We watch who tries to take it.</h2>
              <p className="text-[16px] leading-[25px] text-white/80 max-w-[500px]">A new seller, a lookalike pack, a genuine product from an unclear supply route. Loop Protect puts the evidence in one case so the next step is clear.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <CTA to="/portal/demo/protection" label="Open example cases" tone="light" id="bp-radar-demo" />
                <CTA to="/tools/loop-protect" label="About the tool" tone="outline-light" id="bp-radar-tool" />
              </div>
            </div>
            <SignalRadar />
          </div>
        </div>
      </section>

      <Section eyebrow="What we watch" title="Five signals, checked every day."
        lead="Amazon UK data comes from Keepa daily. Other channels come from your weekly sheets and our own checks.">
        <CardGrid cols={3} items={[
          { title: 'Seller activity', body: 'Who sells your products, where they appear, and whether they are authorised, unknown or grey market.' },
          { title: 'Price movement', body: 'Sudden drops, undercutting and minimum price breaches that damage what your product is worth.' },
          { title: 'Listing changes', body: 'Wrong images, hijacked listings, duplicate pages and keyword misuse.' },
          { title: 'Stock behaviour', body: 'Odd quantities, old stock and clearance supply that point to a leak in distribution.' },
          { title: 'Counterfeit signals', body: 'Listings and sellers that need a test buy, a packaging check or a batch code review.' },
          { title: 'Reviews', body: 'Complaints about damaged, old or different product that often trace back to one seller.' },
        ]} />
      </Section>

      <Section tone="panel">
        <Split
          image="carry"
          imageAlt="A person packing a cardboard box at a workbench"
          eyebrow="Evidence before action"
          title="We build the case before we send the notice."
          body={<p>Marketplaces act on evidence. Every case we escalate carries what Amazon or the seller needs to see, kept in your dashboard so you can review it.</p>}
          points={['Test buy records with photos of labels and packaging', 'Seller screenshots and price history', 'Batch code and packaging comparisons', 'Listing snapshots and a ready to file evidence pack']}
        />
      </Section>

      <Section eyebrow="Enforcement" title="From alert to takedown." lead="You approve each action. We do the work and keep the record.">
        <Steps steps={[
          { title: 'Flag', body: 'The daily check opens a case and emails your team.', time: 'Day 0' },
          { title: 'Verify', body: 'Seller checked against your list; test buy where the stock is in doubt.', time: 'Day 1' },
          { title: 'Notice', body: 'The seller receives the evidence and is asked to stop.', time: 'Within 72 hours' },
          { title: 'Report', body: 'A Brand Registry report is filed if they keep selling. The case closes when they leave.', time: 'After notice' },
        ]} />
      </Section>

      <Section tone="panel" eyebrow="Questions" title="Brand protection FAQ">
        <FAQ items={[
          { q: 'Do we need Amazon Brand Registry?', a: 'For reports to Amazon, yes. We can still monitor, test buy and send notices before it is in place, and we help you get registered.' },
          { q: 'Can you stop a seller who bought genuine stock?', a: 'Often, through your distribution terms and minimum price policy. Where a seller has a legal right to resell, we deal with it through supply and pricing rather than takedowns.' },
          { q: 'What happens before our authorised list is uploaded?', a: 'Seller alerts stay off so you are not flooded with false cases. Price, Buy Box and listing checks still run.' },
          { q: 'Is minimum price enforcement legal in the UK?', a: 'Resale price maintenance is restricted in the UK. We apply minimum prices to unauthorised sellers and through agreements with your partners, and take advice on anything borderline.' },
        ]} />
      </Section>

      <CTABand title="Who is selling your products right now?" body="Send us your ASINs. You get the seller list, price breaches and grey market signals back as a short report." topic="protection-audit" label="Get a free seller audit" />
      <Related links={[
        { to: '/tools/loop-protect', label: 'Loop Protect', body: 'The tool behind the service.' },
        { to: '/marketplace-control', label: 'Marketplace Control', body: 'Run the channel, not just guard it.' },
        { to: '/uk-market-entry', label: 'UK Market Entry', body: 'Protection from your first UK sale.' },
      ]} />
    </SitePage>
  );
}
