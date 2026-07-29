import "server-only";
import { calculateMarketStatus } from "../market-status";
import { mapMarketstackEodQuote } from "../mappers";
import type {
  InstrumentDefinition,
  MarketDataProvider,
  NormalisedFundamentals,
  NormalisedMarketQuote,
  ProviderBatchResult,
  ProviderHealth,
  ProviderInstrumentError,
} from "../types";
import { marketstackApiErrorSchema, marketstackEodResponseSchema } from "../validation";
import { classifyProviderError, fetchProviderJson } from "./http";

const MARKETSTACK_EOD_URL = "https://api.marketstack.com/v2/eod/latest";
const MARKETSTACK_BATCH_LIMIT = 100;

function marketstackSymbol(instrument: InstrumentDefinition): string | null {
  if (instrument.assetClass === "EQUITY" && instrument.exchange === "ASX") {
    return `${instrument.canonicalSymbol}.AX`;
  }
  return null;
}

function unavailable(
  instruments: InstrumentDefinition[],
  message: string,
): ProviderBatchResult<NormalisedMarketQuote> {
  return {
    records: [],
    errors: instruments.map((instrument) => ({
      providerSymbol: marketstackSymbol(instrument) ?? instrument.providerSymbol,
      code: "UNAVAILABLE_PENDING_PROVIDER",
      message,
      retryable: false,
    })),
  };
}

function classifyApiError(raw: unknown): Omit<ProviderInstrumentError, "providerSymbol"> | null {
  const parsed = marketstackApiErrorSchema.safeParse(raw);
  if (!parsed.success) return null;
  const code = String(parsed.data.error.code ?? parsed.data.error.type ?? "PROVIDER_RESPONSE_ERROR");
  const normalised = `${code} ${parsed.data.error.type ?? ""}`.toLowerCase();
  return {
    code: normalised.includes("access") || normalised.includes("key") ? "INVALID_API_KEY"
      : normalised.includes("limit") || normalised.includes("usage") ? "RATE_LIMITED"
        : normalised.includes("function") || normalised.includes("plan") ? "PLAN_RESTRICTION"
          : "PROVIDER_RESPONSE_ERROR",
    message: parsed.data.error.message,
    retryable: normalised.includes("limit") || normalised.includes("usage"),
  };
}

export class MarketstackProvider implements MarketDataProvider {
  readonly code = "marketstack";

  constructor(private readonly apiKey = process.env.MARKETSTACK_API_KEY) {}

  private requireKey(): string {
    if (!this.apiKey) throw new Error("MARKETSTACK_API_KEY is not configured");
    return this.apiKey;
  }

  private async getEodEquityQuotes(
    instruments: InstrumentDefinition[],
  ): Promise<ProviderBatchResult<NormalisedMarketQuote>> {
    const supported = instruments
      .map((instrument) => ({ instrument, symbol: marketstackSymbol(instrument) }))
      .filter((item): item is { instrument: InstrumentDefinition; symbol: string } => Boolean(item.symbol));
    if (supported.length === 0) return { records: [], errors: [] };
    if (supported.length > MARKETSTACK_BATCH_LIMIT) {
      throw new Error(`Marketstack EOD batch exceeds ${MARKETSTACK_BATCH_LIMIT} symbols`);
    }

    const url = new URL(MARKETSTACK_EOD_URL);
    url.searchParams.set("access_key", this.requireKey());
    url.searchParams.set("symbols", supported.map((item) => item.symbol).join(","));
    url.searchParams.set("limit", String(supported.length));
    const fetchedAt = new Date();

    try {
      const raw = await fetchProviderJson<unknown>(url.toString());
      const apiError = classifyApiError(raw);
      if (apiError) {
        return {
          records: [],
          errors: supported.map(({ symbol }) => ({ providerSymbol: symbol, ...apiError })),
        };
      }

      const response = marketstackEodResponseSchema.safeParse(raw);
      if (!response.success) throw new Error(response.error.issues.map((issue) => issue.message).join("; "));

      const records: NormalisedMarketQuote[] = [];
      const errors: ProviderInstrumentError[] = [];
      for (const { instrument, symbol } of supported) {
        const returned = response.data.data.find((item) => {
          if (!item || typeof item !== "object" || !("symbol" in item)) return false;
          const value = String(item.symbol).toUpperCase();
          return value === symbol.toUpperCase() || value.split(".")[0] === instrument.canonicalSymbol;
        });
        if (!returned) {
          errors.push({
            providerSymbol: symbol,
            code: "UNSUPPORTED_SYMBOL",
            message: `Marketstack returned no EOD row for ${symbol}`,
            retryable: false,
          });
          continue;
        }
        const mapped = mapMarketstackEodQuote(
          returned,
          { ...instrument, providerSymbol: symbol },
          fetchedAt,
        );
        if (mapped.record) records.push(mapped.record);
        else errors.push(mapped.error);
      }
      return { records, errors };
    } catch (error) {
      const classified = classifyProviderError(error);
      return {
        records: [],
        errors: supported.map(({ symbol }) => ({ providerSymbol: symbol, ...classified })),
      };
    }
  }

  getEquityQuotes(instruments: InstrumentDefinition[]) {
    return this.getEodEquityQuotes(instruments);
  }

  async getEquityFundamentals(
    instruments: InstrumentDefinition[],
  ): Promise<ProviderBatchResult<NormalisedFundamentals>> {
    return {
      records: [],
      errors: instruments.map((instrument) => ({
        providerSymbol: marketstackSymbol(instrument),
        code: "UNAVAILABLE_PENDING_PROVIDER",
        message: "Marketstack company facts/fundamentals are not included in the Free plan",
        retryable: false,
      })),
    };
  }

  async getIndices(instruments: InstrumentDefinition[]) {
    return unavailable(
      instruments,
      "Marketstack stock-market indices require a paid plan and are unavailable in the configured Free-tier adapter",
    );
  }

  async getCommodities(instruments: InstrumentDefinition[]) {
    return unavailable(
      instruments,
      "Marketstack commodity prices require the Professional plan and are unavailable in the configured Free-tier adapter",
    );
  }

  async getForex(instruments: InstrumentDefinition[]) {
    return unavailable(instruments, "Forex remains assigned to Frankfurter");
  }

  async getMarketStatus(exchange: string) {
    return exchange === "ASX" ? calculateMarketStatus() : "UNKNOWN" as const;
  }

  async healthCheck(): Promise<ProviderHealth> {
    if (!this.apiKey) {
      return {
        provider: this.code,
        status: "unavailable",
        checkedAt: new Date(),
        message: "MARKETSTACK_API_KEY is not configured",
      };
    }
    return {
      provider: this.code,
      status: "healthy",
      checkedAt: new Date(),
      message: "Free-tier EOD equity adapter configured; indices, commodities, and fundamentals remain unavailable",
    };
  }
}
