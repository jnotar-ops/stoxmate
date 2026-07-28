import "server-only";
import { marketDataConfig } from "../config";
import { calculateMarketStatus } from "../market-status";
import { mapTwelveDataQuote } from "../mappers";
import type {
  InstrumentDefinition,
  MarketDataProvider,
  NormalisedFundamentals,
  NormalisedMarketQuote,
  ProviderBatchResult,
  ProviderHealth,
} from "../types";
import { twelveDataApiErrorSchema } from "../validation";
import { classifyProviderError, fetchProviderJson, mapWithConcurrency } from "./http";

type QuotePayload = Record<string, unknown>;

export class TwelveDataProvider implements MarketDataProvider {
  readonly code = "twelve_data";

  constructor(private readonly apiKey = process.env.TWELVE_DATA_API_KEY) {}

  private requireKey(): string {
    if (!this.apiKey) throw new Error("TWELVE_DATA_API_KEY is not configured");
    return this.apiKey;
  }

  private async getQuoteBatch(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>> {
    const supported = instruments.filter((item) => item.providerSymbol && item.status !== "UNAVAILABLE_PENDING_PROVIDER");
    if (supported.length === 0) return { records: [], errors: [] };

    const symbols = supported.map((item) => item.providerSymbol).join(",");
    const url = new URL("https://api.twelvedata.com/quote");
    url.searchParams.set("symbol", symbols);
    const fetchedAt = new Date();
    try {
      const payload = await fetchProviderJson<QuotePayload>(url.toString(), {
        headers: { Authorization: `apikey ${this.requireKey()}` },
      });
      const topLevelError = twelveDataApiErrorSchema.safeParse(payload);
      if (topLevelError.success && ("status" in payload || "code" in payload)) {
        throw new Error(topLevelError.data.message);
      }

      const entries = supported.map((instrument) => {
        const raw = supported.length === 1
          ? payload
          : payload[instrument.providerSymbol!] ?? payload[instrument.canonicalSymbol];
        return mapTwelveDataQuote(raw, instrument, fetchedAt);
      });

      return {
        records: entries.flatMap((entry) => entry.record ? [entry.record] : []),
        errors: entries.flatMap((entry) => entry.error ? [entry.error] : []),
      };
    } catch (error) {
      const classified = classifyProviderError(error);
      return {
        records: [],
        errors: supported.map((instrument) => ({
          providerSymbol: instrument.providerSymbol,
          ...classified,
        })),
      };
    }
  }

  private async getQuotes(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>> {
    const supported = instruments.filter((item) => item.providerSymbol && item.status !== "UNAVAILABLE_PENDING_PROVIDER");
    const batches: InstrumentDefinition[][] = [];
    for (let index = 0; index < supported.length; index += marketDataConfig.transport.batchSize) {
      batches.push(supported.slice(index, index + marketDataConfig.transport.batchSize));
    }
    const results = await mapWithConcurrency(batches, (batch) => this.getQuoteBatch(batch));
    return {
      records: results.flatMap((result) => result.records),
      errors: results.flatMap((result) => result.errors),
    };
  }

  getEquityQuotes(instruments: InstrumentDefinition[]) {
    return this.getQuotes(instruments);
  }

  getIndices(instruments: InstrumentDefinition[]) {
    return this.getQuotes(instruments);
  }

  getCommodities(instruments: InstrumentDefinition[]) {
    return this.getQuotes(instruments);
  }

  getForex(instruments: InstrumentDefinition[]) {
    return this.getQuotes(instruments);
  }

  async getEquityFundamentals(
    instruments: InstrumentDefinition[],
  ): Promise<ProviderBatchResult<NormalisedFundamentals>> {
    return {
      records: [],
      errors: instruments.map((instrument) => ({
        providerSymbol: instrument.providerSymbol,
        code: "PLAN_RESTRICTION",
        message: "Twelve Data free-tier fundamentals are not enabled for Phase 1",
        retryable: false,
      })),
    };
  }

  async getMarketStatus(exchange: string) {
    return exchange === "ASX" ? calculateMarketStatus() : "UNKNOWN" as const;
  }

  async healthCheck(): Promise<ProviderHealth> {
    if (!this.apiKey) {
      return { provider: this.code, status: "unavailable", checkedAt: new Date(), message: "API key not configured" };
    }
    return { provider: this.code, status: "healthy", checkedAt: new Date(), message: "Configuration present" };
  }
}
