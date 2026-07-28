import type { readMarketInstruments } from "./repository";

type MarketRows = Awaited<ReturnType<typeof readMarketInstruments>>;

const numberOrNull = (value: string | null | undefined) => value == null ? null : Number(value);
const compactMoney = (value: number | null, currency = "AUD") => {
  if (value === null || !Number.isFinite(value)) return "Unavailable";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

export function toLegacyMarketShape(
  records: MarketRows,
  legacyCompanies: Record<string, any>,
  legacyCryptos: Record<string, any>,
  legacyIndices: Record<string, any>,
) {
  const equities = records.filter((record) => record.instrument.assetClass === "EQUITY").map((record) => {
    const quote = record.quote;
    const fundamentals = record.fundamentals;
    const legacy = legacyCompanies[record.instrument.canonicalSymbol] ?? {};
    const marketCap = numberOrNull(quote?.marketCap ?? fundamentals?.marketCap);
    return {
      ...legacy,
      id: record.instrument.id,
      ticker: record.instrument.canonicalSymbol,
      name: record.instrument.name,
      sector: record.instrument.sector ?? "Unclassified",
      industry: record.instrument.industry ?? "Unclassified",
      marketCap: compactMoney(marketCap),
      marketCapVal: marketCap === null ? null : marketCap / 1_000_000_000,
      currentPrice: numberOrNull(quote?.price),
      dailyChange: numberOrNull(quote?.absoluteChange),
      dailyChangePercent: numberOrNull(quote?.percentageChange),
      peRatio: numberOrNull(fundamentals?.peRatio),
      dividendYield: numberOrNull(fundamentals?.dividendYield),
      dataProvider: quote?.provider ?? null,
      providerTimestamp: quote?.providerTimestamp ?? null,
      fetchedAt: quote?.fetchedAt ?? null,
      delayClassification: quote?.delayClassification ?? "unavailable",
      staleStatus: quote?.freshnessStatus.toLowerCase() ?? "unavailable",
      licenseTier: quote?.licenseTier ?? "personal_beta",
      marketStatus: quote?.marketStatus ?? "UNKNOWN",
    };
  });

  const cryptos = records.filter((record) => record.instrument.assetClass === "CRYPTO").map((record) => {
    const quote = record.quote;
    const legacy = legacyCryptos[record.instrument.canonicalSymbol] ?? {};
    const marketCap = numberOrNull(quote?.marketCap);
    return {
      ...legacy,
      id: record.instrument.id,
      symbol: record.instrument.canonicalSymbol,
      name: record.instrument.name,
      assetType: "Digital Asset",
      currentPriceAud: numberOrNull(quote?.price),
      dailyChangePercent: numberOrNull(quote?.percentageChange),
      marketCap: compactMoney(marketCap),
      marketCapVal: marketCap === null ? null : marketCap / 1_000_000_000,
      volume24hAud: numberOrNull(quote?.volume),
      circulatingSupply: numberOrNull(quote?.circulatingSupply),
      dataProvider: quote?.provider ?? null,
      providerTimestamp: quote?.providerTimestamp ?? null,
      fetchedAt: quote?.fetchedAt ?? null,
      delayClassification: quote?.delayClassification ?? "unavailable",
      staleStatus: quote?.freshnessStatus.toLowerCase() ?? "unavailable",
      licenseTier: quote?.licenseTier ?? "commercial",
    };
  });

  const indices = records.filter((record) => record.instrument.assetClass === "INDEX").map((record) => {
    const quote = record.quote;
    const legacy = legacyIndices[record.instrument.canonicalSymbol] ?? {};
    const price = numberOrNull(quote?.price);
    return {
      ...legacy,
      id: record.instrument.id,
      ticker: record.instrument.canonicalSymbol,
      name: record.instrument.name,
      region: record.instrument.region ?? "Global",
      currentValue: price === null ? "Unavailable" : price.toLocaleString("en-AU", { maximumFractionDigits: 2 }),
      numericValue: price,
      dailyChange: numberOrNull(quote?.absoluteChange),
      dailyChangePercent: numberOrNull(quote?.percentageChange),
      status: quote ? `${quote.marketStatus}${quote.freshnessStatus === "DELAYED" ? " · delayed" : ""}` : "Unavailable",
      aiAsxImpactSummary: legacy.aiAsxImpactSummary ?? "Market data only. No automated impact narrative is available.",
      affectedAsxTickers: legacy.affectedAsxTickers ?? [],
      dataProvider: quote?.provider ?? null,
      providerTimestamp: quote?.providerTimestamp ?? null,
      fetchedAt: quote?.fetchedAt ?? null,
      staleStatus: quote?.freshnessStatus.toLowerCase() ?? "unavailable",
    };
  });

  const macroIndicators = records
    .filter((record) => record.instrument.assetClass === "FOREX" || record.instrument.assetClass === "COMMODITY")
    .map((record) => {
      const quote = record.quote;
      const value = numberOrNull(quote?.price);
      const change = numberOrNull(quote?.percentageChange);
      return {
        id: record.instrument.id,
        name: record.instrument.name,
        category: record.instrument.assetClass === "FOREX" ? "Currency" : "Commodities",
        currentValue: value === null ? "Unavailable" : `${value.toLocaleString("en-AU", { maximumFractionDigits: 4 })}${record.instrument.unit ? ` / ${record.instrument.unit}` : ""}`,
        numericValue: value,
        change: change === null ? "Unavailable" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`,
        trend: change === null ? "Unavailable" : change > 0 ? "Rising" : change < 0 ? "Falling" : "Stable",
        aiImplicationForAsx: "Provider-backed reference value; no automated market recommendation.",
        dataProvider: quote?.provider ?? null,
        providerTimestamp: quote?.providerTimestamp ?? null,
        fetchedAt: quote?.fetchedAt ?? null,
        staleStatus: quote?.freshnessStatus.toLowerCase() ?? "unavailable",
      };
    });

  return { equities, cryptos, indices, macroIndicators };
}
