import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { readMarketInstruments, readProviderHealth } from "@/lib/market-data/repository";
import { toLegacyMarketShape } from "@/lib/market-data/compatibility";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [user] = await db.select().from(schema.users).limit(1);
    const [legacyGlobalIndices, legacyCryptoAssets, legacyCompanies, marketRecords, marketHealth] = await Promise.all([
      db.select().from(schema.globalIndices),
      db.select().from(schema.cryptoAssets),
      db.select().from(schema.asxCompanies),
      readMarketInstruments(),
      readProviderHealth(),
    ]);
    const canonicalByLegacyIndex: Record<string, string> = {
      "ASX 200": "ASX200",
      "S&P 500": "SP500",
      "NASDAQ": "NASDAQ",
      "DOW": "DJIA",
      "FTSE 100": "FTSE100",
      "NIKKEI 225": "NIKKEI225",
      "HANG SENG": "HANGSENG",
      "DAX": "DAX",
    };
    const compatibility = toLegacyMarketShape(
      marketRecords,
      Object.fromEntries(legacyCompanies.map((row) => [row.ticker, row])),
      Object.fromEntries(legacyCryptoAssets.map((row) => [row.symbol, row])),
      Object.fromEntries(legacyGlobalIndices.map((row) => [canonicalByLegacyIndex[row.ticker] ?? row.ticker, row])),
    );
    const globalIndices = compatibility.indices;
    const cryptoAssets = compatibility.cryptos;
    const companies = compatibility.equities;
    const insights = await db.select().from(schema.aiInsights).orderBy(desc(schema.aiInsights.publishedAt));
    const macro = compatibility.macroIndicators;
    const scenarios = await db.select().from(schema.scenarioModels);
    
    // Watchlist & items
    const watchlists = await db.select().from(schema.watchlists);
    const watchlistItems = await db.select().from(schema.watchlistItems);

    // Portfolio & holdings
    const portfolios = await db.select().from(schema.portfolios);
    const portfolioHoldings = await db.select().from(schema.portfolioHoldings);

    // AI Chat Queries
    const chatQueries = await db.select().from(schema.aiChatQueries).orderBy(desc(schema.aiChatQueries.createdAt));

    return NextResponse.json({
      success: true,
      user: user || null,
      globalIndices,
      cryptoAssets,
      companies,
      insights,
      macroIndicators: macro,
      scenarioModels: scenarios,
      watchlists,
      watchlistItems,
      portfolios,
      portfolioHoldings,
      chatQueries,
      marketHealth,
    });
  } catch (error) {
    console.error("Error fetching StoxMate data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load market intelligence data." },
      { status: 500 }
    );
  }
}
