import { isCronAuthorised } from "@/lib/market-data/cron-auth";
import { refreshMarketStatus, suppressDuplicateIngestion } from "@/lib/market-data/ingestion";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function run(request: Request) {
  if (!isCronAuthorised(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ success: true, run: await suppressDuplicateIngestion("market-status", refreshMarketStatus) });
}

export const POST = run;
export const GET = run;
