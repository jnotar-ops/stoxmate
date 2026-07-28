import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  real,
  jsonb,
  numeric,
  uuid,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  subscriptionTier: text("subscription_tier").notNull().default("TRIAL"), // 'TRIAL' | 'FOUNDING_MEMBER' | 'PRO' | 'EXPIRED'
  trialDaysRemaining: integer("trial_days_remaining").notNull().default(28),
  investorProfile: text("investor_profile").notNull().default("Long-Term Growth"), // e.g. 'Long-Term Growth', 'Dividend Income', 'Capital Preservation', 'Balanced'
  riskTolerance: text("risk_tolerance").notNull().default("Moderate"), // 'Low', 'Moderate', 'High'
  onboardingCompleted: boolean("onboarding_completed").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const asxCompanies = pgTable("asx_companies", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull().unique(), // e.g. 'BHP', 'CBA', 'CSL', 'WBC', 'NAB', 'WDS', 'FMG', 'PLS', 'REA', 'WES'
  name: text("name").notNull(),
  sector: text("sector").notNull(), // e.g. 'Materials', 'Financials', 'Health Care', 'Energy', 'Information Technology'
  industry: text("industry").notNull(),
  marketCap: text("market_cap").notNull(), // e.g. '$214.5B'
  marketCapVal: real("market_cap_val").notNull(), // in billions for sorting
  currentPrice: real("current_price").notNull(), // AUD
  dailyChange: real("daily_change").notNull(),
  dailyChangePercent: real("daily_change_percent").notNull(),
  peRatio: real("pe_ratio").notNull(),
  dividendYield: real("dividend_yield").notNull(), // percentage e.g. 5.4%
  analystConsensus: text("analyst_consensus").notNull(), // 'Strong Buy', 'Buy', 'Hold', 'Underweight'
  aiConfidenceScore: integer("ai_confidence_score").notNull(), // 0 to 100
  fairValue: real("fair_value").notNull(), // AI fair value estimate AUD
  
  // Snowflake 5-dimension health scores (Inspired by Simply Wall St & Morningstar)
  healthScore: integer("health_score").notNull(), // 0-100 Balance Sheet Health
  valuationScore: integer("valuation_score").notNull(), // 0-100 Value vs Price
  futureGrowthScore: integer("future_growth_score").notNull(), // 0-100 Earnings Growth Outlook
  dividendScore: integer("dividend_score").notNull(), // 0-100 Dividend Sustainability & Yield
  pastPerformanceScore: integer("past_performance_score").notNull(), // 0-100 Track Record
  
  description: text("description").notNull(),
  logoUrl: text("logo_url"),
  lastAiAnalysisAt: timestamp("last_ai_analysis_at").defaultNow().notNull(),
  dataProvider: text("data_provider").notNull().default("legacy_demo"),
  providerTimestamp: timestamp("provider_timestamp", { withTimezone: true }).notNull().defaultNow(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  delayClassification: text("delay_classification").notNull().default("demo"),
  staleStatus: text("stale_status").notNull().default("unavailable"),
  licenseTier: text("license_tier").notNull().default("personal_beta"),
});

export const globalIndices = pgTable("global_indices", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull().unique(), // e.g. 'DOW', 'S&P 500', 'NIKKEI 225', 'NYMEX WTI', 'BRENT', 'GOLD', 'HANG SENG', 'FTSE 100', 'ASX 200'
  name: text("name").notNull(), // 'Dow Jones Industrial Avg', 'Nikkei 225 Index', 'NYMEX Crude Oil Futures'
  region: text("region").notNull(), // 'US / Americas', 'Asia-Pacific', 'Commodity Markets', 'Europe', 'Australia'
  currentValue: text("current_value").notNull(), // e.g. '42,310.50', '39,450.20', '$78.40/bbl'
  numericValue: real("numeric_value").notNull(),
  dailyChange: real("daily_change").notNull(), // point change e.g. +310.50 or -1.20
  dailyChangePercent: real("daily_change_percent").notNull(), // +0.74%
  status: text("status").notNull(), // 'Closed (Overnight)', 'Live Trading', 'Pre-Market'
  aiAsxImpactSummary: text("ai_asx_impact_summary").notNull(), // Direct bridge: Why does this international Index move local ASX stocks today?
  affectedAsxTickers: jsonb("affected_asx_tickers").notNull(), // Array e.g. ['BHP', 'WDS', 'CBA']
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dataProvider: text("data_provider").notNull().default("legacy_demo"),
  providerTimestamp: timestamp("provider_timestamp", { withTimezone: true }).notNull().defaultNow(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  delayClassification: text("delay_classification").notNull().default("demo"),
  staleStatus: text("stale_status").notNull().default("unavailable"),
  licenseTier: text("license_tier").notNull().default("personal_beta"),
});

