export const ASSET_CLASSES = ["EQUITY", "INDEX", "COMMODITY", "FOREX", "CRYPTO", "ETF"] as const;
export const MARKET_STATUSES = ["PRE_MARKET", "OPEN", "POST_MARKET", "CLOSED", "UNKNOWN"] as const;
export const FRESHNESS_STATUSES = ["FRESH", "DELAYED", "STALE", "UNAVAILABLE"] as const;
export const DELAY_CLASSIFICATIONS = [
  "real_time",
  "delayed_15_20min",
  "end_of_day",
  "reference_rate",
  "unavailable",
  "demo",
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number];
export type MarketStatus = (typeof MARKET_STATUSES)[number];
export type FreshnessStatus = (typeof FRESHNESS_STATUSES)[number];
export type DelayClassification = (typeof DELAY_CLASSIFICATIONS)[number];
export type LicenseTier = "personal_beta" | "commercial";

/**
 * Decimal values cross process/database boundaries as strings. Consumers may
 * render them as numbers, but calculations must use Decimal or PostgreSQL
 * numeric rather than binary floating point.
 */
export interface NormalisedMarketQuote {
  canonicalSymbol: string;
  providerSymbol: string;
  assetClass: AssetClass;
  price: string;
  currency: string;
  previousClose: string | null;
  open: string | null;
  high: string | null;
  low: string | null;
  volume: string | null;
  absoluteChange: string | null;
  percentageChange: string | null;
  marketCap: string | null;
  circulatingSupply: string | null;
  providerTimestamp: Date | null;
  fetchedAt: Date;
  provider: string;
  delayMinutes: number | null;
  delayClassification: DelayClassification;
  marketStatus: MarketStatus;
  freshnessStatus: FreshnessStatus;
  licenseTier: LicenseTier;
  rawPayloadHash: string | null;
}

export interface NormalisedFundamentals {
  canonicalSymbol: string;
  marketCap: string | null;
  peRatio: string | null;
  forwardPeRatio: string | null;
  eps: string | null;
  dividendYield: string | null;
  bookValue: string | null;
  revenue: string | null;
  netIncome: string | null;
  fiftyTwoWeekHigh: string | null;
  fiftyTwoWeekLow: string | null;
  reportingPeriod: string | null;
  providerTimestamp: Date | null;
  fetchedAt: Date;
  provider: string;
}

export interface InstrumentDefinition {
  canonicalSymbol: string;
  providerSymbol: string | null;
  name: string;
  assetClass: AssetClass;
  exchange?: string;
  mic?: string;
  currency: string;
  region?: string;
  sector?: string;
  industry?: string;
  unit?: string;
  status?: "ACTIVE" | "UNAVAILABLE_PENDING_PROVIDER";
}

export interface ProviderHealth {
  provider: string;
  status: "healthy" | "degraded" | "unavailable";
  checkedAt: Date;
  message?: string;
}

export interface ProviderBatchResult<T> {
  records: T[];
  errors: ProviderInstrumentError[];
}

export interface ProviderInstrumentError {
  providerSymbol: string | null;
  code: string;
  message: string;
  retryable: boolean;
  context?: Record<string, unknown>;
}

export interface MarketDataProvider {
  readonly code: string;
  getEquityQuotes(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>>;
  getEquityFundamentals(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedFundamentals>>;
  getIndices(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>>;
  getCommodities(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>>;
  getForex(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>>;
  getMarketStatus(exchange: string): Promise<MarketStatus>;
  healthCheck(): Promise<ProviderHealth>;
}

export interface CryptoDataProvider {
  readonly code: string;
  getCryptoQuotes(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>>;
  getCryptoMarketData(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>>;
  healthCheck(): Promise<ProviderHealth>;
}

export interface ForexDataProvider {
  readonly code: string;
  getForex(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>>;
  healthCheck(): Promise<ProviderHealth>;
}
