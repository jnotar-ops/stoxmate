import "server-only";
import { mapCoinGeckoMarket } from "../mappers";
import type {
  CryptoDataProvider,
  InstrumentDefinition,
  NormalisedMarketQuote,
  ProviderBatchResult,
  ProviderHealth,
} from "../types";
import { classifyProviderError, fetchProviderJson } from "./http";

export class CoinGeckoProvider implements CryptoDataProvider {
  readonly code = "coingecko";

  constructor(private readonly apiKey = process.env.COINGECKO_API_KEY) {}

  async getCryptoQuotes(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>> {
    const supported = instruments.filter((item) => item.providerSymbol);
    if (supported.length === 0) return { records: [], errors: [] };
    const url = new URL(
      this.apiKey
        ? "https://pro-api.coingecko.com/api/v3/coins/markets"
        : "https://api.coingecko.com/api/v3/coins/markets",
    );
    url.searchParams.set("vs_currency", "aud");
    url.searchParams.set("ids", supported.map((item) => item.providerSymbol).join(","));
    url.searchParams.set("price_change_percentage", "24h");
    const fetchedAt = new Date();
    try {
      const payload = await fetchProviderJson<unknown[]>(url.toString(), {
        headers: this.apiKey ? { "x-cg-pro-api-key": this.apiKey } : undefined,
      });
      if (!Array.isArray(payload)) throw new Error("CoinGecko returned a non-array payload");
      const byId = new Map(payload.map((item) => [typeof item === "object" && item ? (item as { id?: string }).id : undefined, item]));
      const records: NormalisedMarketQuote[] = [];
      const errors: ProviderBatchResult<NormalisedMarketQuote>["errors"] = [];

      for (const instrument of supported) {
        const raw = byId.get(instrument.providerSymbol!);
        const mapped = mapCoinGeckoMarket(raw, instrument, fetchedAt);
        if (mapped.error) errors.push(mapped.error);
        else records.push(mapped.record);
      }
      return { records, errors };
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

  getCryptoMarketData(instruments: InstrumentDefinition[]) {
    return this.getCryptoQuotes(instruments);
  }

  async healthCheck(): Promise<ProviderHealth> {
    return { provider: this.code, status: "healthy", checkedAt: new Date(), message: this.apiKey ? "Pro key configured" : "Using public demo API" };
  }
}
