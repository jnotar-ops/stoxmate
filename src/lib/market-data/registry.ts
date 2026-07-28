import type { AssetClass, InstrumentDefinition } from "./types";

const asx = (
  canonicalSymbol: string,
  name: string,
  sector: string,
  industry: string,
): InstrumentDefinition => ({
  canonicalSymbol,
  providerSymbol: `${canonicalSymbol}:ASX`,
  name,
  assetClass: "EQUITY",
  exchange: "ASX",
  mic: "XASX",
  currency: "AUD",
  region: "Australia",
  sector,
  industry,
});

export const instrumentRegistry: readonly InstrumentDefinition[] = [
  asx("BHP", "BHP Group Limited", "Materials", "Diversified Metals & Mining"),
  asx("CBA", "Commonwealth Bank of Australia", "Financials", "Diversified Banks"),
  asx("CSL", "CSL Limited", "Health Care", "Biotechnology"),
  asx("NAB", "National Australia Bank Limited", "Financials", "Diversified Banks"),
  asx("WBC", "Westpac Banking Corporation", "Financials", "Diversified Banks"),
  asx("ANZ", "ANZ Group Holdings Limited", "Financials", "Diversified Banks"),
  asx("WES", "Wesfarmers Limited", "Consumer Discretionary", "Diversified Retail"),
  asx("WDS", "Woodside Energy Group Ltd", "Energy", "Oil & Gas Exploration"),
  asx("FMG", "Fortescue Ltd", "Materials", "Steel"),
  asx("MQG", "Macquarie Group Limited", "Financials", "Capital Markets"),
  asx("TLS", "Telstra Group Limited", "Telecommunications", "Telecommunication Services"),
  asx("WOW", "Woolworths Group Limited", "Consumer Staples", "Consumer Staples Distribution"),
  asx("RIO", "Rio Tinto Limited", "Materials", "Diversified Metals & Mining"),
  asx("REA", "REA Group Ltd", "Communication Services", "Interactive Media"),
  asx("XRO", "Xero Limited", "Information Technology", "Application Software"),
  asx("PLS", "Pilbara Minerals Limited", "Materials", "Diversified Metals & Mining"),
  asx("QAN", "Qantas Airways Limited", "Industrials", "Passenger Airlines"),
  asx("COL", "Coles Group Limited", "Consumer Staples", "Food Retail"),
  asx("GMG", "Goodman Group", "Real Estate", "Industrial REITs"),
  asx("ALL", "Aristocrat Leisure Limited", "Consumer Discretionary", "Casinos & Gaming"),

  { canonicalSymbol: "ASX200", providerSymbol: "XJO:ASX", name: "S&P/ASX 200", assetClass: "INDEX", exchange: "ASX", mic: "XASX", currency: "AUD", region: "Australia" },
  { canonicalSymbol: "SP500", providerSymbol: "SPX", name: "S&P 500", assetClass: "INDEX", exchange: "S&P", currency: "USD", region: "US / Americas" },
  { canonicalSymbol: "NASDAQ", providerSymbol: "IXIC", name: "Nasdaq Composite", assetClass: "INDEX", exchange: "NASDAQ", currency: "USD", region: "US / Americas" },
  { canonicalSymbol: "DJIA", providerSymbol: "DJI", name: "Dow Jones Industrial Average", assetClass: "INDEX", exchange: "DJI", currency: "USD", region: "US / Americas" },
  { canonicalSymbol: "FTSE100", providerSymbol: "FTSE", name: "FTSE 100", assetClass: "INDEX", exchange: "LSE", currency: "GBP", region: "Europe" },
  { canonicalSymbol: "NIKKEI225", providerSymbol: "N225", name: "Nikkei 225", assetClass: "INDEX", exchange: "JPX", currency: "JPY", region: "Asia-Pacific" },
  { canonicalSymbol: "HANGSENG", providerSymbol: "HSI", name: "Hang Seng", assetClass: "INDEX", exchange: "HKEX", currency: "HKD", region: "Asia-Pacific" },
  { canonicalSymbol: "DAX", providerSymbol: "GDAXI", name: "DAX", assetClass: "INDEX", exchange: "XETRA", currency: "EUR", region: "Europe" },

  { canonicalSymbol: "GOLD", providerSymbol: "XAU/USD", name: "Gold", assetClass: "COMMODITY", currency: "USD", region: "Global", unit: "troy ounce" },
  { canonicalSymbol: "BRENT", providerSymbol: "BRENT", name: "Brent Crude Oil", assetClass: "COMMODITY", currency: "USD", region: "Global", unit: "barrel" },
  { canonicalSymbol: "WTI", providerSymbol: "WTI", name: "WTI Crude Oil", assetClass: "COMMODITY", currency: "USD", region: "Global", unit: "barrel" },
  { canonicalSymbol: "COPPER", providerSymbol: "XCU/USD", name: "Copper", assetClass: "COMMODITY", currency: "USD", region: "Global", unit: "pound" },
  { canonicalSymbol: "IRON_ORE", providerSymbol: null, name: "Iron Ore 62% Fe", assetClass: "COMMODITY", currency: "USD", region: "Global", unit: "tonne", status: "UNAVAILABLE_PENDING_PROVIDER" },
  { canonicalSymbol: "LITHIUM", providerSymbol: null, name: "Lithium Carbonate Benchmark", assetClass: "COMMODITY", currency: "USD", region: "Global", unit: "tonne", status: "UNAVAILABLE_PENDING_PROVIDER" },

  ...(["USD", "NZD", "EUR", "GBP", "JPY", "CNY"] as const).map((quote) => ({
    canonicalSymbol: `AUD${quote}`,
    providerSymbol: `AUD/${quote}`,
    name: `Australian Dollar / ${quote}`,
    assetClass: "FOREX" as const,
    currency: quote,
    region: "Global",
  })),

  { canonicalSymbol: "BTC", providerSymbol: "bitcoin", name: "Bitcoin", assetClass: "CRYPTO", currency: "AUD", region: "Global" },
  { canonicalSymbol: "ETH", providerSymbol: "ethereum", name: "Ethereum", assetClass: "CRYPTO", currency: "AUD", region: "Global" },
  { canonicalSymbol: "SOL", providerSymbol: "solana", name: "Solana", assetClass: "CRYPTO", currency: "AUD", region: "Global" },
  { canonicalSymbol: "XRP", providerSymbol: "ripple", name: "XRP", assetClass: "CRYPTO", currency: "AUD", region: "Global" },
] as const;

export function getInstruments(assetClass?: AssetClass): InstrumentDefinition[] {
  return instrumentRegistry.filter((item) => !assetClass || item.assetClass === assetClass);
}

export function getInstrument(canonicalSymbol: string): InstrumentDefinition | undefined {
  return instrumentRegistry.find((item) => item.canonicalSymbol === canonicalSymbol.toUpperCase());
}

export function getInstrumentByProviderSymbol(providerSymbol: string): InstrumentDefinition | undefined {
  return instrumentRegistry.find((item) => item.providerSymbol === providerSymbol);
}
