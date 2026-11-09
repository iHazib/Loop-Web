import { SitePage, PageHero, Section, CardGrid, Steps, FAQ, CTABand, Related, Compare } from '../components/site/Page';
import { CTA, contactHref } from '../components/CTA';

export default function HowItWorks() {
  return (
    <SitePage>
      <PageHero
        eyebrow="How it works · Loop Retail"
        tag="Partnership models"
        title={<><span className="font-light text-white/50">You keep the brand.</span><br />We run the UK operation.</>}
        lead="Two ways to work with us, one onboarding process and one dashboard. You set the brand rules, prices and priorities; we run the day to day and report on it."
        ctas={<><CTA to={contactHref('strategy-call')} label="Book a strategy call" tone="red" id="how-hero" /><CTA to="/portal/demo/overview" label="See the dashboard" tone="outline-light" id="how-hero-demo" /></>}
      />

      <Section eyebrow="Partnership models" title={<>Two ways<br />to work together.</>}
        lead="The right model depends on how much of the UK operation you want to own. Many brands start with one and move to the other.">
        <CardGrid cols={2} items={[
          {
            tag: 'Model A', title: 'Authorised UK partner',
            body: 'We buy your stock at agreed trade terms and sell it on UK channels as your authorised partner. You get predictable orders and a single, clean seller on your listings.',
            points: ['We hold and fund UK stock', 'One authorised seller replaces many', 'Your price and brand rules apply', 'Protection built in from day one'],
          },
          {
            tag: 'Model B', title: 'Managed service',
            body: 'You keep selling on your own accounts and own the stock. We run listings, ads, protection and fulfilment for you on a monthly fee.',
            points: ['Your accounts, your stock', 'We operate them day to day', 'UK fulfilment available', 'Pick the services you need'],
          },
        ]} />
        <div className="mt-10">
          <Compare
            columns={['Authorised UK partner', 'Managed service']}
            rows={[
              { label: 'Who owns the stock in the UK', cells: ['Loop Retail', 'You'] },
              { label: 'Whose seller account', cells: ['Ours, as your authorised partner', 'Yours'] },
              { label: 'How we are paid', cells: ['Margin on agreed trade terms', 'Monthly fee'] },
              { label: 'Who sets prices and brand rules', cells: ['You', 'You'] },
              { label: 'Brand Dashboard and Loop Protect', cells: [true, true] },
              { label: 'Best for', cells: ['Brands new to the UK or with grey stock problems', 'Brands already selling with their own accounts'] },
            ]}
          />
        </div>
      </Section>

      <Section tone="dark" eyebrow="Onboarding" title="The first 30 days.">
        <Steps dark steps={[
          { title: 'Discovery call', body: 'Your products, channels, margins and what is going wrong today.', time: 'Day 1' },
          { title: 'Audit and opportunity map', body: 'Sellers, prices, listings, stock and compliance reviewed across UK channels. You get a short written plan.', time: 'Days 2 to 10' },
          { title: 'Agreement', body: 'Partnership model, services, minimum prices, authorised sellers and reporting cadence agreed.', time: 'Days 10 to 14' },
          { title: 'Set up', body: 'Dashboard logins for your team, products imported, protection rules live, stock plan agreed.', time: 'Days 14 to 21' },
          { title: 'Go live', body: 'Listings and ads live or taken over, stock flowing, first weekly report.', time: 'Days 21 to 30' },
        ]} />
      </Section>

      <Section eyebrow="Reporting rhythm" title="What you get, and when.">
        <CardGrid cols={3} items={[
          { tag: 'Daily', title: 'Live dashboard', body: 'Rank, price, sellers and protection cases update every day. Your team can log in any time.' },
          { tag: 'Weekly', title: 'Operations update', body: 'Sales by channel, ads, stock cover and the actions taken on open protection cases.' },
          { tag: 'Monthly', title: 'Review call', body: 'Growth, margin, competitor moves and the plan for next month, agreed together.' },
        ]} />
      </Section>

      <Section tone="off" eyebrow="What we need from you" title="Your side of the partnership.">
        <CardGrid cols={4} items={[
          { title: 'Product data', body: 'ASINs or barcodes, costs, RRPs and minimum prices.' },
          { title: 'Brand rules', body: 'Who is authorised to sell, approved content and pricing guidelines.' },
          { title: 'Access', body: 'Brand Registry user access for enforcement, and ad accounts if we run them.' },
          { title: 'One contact', body: 'A named person who can approve content, prices and enforcement quickly.' },
        ]} />
      </Section>

      <Section eyebrow="Questions" title="Partnership FAQ">
        <FAQ items={[
          { q: 'Which brands are a good fit?', a: 'Brands with products that sell well online and real UK demand, or a clear reason to expect it. Tell us about your range and we will be honest about fit.' },
          { q: 'Do you work with brands outside the UK?', a: 'Yes. Most of our work is with overseas brands entering or growing in the UK. See the UK market entry page for what that involves.' },
          { q: 'Can we start with one service?', a: 'Yes. Brand protection or a single marketplace are common starting points. Everything runs on the same dashboard, so adding services later is simple.' },
          { q: 'What happens if we stop?', a: 'You keep your listings, your data exports and your brand accounts. In the partner model we agree how remaining stock is handled up front.' },
          { q: 'How are terms set?', a: 'Terms are agreed per brand once the audit shows what the work involves, with regular review points built in.' },
        ]} />
      </Section>

      <CTABand title="Let's map your UK opportunity." body="One call. We will tell you honestly which model fits, which channels to start with and what to fix first." topic="strategy-call" />
      <Related links={[
        { to: '/services', label: 'Services', body: 'Everything we run for brands.' },
        { to: '/tools', label: 'Tools', body: 'Dashboard, Loop Protect and competitor analysis.' },
        { to: '/uk-market-entry', label: 'UK market entry', body: 'For overseas brands launching in the UK.' },
      ]} />
    </SitePage>
  );
}
