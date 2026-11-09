/* Shared types for the brand portal (server + client). */

export const CHANNELS = ['Amazon', 'TikTok Shop', 'eBay', 'Temu', 'D2C', 'Wholesale'] as const;
export type Channel = (typeof CHANNELS)[number];

export interface Brand {
  id: string;
  name: string;
  plan: string;
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
}

export interface PortalEvent {
  at: string; // ISO
  source: string;
  message: string;
  level: 'ok' | 'warn' | 'info';
}

/** Everything the metric functions need for one brand. */
export interface Dataset {
  brand: Brand;
  products: Product[];
  sales: SalesRow[];
  ads: AdsRow[];
  sellers: AuthorisedSeller[];
  competitors: CompetitorLink[];
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
  grey_market: 'Grey market signal',
};
