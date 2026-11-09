import { SitePage, PageHero, Section, CardGrid, Steps, FAQ, CTABand, Related, Note } from '../components/site/Page';
import { CTA, contactHref } from '../components/CTA';

export default function UKMarketEntry() {
  return (
    <SitePage>
      <PageHero
        eyebrow="UK Market Entry · Loop Retail"
        tag="For overseas brands"
        title={<><span className="font-light text-white/50">Sell in the UK</span><br />without building a UK team.</>}
        lead="The UK rewards brands that arrive prepared: tax set up, products compliant, listings written for UK shoppers and stock already here. We coordinate all of it and run the channels once you are live."
        ctas={<><CTA to={contactHref('strategy-call')} label="Plan your UK launch" tone="red" id="ukentry-hero" /><CTA to="/how-it-works" label="How we work" tone="outline-light" id="ukentry-hero-how" /></>}
        meta={[{ k: 'Launch plan', v: 'Channel by channel' }, { k: 'Stock', v: 'Held in the UK' }, { k: 'Listings', v: 'Written for UK search' }, { k: 'Protection', v: 'From day one' }]}
      />

      <Section eyebrow="The checklist" title={<>What has to be true<br />before the first sale.</>}
        lead="Every brand's list is different. These are the areas we work through with you and your advisers before anything goes live.">
        <CardGrid items={[
          { tag: '01 · Tax', title: 'UK VAT', body: 'Overseas sellers do not get the UK VAT threshold. Holding stock in the UK, including in Amazon warehouses, normally means registering before you sell. We work alongside your accountant so marketplace accounts and invoices match.' },
          { tag: '02 · Product', title: 'Safety, marking and labels', body: 'Products sold in Great Britain need the right conformity marking, UK contact details and English labelling for their category. We check your range and flag gaps before stock ships.' },
          { tag: '03 · Packaging', title: 'Packaging EPR', body: 'UK packaging rules sit with UK businesses. For overseas sellers on marketplaces the marketplace usually reports the packaging; a UK importer or partner may carry its own obligations. We help you work out which applies.' },
          { tag: '04 · Brand', title: 'Trademark and Brand Registry', body: 'A UK trademark (or one that covers the UK) unlocks Amazon Brand Registry, A+ content and enforcement. We plan the route and timing with your IP adviser.' },
          { tag: '05 · Listings', title: 'Written for UK shoppers', body: 'UK keyword research, British spelling, metric and imperial sizes, UK plugs and sizes called out, and images that answer UK questions.' },
          { tag: '06 · Stock', title: 'Freight, storage and FBA', body: 'Inbound freight planning, UK storage, FBA prep and first order quantities sized to demand rather than guesswork.' },
        ]} />
        <Note>This page is a general overview, not tax or legal advice. Rules change; we work alongside your accountant and legal advisers on the specifics for your products.</Note>
      </Section>

      <Section tone="dark" eyebrow="Launch path" title="From first call to first UK orders.">
        <Steps dark steps={[
          { title: 'Readiness review', body: 'Range, compliance, labelling, pricing and margin checked against UK channels. You get a clear list of what is ready and what is not.', time: 'Week 1' },
          { title: 'Channel plan', body: 'Which channel first (usually Amazon UK or a UK D2C store), which products, launch prices and first stock quantities.', time: 'Week 2' },
          { title: 'Set up', body: 'Accounts, listings, Brand Registry route, authorised seller list and minimum prices loaded into Loop Protect.', time: 'Weeks 2 to 4' },
          { title: 'Stock lands', body: 'Goods received in the UK, checked and prepped for FBA and direct orders.', time: 'Weeks 4 to 6' },
          { title: 'Launch and learn', body: 'Ads, reviews and pricing tuned weekly in the dashboard; next channels added once the first one proves demand.', time: 'Weeks 6 to 12' },
        ]} />
      </Section>

      <Section tone="off" eyebrow="Questions" title="UK entry FAQ">
        <FAQ items={[
          { q: 'Do we need a UK company?', a: 'Not always. Many overseas brands sell in the UK through their home company. Some choose a UK entity or a partner who buys and resells the stock. We walk through the options with your advisers.' },
          { q: 'Which channel should we start with?', a: 'Usually the one where UK shoppers already search for your category. For most consumer brands that is Amazon UK, with a UK D2C store alongside to own the customer relationship.' },
          { q: 'Can you hold our stock?', a: 'Yes. Stock is held in the UK and shipped to Amazon and to direct customers from the same place.' },
          { q: 'How do we stop grey stock from day one?', a: 'Load your authorised seller list and minimum prices into Loop Protect before launch, so any other seller on your listings is flagged from the first daily check.' },
        ]} />
      </Section>

      <CTABand title="Planning a UK launch?" body="Send us your range and target channels. We will come back with a readiness review and a first channel plan." topic="strategy-call" label="Plan your UK launch" />
      <Related links={[
        { to: '/marketplace-control', label: 'Marketplace Control', body: 'Running Amazon, TikTok Shop, eBay and Temu.' },
        { to: '/dtc-growth', label: 'DTC Growth', body: 'A UK direct store that feels local.' },
        { to: '/services', label: 'All services', body: 'Everything we run for brands.' },
      ]} />
    </SitePage>
  );
}
