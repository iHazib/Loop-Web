/* Shared types for the brand portal (server + client). */

export const CHANNELS = ['Amazon', 'TikTok Shop', 'eBay', 'Temu', 'D2C', 'Wholesale'] as const;
export type Channel = (typeof CHANNELS)[number];

export const BRAND_STATUSES = ['onboarding', 'active', 'paused', 'churned'] as const;
export type BrandStatus = (typeof BRAND_STATUSES)[number];

export interface Brand {
  id: string;
  name: string;
  plan: string;
  status?: BrandStatus;
  accountManager?: string; // name of the Loopretail contact
  accountManagerEmail?: string;
  contactEmail?: string; // main contact at the brand
  notes?: string; // staff only
  createdAt?: string;
}

export interface Product {
  sku: string;
  name: string;
  asin: string;
  ean: string;
  cost: number; // £ per unit
  rrp: number; // £
  mapPrice: number; // £ minimum price used for protection alerts
}

export interface SalesRow {
  weekStart: string; // YYYY-MM-DD (Monday)
  channel: Channel;
  sku: string;
  units: number;
  revenue: number; // £ inc VAT
  returns: number; // units
  fees: number; // £
  stock: number; // units on hand at week end
}

export interface AdsRow {
  weekStart: string;
  channel: string; // Amazon / TikTok / eBay / Temu / Google / Meta
  campaign: string;
  campaignType: string;
  spend: number;
  impressions: number;
  clicks: number;
  orders: number;
  adSales: number;
}

export interface AuthorisedSeller {
  sellerName: string;
  amazonSellerId: string;
  ebayUsername: string;
  skus: string; // "All" or "SKU1;SKU2"
  validUntil: string; // YYYY-MM-DD or ''
}

export interface CompetitorLink {
  sku: string; // our product
  asin: string; // their product
  kind: 'competitor' | 'compatible';
  source: 'auto' | 'manual';
  createdAt: string; // YYYY-MM-DD
}

export interface Offer {
  sellerId: string;
  sellerName?: string;
  price: number | null; // £ inc shipping
  isFBA: boolean;
  isAmazon: boolean;
  condition: string;
  country?: string; // seller country if known
}

/** Amazon EU marketplaces checked for grey market price gaps. */
export const EU_MARKETS = ['DE', 'FR', 'IT', 'ES'] as const;
export type EuMarket = (typeof EU_MARKETS)[number];
export interface EuPrice {
  market: EuMarket;
  price: number | null; // € (Buy Box or lowest new)
  gbp: number | null; // converted at the configured EUR to GBP rate
}

/** One Keepa reading of one ASIN on one day. */
export interface KeepaSnapshot {
  asin: string;
  day: string; // YYYY-MM-DD
  title: string;
  brand: string;
  images: string;
  bsr: number | null;
  bsrAvg30: number | null;
  bsrAvg90: number | null;
  price: number | null; // Buy Box (or lowest new) £
  priceAvg30: number | null;
  priceAvg90: number | null;
  buyBoxSellerId: string | null;
  offerCount: number | null;
  offers: Offer[];
  monthlySold: number | null;
  rating: number | null;
  reviews: number | null;
  eu?: EuPrice[]; // same ASIN on Amazon DE / FR / IT / ES (own ASINs only)
}

export type CaseType =
  | 'unauthorised_seller'
  | 'price_below_min'
  | 'buybox_lost'
  | 'seller_spike'
  | 'listing_changed'
  | 'grey_market';
export type CaseStatus = 'flagged' | 'reviewing' | 'clear' | 'resolved';
export type Severity = 'high' | 'medium' | 'low';

export interface CaseAction {
  at: string;
  by: string;
  note: string;
}

/** A test buy logged against a case: what arrived and what it shows. */
export const TEST_BUY_VERDICTS = ['uk_stock', 'grey_stock', 'counterfeit', 'unclear'] as const;
export type TestBuyVerdict = (typeof TEST_BUY_VERDICTS)[number];
export interface TestBuy {
  id: string;
  at: string; // logged at
  by: string;
  orderedOn: string; // YYYY-MM-DD
  receivedOn: string; // YYYY-MM-DD or ''
  packaging: string; // e.g. "German and French labels, no UK importer address"
  batchCode: string;
  notes: string;
  verdict: TestBuyVerdict;
}
export const VERDICT_LABELS: Record<TestBuyVerdict, string> = {
  uk_stock: 'UK stock',
  grey_stock: 'Grey market stock',
  counterfeit: 'Counterfeit',
  unclear: 'Unclear',
};

export interface ProtectionCase {
  id: string;
  type: CaseType;
  severity: Severity;
  status: CaseStatus;
  channel: string;
  asin: string;
  sku: string;
  sellerId: string;
  title: string;
  detail: string;
  evidence: Record<string, unknown>;
  openedAt: string;
  updatedAt: string;
  actions: CaseAction[];
  testBuys?: TestBuy[];
}

export interface PortalEvent {
  at: string; // ISO
  source: string;
  message: string;
  level: 'ok' | 'warn' | 'info';
}

/** Everything the metric functions need for one brand. */
/** Weekly D2C store figures (Shopify / WooCommerce / GA4 exports). */
export interface D2cRow {
  weekStart: string;
  sessions: number;
  orders: number;
  revenue: number; // £ inc VAT
  newCustomers: number;
  returningCustomers: number;
  refunds: number; // refunded orders
}

export interface Dataset {
  brand: Brand;
  products: Product[];
  sales: SalesRow[];
  ads: AdsRow[];
  sellers: AuthorisedSeller[];
  competitors: CompetitorLink[];
  d2c: D2cRow[];
  snapshots: KeepaSnapshot[];
  cases: ProtectionCase[];
  events: PortalEvent[];
}

export const CASE_LABELS: Record<CaseType, string> = {
  unauthorised_seller: 'Unauthorised seller',
  price_below_min: 'Price below minimum',
  buybox_lost: 'Buy Box lost',
  seller_spike: 'Seller count spike',
  listing_changed: 'Listing changed',
  grey_market: 'Grey market stock',
};

/** Plain English definitions shown in the portal, reports and on the site. */
export const CASE_HELP: Partial<Record<CaseType, string>> = {
  unauthorised_seller: 'Someone who bought your stock, from you or one of your resellers, and sells it on Amazon without being on your authorised list.',
  grey_market: 'Stock brought in from Europe or elsewhere and sold in the UK without your permission.',
  price_below_min: 'An unauthorised seller is pricing below your minimum.',
  buybox_lost: 'A seller who is not authorised holds the Buy Box on your listing.',
  seller_spike: 'Several new sellers joined your listing within a week.',
  listing_changed: 'The title, brand or images on your listing were changed.',
};
