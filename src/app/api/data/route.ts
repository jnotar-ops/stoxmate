import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { seedDatabaseIfNeeded } from "@/db/seed-data";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Ensure database is seeded with initial high-fidelity Australian & Global market data
    await seedDatabaseIfNeeded();

    const [user] = await db.select().from(schema.users).limit(1);
    const globalIndices = await db.select().from(schema.globalIndices);
    const cryptoAssets = await db.select().from(schema.cryptoAssets).orderBy(desc(schema.cryptoAssets.marketCapVal));
    const companies = await db.select().from(schema.asxCompanies).orderBy(desc(schema.asxCompanies.marketCapVal));
    const insights = await db.select().from(schema.aiInsights).orderBy(desc(schema.aiInsights.publishedAt));
    const macro = await db.select().from(schema.macroIndicators);
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
    });
  } catch (error) {
    console.error("Error fetching StoxMate data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load market intelligence data." },
      { status: 500 }
    );
  }
}
