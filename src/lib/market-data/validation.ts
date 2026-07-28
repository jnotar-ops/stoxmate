import Decimal from "decimal.js";
import { z } from "zod";

export const decimalValueSchema = z.union([z.string(), z.number()]).transform((value, context) => {
  try {
    const decimal = new Decimal(value);
    if (!decimal.isFinite()) throw new Error("not finite");
    return decimal.toString();
  } catch {
    context.addIssue({ code: "custom", message: "Expected a finite decimal value" });
    return z.NEVER;
  }
});

export const nullableDecimalValueSchema = z
  .union([decimalValueSchema, z.null(), z.undefined()])
  .transform((value) => value ?? null);

export const twelveDataQuoteSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().optional(),
  exchange: z.string().optional(),
  mic_code: z.string().optional(),
  currency: z.string().min(3),
  datetime: z.string().optional(),
  timestamp: z.number().int().positive().optional(),
  last_quote_at: z.number().int().positive().optional(),
  open: nullableDecimalValueSchema,
  high: nullableDecimalValueSchema,
  low: nullableDecimalValueSchema,
  close: decimalValueSchema,
  volume: nullableDecimalValueSchema,
  previous_close: nullableDecimalValueSchema,
  change: nullableDecimalValueSchema,
  percent_change: nullableDecimalValueSchema,
  is_market_open: z.boolean().optional(),
});

export const twelveDataApiErrorSchema = z.object({
  status: z.literal("error").optional(),
  code: z.number().optional(),
  message: z.string(),
});

export const coinGeckoMarketSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  current_price: decimalValueSchema,
  market_cap: nullableDecimalValueSchema,
  total_volume: nullableDecimalValueSchema,
  high_24h: nullableDecimalValueSchema,
  low_24h: nullableDecimalValueSchema,
  price_change_24h: nullableDecimalValueSchema,
  price_change_percentage_24h: nullableDecimalValueSchema,
  circulating_supply: nullableDecimalValueSchema,
  last_updated: z.string().datetime(),
});

export const frankfurterRateSchema = z.object({
  date: z.string().date(),
  base: z.string().length(3),
  quote: z.string().length(3),
  rate: decimalValueSchema,
});

export function calculatePercentageChange(price: string, previousClose: string | null): {
  absoluteChange: string | null;
  percentageChange: string | null;
} {
  if (!previousClose) return { absoluteChange: null, percentageChange: null };
  const current = new Decimal(price);
  const previous = new Decimal(previousClose);
  if (previous.isZero()) return { absoluteChange: current.minus(previous).toString(), percentageChange: null };
  return {
    absoluteChange: current.minus(previous).toString(),
    percentageChange: current.minus(previous).dividedBy(previous).times(100).toString(),
  };
}

export function assertPlausibleQuote(price: string, marketCap: string | null, percentageChange: string | null): void {
  if (new Decimal(price).lte(0)) throw new Error("Price must be greater than zero");
  if (marketCap !== null && new Decimal(marketCap).isNegative()) throw new Error("Market capitalisation cannot be negative");
  if (percentageChange !== null && new Decimal(percentageChange).abs().gt(10_000)) {
    throw new Error("Percentage change is implausible");
  }
}
