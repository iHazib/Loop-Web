import { CTA, contactHref } from '../components/CTA';
import { SitePage, PageHero, Section, CardGrid, Steps, Figures, CTABand, Related, Note } from '../components/site/Page';
import { Check } from 'lucide-react';

/* Retail Expansion: getting an overseas or online brand ready for UK shop shelves. */

const SECTORS = [
  { name: 'Grocery and convenience', score: 8, opp: '50,486 convenience stores, £48.8bn projected sales', chains: 'Tesco, Sainsbury\'s, Asda, Aldi, Lidl, Co-op' },
  { name: 'Pet, garden centre and animal care', score: 8, opp: '7,292 businesses, low concentration, strong independent route', chains: 'Pets at Home, Jollyes, Mole Valley, B&M' },
  { name: 'Health, beauty and pharmacy', score: 7, opp: '49% of pharmacies in England are independent (March 2025)', chains: 'Boots, Superdrug, Holland & Barrett, Space NK' },
  { name: 'DIY, hardware and garden', score: 7, opp: 'UK DIY market £13bn+, 5,909 hardware businesses (2024)', chains: 'B&Q, Screwfix, Wickes, Toolstation' },
  { name: 'Furniture, homeware and interiors', score: 6, opp: '9,136 businesses, moderate concentration (2025)', chains: 'IKEA, Dunelm, Next Home, John Lewis' },
  { name: 'Toys, gifts, books and stationery', score: 6, opp: 'Good testing route through independents and gift shops', chains: 'The Entertainer, Smyths, Waterstones, Hobbycraft' },
  { name: 'Electronics and appliances', score: 5, opp: 'UK tech market expected at £25.4bn in 2025 (Insider Media)', chains: 'Currys, Argos, AO, Euronics' },
  { name: 'Fashion, footwear and sports', score: 4, opp: 'UK clothing £67.8bn in 2025, dominated by chains and online', chains: 'M&S, Next, Primark, JD Sports' },
];

const CHECKLIST = [
  'Does the product comply with UK rules?',
  'Is the packaging right for UK shelves?',
  'Does the price leave a UK retail margin?',
  'Are the barcode, case size and carton format correct?',
  'Can stock be supplied reliably?',
  'Is there proof of demand online or in independents?',
  'Will it hold up to returns, reviews and retailer standards?',
];

