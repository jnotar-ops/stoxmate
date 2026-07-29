import { readMarketInstruments } from "@/lib/market-data/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const search = new URL(request.url).searchParams;
  const symbols = search.get("symbols")?.split(",").map((symbol) => symbol.trim().toUpperCase()).filter(Boolean);
  const records = await readMarketInstruments({
    assetClass: search.get("assetClass")?.toUpperCase(),
    exchange: search.get("exchange")?.toUpperCase(),
    region: search.get("region") ?? undefined,
    symbols,
  });
  return Response.json({
    data: records,
    metadata: {
      attribution: [
        "Marketstack: end-of-day ASX equity data from a non-commercial evaluation tier.",
        "CoinGecko: crypto prices in AUD.",
        "Frankfurter: daily foreign-exchange reference rates.",
      ],
    },
  });
}
