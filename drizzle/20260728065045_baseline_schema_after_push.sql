-- Baseline generated after the live schema was synchronised with drizzle-kit push.
-- IF NOT EXISTS makes this migration safe for that database while preserving a
-- complete Drizzle snapshot for fresh databases and all future generated diffs.
CREATE TABLE IF NOT EXISTS "ai_chat_queries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"query_text" text NOT NULL,
	"ai_response" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"company_ticker" text,
	"company_name" text,
	"category" text NOT NULL,
	"impact_level" text NOT NULL,
	"sentiment" text NOT NULL,
	"image_url" text,
	"news_type" text DEFAULT 'TOP_NEWS' NOT NULL,
	"international_link" text,
	"what_happened" jsonb NOT NULL,
	"why_it_matters" text NOT NULL,
	"implications" jsonb NOT NULL,
	"what_to_watch" jsonb NOT NULL,
	"evidence" jsonb NOT NULL,
	"ai_confidence" integer NOT NULL,
	"ai_confidence_reason" text NOT NULL,
	"uncertainties" jsonb NOT NULL,
	"is_morning_briefing" boolean DEFAULT false NOT NULL,
	"read_time_minutes" integer DEFAULT 3 NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"bookmarks_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asx_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" text NOT NULL,
	"name" text NOT NULL,
	"sector" text NOT NULL,
	"industry" text NOT NULL,
	"market_cap" text NOT NULL,
	"market_cap_val" real NOT NULL,
	"current_price" real NOT NULL,
	"daily_change" real NOT NULL,
	"daily_change_percent" real NOT NULL,
	"pe_ratio" real NOT NULL,
	"dividend_yield" real NOT NULL,
	"analyst_consensus" text NOT NULL,
	"ai_confidence_score" integer NOT NULL,
	"fair_value" real NOT NULL,
	"health_score" integer NOT NULL,
	"valuation_score" integer NOT NULL,
	"future_growth_score" integer NOT NULL,
	"dividend_score" integer NOT NULL,
	"past_performance_score" integer NOT NULL,
	"description" text NOT NULL,
	"logo_url" text,
	"last_ai_analysis_at" timestamp DEFAULT now() NOT NULL,
	"data_provider" text DEFAULT 'legacy_demo' NOT NULL,
	"provider_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delay_classification" text DEFAULT 'demo' NOT NULL,
	"stale_status" text DEFAULT 'unavailable' NOT NULL,
	"license_tier" text DEFAULT 'personal_beta' NOT NULL,
	CONSTRAINT "asx_companies_ticker_unique" UNIQUE("ticker")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company_fundamentals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"market_cap" numeric(30, 2),
	"pe_ratio" numeric(20, 8),
	"forward_pe_ratio" numeric(20, 8),
	"eps" numeric(20, 8),
	"dividend_yield" numeric(20, 8),
	"book_value" numeric(30, 10),
	"revenue" numeric(30, 2),
	"net_income" numeric(30, 2),
	"fifty_two_week_high" numeric(30, 10),
	"fifty_two_week_low" numeric(30, 10),
	"reporting_period" text,
	"provider_timestamp" timestamp with time zone,
	"fetched_at" timestamp with time zone NOT NULL,
	"provider" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crypto_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"asset_type" text NOT NULL,
	"current_price_aud" real NOT NULL,
	"daily_change_percent" real NOT NULL,
	"market_cap" text NOT NULL,
	"market_cap_val" real NOT NULL,
	"volatility_30d" real NOT NULL,
	"correlation_asx200" real NOT NULL,
	"correlation_gold" real NOT NULL,
	"correlation_nasdaq" real NOT NULL,
	"risk_level" text NOT NULL,
	"ai_confidence_score" integer NOT NULL,
	"asx_access_route" text NOT NULL,
	"ai_thesis" text NOT NULL,
	"ai_risk_note" text NOT NULL,
	"regulatory_note" text NOT NULL,
	"image_url" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"data_provider" text DEFAULT 'legacy_demo' NOT NULL,
	"provider_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delay_classification" text DEFAULT 'demo' NOT NULL,
	"stale_status" text DEFAULT 'unavailable' NOT NULL,
	"license_tier" text DEFAULT 'personal_beta' NOT NULL,
	CONSTRAINT "crypto_assets_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"asset_classes" jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"commercial_use_confirmed" boolean DEFAULT false NOT NULL,
	"license_tier" text DEFAULT 'personal_beta' NOT NULL,
	"licence_notes" text,
	"attribution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "data_providers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forex_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"base_currency" text NOT NULL,
	"quote_currency" text NOT NULL,
	"rate" numeric(30, 10) NOT NULL,
	"previous_close" numeric(30, 10),
	"daily_change_percent" numeric(20, 8),
	"data_provider" text NOT NULL,
	"provider_timestamp" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	"delay_classification" text NOT NULL,
	"stale_status" text DEFAULT 'fresh' NOT NULL,
	"license_tier" text DEFAULT 'commercial' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "global_indices" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" text NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL,
	"current_value" text NOT NULL,
	"numeric_value" real NOT NULL,
	"daily_change" real NOT NULL,
	"daily_change_percent" real NOT NULL,
	"status" text NOT NULL,
	"ai_asx_impact_summary" text NOT NULL,
	"affected_asx_tickers" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"data_provider" text DEFAULT 'legacy_demo' NOT NULL,
	"provider_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delay_classification" text DEFAULT 'demo' NOT NULL,
	"stale_status" text DEFAULT 'unavailable' NOT NULL,
	"license_tier" text DEFAULT 'personal_beta' NOT NULL,
	CONSTRAINT "global_indices_ticker_unique" UNIQUE("ticker")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingestion_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ingestion_run_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"instrument_id" uuid,
	"provider_symbol" text,
	"error_code" text NOT NULL,
	"error_message" text NOT NULL,
	"retryable" boolean DEFAULT false NOT NULL,
	"raw_context" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"job_type" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"status" text NOT NULL,
	"requested_count" integer DEFAULT 0 NOT NULL,
	"successful_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"error_summary" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "instruments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canonical_symbol" text NOT NULL,
	"provider_symbol" text,
	"name" text NOT NULL,
	"asset_class" text NOT NULL,
	"exchange" text,
	"mic" text,
	"currency" text NOT NULL,
	"region" text,
	"sector" text,
	"industry" text,
	"unit" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instruments_canonical_symbol_unique" UNIQUE("canonical_symbol")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "macro_indicators" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"current_value" text NOT NULL,
	"numeric_value" real NOT NULL,
	"change" text NOT NULL,
	"trend" text NOT NULL,
	"ai_implication_for_asx" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"data_provider" text DEFAULT 'legacy_demo' NOT NULL,
	"provider_timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delay_classification" text DEFAULT 'demo' NOT NULL,
	"stale_status" text DEFAULT 'unavailable' NOT NULL,
	"license_tier" text DEFAULT 'personal_beta' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "market_quote_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"price" numeric(30, 10) NOT NULL,
	"open" numeric(30, 10),
	"high" numeric(30, 10),
	"low" numeric(30, 10),
	"close" numeric(30, 10),
	"volume" numeric(30, 4),
	"interval" text DEFAULT '1D' NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"provider" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "market_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument_id" uuid NOT NULL,
	"price" numeric(30, 10) NOT NULL,
	"previous_close" numeric(30, 10),
	"open" numeric(30, 10),
	"high" numeric(30, 10),
	"low" numeric(30, 10),
	"absolute_change" numeric(30, 10),
	"percentage_change" numeric(20, 8),
	"volume" numeric(30, 4),
	"market_cap" numeric(30, 2),
	"circulating_supply" numeric(30, 8),
	"provider_timestamp" timestamp with time zone,
	"fetched_at" timestamp with time zone NOT NULL,
	"market_status" text DEFAULT 'UNKNOWN' NOT NULL,
	"delay_minutes" integer,
	"delay_classification" text NOT NULL,
	"freshness_status" text NOT NULL,
	"provider" text NOT NULL,
	"license_tier" text DEFAULT 'personal_beta' NOT NULL,
	"raw_payload_hash" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "portfolio_holdings" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"company_ticker" text NOT NULL,
	"asset_class" text DEFAULT 'EQUITY' NOT NULL,
	"asset_name" text,
	"notes" text,
	"shares_count" real NOT NULL,
	"average_buy_price" real NOT NULL,
	"current_price" real NOT NULL,
	"total_value" real NOT NULL,
	"gain_loss_val" real NOT NULL,
	"gain_loss_percent" real NOT NULL,
	"weight_percent" real NOT NULL,
	"ai_risk_flag" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"total_value" real NOT NULL,
	"day_change_val" real NOT NULL,
	"day_change_percent" real NOT NULL,
	"total_gain_val" real NOT NULL,
	"total_gain_percent" real NOT NULL,
	"annual_dividend_income" real NOT NULL,
	"portfolio_risk_score" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scenario_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"probability" integer NOT NULL,
	"summary" text NOT NULL,
	"affected_sectors" jsonb NOT NULL,
	"top_stock_beneficiaries" jsonb NOT NULL,
	"top_stock_risks" jsonb NOT NULL,
	"detailed_analysis" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"avatar_url" text,
	"subscription_tier" text DEFAULT 'TRIAL' NOT NULL,
	"trial_days_remaining" integer DEFAULT 28 NOT NULL,
	"investor_profile" text DEFAULT 'Long-Term Growth' NOT NULL,
	"risk_tolerance" text DEFAULT 'Moderate' NOT NULL,
	"onboarding_completed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watchlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"watchlist_id" integer NOT NULL,
	"company_ticker" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"alert_on_price_change_percent" real DEFAULT 3,
	"alert_on_insider_trading" boolean DEFAULT true,
	"alert_on_earnings" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watchlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "company_fundamentals_instrument_provider_uidx" ON "company_fundamentals" USING btree ("instrument_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "forex_rates_pair_provider_uidx" ON "forex_rates" USING btree ("base_currency","quote_currency","data_provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ingestion_errors_run_idx" ON "ingestion_errors" USING btree ("ingestion_run_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ingestion_runs_provider_started_idx" ON "ingestion_runs" USING btree ("provider","started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "instruments_asset_class_idx" ON "instruments" USING btree ("asset_class");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "instruments_exchange_idx" ON "instruments" USING btree ("exchange");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "market_quote_history_observation_uidx" ON "market_quote_history" USING btree ("instrument_id","provider","interval","observed_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "market_quotes_instrument_provider_uidx" ON "market_quotes" USING btree ("instrument_id","provider");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "market_quotes_freshness_idx" ON "market_quotes" USING btree ("freshness_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "market_quotes_fetched_at_idx" ON "market_quotes" USING btree ("fetched_at");