export default function RetailExpansion() {
  return (
    <SitePage>
      <PageHero
        crumb={{ label: 'Services', to: '/services' }}
        eyebrow="Retail Expansion"
        title="Get your brand ready for UK shop shelves."
        lead="Buyers want proof before they list a new brand. We fix the packaging, pricing and compliance gaps, test with independents, and prepare the pitch for chains."
        ctas={<><CTA to={contactHref('retail-expansion')} label="Check our retail readiness" id="re-hero" /><CTA to="/uk-market-entry" label="UK market entry" tone="outline-dark" id="re-hero-entry" /></>}
        image="team"
        imageAlt="A team reviewing a plan around a meeting table"
      />

      <Section tone="panel" eyebrow="The UK market" title="Most UK shopping still happens in store.">
        <Figures items={[
          { value: '£517bn', label: 'UK retail sales', note: '2024, House of Commons Library' },
          { value: '304,560', label: 'Retail businesses', note: 'January 2025' },
          { value: '2.6m', label: 'People work in UK retail', note: 'Active workforce' },
          { value: '28.3%', label: 'Share of sales online', note: 'December 2025' },
        ]} />
      </Section>

      <Section eyebrow="Sector map" title="Where a new brand can get in."
        lead="Our score combines market size, how concentrated the big chains are, and whether independents give you a way to test first. 8 is the easiest route.">
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[760px] text-[14px]">
            <thead className="bg-canvas text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Sector</th>
                <th className="px-5 py-3 font-semibold">Entry score</th>
                <th className="px-5 py-3 font-semibold">Opportunity</th>
                <th className="px-5 py-3 font-semibold">Main chains</th>
              </tr>
            </thead>
            <tbody>
              {SECTORS.map((s) => (
                <tr key={s.name} className="border-t border-line align-top">
                  <th scope="row" className="px-5 py-3.5 text-left font-medium">{s.name}</th>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-16 h-1.5 rounded-full bg-sunken overflow-hidden"><span className={`block h-full rounded-full ${s.score >= 7 ? 'bg-success' : s.score >= 6 ? 'bg-petrol' : 'bg-warning'}`} style={{ width: `${s.score * 10}%` }} /></span>
                      <span className="tnum font-medium">{s.score}/10</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{s.opp}</td>
                  <td className="px-5 py-3.5 text-muted">{s.chains}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note>Figures are from public sources named in each row. Chain names show who dominates each sector; we have no partnership with them implied.</Note>
      </Section>

      <Section tone="panel" eyebrow="What buyers ask" title="Seven questions every UK buyer will ask you.">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-8 items-start">
          <ul className="grid gap-2">
            {CHECKLIST.map((q) => (
              <li key={q} className="flex gap-3 rounded-xl bg-canvas px-4 py-3 text-[15px]"><Check size={18} className="text-brand-red shrink-0 mt-0.5" aria-hidden="true" />{q}</li>
            ))}
          </ul>
          <div className="rounded-2xl bg-ink text-white p-6 md:p-8">
            <p className="text-[22px] leading-[30px] font-semibold tracking-[-0.02em]">If any answer is no, the buyer moves on.</p>
            <p className="mt-3 text-[15px] leading-[23px] text-white/75">We work through every question with you before the first meeting, so the conversation is about range and volume instead of gaps.</p>
            <div className="mt-6"><CTA to={contactHref('retail-expansion')} label="Get a readiness check" tone="light" id="re-checklist" /></div>
          </div>
        </div>
      </Section>

      <Section eyebrow="How we help" title="From market map to first purchase order.">
        <CardGrid cols={3} items={[
          { title: 'Route to market', body: 'Chains, independents, pharmacy, garden centres, trade counters, wholesale or marketplace first. We pick the route that fits your product.' },
          { title: 'Readiness check', body: 'Packaging, pricing, barcodes, case quantities, claims, labels, images and margin structure.' },
          { title: 'Regulation', body: 'Labelling, product safety, UKCA or CE, cosmetics notification, food rules and importer duties for your category.' },
          { title: 'Independent testing', body: 'Sell through local and specialist shops first to prove demand before approaching chains.' },
          { title: 'Buyer preparation', body: 'Product story, commercial terms, margin logic and proof of demand in a buyer ready deck.' },
          { title: 'Supply', body: 'UK stock, case packing and delivery to retailer standards, from the same warehouse as your online orders.' },
        ]} />
      </Section>

      <Section tone="panel" eyebrow="Order of work" title="Test locally, then scale.">
        <Steps steps={[
          { title: 'Map the sector', body: 'Where your product fits, who buys it and what the shelf price must be.', time: 'Weeks 1 to 2' },
          { title: 'Fix the gaps', body: 'Packaging, labels, barcodes and pricing changed for UK retail.', time: 'Weeks 2 to 6' },
          { title: 'Test with independents', body: 'A small group of shops sells it while we track sell through.', time: 'Months 2 to 4' },
          { title: 'Pitch the chains', body: 'Buyer meetings with real sales data behind the range.', time: 'From month 4' },
        ]} />
      </Section>

      <CTABand title="Ready to sell in UK shops?" body="Tell us your category and current packaging. We will tell you how far you are from buyer ready." topic="retail-expansion" label="Check our retail readiness" />
      <Related links={[
        { to: '/uk-market-entry', label: 'UK Market Entry', body: 'Tax, compliance and first stock.' },
        { to: '/dtc-growth', label: 'DTC Growth', body: 'Prove demand online first.' },
        { to: '/services', label: 'All services', body: 'Everything we run.' },
      ]} />
    </SitePage>
  );
}
