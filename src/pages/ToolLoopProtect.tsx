import { SitePage, PageHero, Section, CardGrid, Steps, FAQ, CTABand, Related, Note } from '../components/site/Page';
import { CTA, contactHref } from '../components/CTA';

const rules = [
  { tag: 'Rule 1 · High', title: 'Unauthorised seller', body: 'A seller on your listing who is not on your authorised list. We record who they are, their price, whether they ship through Amazon and when they first appeared.' },
  { tag: 'Rule 2 · Medium to high', title: 'Price below minimum', body: 'An unauthorised seller under your minimum price. The case shows the gap in pounds and percent. Authorised resellers are never flagged on price.' },
  { tag: 'Rule 3 · High', title: 'Buy Box lost', body: 'The Buy Box is held by a seller who is not authorised, so your own offer is not the one shoppers see.' },
  { tag: 'Rule 4 · Medium', title: 'Seller count spike', body: 'Three or more new offers on a product within seven days, usually the first sign of a grey stock drop.' },
  { tag: 'Rule 5 · High', title: 'Listing changed', body: 'Your title, brand field or images changed since yesterday. Before and after are saved as evidence.' },
  { tag: 'Rule 6 · Review', title: 'Grey market signal', body: 'A score built from several signals: unauthorised, deep discount, new to the listing with FBA stock, overseas seller, price near your cost. High scores go to review and a test buy.' },
];

export default function ToolLoopProtect() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Tools · Loop Protect"
        tag="Amazon UK · daily"
        title={<><span className="font-light text-white/50">See the signal.</span><br />Verify the facts. Act.</>}
        lead="Loop Protect checks every seller on your Amazon UK listings each day. When something breaks your rules it opens a case with the evidence, so your team or ours can act the same day."
        ctas={<><CTA to={contactHref('brand-protection')} label="Get a free seller scan" tone="red" id="protect-hero" /><CTA to="/portal/demo/protection" label="See it in the demo" tone="outline-light" id="protect-hero-demo" /></>}
        meta={[{ k: 'Checks', v: 'Daily' }, { k: 'Rules', v: 'Six' }, { k: 'Evidence', v: 'Saved per case' }, { k: 'Coverage', v: 'Amazon UK' }]}
      />

      <Section eyebrow="What it watches" title={<>Six rules.<br />Each one opens a case.</>}
        lead="Rules run against your own authorised seller list and minimum prices. Until that list exists, sellers are shown but not flagged, so you are never flooded with false alarms.">
        <CardGrid items={rules} />
      </Section>

      <Section tone="dark" eyebrow="From alert to resolved" title="Every case follows the same path.">
        <Steps dark steps={[
          { title: 'Flagged', body: 'A rule fires. The case records the seller, price, fulfilment method, listing and the date, plus the data that triggered it.', time: 'Same day' },
          { title: 'Reviewed', body: 'Your manager or our team checks the evidence. New authorised partners are cleared; real problems move forward.', time: 'Within 1 day' },
          { title: 'Action', body: 'Seller contact, test buy, Amazon Report a Violation through Brand Registry, or a cease and desist letter. Each action is logged on the case.', time: 'Days 1 to 7' },
          { title: 'Resolved', body: 'When the seller leaves the listing, the next daily check closes the case automatically and records it.', time: 'Automatic' },
        ]} />
      </Section>

      <Section tone="off" eyebrow="Honest limits" title="What it can and cannot see.">
        <CardGrid cols={2} items={[
          { title: 'What the data shows', body: 'Who is selling, at what price, through FBA or not, who holds the Buy Box, how many offers there are and how the listing has changed.', points: ['Seller names, ratings and country where available', '30 and 90 day price and rank history', 'Daily snapshots kept as evidence'] },
          { title: 'What needs a person', body: 'No data source shows where a seller bought their stock or whether it is genuine. That is why grey market cases go to review and a test buy, never straight to enforcement.', points: ['Test buys: batch codes, packaging, language', 'Supply route investigation', 'Legal letters through your counsel'] },
        ]} />
        <Note>Coverage today is Amazon UK through Keepa market data. Other marketplaces are covered by our team's manual checks and the reports you receive from them. Minimum price alerts are only raised for sellers who are not authorised: in the UK, pressuring authorised resellers on resale prices can breach competition law.</Note>
      </Section>

      <Section eyebrow="Questions" title="Loop Protect FAQ">
        <FAQ items={[
          { q: 'Do we need Amazon Brand Registry?', a: 'Monitoring works without it. Enforcement through Amazon (Report a Violation) needs Brand Registry, and we can add our team as users on your account or help you get registered.' },
          { q: 'How quickly are new sellers spotted?', a: 'Checks run once a day, so a new seller normally appears in a case within 24 hours.' },
          { q: 'Will it flag our own distributors?', a: 'Not once they are on your authorised seller list. You can limit each one to specific products and set an end date.' },
          { q: 'What happens to resolved cases?', a: 'They stay in the history with every note and action, which helps if the same seller returns or a legal route is needed.' },
        ]} />
      </Section>

      <CTABand title="Find out who is selling your products." body="Send us your ASINs. We will list every seller on them, who looks unauthorised and where prices are below your minimum." topic="brand-protection" label="Get a free seller scan" />
      <Related links={[
        { to: '/brand-protection', label: 'Brand Protection service', body: 'Enforcement, test buys and reseller programmes.' },
        { to: '/tools/brand-dashboard', label: 'Brand Dashboard', body: 'Where Loop Protect cases appear.' },
        { to: '/tools/competitor-analysis', label: 'Competitor Analysis', body: 'Lookalikes and compatible copies.' },
      ]} />
    </SitePage>
  );
}
