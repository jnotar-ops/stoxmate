import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  companyFundamentals,
  dataProviders,
  forexRates,
  ingestionErrors,
  ingestionRuns,
  instruments,
  marketQuoteHistory,
  marketQuotes,
} from "@/db/schema";
import { instrumentRegistry } from "./registry";
import type {
  NormalisedFundamentals,
  NormalisedMarketQuote,
  ProviderInstrumentError,
} from "./types";

export async function syncInstrumentRegistry(): Promise<Map<string, string>> {
  await db.insert(dataProviders).values([
    {
      code: "twelve_data",
      name: "Twelve Data",
      assetClasses: ["EQUITY", "INDEX", "COMMODITY"],
      commercialUseConfirmed: false,
      licenseTier: "personal_beta",
      licenceNotes: "Closed-beta personal/free-tier use only. Replace before public or paid launch.",
      attribution: "Market data provided by Twelve Data; ASX data may be delayed.",
    },
    {
      code: "coingecko",
      name: "CoinGecko",
      assetClasses: ["CRYPTO"],
      commercialUseConfirmed: false,
      licenseTier: "commercial",
      licenceNotes: "Founder must verify the selected account terms and attribution requirements.",
      attribution: "Crypto market data provided by CoinGecko.",
    },
    {
      code: "frankfurter",
      name: "Frankfurter",
      assetClasses: ["FOREX"],
      commercialUseConfirmed: true,
      licenseTier: "commercial",
      licenceNotes: "Free keyless reference rates; underlying provider terms still apply.",
      attribution: "Foreign-exchange reference rates provided by Frankfurter.",
    },
  ]).onConflictDoNothing({ target: dataProviders.code });

  for (const item of instrumentRegistry) {
    await db.insert(instruments).values({
      canonicalSymbol: item.canonicalSymbol,
      providerSymbol: item.providerSymbol,
      name: item.name,
      assetClass: item.assetClass,
      exchange: item.exchange,
      mic: item.mic,
      currency: item.currency,
      region: item.region,
      sector: item.sector,
      industry: item.industry,
      unit: item.unit,
      status: item.status ?? "ACTIVE",
      isActive: (item.status ?? "ACTIVE") === "ACTIVE",
    }).onConflictDoUpdate({
      target: instruments.canonicalSymbol,
      set: {
        providerSymbol: item.providerSymbol,
        name: item.name,
        assetClass: item.assetClass,
        exchange: item.exchange,
        mic: item.mic,
        currency: item.currency,
        region: item.region,
        sector: item.sector,
        industry: item.industry,
        unit: item.unit,
        status: item.status ?? "ACTIVE",
        isActive: (item.status ?? "ACTIVE") === "ACTIVE",
        updatedAt: new Date(),
      },
    });
  }
  const rows = await db.select({
    id: instruments.id,
    canonicalSymbol: instruments.canonicalSymbol,
  }).from(instruments);
  return new Map(rows.map((row) => [row.canonicalSymbol, row.id]));
}

export async function beginIngestionRun(provider: string, jobType: string, requestedCount: number) {
  const [run] = await db.insert(ingestionRuns).values({
    provider,
    jobType,
    startedAt: new Date(),
    status: "RUNNING",
    requestedCount,
  }).returning();
  return run;
}

export async function completeIngestionRun(
  runId: string,
  successfulCount: number,
  failedCount: number,
  durationMs: number,
  errorSummary?: string,
) {
  const status = failedCount === 0 ? "SUCCESS" : successfulCount > 0 ? "PARTIAL_SUCCESS" : "FAILED";
  const [run] = await db.update(ingestionRuns).set({
    completedAt: new Date(),
    status,
    successfulCount,
    failedCount,
    errorSummary: errorSummary?.slice(0, 2_000),
    metadata: { durationMs },
  }).where(eq(ingestionRuns.id, runId)).returning();
  console.info(JSON.stringify({
    event: "market_data_ingestion_completed",
    provider: run.provider,
    jobType: run.jobType,
    runId,
    instrumentCount: run.requestedCount,
    successCount: successfulCount,
    failureCount: failedCount,
    durationMs,
    status,
  }));
  return run;
}