export const cryptoAssets = pgTable("crypto_assets", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(), // 'BTC', 'ETH', 'SOL', 'XRP', 'VBTC', 'EBTC', 'DCC'
  name: text("name").notNull(), // 'Bitcoin', 'Ethereum', 'VanEck Bitcoin ETF'
  assetType: text("asset_type").notNull(), // 'Digital Asset' | 'ASX Listed Crypto ETF' | 'ASX Listed Crypto Equity'
  currentPriceAud: real("current_price_aud").notNull(),
  dailyChangePercent: real("daily_change_percent").notNull(),
  marketCap: text("market_cap").notNull(), // '$2.4T AUD'
  marketCapVal: real("market_cap_val").notNull(), // billions AUD for sorting
  volatility30d: real("volatility_30d").notNull(), // annualised % e.g. 48.2
  correlationAsx200: real("correlation_asx200").notNull(), // -1.0 to 1.0
  correlationGold: real("correlation_gold").notNull(), // -1.0 to 1.0
  correlationNasdaq: real("correlation_nasdaq").notNull(), // -1.0 to 1.0
  riskLevel: text("risk_level").notNull(), // 'Very High' | 'High' | 'Moderate'
  aiConfidenceScore: integer("ai_confidence_score").notNull(), // 0-100 data quality/confidence
  asxAccessRoute: text("asx_access_route").notNull(), // How an Australian investor gains regulated exposure
  aiThesis: text("ai_thesis").notNull(), // Evidence-based observation (not advice)
  aiRiskNote: text("ai_risk_note").notNull(),
  regulatoryNote: text("regulatory_note").notNull(), // AUSTRAC / ATO CGT / ASIC framing
  imageUrl: text("image_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dataProvider: text("data_provider").notNull().default("legacy_demo"),
  providerTimestamp: timestamp("provider_timestamp", { withTimezone: true }).notNull().defaultNow(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  delayClassification: text("delay_classification").notNull().default("demo"),
  staleStatus: text("stale_status").notNull().default("unavailable"),
  licenseTier: text("license_tier").notNull().default("personal_beta"),
});

export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  companyTicker: text("company_ticker"), // Ticker like 'BHP' or null if Macro/Sector
  companyName: text("company_name"),
  category: text("category").notNull(), // 'ASX Announcement' | 'Earnings Report' | 'Macroeconomic Event' | 'Analyst Consensus' | 'Insider Trading' | 'Sector Movement' | 'International Market Driver'
  impactLevel: text("impact_level").notNull(), // 'Critical' | 'High' | 'Medium' | 'Low'
  sentiment: text("sentiment").notNull(), // 'Bullish' | 'Bearish' | 'Neutral'
  
  // Media & Categorization improvements (Bloomberg & editorial style)
  imageUrl: text("image_url"), // High-resolution photo asset URL
  newsType: text("news_type").notNull().default("TOP_NEWS"), // 'TOP_NEWS' | 'LATEST_NEWS' | 'MORNING_BRIEFING'
  internationalLink: text("international_link"), // How this connects global markets to local Australian stocks
  
  // The 7 Mandatory Core Questions from the Development Brief
  whatHappened: jsonb("what_happened").notNull(), // Array of strings or structured object
  whyItMatters: text("why_it_matters").notNull(),
  implications: jsonb("implications").notNull(), // { shortTerm: string, longTerm: string, cashflowImpact: string }
  whatToWatch: jsonb("what_to_watch").notNull(), // Array of specific trigger points & dates
  evidence: jsonb("evidence").notNull(), // Array of { source: string, metric: string, detail: string }
  aiConfidence: integer("ai_confidence").notNull(), // 0-100
  aiConfidenceReason: text("ai_confidence_reason").notNull(),
  uncertainties: jsonb("uncertainties").notNull(), // Array of unknown variables / risks
  
  isMorningBriefing: boolean("is_morning_briefing").notNull().default(false),
  readTimeMinutes: integer("read_time_minutes").notNull().default(3),
  likesCount: integer("likes_count").notNull().default(0),
  bookmarksCount: integer("bookmarks_count").notNull().default(0),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(), // e.g. 'Core Dividend Portfolio', 'Battery & Transition Tech'
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchlistItems = pgTable("watchlist_items", {
  id: serial("id").primaryKey(),
  watchlistId: integer("watchlist_id").notNull(),
  companyTicker: text("company_ticker").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  alertOnPriceChangePercent: real("alert_on_price_change_percent").default(3.0),
  alertOnInsiderTrading: boolean("alert_on_insider_trading").default(true),
  alertOnEarnings: boolean("alert_on_earnings").default(true),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(), // e.g. 'SMSF Growth Portfolio', 'Personal Trading'
  totalValue: real("total_value").notNull(), // AUD
  dayChangeVal: real("day_change_val").notNull(),
  dayChangePercent: real("day_change_percent").notNull(),
  totalGainVal: real("total_gain_val").notNull(),
  totalGainPercent: real("total_gain_percent").notNull(),
  annualDividendIncome: real("annual_dividend_income").notNull(),
  portfolioRiskScore: integer("portfolio_risk_score").notNull(), // 0-100 AI calculated risk
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull(),
  companyTicker: text("company_ticker").notNull(),
  assetClass: text("asset_class").notNull().default("EQUITY"), // 'EQUITY' | 'CRYPTO' | 'ETF'
  assetName: text("asset_name"), // Display name e.g. 'BHP Group Limited' or 'Bitcoin'
  notes: text("notes"), // Optional user note e.g. 'DRP enabled', 'Long-term hold'
  sharesCount: real("shares_count").notNull(),
  averageBuyPrice: real("average_buy_price").notNull(),
  currentPrice: real("current_price").notNull(),
  totalValue: real("total_value").notNull(),
  gainLossVal: real("gain_loss_val").notNull(),
  gainLossPercent: real("gain_loss_percent").notNull(),
  weightPercent: real("weight_percent").notNull(), // Percentage of total portfolio
  aiRiskFlag: text("ai_risk_flag"), // e.g. 'High Iron Ore Concentration', 'Dividend Cut Risk'
});

export const macroIndicators = pgTable("macro_indicators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g. 'RBA Cash Rate', 'AUD / USD', 'Iron Ore ($/t)', 'Australian CPI Inflation', 'Gold ($/oz)', 'Lithium Carbonate ($/t)'
  category: text("category").notNull(), // 'Monetary', 'Currency', 'Commodities', 'Inflation'
  currentValue: text("current_value").notNull(), // e.g. '4.35%', '$0.6542', '$102.50/t', '2.8%'
  numericValue: real("numeric_value").notNull(),
  change: text("change").notNull(), // e.g. 'Unchanged', '+0.42%', '+$1.80'
  trend: text("trend").notNull(), // 'Rising', 'Falling', 'Stable', 'Volatile'
  aiImplicationForAsx: text("ai_implication_for_asx").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dataProvider: text("data_provider").notNull().default("legacy_demo"),
  providerTimestamp: timestamp("provider_timestamp", { withTimezone: true }).notNull().defaultNow(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  delayClassification: text("delay_classification").notNull().default("demo"),
  staleStatus: text("stale_status").notNull().default("unavailable"),
  licenseTier: text("license_tier").notNull().default("personal_beta"),
});

/**
 * Canonical market-data tables. These are server-owned and intentionally do
 * not carry presentation strings or provider-specific response structures.
 */
export const instruments = pgTable("instruments", {
  id: uuid("id").defaultRandom().primaryKey(),
  canonicalSymbol: text("canonical_symbol").notNull().unique(),
  providerSymbol: text("provider_symbol"),
  name: text("name").notNull(),
  assetClass: text("asset_class").notNull(),
  exchange: text("exchange"),
  mic: text("mic"),
  currency: text("currency").notNull(),
  region: text("region"),
  sector: text("sector"),
  industry: text("industry"),
  unit: text("unit"),
  status: text("status").notNull().default("ACTIVE"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("instruments_asset_class_idx").on(table.assetClass),
  index("instruments_exchange_idx").on(table.exchange),
]);

export const marketQuotes = pgTable("market_quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  instrumentId: uuid("instrument_id").notNull().references(() => instruments.id, { onDelete: "cascade" }),
  price: numeric("price", { precision: 30, scale: 10 }).notNull(),
  previousClose: numeric("previous_close", { precision: 30, scale: 10 }),
  open: numeric("open", { precision: 30, scale: 10 }),
  high: numeric("high", { precision: 30, scale: 10 }),
  low: numeric("low", { precision: 30, scale: 10 }),
  absoluteChange: numeric("absolute_change", { precision: 30, scale: 10 }),
  percentageChange: numeric("percentage_change", { precision: 20, scale: 8 }),
  volume: numeric("volume", { precision: 30, scale: 4 }),
  marketCap: numeric("market_cap", { precision: 30, scale: 2 }),
  circulatingSupply: numeric("circulating_supply", { precision: 30, scale: 8 }),
  providerTimestamp: timestamp("provider_timestamp", { withTimezone: true }),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
  marketStatus: text("market_status").notNull().default("UNKNOWN"),
  delayMinutes: integer("delay_minutes"),
  delayClassification: text("delay_classification").notNull(),
  freshnessStatus: text("freshness_status").notNull(),
  provider: text("provider").notNull(),
  licenseTier: text("license_tier").notNull().default("personal_beta"),
  rawPayloadHash: text("raw_payload_hash"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("market_quotes_instrument_provider_uidx").on(table.instrumentId, table.provider),
  index("market_quotes_freshness_idx").on(table.freshnessStatus),
  index("market_quotes_fetched_at_idx").on(table.fetchedAt),
]);

export const marketQuoteHistory = pgTable("market_quote_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  instrumentId: uuid("instrument_id").notNull().references(() => instruments.id, { onDelete: "cascade" }),
  price: numeric("price", { precision: 30, scale: 10 }).notNull(),
  open: numeric("open", { precision: 30, scale: 10 }),
  high: numeric("high", { precision: 30, scale: 10 }),
  low: numeric("low", { precision: 30, scale: 10 }),
  close: numeric("close", { precision: 30, scale: 10 }),
  volume: numeric("volume", { precision: 30, scale: 4 }),
  interval: text("interval").notNull().default("1D"),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  provider: text("provider").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("market_quote_history_observation_uidx").on(
    table.instrumentId,
    table.provider,
    table.interval,
    table.observedAt,
  ),
]);

export const companyFundamentals = pgTable("company_fundamentals", {
  id: uuid("id").defaultRandom().primaryKey(),
  instrumentId: uuid("instrument_id").notNull().references(() => instruments.id, { onDelete: "cascade" }),
  marketCap: numeric("market_cap", { precision: 30, scale: 2 }),
  peRatio: numeric("pe_ratio", { precision: 20, scale: 8 }),
  forwardPeRatio: numeric("forward_pe_ratio", { precision: 20, scale: 8 }),
  eps: numeric("eps", { precision: 20, scale: 8 }),
  dividendYield: numeric("dividend_yield", { precision: 20, scale: 8 }),
  bookValue: numeric("book_value", { precision: 30, scale: 10 }),
  revenue: numeric("revenue", { precision: 30, scale: 2 }),
  netIncome: numeric("net_income", { precision: 30, scale: 2 }),
  fiftyTwoWeekHigh: numeric("fifty_two_week_high", { precision: 30, scale: 10 }),
  fiftyTwoWeekLow: numeric("fifty_two_week_low", { precision: 30, scale: 10 }),
  reportingPeriod: text("reporting_period"),
  providerTimestamp: timestamp("provider_timestamp", { withTimezone: true }),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
  provider: text("provider").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("company_fundamentals_instrument_provider_uidx").on(table.instrumentId, table.provider),
]);

export const dataProviders = pgTable("data_providers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  assetClasses: jsonb("asset_classes").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  commercialUseConfirmed: boolean("commercial_use_confirmed").notNull().default(false),
  licenseTier: text("license_tier").notNull().default("personal_beta"),
  licenceNotes: text("licence_notes"),
  attribution: text("attribution"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ingestionRuns = pgTable("ingestion_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").notNull(),
  jobType: text("job_type").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  status: text("status").notNull(),
  requestedCount: integer("requested_count").notNull().default(0),
  successfulCount: integer("successful_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  errorSummary: text("error_summary"),
  metadata: jsonb("metadata"),
}, (table) => [
  index("ingestion_runs_provider_started_idx").on(table.provider, table.startedAt),
]);

export const ingestionErrors = pgTable("ingestion_errors", {
  id: uuid("id").defaultRandom().primaryKey(),
  ingestionRunId: uuid("ingestion_run_id").notNull().references(() => ingestionRuns.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  instrumentId: uuid("instrument_id").references(() => instruments.id, { onDelete: "set null" }),
  providerSymbol: text("provider_symbol"),
  errorCode: text("error_code").notNull(),
  errorMessage: text("error_message").notNull(),
  retryable: boolean("retryable").notNull().default(false),
  rawContext: jsonb("raw_context"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("ingestion_errors_run_idx").on(table.ingestionRunId),
]);

export const forexRates = pgTable("forex_rates", {
  id: uuid("id").defaultRandom().primaryKey(),
  instrumentId: uuid("instrument_id").notNull().references(() => instruments.id, { onDelete: "cascade" }),
  baseCurrency: text("base_currency").notNull(),
  quoteCurrency: text("quote_currency").notNull(),
  rate: numeric("rate", { precision: 30, scale: 10 }).notNull(),
  previousClose: numeric("previous_close", { precision: 30, scale: 10 }),
  dailyChangePercent: numeric("daily_change_percent", { precision: 20, scale: 8 }),
  dataProvider: text("data_provider").notNull(),
  providerTimestamp: timestamp("provider_timestamp", { withTimezone: true }).notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
  delayClassification: text("delay_classification").notNull(),
  staleStatus: text("stale_status").notNull().default("fresh"),
  licenseTier: text("license_tier").notNull().default("commercial"),
}, (table) => [
  uniqueIndex("forex_rates_pair_provider_uidx").on(table.baseCurrency, table.quoteCurrency, table.dataProvider),
]);

export const scenarioModels = pgTable("scenario_models", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // e.g. 'RBA 50bps Rate Cut by Q3 2026'
  category: text("category").notNull(), // 'Monetary Policy', 'China Economy', 'Commodity Supercycle', 'Energy Transition'
  probability: integer("probability").notNull(), // 0-100 percentage estimate by AI
  summary: text("summary").notNull(),
  affectedSectors: jsonb("affected_sectors").notNull(), // Array of { sector: string, impact: 'Positive' | 'Negative' | 'Mixed', reasoning: string }
  topStockBeneficiaries: jsonb("top_stock_beneficiaries").notNull(), // Array of tickers e.g. ['REA', 'WES', 'CBA']
  topStockRisks: jsonb("top_stock_risks").notNull(), // Array of tickers e.g. ['QAN', 'WDS']
  detailedAnalysis: text("detailed_analysis").notNull(),
});

export const aiChatQueries = pgTable("ai_chat_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  queryText: text("query_text").notNull(),
  aiResponse: jsonb("ai_response").notNull(), // Structured answer with summary, evidence, confidence, tickers
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
