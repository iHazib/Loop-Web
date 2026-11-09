import { SitePage, PageHero, Section, CardGrid, Steps, FAQ, CTABand, Related } from '../components/site/Page';
import { CTA, contactHref } from '../components/CTA';

export default function ToolCompetitorAnalysis() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Tools · Competitor Analysis"
        tag="Per product · daily"
        title={<><span className="font-light text-white/50">Know who sells against you.</span><br />And how fast they grow.</>}
        lead="For every product, we track the direct competitors and the 'compatible with' copies built on your demand: their price, rank, reviews and growth, next to yours."
        ctas={<><CTA to={contactHref('competitor-analysis')} label="Get a free competitor scan" tone="red" id="comp-hero" /><CTA to="/portal/demo/analysis" label="See it in the demo" tone="outline-light" id="comp-hero-demo" /></>}
        meta={[{ k: 'Per product', v: 'Up to 30 rivals' }, { k: 'History', v: '90 days' }, { k: 'Found by', v: 'Keepa search + AI' }, { k: 'Updated', v: 'Daily' }]}
      />

      <Section eyebrow="Four kinds of competition" title={<>Not every rival<br />is a brand.</>}
        lead="Marketplace competition comes in four shapes. Each one needs a different response, so we track them separately.">
        <CardGrid cols={4} items={[
          { tag: 'Track', title: 'Direct competitors', body: 'Other brands selling the same kind of product to the same shopper.' },
          { tag: 'Track and defend', title: 'Compatible copies', body: 'Listings that say "compatible with" or "for use with" your brand, sitting on your keywords.' },
          { tag: 'Investigate', title: 'Grey stock', body: 'Your genuine product bought cheaply abroad and resold here. Handled by Loop Protect.' },
          { tag: 'Enforce', title: 'Lookalikes', body: 'Products using your name, packaging or images. Reported through Brand Registry and IP routes.' },
        ]} />
      </Section>

      <Section tone="dark" eyebrow="What you see for each product" title="Your product against the field.">
        <CardGrid dark items={[
          { title: 'Price position', body: 'Your price against the lowest, average and highest competitor, labelled cheapest, below average, above average or premium.' },
          { title: 'Rank and price trends', body: '90 day BSR and price lines for you and your top five competitors, so you can see who is moving and when.' },
          { title: 'Competitor table', body: 'Each rival with price, 90 day average price, BSR, monthly sales bracket, reviews and review growth.' },
          { title: 'Compatible watch', body: 'How many compatible listings target your product, their average price and how that number changes.' },
          { title: 'Fastest climbers', body: 'The competitors gaining the most rank and reviews in the last 30 days, the early warning for lost share.' },
          { title: 'Brand view', body: 'The share of your range where you are the cheapest, and new compatible listings this month.' },
        ]} />
      </Section>

      <Section eyebrow="How the competitor set is built" title="Search, sort, then track.">
        <Steps steps={[
          { title: 'Search', body: 'AI suggests the phrases a shopper would type for your product, plus a "compatible with your brand" search. Each one runs as an Amazon UK search through Keepa.', time: 'Minutes' },
          { title: 'Sort', body: 'AI reads each result and keeps only real competitors and compatible listings, dropping accessories, other categories and your own products.', time: 'Seconds' },
          { title: 'Review', body: 'Your team or ours can add or remove any product from the set at any time.', time: 'Optional' },
          { title: 'Track', body: 'From the next daily check, every product in the set is tracked for price, rank, reviews and sales bracket.', time: 'Daily' },
        ]} />
      </Section>

      <Section tone="off" eyebrow="Questions" title="Competitor Analysis FAQ">
        <FAQ items={[
          { q: 'Where does the data come from?', a: 'Keepa market data for Amazon UK: prices, sales rank, reviews and Amazon\'s "bought in past month" figure where Amazon shows it. No scraping.' },
          { q: 'Can we choose our own competitors?', a: 'Yes. Add any ASIN to a product\'s set, or remove one, and it is tracked from the next daily check.' },
          { q: 'What do you do with the findings?', a: 'Price and promotion changes, keyword defence with ads against compatible copies, listing improvements where rivals convert better, and enforcement where a listing crosses into lookalike territory.' },
        ]} />
      </Section>

      <CTABand title="See who is beating you on price." body="Pick three products. We will show their competitors, price position and the rivals climbing fastest." topic="competitor-analysis" label="Get a free competitor scan" />
      <Related links={[
        { to: '/marketplace-control', label: 'Marketplace Control', body: 'Pricing, listings and ads that respond to it.' },
        { to: '/tools/loop-protect', label: 'Loop Protect', body: 'When competition is really grey stock.' },
        { to: '/tools/brand-dashboard', label: 'Brand Dashboard', body: 'Where the analysis lives.' },
      ]} />
    </SitePage>
  );
}
