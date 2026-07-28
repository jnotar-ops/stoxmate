import { calculateMarketStatus } from "@/lib/market-data/market-status";
import { readMarketInstruments, readProviderHealth } from "@/lib/market-data/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const [records, health] = await Promise.all([readMarketInstruments(), readProviderHealth()]);
  const byClass = (assetClass: string) => records.filter((record) => record.instrument.assetClass === assetClass);
  const asxEquities = byClass("EQUITY");
  const movers = [...asxEquities]
    .filter((record) => record.quote?.percentageChange !== null)
    .sort((a, b) => Math.abs(Number(b.quote?.percentageChange ?? 0)) - Math.abs(Number(a.quote?.percentageChange ?? 0)))
    .slice(0, 5);
  return Response.json({
    asx200: records.find((record) => record.instrument.canonicalSymbol === "ASX200") ?? null,
    globalIndices: byClass("INDEX").filter((record) => record.instrument.canonicalSymbol !== "ASX200"),
    commodities: byClass("COMMODITY"),
    audUsd: records.find((record) => record.instrument.canonicalSymbol === "AUDUSD") ?? null,
    topAsxMovers: movers,
    cryptoSnapshot: byClass("CRYPTO"),
    marketStatus: { exchange: "ASX", status: calculateMarketStatus(), timeZone: "Australia/Sydney" },
    freshnessSummary: health.quoteCounts,
    systemHealth: health.status,
  });
}
