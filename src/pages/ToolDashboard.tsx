import { SitePage, PageHero, Section, CardGrid, Steps, FAQ, CTABand, Related, Compare } from '../components/site/Page';
import { CTA, contactHref } from '../components/CTA';

const tabs = [
  { tag: 'Tab 1', title: 'Overview', body: 'GMV, units, margin after fees and ad spend, sell through, TACoS, average BSR and a risk index, with the change against the previous four weeks.' },
  { tag: 'Tab 2', title: 'Channels', body: 'Amazon, TikTok Shop, eBay, Temu, D2C and wholesale side by side: revenue, units, average selling price, returns and growth by product.' },
  { tag: 'Tab 3', title: 'Protection', body: 'Every seller on your listings, who is authorised, open cases with evidence and the action taken on each one.' },
  { tag: 'Tab 4', title: 'Brand Analysis', body: 'Search any product: BSR and price against its competitors over 90 days, price position, compatible products and the fastest climbing rivals.' },
  { tag: 'Tab 5', title: 'Ads', body: 'Spend, ad sales, ROAS, ACoS and TACoS across Amazon, TikTok, eBay, Google and Meta, with campaigns over your target flagged.' },
  { tag: 'Tab 6', title: 'Logistics and Distribution', body: 'Stock by location, weeks of cover, reorder alerts, wholesale sales and the UK demand evidence retail buyers ask for.' },
];

export default function ToolDashboard() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Tools · Brand Dashboard"
        tag="Included for every client"
        title={<><span className="font-light text-white/50">Your UK business,</span><br />on one screen.</>}
        lead="Sales, margin, ads, stock, rank, price and protection across every channel. Updated daily, available to your team with their own logins."
        ctas={<><CTA to="/portal/demo/overview" label="Open the live demo" tone="red" id="dash-hero-demo" /><CTA to={contactHref('dashboard-demo')} label="Get a free brand report" tone="outline-light" id="dash-hero-report" /></>}
        meta={[{ k: 'Tabs', v: 'Six views' }, { k: 'Market data', v: 'Daily from Keepa' }, { k: 'Your data', v: 'Weekly sheet' }, { k: 'Access', v: 'Manager and viewer logins' }]}
      />

      <Section eyebrow="What you see" title={<>Six views.<br />Every channel.</>}
        lead="Each tab answers one question a brand owner asks every week. Click any number to see what is behind it.">
        <CardGrid items={tabs} />
      </Section>

      <Section tone="dark" eyebrow="Ask it anything" title={<>Questions in plain English.<br />Answers from your data.</>}
        lead="The built in AI search reads your dashboard, not the internet. Every answer links to the tab with the detail.">
        <CardGrid dark cols={2} items={[
          { title: '"Which products lost the Buy Box this week?"', body: 'Lists the products, who holds the Buy Box now and the open protection case for each.' },
          { title: '"Where are competitors cheaper than us?"', body: 'Shows the products where a direct competitor undercuts you, by how much, and their rank trend.' },
          { title: '"Which channel grew fastest this month?"', body: 'Compares revenue growth across channels and points to the products driving it.' },
          { title: '"Which campaigns are over target ACoS?"', body: 'Lists the campaigns, their spend and what the overspend cost over the period.' },
        ]} />
      </Section>

      <Section tone="off" eyebrow="Where every number comes from" title="Clear sources. No black box.">
        <Compare highlight={-1}
          columns={['Source', 'Updated', 'Covers']}
          rows={[
            { label: 'Rank, price, Buy Box, sellers, reviews', cells: ['Keepa market data (Amazon UK)', 'Daily', 'Your products and tracked competitors'] },
            { label: 'Sales by channel, returns, stock', cells: ['Your weekly sheet', 'Weekly', 'Amazon, TikTok Shop, eBay, Temu, D2C, wholesale'] },
            { label: 'Ad spend and ad sales', cells: ['Your weekly sheet from each ad platform', 'Weekly', 'Amazon, TikTok, eBay, Google, Meta'] },
            { label: 'Costs and minimum prices', cells: ['You, edited in the dashboard', 'When they change', 'Margin and price alerts'] },
            { label: 'Authorised sellers', cells: ['You, uploaded once', 'When it changes', 'Protection alerts'] },
          ]}
        />
      </Section>

      <Section eyebrow="Getting started" title="Live in a week.">
        <Steps steps={[
          { title: 'Send your ASINs', body: 'Paste them into the dashboard. Product names, barcodes and RRPs fill in from Keepa automatically.', time: 'Day 1' },
          { title: 'Add costs and minimum prices', body: 'Edit them straight in the products table so margin and price alerts are accurate.', time: 'Day 1' },
          { title: 'Upload your authorised sellers', body: 'Seller alerts switch on as soon as the list is in, so you are never flooded with false alarms.', time: 'Day 2' },
          { title: 'Upload last 12 weeks of sales and ads', body: 'From a simple template. Bad rows are rejected with the reason, so you can fix and re upload.', time: 'Days 2 to 5' },
          { title: 'Invite your team', body: 'Managers can upload and edit. Viewers can only look. Everyone sees only your brand.', time: 'Day 5' },
        ]} />
      </Section>

      <Section tone="off" eyebrow="Questions" title="Dashboard FAQ">
        <FAQ items={[
          { q: 'Do we need to connect our Seller Central account?', a: 'No. Market data comes from Keepa and your own figures come from a weekly sheet, so nothing needs access to your accounts to get started. Direct account connections can be added later.' },
          { q: 'Can other brands see our data?', a: 'No. Every login is tied to one brand. Clients only ever see their own brand, and access can be removed instantly.' },
          { q: 'Which marketplaces does the market data cover?', a: 'Keepa covers Amazon UK, which is where most rank, price and seller data matters. Your sales on TikTok Shop, eBay, Temu, D2C and wholesale come from your weekly sheet.' },
          { q: 'How accurate are the AI answers?', a: 'The AI only reads the figures already in your dashboard and links to the tab it used. It is a fast way to find things, and the tab is always the source of truth.' },
          { q: 'Is it included or extra?', a: 'The dashboard is included for every brand we work with. Ask us about stand alone access if you only need the data.' },
        ]} />
      </Section>

      <CTABand title="See your own numbers in it." body="Send us your ASINs and we will load them into the dashboard so you can see your sellers, prices and competitors first." topic="dashboard-demo" label="Get a free brand report" secondary={{ to: '/portal/demo/overview', label: 'Open the demo' }} />
      <Related links={[
        { to: '/tools/loop-protect', label: 'Loop Protect', body: 'How seller and price alerts work.' },
        { to: '/tools/competitor-analysis', label: 'Competitor Analysis', body: 'Tracking rivals and compatible copies.' },
        { to: '/services', label: 'Services', body: 'What our team runs for you.' },
      ]} />
    </SitePage>
  );
}
