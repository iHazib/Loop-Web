-- Brand portal tables. Run once in the Supabase SQL editor.
-- All access goes through the server with the service_role key, so RLS stays on with no policies.

create table if not exists portal_brands (
  id text primary key,
  name text not null,
  plan text default '',
  created_at timestamptz default now()
);

create table if not exists portal_products (
  brand_id text references portal_brands(id) on delete cascade,
  sku text not null,
  name text not null,
  asin text default '',
  ean text default '',
  cost numeric default 0,
  rrp numeric default 0,
  map_price numeric default 0,
  primary key (brand_id, sku)
);

create table if not exists portal_sales (
  brand_id text references portal_brands(id) on delete cascade,
  week_start date not null,
  channel text not null,
  sku text not null,
  units integer default 0,
  revenue numeric default 0,
  returns integer default 0,
  fees numeric default 0,
  stock integer default 0,
  primary key (brand_id, week_start, channel, sku)
);

create table if not exists portal_ads (
  brand_id text references portal_brands(id) on delete cascade,
  week_start date not null,
  channel text not null,
  campaign text not null,
  campaign_type text default '',
  spend numeric default 0,
  impressions integer default 0,
  clicks integer default 0,
  orders integer default 0,
  ad_sales numeric default 0,
  primary key (brand_id, week_start, channel, campaign)
);

create table if not exists portal_sellers (
  brand_id text references portal_brands(id) on delete cascade,
  seller_name text not null,
  amazon_seller_id text default '',
  ebay_username text default '',
  skus text default 'All',
  valid_until date,
  primary key (brand_id, seller_name)
);

create table if not exists portal_competitors (
  brand_id text references portal_brands(id) on delete cascade,
  sku text not null,
  asin text not null,
  kind text not null check (kind in ('competitor', 'compatible')),
  source text not null default 'manual',
  created_at timestamptz default now(),
  primary key (brand_id, sku, asin)
);

-- One Keepa reading per ASIN per day, shared across brands.
create table if not exists portal_keepa_snapshots (
  asin text not null,
  day date not null,
  data jsonb not null,
  primary key (asin, day)
);

create table if not exists portal_cases (
  id text primary key,
  brand_id text references portal_brands(id) on delete cascade,
  type text not null,
  status text not null,
  asin text default '',
  seller_id text default '',
  opened_at timestamptz not null,
  updated_at timestamptz not null,
  data jsonb not null
);
create index if not exists portal_cases_brand on portal_cases (brand_id, status);

create table if not exists portal_events (
  id bigserial primary key,
  brand_id text references portal_brands(id) on delete cascade,
  at timestamptz not null default now(),
  source text not null,
  message text not null,
  level text not null default 'info'
);
create index if not exists portal_events_brand on portal_events (brand_id, at desc);

-- Brand management fields (staff admin)
alter table portal_brands add column if not exists status text not null default 'onboarding';
alter table portal_brands add column if not exists account_manager text default '';
alter table portal_brands add column if not exists account_manager_email text default '';
alter table portal_brands add column if not exists contact_email text default '';
alter table portal_brands add column if not exists notes text default '';

-- Weekly D2C store figures
create table if not exists portal_d2c (
  brand_id text references portal_brands(id) on delete cascade,
  week_start date not null,
  sessions integer default 0,
  orders integer default 0,
  revenue numeric default 0,
  new_customers integer default 0,
  returning_customers integer default 0,
  refunds integer default 0,
  primary key (brand_id, week_start)
);
alter table portal_d2c enable row level security;

-- Client accounts (brand logins)
create table if not exists portal_users (
  email text primary key,
  name text default '',
  password_hash text,
  last_login timestamptz,
  created_at timestamptz default now()
);
create table if not exists portal_user_brands (
  email text references portal_users(email) on delete cascade,
  brand_id text references portal_brands(id) on delete cascade,
  role text not null default 'viewer' check (role in ('manager', 'viewer')),
  primary key (email, brand_id)
);
create table if not exists portal_invites (
  token_hash text primary key,
  email text not null,
  brand_id text references portal_brands(id) on delete cascade,
  role text not null default 'viewer',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

-- Keepa seller names / ratings, shared across brands
create table if not exists portal_keepa_sellers (
  seller_id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table portal_users enable row level security;
alter table portal_user_brands enable row level security;
alter table portal_invites enable row level security;
alter table portal_keepa_sellers enable row level security;
alter table portal_brands enable row level security;
alter table portal_products enable row level security;
alter table portal_sales enable row level security;
alter table portal_ads enable row level security;
alter table portal_sellers enable row level security;
alter table portal_competitors enable row level security;
alter table portal_keepa_snapshots enable row level security;
alter table portal_cases enable row level security;
alter table portal_events enable row level security;
