import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { watchlistId = 1, companyTicker, action } = await req.json();

    if (!companyTicker) {
      return NextResponse.json({ error: "Company ticker is required" }, { status: 400 });
    }

    if (action === "remove") {
      await db.delete(schema.watchlistItems)
        .where(
          and(
            eq(schema.watchlistItems.watchlistId, Number(watchlistId)),
            eq(schema.watchlistItems.companyTicker, companyTicker)
          )
        );
      return NextResponse.json({ success: true, message: `Removed ${companyTicker} from watchlist.` });
    } else {
      // Check if exists
      const existing = await db.select().from(schema.watchlistItems)
        .where(
          and(
            eq(schema.watchlistItems.watchlistId, Number(watchlistId)),
            eq(schema.watchlistItems.companyTicker, companyTicker)
          )
        ).limit(1);

      if (existing.length === 0) {
        await db.insert(schema.watchlistItems).values({
          watchlistId: Number(watchlistId),
          companyTicker,
          alertOnPriceChangePercent: 3.0,
          alertOnInsiderTrading: true,
          alertOnEarnings: true,
        });
      }
      return NextResponse.json({ success: true, message: `Added ${companyTicker} to AI monitored watchlist.` });
    }
  } catch (error) {
    console.error("Error modifying watchlist:", error);
    return NextResponse.json({ error: "Failed to update watchlist" }, { status: 500 });
  }
}
