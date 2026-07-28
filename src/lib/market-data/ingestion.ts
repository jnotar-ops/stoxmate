import "server-only";
import { getInstruments } from "./registry";
import {
  beginIngestionRun,
  completeIngestionRun,
  markProviderQuotesStale,
  persistFundamentals,
  persistQuotes,
  recordIngestionErrors,
  syncInstrumentRegistry,
} from "./repository";
import { getCryptoDataProvider, getForexProvider, getMarketDataProvider } from "./providers/factory";
import type { NormalisedFundamentals, NormalisedMarketQuote, ProviderBatchResult } from "./types";

const globalIngestionState = globalThis as typeof globalThis & {
  __stoxmateIngestionPromises?: Map<string, Promise<unknown>>;
};
const activeIngestions = globalIngestionState.__stoxmateIngestionPromises ?? new Map<string, Promise<unknown>>();
if (process.env.NODE_ENV !== "production") globalIngestionState.__stoxmateIngestionPromises = activeIngestions;

export function suppressDuplicateIngestion<T>(key: string, work: () => Promise<T>): Promise<T> {
  const existing = activeIngestions.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const pending = work().finally(() => activeIngestions.delete(key));
  activeIngestions.set(key, pending);
  return pending;
}

async function executeIngestion<T extends NormalisedMarketQuote | NormalisedFundamentals>(
  provider: string,
  jobType: string,
  requestedCount: number,
  fetcher: () => Promise<ProviderBatchResult<T>>,
  persister: (records: T[], symbolToId: Map<string, string>) => Promise<void>,
) {
  const started = Date.now();
  const symbolToId = await syncInstrumentRegistry();
  const run = await beginIngestionRun(provider, jobType, requestedCount);
  try {
    const result = await fetcher();
    await persister(result.records, symbolToId);
    await recordIngestionErrors(run.id, provider, symbolToId, result.errors);
    if (result.records.length === 0 && result.errors.length > 0 && jobType !== "fundamentals") {
      await markProviderQuotesStale(provider);
    }
    return completeIngestionRun(
      run.id,
      result.records.length,
      result.errors.length,
      Date.now() - started,
      result.errors.map((error) => `${error.providerSymbol ?? "batch"}: ${error.message}`).join(" | "),
    );
  } catch (error) {
    if (jobType !== "fundamentals") await markProviderQuotesStale(provider);
    return completeIngestionRun(
      run.id,
      0,
      requestedCount,
      Date.now() - started,
      error instanceof Error ? error.message : "Unknown ingestion failure",
    );
  }
}

export async function ingestMarketQuotes() {
  const provider = getMarketDataProvider();
  const equities = getInstruments("EQUITY");
  const indices = getInstruments("INDEX");
  const commodities = getInstruments("COMMODITY").filter((item) => item.status !== "UNAVAILABLE_PENDING_PROVIDER");
  const requested = [...equities, ...indices, ...commodities];
  return executeIngestion(provider.code, "quotes", requested.length, async () => {
    const [equityResult, indexResult, commodityResult] = await Promise.all([
      provider.getEquityQuotes(equities),
      provider.getIndices(indices),
      provider.getCommodities(commodities),
    ]);
    return {
      records: [...equityResult.records, ...indexResult.records, ...commodityResult.records],
      errors: [...equityResult.errors, ...indexResult.errors, ...commodityResult.errors],
    };
  }, persistQuotes);
}

export async function ingestCrypto() {
  const provider = getCryptoDataProvider();
  const crypto = getInstruments("CRYPTO");
  return executeIngestion(provider.code, "crypto", crypto.length, () => provider.getCryptoMarketData(crypto), persistQuotes);
}

export async function ingestForex() {
  const provider = getForexProvider();
  const forex = getInstruments("FOREX");
  return executeIngestion(provider.code, "forex", forex.length, () => provider.getForex(forex), persistQuotes);
}

export async function ingestFundamentals() {
  const provider = getMarketDataProvider();
  const equities = getInstruments("EQUITY");
  return executeIngestion(
    provider.code,
    "fundamentals",
    equities.length,
    () => provider.getEquityFundamentals(equities),
    persistFundamentals,
  );
}

export async function refreshMarketStatus() {
  const provider = getMarketDataProvider();
  const started = Date.now();
  const run = await beginIngestionRun(provider.code, "market_status", 1);
  try {
    const status = await provider.getMarketStatus("ASX");
    return completeIngestionRun(run.id, 1, 0, Date.now() - started, `ASX status: ${status}`);
  } catch (error) {
    return completeIngestionRun(
      run.id,
      0,
      1,
      Date.now() - started,
      error instanceof Error ? error.message : "Market status refresh failed",
    );
  }
}
