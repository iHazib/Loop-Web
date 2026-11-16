import { CTA, contactHref } from '../components/CTA';
import { SitePage, PageHero, Section, CardGrid, Steps, Split, CTABand, Related } from '../components/site/Page';
import { MoreThanSaas } from '../components/home/MoreThanSaas';

/* About: who we are, what we believe, how the pieces fit. No invented history or headcount. */

export default function About() {
  return (
    <SitePage>
      <PageHero
        eyebrow="About Loopretail"
        title="An operating partner for brands selling in the UK."
        lead="We connect marketplaces, brand protection, fulfilment, direct stores and retail into one operation, so a brand can grow in the UK without losing control of its price, its sellers or its customers."
        ctas={<><CTA to={contactHref('strategy-call')} label="Talk to us" id="about-hero" /><CTA to="/how-it-works" label="How we work" tone="outline-dark" id="about-how" /></>}
        image="aisle"
        imageAlt="Warehouse staff walking down a long aisle"
      />

      <Section tone="panel">
        <Split
          image="forklift"
          imageAlt="Two warehouse staff checking stock in an aisle"
          eyebrow="What we believe"
          title="Brands do not only want sales. They want control."
          body={<>
            <p>More sellers and lower prices can lift sales for a quarter and damage a brand for years. Retail partners lose margin, reviews fill with complaints about old or wrong stock, and the brand owner stops knowing who sells what.</p>
            <p>We grow sales through one accountable operator, with the price, the listings and the stock under the brand's rules.</p>
          </>}
        />
      </Section>

      <Section eyebrow="One operating model" title="Five capabilities, run on the same stock and data.">
        <CardGrid cols={3} items={[
          { title: 'Marketplace Control', body: 'Pricing, listings, sellers and stock across every marketplace.', href: '/marketplace-control' },
          { title: 'Brand Protection', body: 'Unauthorised sellers, grey market stock and counterfeits caught before they cost trust.', href: '/brand-protection' },
          { title: 'Retail Expansion', body: 'Find where the brand wins in UK retail and get it buyer ready.', href: '/retail-expansion' },
          { title: 'DTC Growth', body: 'A UK direct channel: store, stock, fulfilment and returns.', href: '/dtc-growth' },
          { title: 'Fulfilment', body: 'Stock, pick, pack, dispatch and returns from one UK operation.', href: '/services' },
          { title: 'Reporting', body: 'One dashboard and a weekly report across all of it.', href: '/tools/brand-dashboard' },
        ]} />
      </Section>

      <MoreThanSaas />

      <Section tone="panel" eyebrow="How we grow a brand" title="Controlled growth, in four moves.">
        <Steps steps={[
          { title: 'Map the market', body: 'Who sells the brand today, at what price, on which channels.' },
          { title: 'Take control', body: 'One authorised operator, clean listings and a minimum price.' },
          { title: 'Protect', body: 'Daily checks, evidence and enforcement against anyone breaking the rules.' },
          { title: 'Scale what works', body: 'More channels and retail, using the data from the first ones.' },
        ]} />
      </Section>

      <CTABand title="Grow the market. Keep control of it." body="Tell us about your brand and where it sells today. We will show you what control would change." topic="strategy-call" label="Talk to us" />
      <Related links={[
        { to: '/services', label: 'Services', body: 'Everything we run for brands.' },
        { to: '/tools', label: 'Tools', body: 'Dashboard, Loop Protect and competitor analysis.' },
        { to: '/blog', label: 'Blog', body: 'Notes on UK marketplaces and protection.' },
      ]} />
    </SitePage>
  );
}