export async function recordIngestionErrors(
  runId: string,
  provider: string,
  symbolToId: Map<string, string>,
  errors: ProviderInstrumentError[],
) {
  if (errors.length === 0) return;
  await db.insert(ingestionErrors).values(errors.map((error) => {
    const canonical = instrumentRegistry.find((item) => item.providerSymbol === error.providerSymbol)?.canonicalSymbol;
    return {
      ingestionRunId: runId,
      provider,
      instrumentId: canonical ? symbolToId.get(canonical) : undefined,
      providerSymbol: error.providerSymbol,
      errorCode: error.code,
      errorMessage: error.message.slice(0, 2_000),
      retryable: error.retryable,
      rawContext: error.context,
    };
  }));
}

export async function persistQuotes(
  quotes: NormalisedMarketQuote[],
  symbolToId: Map<string, string>,
) {
  for (const quote of quotes) {
    const instrumentId = symbolToId.get(quote.canonicalSymbol);
    if (!instrumentId) throw new Error(`Canonical instrument ${quote.canonicalSymbol} is not registered`);
    const values = {
      instrumentId,
      price: quote.price,
      previousClose: quote.previousClose,
      open: quote.open,
      high: quote.high,
      low: quote.low,
      absoluteChange: quote.absoluteChange,
      percentageChange: quote.percentageChange,
      volume: quote.volume,
      marketCap: quote.marketCap,
      circulatingSupply: quote.circulatingSupply,
      providerTimestamp: quote.providerTimestamp,
      fetchedAt: quote.fetchedAt,
      marketStatus: quote.marketStatus,
      delayMinutes: quote.delayMinutes,
      delayClassification: quote.delayClassification,
      freshnessStatus: quote.freshnessStatus,
      provider: quote.provider,
      licenseTier: quote.licenseTier,
      rawPayloadHash: quote.rawPayloadHash,
      updatedAt: new Date(),
    };
    await db.insert(marketQuotes).values(values).onConflictDoUpdate({
      target: [marketQuotes.instrumentId, marketQuotes.provider],
      set: values,
    });

    if (quote.providerTimestamp) {
      await db.insert(marketQuoteHistory).values({
        instrumentId,
        price: quote.price,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.price,
        volume: quote.volume,
        interval: "1D",
        observedAt: quote.providerTimestamp,
        provider: quote.provider,
      }).onConflictDoNothing({
        target: [
          marketQuoteHistory.instrumentId,
          marketQuoteHistory.provider,
          marketQuoteHistory.interval,
          marketQuoteHistory.observedAt,
        ],
      });
    }

    if (quote.assetClass === "FOREX") {
      await db.insert(forexRates).values({
        instrumentId,
        baseCurrency: "AUD",
        quoteCurrency: quote.currency,
        rate: quote.price,
        previousClose: quote.previousClose,
        dailyChangePercent: quote.percentageChange,
        dataProvider: quote.provider,
        providerTimestamp: quote.providerTimestamp ?? quote.fetchedAt,
        fetchedAt: quote.fetchedAt,
        delayClassification: quote.delayClassification,
        staleStatus: quote.freshnessStatus.toLowerCase(),
        licenseTier: quote.licenseTier,
      }).onConflictDoUpdate({
        target: [forexRates.baseCurrency, forexRates.quoteCurrency, forexRates.dataProvider],
        set: {
          rate: quote.price,
          previousClose: quote.previousClose,
          dailyChangePercent: quote.percentageChange,
          providerTimestamp: quote.providerTimestamp ?? quote.fetchedAt,
          fetchedAt: quote.fetchedAt,
          delayClassification: quote.delayClassification,
          staleStatus: quote.freshnessStatus.toLowerCase(),
        },
      });
    }
  }
}

export async function persistFundamentals(
  values: NormalisedFundamentals[],
  symbolToId: Map<string, string>,
) {
  for (const value of values) {
    const instrumentId = symbolToId.get(value.canonicalSymbol);
    if (!instrumentId) throw new Error(`Canonical instrument ${value.canonicalSymbol} is not registered`);
    const row = {
      instrumentId,
      marketCap: value.marketCap,
      peRatio: value.peRatio,
      forwardPeRatio: value.forwardPeRatio,
      eps: value.eps,
      dividendYield: value.dividendYield,
      bookValue: value.bookValue,
      revenue: value.revenue,
      netIncome: value.netIncome,
      fiftyTwoWeekHigh: value.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: value.fiftyTwoWeekLow,
      reportingPeriod: value.reportingPeriod,
      providerTimestamp: value.providerTimestamp,
      fetchedAt: value.fetchedAt,
      provider: value.provider,
      updatedAt: new Date(),
    };
    await db.insert(companyFundamentals).values(row).onConflictDoUpdate({
      target: [companyFundamentals.instrumentId, companyFundamentals.provider],
      set: row,
    });
  }
}

