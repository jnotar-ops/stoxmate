import "server-only";
import { createHash } from "node:crypto";
import { calculateFreshnessStatus } from "../freshness";
import type {
  ForexDataProvider,
  InstrumentDefinition,
  NormalisedMarketQuote,
  ProviderBatchResult,
  ProviderHealth,
} from "../types";
import { frankfurterRateSchema } from "../validation";
import { classifyProviderError, fetchProviderJson } from "./http";

export class FrankfurterProvider implements ForexDataProvider {
  readonly code = "frankfurter";

  async getForex(instruments: InstrumentDefinition[]): Promise<ProviderBatchResult<NormalisedMarketQuote>> {
    const supported = instruments.filter((item) => item.providerSymbol?.startsWith("AUD/"));
    const quotes = supported.map((item) => item.providerSymbol!.split("/")[1]);
    const url = new URL("https://api.frankfurter.dev/v2/rates");
    url.searchParams.set("base", "AUD");
    url.searchParams.set("quotes", quotes.join(","));
    const fetchedAt = new Date();
    try {
      const raw = await fetchProviderJson<unknown>(url.toString());
      const parsed = frankfurterRateSchema.array().safeParse(raw);
      if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => issue.message).join("; "));
      const byQuote = new Map(parsed.data.map((rate) => [rate.quote, rate]));
      const records: NormalisedMarketQuote[] = [];
      const errors: ProviderBatchResult<NormalisedMarketQuote>["errors"] = [];
      for (const instrument of supported) {
        const quoteCurrency = instrument.providerSymbol!.split("/")[1];
        const rate = byQuote.get(quoteCurrency);
        if (!rate) {
          errors.push({
            providerSymbol: instrument.providerSymbol,
            code: "UNSUPPORTED_SYMBOL",
            message: `Frankfurter returned no AUD/${quoteCurrency} rate`,
            retryable: false,
          });
          continue;
        }
        const providerTimestamp = new Date(`${rate.date}T16:00:00+02:00`);
        const record: NormalisedMarketQuote = {
          canonicalSymbol: instrument.canonicalSymbol,
          providerSymbol: instrument.providerSymbol!,
          assetClass: "FOREX",
          price: rate.rate,
          currency: quoteCurrency,
          previousClose: null,
          open: null,
          high: null,
          low: null,
          volume: null,
          absoluteChange: null,
          percentageChange: null,
          marketCap: null,
          circulatingSupply: null,
          providerTimestamp,
          fetchedAt,
          provider: this.code,
          delayMinutes: null,
          delayClassification: "reference_rate",
          marketStatus: "CLOSED",
          freshnessStatus: "FRESH",
          licenseTier: "commercial",
          rawPayloadHash: createHash("sha256").update(JSON.stringify(rate)).digest("hex"),
        };
        record.freshnessStatus = calculateFreshnessStatus(record);
        records.push(record);
      }
      return { records, errors };
    } catch (error) {
      const classified = classifyProviderError(error);
      return {
        records: [],
        errors: supported.map((instrument) => ({ providerSymbol: instrument.providerSymbol, ...classified })),
      };
    }
  }

  async healthCheck(): Promise<ProviderHealth> {
    return { provider: this.code, status: "healthy", checkedAt: new Date(), message: "Keyless reference-rate API configured" };
  }
}
