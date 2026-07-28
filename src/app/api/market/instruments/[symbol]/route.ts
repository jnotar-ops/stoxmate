import { readInstrument } from "@/lib/market-data/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await context.params;
  const record = await readInstrument(symbol);
  if (!record) return Response.json({ error: "Instrument not found" }, { status: 404 });
  return Response.json({
    data: record,
    metadata: {
      providerAttribution: record.quote?.provider === "twelve_data"
        ? "Market data provided by Twelve Data. ASX data may be delayed and is not licensed for redistribution."
        : record.quote?.provider === "coingecko"
          ? "Crypto market data provided by CoinGecko."
          : record.quote?.provider === "frankfurter"
            ? "Foreign-exchange reference rates provided by Frankfurter."
            : null,
    },
  });
}
