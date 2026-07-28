import { readProviderHealth } from "@/lib/market-data/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json(await readProviderHealth());
}
