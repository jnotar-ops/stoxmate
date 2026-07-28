import { createHash } from "node:crypto";
import { calculateFreshnessStatus } from "./freshness";
import { calculateMarketStatus } from "./market-status";
import type { InstrumentDefinition, NormalisedMarketQuote, ProviderInstrumentError } from "./types";
import {
  assertPlausibleQuote,
  calculatePercentageChange,
  coinGeckoMarketSchema,
  twelveDataApiErrorSchema,
  twelveDataQuoteSchema,
} from "./validation";

export type MappingResult =
  | { record: NormalisedMarketQuote; error?: never }
  | { record?: never; error: ProviderInstrumentError };

const malformed = (instrument: InstrumentDefinition, message: string): MappingResult => ({
  error: {
    providerSymbol: instrument.providerSymbol,
    code: "MALFORMED_PAYLOAD",
    message,
    retryable: false,
  },
});

export function mapTwelveDataQuote(
  raw: unknown,
  instrument: InstrumentDefinition,
  fetchedAt: Date,
): MappingResult {
  const apiError = twelveDataApiErrorSchema.safeParse(raw);
  if (apiError.success && raw && typeof raw === "object" && ("status" in raw || "code" in raw)) {
    return {
      error: {
        providerSymbol: instrument.providerSymbol,
        code: apiError.data.code === 401 ? "INVALID_API_KEY" : "PROVIDER_RESPONSE_ERROR",
        message: apiError.data.message,
        retryable: apiError.data.code === 429,
      },
    };
  }
  const parsed = twelveDataQuoteSchema.safeParse(raw);
  if (!parsed.success) return malformed(instrument, parsed.error.issues.map((issue) => issue.message).join("; "));
  const quote = parsed.data;
  const returnedSymbol = quote.symbol.toUpperCase();
  if (
    returnedSymbol !== instrument.canonicalSymbol &&
    returnedSymbol !== instrument.providerSymbol?.toUpperCase().split(":")[0]
  ) {
    return {
      error: {
        providerSymbol: instrument.providerSymbol,
        code: "SYMBOL_MISMATCH",
        message: `Requested ${instrument.providerSymbol}, received ${quote.symbol}`,
        retryable: false,
      },
    };
  }
  if (quote.currency.toUpperCase() !== instrument.currency.toUpperCase()) {
    return {
      error: {
        providerSymbol: instrument.providerSymbol,
        code: "CURRENCY_MISMATCH",
        message: `Expected ${instrument.currency}, received ${quote.currency}`,
        retryable: false,
      },
    };
  }
  const calculated = calculatePercentageChange(quote.close, quote.previous_close);
  const percentageChange = quote.percent_change ?? calculated.percentageChange;
  assertPlausibleQuote(quote.close, null, percentageChange);
  const providerTimestamp = quote.last_quote_at || quote.timestamp
    ? new Date((quote.last_quote_at ?? quote.timestamp)! * 1_000)
    : null;
  const delayClassification = instrument.exchange === "ASX" ? "delayed_15_20min" as const : "end_of_day" as const;
  const record: NormalisedMarketQuote = {
    canonicalSymbol: instrument.canonicalSymbol,
    providerSymbol: instrument.providerSymbol!,
    assetClass: instrument.assetClass,
    price: quote.close,
    currency: quote.currency.toUpperCase(),
    previousClose: quote.previous_close,
    open: quote.open,
    high: quote.high,
    low: quote.low,
    volume: quote.volume,
    absoluteChange: quote.change ?? calculated.absoluteChange,
    percentageChange,
    marketCap: null,
    circulatingSupply: null,
    providerTimestamp,
    fetchedAt,
    provider: "twelve_data",
    delayMinutes: instrument.exchange === "ASX" ? 20 : null,
    delayClassification,
    marketStatus: instrument.exchange === "ASX"
      ? calculateMarketStatus(fetchedAt)
      : quote.is_market_open ? "OPEN" : "CLOSED",
    freshnessStatus: "FRESH",
    licenseTier: "personal_beta",
    rawPayloadHash: createHash("sha256").update(JSON.stringify(raw)).digest("hex"),
  };
  record.freshnessStatus = calculateFreshnessStatus(record);
  return { record };
}

export function mapCoinGeckoMarket(
  raw: unknown,
  instrument: InstrumentDefinition,
  fetchedAt: Date,
): MappingResult {
  const parsed = coinGeckoMarketSchema.safeParse(raw);
  if (!parsed.success) {
    const result = malformed(instrument, parsed.error.issues.map((issue) => issue.message).join("; "));
    if (raw === undefined && result.error) result.error.code = "UNSUPPORTED_SYMBOL";
    return result;
  }
  if (parsed.data.id !== instrument.providerSymbol) {
    return {
      error: {
        providerSymbol: instrument.providerSymbol,
        code: "SYMBOL_MISMATCH",
        message: `Requested ${instrument.providerSymbol}, received ${parsed.data.id}`,
        retryable: false,
      },
    };
  }
  assertPlausibleQuote(parsed.data.current_price, parsed.data.market_cap, parsed.data.price_change_percentage_24h);
  const record: NormalisedMarketQuote = {
    canonicalSymbol: instrument.canonicalSymbol,
    providerSymbol: parsed.data.id,
    assetClass: "CRYPTO",
    price: parsed.data.current_price,
    currency: "AUD",
    previousClose: null,
    open: null,
    high: parsed.data.high_24h,
    low: parsed.data.low_24h,
    volume: parsed.data.total_volume,
    absoluteChange: parsed.data.price_change_24h,
    percentageChange: parsed.data.price_change_percentage_24h,
    marketCap: parsed.data.market_cap,
    circulatingSupply: parsed.data.circulating_supply,
    providerTimestamp: new Date(parsed.data.last_updated),
    fetchedAt,
    provider: "coingecko",
    delayMinutes: 0,
    delayClassification: "real_time",
    marketStatus: "OPEN",
    freshnessStatus: "FRESH",
    licenseTier: "commercial",
    rawPayloadHash: createHash("sha256").update(JSON.stringify(raw)).digest("hex"),
  };
  record.freshnessStatus = calculateFreshnessStatus(record);
  return { record };
}
