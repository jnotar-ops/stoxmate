import { ingestFundamentals } from "@/lib/market-data/ingestion";
import { respondToIngestionRequest } from "@/lib/market-data/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

async function run(request: Request) {
  return respondToIngestionRequest(request, "fundamentals", ingestFundamentals);
}

export const POST = run;
export const GET = run;
