import { isCronAuthorised } from "@/lib/market-data/cron-auth";
import { ingestCrypto, suppressDuplicateIngestion } from "@/lib/market-data/ingestion";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

async function run(request: Request) {
  if (!isCronAuthorised(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ success: true, run: await suppressDuplicateIngestion("crypto", ingestCrypto) });
}

export const POST = run;
export const GET = run;