export async function markProviderQuotesStale(provider: string) {
  await db.update(marketQuotes).set({
    freshnessStatus: "STALE",
    updatedAt: new Date(),
  }).where(eq(marketQuotes.provider, provider));
}

export interface InstrumentFilters {
  assetClass?: string;
  exchange?: string;
  region?: string;
  symbols?: string[];
}

export async function readMarketInstruments(filters: InstrumentFilters = {}) {
  const predicates = [
    filters.assetClass ? eq(instruments.assetClass, filters.assetClass) : undefined,
    filters.exchange ? eq(instruments.exchange, filters.exchange) : undefined,
    filters.region ? eq(instruments.region, filters.region) : undefined,
    filters.symbols?.length ? inArray(instruments.canonicalSymbol, filters.symbols) : undefined,
  ].filter(Boolean);
  return db.select({
    instrument: instruments,
    quote: marketQuotes,
    fundamentals: companyFundamentals,
  }).from(instruments)
    .leftJoin(marketQuotes, eq(marketQuotes.instrumentId, instruments.id))
    .leftJoin(companyFundamentals, eq(companyFundamentals.instrumentId, instruments.id))
    .where(predicates.length ? and(...predicates) : undefined)
    .orderBy(instruments.assetClass, instruments.canonicalSymbol);
}

export async function readInstrument(symbol: string) {
  const [record] = await readMarketInstruments({ symbols: [symbol.toUpperCase()] });
  if (!record) return null;
  const history = await db.select().from(marketQuoteHistory)
    .where(eq(marketQuoteHistory.instrumentId, record.instrument.id))
    .orderBy(desc(marketQuoteHistory.observedAt))
    .limit(90);
  return { ...record, history };
}

export async function readProviderHealth() {
  const latestRuns = await db.select().from(ingestionRuns)
    .orderBy(desc(ingestionRuns.startedAt))
    .limit(100);
  const quoteCounts = await db.select({
    freshnessStatus: marketQuotes.freshnessStatus,
    count: sql<number>`count(*)::int`,
  }).from(marketQuotes).groupBy(marketQuotes.freshnessStatus);
  const providers = ["twelve_data", "coingecko", "frankfurter"].map((provider) => {
    const runs = latestRuns.filter((run) => run.provider === provider);
    const latest = runs[0] ?? null;
    const lastSuccess = runs.find((run) => run.status === "SUCCESS" || run.status === "PARTIAL_SUCCESS") ?? null;
    return {
      provider,
      status: !latest ? "offline" : latest.status === "FAILED" ? "degraded" : latest.status === "RUNNING" ? "running" : "healthy",
      lastSuccessfulFetch: lastSuccess?.completedAt ?? null,
      latestRun: latest ? {
        id: latest.id,
        jobType: latest.jobType,
        status: latest.status,
        startedAt: latest.startedAt,
        completedAt: latest.completedAt,
        requestedCount: latest.requestedCount,
        successfulCount: latest.successfulCount,
        failedCount: latest.failedCount,
      } : null,
    };
  });
  const counts = Object.fromEntries(quoteCounts.map((row) => [row.freshnessStatus.toLowerCase(), row.count]));
  const healthyCount = providers.filter((provider) => provider.status === "healthy").length;
  return {
    status: healthyCount === providers.length ? "healthy" : healthyCount > 0 ? "degraded" : "offline",
    providers,
    quoteCounts: {
      fresh: counts.fresh ?? 0,
      delayed: counts.delayed ?? 0,
      stale: counts.stale ?? 0,
      unavailable: counts.unavailable ?? 0,
    },
    currentIngestionStatus: latestRuns.some((run) => run.status === "RUNNING") ? "running" : "idle",
    latestCompletedRun: latestRuns.find((run) => run.completedAt) ?? null,
  };
}
