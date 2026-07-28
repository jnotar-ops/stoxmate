import { isCronAuthorised } from "@/lib/market-data/cron-auth";
import { ingestForex, ingestMarketQuotes, suppressDuplicateIngestion } from "@/lib/market-data/ingestion";
import { shouldRunScheduledMarketQuotes } from "@/lib/market-data/schedule";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

async function run(request: Request, scheduled: boolean) {
  if (!isCronAuthorised(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (scheduled && !shouldRunScheduledMarketQuotes()) {
    return Response.json({ success: true, skipped: true, reason: "Outside ASX ingestion window" });
  }
  const url = new URL(request.url);
  if (url.searchParams.get("type") === "forex") {
    return Response.json({ success: true, run: await suppressDuplicateIngestion("forex", ingestForex) });
  }
  return Response.json({ success: true, run: await suppressDuplicateIngestion("quotes", ingestMarketQuotes) });
}

export function POST(request: Request) {
  return run(request, false);
}

export function GET(request: Request) {
  return run(request, true);
}
