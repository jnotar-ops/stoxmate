import { refreshMarketStatus } from "@/lib/market-data/ingestion";
import { respondToIngestionRequest } from "@/lib/market-data/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function run(request: Request) {
  return respondToIngestionRequest(request, "market-status", refreshMarketStatus);
}

export const POST = run;
export const GET = run;
