-- StoxMate Phase 1 market-data foundation.
-- Existing market rows are explicitly classified as demo/unavailable so they
-- can never be mistaken for provider-backed values.

alter table if exists public.asx_companies
  add column if not exists data_provider text not null default 'legacy_demo',
  add column if not exists provider_timestamp timestamptz not null default now(),
  add column if not exists fetched_at timestamptz not null default now(),
  add column if not exists delay_classification text not null default 'demo',
  add column if not exists stale_status text not null default 'unavailable',
  add column if not exists license_tier text not null default 'personal_beta';

alter table if exists public.global_indices
  add column if not exists data_provider text not null default 'legacy_demo',
  add column if not exists provider_timestamp timestamptz not null default now(),
  add column if not exists fetched_at timestamptz not null default now(),
  add column if not exists delay_classification text not null default 'demo',
  add column if not exists stale_status text not null default 'unavailable',
  add column if not exists license_tier text not null default 'personal_beta';

alter table if exists public.crypto_assets
  add column if not exists data_provider text not null default 'legacy_demo',
  add column if not exists provider_timestamp timestamptz not null default now(),
  add column if not exists fetched_at timestamptz not null default now(),
  add column if not exists delay_classification text not null default 'demo',
  add column if not exists stale_status text not null default 'unavailable',
  add column if not exists license_tier text not null default 'personal_beta';

alter table if exists public.macro_indicators
  add column if not exists data_provider text not null default 'legacy_demo',
  add column if not exists provider_timestamp timestamptz not null default now(),
  add column if not exists fetched_at timestamptz not null default now(),
  add column if not exists delay_classification text not null default 'demo',
  add column if not exists stale_status text not null default 'unavailable',
  add column if not exists license_tier text not null default 'personal_beta';

create table if not exists public.instruments (
  id uuid primary key default gen_random_uuid(),
  canonical_symbol text not null unique,
  provider_symbol text,
  name text not null,
  asset_class text not null check (asset_class in ('EQUITY','INDEX','COMMODITY','FOREX','CRYPTO','ETF')),
  exchange text,
  mic text,
  currency text not null,
  region text,
  sector text,
  industry text,
  unit text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','UNAVAILABLE_PENDING_PROVIDER')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists instruments_asset_class_idx on public.instruments(asset_class);
create index if not exists instruments_exchange_idx on public.instruments(exchange);

create table if not exists public.market_quotes (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  price numeric(30,10) not null check (price > 0),
  previous_close numeric(30,10),
  open numeric(30,10),
  high numeric(30,10),
  low numeric(30,10),
  absolute_change numeric(30,10),
  percentage_change numeric(20,8),
  volume numeric(30,4),
  market_cap numeric(30,2) check (market_cap is null or market_cap >= 0),
  circulating_supply numeric(30,8),
  provider_timestamp timestamptz,
  fetched_at timestamptz not null,
  market_status text not null default 'UNKNOWN' check (market_status in ('PRE_MARKET','OPEN','POST_MARKET','CLOSED','UNKNOWN')),
  delay_minutes integer,
  delay_classification text not null,
  freshness_status text not null check (freshness_status in ('FRESH','DELAYED','STALE','UNAVAILABLE')),
  provider text not null,
  license_tier text not null default 'personal_beta' check (license_tier in ('personal_beta','commercial')),
  raw_payload_hash text,
  updated_at timestamptz not null default now(),
  constraint market_quotes_instrument_provider_uidx unique (instrument_id, provider)
);
create index if not exists market_quotes_freshness_idx on public.market_quotes(freshness_status);
create index if not exists market_quotes_fetched_at_idx on public.market_quotes(fetched_at);

create table if not exists public.market_quote_history (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  price numeric(30,10) not null,
  open numeric(30,10),
  high numeric(30,10),
  low numeric(30,10),
  close numeric(30,10),
  volume numeric(30,4),
  interval text not null default '1D',
  observed_at timestamptz not null,
  provider text not null,
  created_at timestamptz not null default now(),
  constraint market_quote_history_observation_uidx unique (instrument_id, provider, interval, observed_at)
);

create table if not exists public.company_fundamentals (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  market_cap numeric(30,2),
  pe_ratio numeric(20,8),
  forward_pe_ratio numeric(20,8),
  eps numeric(20,8),
  dividend_yield numeric(20,8),
  book_value numeric(30,10),
  revenue numeric(30,2),
  net_income numeric(30,2),
  fifty_two_week_high numeric(30,10),
  fifty_two_week_low numeric(30,10),
  reporting_period text,
  provider_timestamp timestamptz,
  fetched_at timestamptz not null,
  provider text not null,
  updated_at timestamptz not null default now(),
  constraint company_fundamentals_instrument_provider_uidx unique (instrument_id, provider)
);

create table if not exists public.data_providers (
  id serial primary key,
  code text not null unique,
  name text not null,
  asset_classes jsonb not null,
  is_enabled boolean not null default true,
  commercial_use_confirmed boolean not null default false,
  license_tier text not null default 'personal_beta',
  licence_notes text,
  attribution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  job_type text not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  status text not null check (status in ('RUNNING','SUCCESS','PARTIAL_SUCCESS','FAILED')),
  requested_count integer not null default 0,
  successful_count integer not null default 0,
  failed_count integer not null default 0,
  error_summary text,
  metadata jsonb
);
create index if not exists ingestion_runs_provider_started_idx on public.ingestion_runs(provider, started_at);

create table if not exists public.ingestion_errors (
  id uuid primary key default gen_random_uuid(),
  ingestion_run_id uuid not null references public.ingestion_runs(id) on delete cascade,
  provider text not null,
  instrument_id uuid references public.instruments(id) on delete set null,
  provider_symbol text,
  error_code text not null,
  error_message text not null,
  retryable boolean not null default false,
  raw_context jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ingestion_errors_run_idx on public.ingestion_errors(ingestion_run_id);

create table if not exists public.forex_rates (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  base_currency text not null,
  quote_currency text not null,
  rate numeric(30,10) not null check (rate > 0),
  previous_close numeric(30,10),
  daily_change_percent numeric(20,8),
  data_provider text not null,
  provider_timestamp timestamptz not null,
  fetched_at timestamptz not null,
  delay_classification text not null,
  stale_status text not null default 'fresh',
  license_tier text not null default 'commercial',
  constraint forex_rates_pair_provider_uidx unique (base_currency, quote_currency, data_provider)
);

-- These tables are only accessed by trusted server-side database connections.
alter table public.instruments enable row level security;
alter table public.market_quotes enable row level security;
alter table public.market_quote_history enable row level security;
alter table public.company_fundamentals enable row level security;
alter table public.data_providers enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.ingestion_errors enable row level security;
alter table public.forex_rates enable row level security;

revoke all on table public.instruments, public.market_quotes, public.market_quote_history,
  public.company_fundamentals, public.data_providers, public.ingestion_runs,
  public.ingestion_errors, public.forex_rates from anon, authenticated;
grant all on table public.instruments, public.market_quotes, public.market_quote_history,
  public.company_fundamentals, public.data_providers, public.ingestion_runs,
  public.ingestion_errors, public.forex_rates to service_role;
grant usage, select on sequence public.data_providers_id_seq to service_role;
