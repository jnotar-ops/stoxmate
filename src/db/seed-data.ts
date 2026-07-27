import { db } from "./index";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

export async function seedDatabaseIfNeeded() {
  try {
    // Check if digital asset intelligence is seeded; if not, clear and re-seed with all current fields
    const existingCrypto = await db.select().from(schema.cryptoAssets).limit(1);
    if (existingCrypto.length > 0) {
      return { seeded: false, message: "Database already seeded with global indices, digital assets & rich media articles." };
    }

    console.log("Seeding StoxMate database with Global Indices, Digital Assets, Top News, Images & Australian market data...");

    // Clean existing data for smooth upgrade
    await db.delete(schema.cryptoAssets);
    await db.delete(schema.watchlistItems);
    await db.delete(schema.watchlists);
    await db.delete(schema.portfolioHoldings);
    await db.delete(schema.portfolios);
    await db.delete(schema.aiChatQueries);
    await db.delete(schema.scenarioModels);
    await db.delete(schema.macroIndicators);
    await db.delete(schema.aiInsights);
    await db.delete(schema.asxCompanies);
    await db.delete(schema.users);
    await db.delete(schema.globalIndices);

    // 1. Seed Users
    const [user] = await db.insert(schema.users).values({
      name: "Alex Vance",
      email: "alex.vance@investor.com.au",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      subscriptionTier: "FOUNDING_MEMBER",
      trialDaysRemaining: 28,
      investorProfile: "Long-Term Growth & Dividends",
      riskTolerance: "Moderate",
      onboardingCompleted: true,
    }).returning();

    // 2. Seed Bloomberg-Style Global Indices & International to Local ASX Bridge
    const globalIndicesData = [
      {
        ticker: "DOW JONES",
        name: "Dow Jones Industrial Avg",
        region: "US / Americas",
        currentValue: "42,310.50",
        numericValue: 42310.50,
        dailyChange: 312.40,
        dailyChangePercent: 0.74,
        status: "Closed (Overnight)",
        aiAsxImpactSummary: "Strong cyclical and banking leadership on Wall Street provides overnight positive momentum for ASX financial leaders (CBA, NAB, WBC) and industrial conglomerates (WES).",
        affectedAsxTickers: ["CBA", "NAB", "WBC", "WES", "MQG"]
      },
      {
        ticker: "S&P 500",
        name: "S&P 500 Index",
        region: "US / Americas",
        currentValue: "5,760.80",
        numericValue: 5760.80,
        dailyChange: 42.10,
        dailyChangePercent: 0.74,
        status: "Closed (Overnight)",
        aiAsxImpactSummary: "Broad-based US equity expansion confirms sustained risk-on liquidity, supporting valuation multiples for high-grade ASX growth & tech platforms.",
        affectedAsxTickers: ["CSL", "REA", "ALL", "MQG", "TLS"]
      },
      {
        ticker: "NASDAQ 100",
        name: "Nasdaq Tech Composite",
        region: "US / Americas",
        currentValue: "20,150.40",
        numericValue: 20150.40,
        dailyChange: 218.60,
        dailyChangePercent: 1.10,
        status: "Closed (Overnight)",
        aiAsxImpactSummary: "Artificial Intelligence and cloud infrastructure capital spending surges in US directly benefit Australian digital monopolies and data centers (REA, NEXTDC).",
        affectedAsxTickers: ["REA", "TLS", "CPU", "NXT", "ALL"]
      },
      {
        ticker: "NYMEX WTI",
        name: "NYMEX WTI Crude Oil",
        region: "Commodity Markets",
        currentValue: "$78.40/bbl",
        numericValue: 78.40,
        dailyChange: -1.25,
        dailyChangePercent: -1.57,
        status: "Live Futures",
        aiAsxImpactSummary: "Softening global crude futures due to inventory builds in Cushing create short-term margin headwind for Australian energy exporters (WDS, STO, BPT).",
        affectedAsxTickers: ["WDS", "STO", "BPT", "QAN"]
      },
      {
        ticker: "NIKKEI 225",
        name: "Nikkei 225 Tokyo",
        region: "Asia-Pacific",
        currentValue: "39,450.20",
        numericValue: 39450.20,
        dailyChange: 540.80,
        dailyChangePercent: 1.39,
        status: "Live Trading",
        aiAsxImpactSummary: "Robust Japanese economic activity and weak Yen stimulate heavy Japanese LNG and coking coal utility import demand from Pilbara and Queensland producers.",
        affectedAsxTickers: ["WDS", "BHP", "FMG", "RIO", "NHC"]
      },
      {
        ticker: "HANG SENG",
        name: "Hong Kong Hang Seng",
        region: "Asia-Pacific",
        currentValue: "18,920.60",
        numericValue: 18920.60,
        dailyChange: -142.50,
        dailyChangePercent: -0.75,
        status: "Live Trading",
        aiAsxImpactSummary: "Persistent property developer deleveraging in Mainland China restricts steel mill output in Hebei, capping spot iron ore rebound potential.",
        affectedAsxTickers: ["BHP", "FMG", "RIO", "MIN"]
      },
      {
        ticker: "COMEX GOLD",
        name: "COMEX Gold Futures USD",
        region: "Commodity Markets",
        currentValue: "$2,642.50/oz",
        numericValue: 2642.50,
        dailyChange: 22.40,
        dailyChangePercent: 0.85,
        status: "Live Futures",
        aiAsxImpactSummary: "Central bank gold reserves accumulation and safe-haven hedging lift cash operating margins to historic records for ASX Tier-1 gold miners.",
        affectedAsxTickers: ["NST", "EVN", "GMD", "BHP"]
      },
      {
        ticker: "SINGAPORE FE",
        name: "62% Iron Ore CFR China",
        region: "Commodity Markets",
        currentValue: "$102.50/t",
        numericValue: 102.50,
        dailyChange: -1.20,
        dailyChangePercent: -1.16,
        status: "Live Futures",
        aiAsxImpactSummary: "While slightly lower today, pricing well above miner cash costs (~US$45/t) ensures secure fully franked dividend distribution visibility for large resource miners.",
        affectedAsxTickers: ["BHP", "FMG", "RIO", "MIN"]
      },
      {
        ticker: "FTSE 100",
        name: "London FTSE 100",
        region: "Europe",
        currentValue: "8,340.20",
        numericValue: 8340.20,
        dailyChange: 38.50,
        dailyChangePercent: 0.46,
        status: "Closed (Overnight)",
        aiAsxImpactSummary: "European banking stability and resource valuation alignment anchor UK-listed mining depository shares, stabilizing dual-listed arbitrage spreads.",
        affectedAsxTickers: ["BHP", "RIO", "MQG"]
      },
      {
        ticker: "ASX 200 (XJO)",
        name: "S&P/ASX 200 Index",
        region: "Australia",
        currentValue: "8,245.80",
        numericValue: 8245.80,
        dailyChange: 48.20,
        dailyChangePercent: 0.59,
        status: "Live Trading",
        aiAsxImpactSummary: "Australian market leads upward led by financial sector dividend inflows and battery mineral short-covering following Chinese spodumene price recovery.",
        affectedAsxTickers: ["CBA", "BHP", "CSL", "WBC", "PLS"]
      }
    ];

    await db.insert(schema.globalIndices).values(globalIndicesData);

    // 2b. Seed Digital Assets (Crypto) Intelligence — Australian regulated access lens
    const cryptoData = [
      {
        symbol: "BTC",
        name: "Bitcoin",
        assetType: "Digital Asset",
        currentPriceAud: 164500.00,
        dailyChangePercent: 2.40,
        marketCap: "$3.26T AUD",
        marketCapVal: 3260.0,
        volatility30d: 48.2,
        correlationAsx200: 0.31,
        correlationGold: 0.44,
        correlationNasdaq: 0.68,
        riskLevel: "Very High",
        aiConfidenceScore: 82,
        asxAccessRoute: "Regulated ASX exposure available via spot Bitcoin ETFs: VBTC (VanEck) and EBTC (Global X 21Shares), both CHESS-settled through your existing Australian broker.",
        aiThesis: "Bitcoin's price behaviour is now dominated by global liquidity conditions rather than retail speculation. Its 0.68 correlation to the Nasdaq means it behaves as a long-duration risk asset: it typically strengthens when real yields fall and US dollar liquidity expands — the same macro conditions that support ASX growth names like REA and ALL.",
        aiRiskNote: "30-day annualised volatility of 48.2% is roughly 4x the ASX 200. Drawdowns of 50-70% have occurred in every prior cycle. Position sizing, not price prediction, is the dominant driver of investor outcomes.",
        regulatoryNote: "Digital asset exchanges operating in Australia must register with AUSTRAC. The ATO treats crypto as a CGT asset — disposals (including crypto-to-crypto swaps) are CGT events, with a 50% discount available after 12 months for eligible holders.",
        imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop&q=80",
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        assetType: "Digital Asset",
        currentPriceAud: 5320.00,
        dailyChangePercent: 3.15,
        marketCap: "$640B AUD",
        marketCapVal: 640.0,
        volatility30d: 56.8,
        correlationAsx200: 0.28,
        correlationGold: 0.21,
        correlationNasdaq: 0.72,
        riskLevel: "Very High",
        aiConfidenceScore: 78,
        asxAccessRoute: "Regulated ASX exposure via VanEck Ethereum ETF units; direct custody requires an AUSTRAC-registered exchange.",
        aiThesis: "Ethereum's investment case rests on network fee revenue and staking yield rather than scarcity. Post-upgrade transaction costs have compressed, expanding usage but reducing fee burn — a genuine tension our AI flags rather than glosses over.",
        aiRiskNote: "Protocol competition (Solana, layer-2 fragmentation) and staking concentration remain unresolved structural risks. Fee revenue is cyclical and has not yet demonstrated resilience through a full credit cycle.",
        regulatoryNote: "Staking rewards are assessable income at the AUD market value on receipt under current ATO guidance, with a separate CGT event on later disposal.",
        imageUrl: "https://images.unsplash.com/photo-1622790698141-94e30457ef12?w=800&auto=format&fit=crop&q=80",
      },
      {
        symbol: "SOL",
        name: "Solana",
        assetType: "Digital Asset",
        currentPriceAud: 296.40,
        dailyChangePercent: -1.85,
        marketCap: "$158B AUD",
        marketCapVal: 158.0,
        volatility30d: 74.5,
        correlationAsx200: 0.22,
        correlationGold: 0.09,
        correlationNasdaq: 0.66,
        riskLevel: "Very High",
        aiConfidenceScore: 68,
        asxAccessRoute: "No ASX-listed spot product currently available. Australian exposure requires an AUSTRAC-registered exchange with self-custody or third-party custody risk.",
        aiThesis: "Solana captures the majority of high-frequency, low-value on-chain settlement. Throughput leadership is measurable and verifiable; long-term fee capture and validator economics are not yet proven across a downturn.",
        aiRiskNote: "Highest volatility in our coverage (74.5% annualised) and historical network outage events. Our AI confidence is deliberately lower here (68%) because on-chain activity metrics can be inflated by wash transactions.",
        regulatoryNote: "Assets held on offshore exchanges may sit outside Australian consumer protections. ASIC has repeatedly warned that most crypto assets are not regulated financial products.",
        imageUrl: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=800&auto=format&fit=crop&q=80",
      },
      {
        symbol: "VBTC",
        name: "VanEck Bitcoin ETF (ASX)",
        assetType: "ASX Listed Crypto ETF",
        currentPriceAud: 42.85,
        dailyChangePercent: 2.28,
        marketCap: "$1.1B AUD",
        marketCapVal: 1.1,
        volatility30d: 47.6,
        correlationAsx200: 0.30,
        correlationGold: 0.43,
        correlationNasdaq: 0.67,
        riskLevel: "High",
        aiConfidenceScore: 91,
        asxAccessRoute: "Trades on the ASX like any share — settles through CHESS, holdable inside an SMSF, no private key or exchange custody required.",
        aiThesis: "For Australian SMSF trustees, VBTC removes the operational and audit burden of private key custody. It converts an unregulated asset into a regulated, CHESS-settled ASX line item with transparent NAV — the single largest barrier to institutional adoption in Australia.",
        aiRiskNote: "Management fees (approx. 0.45% p.a.) create long-term tracking drag versus spot. The ETF still carries 100% of Bitcoin's underlying price volatility — the wrapper reduces operational risk, not market risk.",
        regulatoryNote: "As a registered managed investment scheme, VBTC provides a PDS and TMD — documents that do not exist for direct crypto purchases.",
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop&q=80",
      },
      {
        symbol: "EBTC",
        name: "Global X 21Shares Bitcoin ETF (ASX)",
        assetType: "ASX Listed Crypto ETF",
        currentPriceAud: 28.10,
        dailyChangePercent: 2.34,
        marketCap: "$310M AUD",
        marketCapVal: 0.31,
        volatility30d: 47.9,
        correlationAsx200: 0.29,
        correlationGold: 0.42,
        correlationNasdaq: 0.67,
        riskLevel: "High",
        aiConfidenceScore: 89,
        asxAccessRoute: "ASX-quoted spot Bitcoin ETF with cold-storage custody handled by the responsible entity.",
        aiThesis: "EBTC and VBTC are functionally near-identical exposures; the differentiator is fee structure and spread liquidity. Our AI monitors bid-ask spreads intraday, as smaller fund size can widen execution costs during volatile sessions.",
        aiRiskNote: "Lower funds under management than VBTC can mean wider spreads on large parcels — a measurable, often overlooked cost for larger SMSF orders.",
        regulatoryNote: "Held via CHESS with standard ASX investor protections; underlying asset remains unregulated.",
        imageUrl: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&auto=format&fit=crop&q=80",
      },
      {
        symbol: "DCC",
        name: "DigitalX Limited (ASX)",
        assetType: "ASX Listed Crypto Equity",
        currentPriceAud: 0.088,
        dailyChangePercent: 4.76,
        marketCap: "$96M AUD",
        marketCapVal: 0.096,
        volatility30d: 68.4,
        correlationAsx200: 0.34,
        correlationGold: 0.18,
        correlationNasdaq: 0.61,
        riskLevel: "Very High",
        aiConfidenceScore: 71,
        asxAccessRoute: "Ordinary ASX-listed small-cap equity — operating business exposure rather than direct spot price exposure.",
        aiThesis: "DigitalX is an operating company (funds management and treasury holdings), not a passive tracker. Its share price reflects both digital asset prices and business execution — a leveraged, and therefore imperfect, proxy for Bitcoin exposure.",
        aiRiskNote: "Micro-cap liquidity, key-person dependency, and balance sheet mark-to-market swings. Historically trades at a premium or discount to net asset backing that can persist for quarters.",
        regulatoryNote: "Standard ASX-listed entity subject to continuous disclosure obligations under ASX Listing Rule 3.1.",
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
      }
    ];

    await db.insert(schema.cryptoAssets).values(cryptoData);

    // 3. Seed ASX Companies
    const companiesData = [
      {
        ticker: "BHP",
        name: "BHP Group Limited",
        sector: "Materials",
        industry: "Diversified Metals & Mining",
        marketCap: "$214.5B",
        marketCapVal: 214.5,
        currentPrice: 41.80,
        dailyChange: -0.36,
        dailyChangePercent: -0.85,
        peRatio: 11.4,
        dividendYield: 5.8,
        analystConsensus: "Buy",
        aiConfidenceScore: 91,
        fairValue: 46.50,
        healthScore: 88,
        valuationScore: 85,
        futureGrowthScore: 68,
        dividendScore: 94,
        pastPerformanceScore: 82,
        description: "BHP is a world-leading resources company extracting copper, iron ore, nickel, metallurgical coal, and potash with significant operations in Australia and the Americas.",
        logoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "CBA",
        name: "Commonwealth Bank of Australia",
        sector: "Financials",
        industry: "Diversified Banks",
        marketCap: "$235.0B",
        marketCapVal: 235.0,
        currentPrice: 141.20,
        dailyChange: 1.72,
        dailyChangePercent: 1.24,
        peRatio: 21.8,
        dividendYield: 3.6,
        analystConsensus: "Hold",
        aiConfidenceScore: 94,
        fairValue: 128.00,
        healthScore: 92,
        valuationScore: 42,
        futureGrowthScore: 71,
        dividendScore: 88,
        pastPerformanceScore: 96,
        description: "Commonwealth Bank is Australia's premier provider of integrated financial services, commanding the largest retail and business banking market share in the country.",
        logoUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "CSL",
        name: "CSL Limited",
        sector: "Health Care",
        industry: "Biotechnology",
        marketCap: "$145.2B",
        marketCapVal: 145.2,
        currentPrice: 298.50,
        dailyChange: 6.30,
        dailyChangePercent: 2.15,
        peRatio: 34.2,
        dividendYield: 1.4,
        analystConsensus: "Strong Buy",
        aiConfidenceScore: 89,
        fairValue: 335.00,
        healthScore: 84,
        valuationScore: 78,
        futureGrowthScore: 91,
        dividendScore: 65,
        pastPerformanceScore: 88,
        description: "CSL is a global biotechnology leader specializing in biotherapies and influenza vaccines, operating through CSL Behring, CSL Seqirus, and CSL Vifor.",
        logoUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "WDS",
        name: "Woodside Energy Group Ltd",
        sector: "Energy",
        industry: "Oil & Gas Exploration & Production",
        marketCap: "$52.8B",
        marketCapVal: 52.8,
        currentPrice: 27.90,
        dailyChange: -0.40,
        dailyChangePercent: -1.40,
        peRatio: 9.8,
        dividendYield: 7.2,
        analystConsensus: "Hold",
        aiConfidenceScore: 86,
        fairValue: 31.50,
        healthScore: 81,
        valuationScore: 89,
        futureGrowthScore: 55,
        dividendScore: 96,
        pastPerformanceScore: 75,
        description: "Woodside Energy is a global energy pioneer and Australia's largest independent dedicated oil and gas producer, with world-class LNG assets in Western Australia.",
        logoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "FMG",
        name: "Fortescue Ltd",
        sector: "Materials",
        industry: "Iron Ore Mining & Green Energy",
        marketCap: "$56.4B",
        marketCapVal: 56.4,
        currentPrice: 18.30,
        dailyChange: -0.43,
        dailyChangePercent: -2.30,
        peRatio: 8.5,
        dividendYield: 8.6,
        analystConsensus: "Hold",
        aiConfidenceScore: 85,
        fairValue: 19.80,
        healthScore: 79,
        valuationScore: 84,
        futureGrowthScore: 62,
        dividendScore: 95,
        pastPerformanceScore: 84,
        description: "Fortescue is a global green energy and metals company, recognized as one of the lowest-cost iron ore producers in the world with ambitious zero-carbon hydrogen goals.",
        logoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "WBC",
        name: "Westpac Banking Corporation",
        sector: "Financials",
        industry: "Diversified Banks",
        marketCap: "$98.6B",
        marketCapVal: 98.6,
        currentPrice: 28.40,
        dailyChange: 0.18,
        dailyChangePercent: 0.65,
        peRatio: 14.2,
        dividendYield: 5.1,
        analystConsensus: "Buy",
        aiConfidenceScore: 90,
        fairValue: 30.20,
        healthScore: 87,
        valuationScore: 72,
        futureGrowthScore: 66,
        dividendScore: 90,
        pastPerformanceScore: 80,
        description: "Westpac is Australia's first bank and oldest company, serving millions of customers across consumer banking, business banking, and wealth management.",
        logoUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "NAB",
        name: "National Australia Bank Limited",
        sector: "Financials",
        industry: "Diversified Banks",
        marketCap: "$115.4B",
        marketCapVal: 115.4,
        currentPrice: 37.20,
        dailyChange: 0.30,
        dailyChangePercent: 0.80,
        peRatio: 15.1,
        dividendYield: 4.8,
        analystConsensus: "Buy",
        aiConfidenceScore: 92,
        fairValue: 39.50,
        healthScore: 89,
        valuationScore: 74,
        futureGrowthScore: 69,
        dividendScore: 89,
        pastPerformanceScore: 83,
        description: "NAB is a major Australian commercial bank and the nation's leading business bank, offering comprehensive services across Australia and New Zealand.",
        logoUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "PLS",
        name: "Pilbara Minerals Limited",
        sector: "Materials",
        industry: "Lithium & Clean Energy Minerals",
        marketCap: "$9.2B",
        marketCapVal: 9.2,
        currentPrice: 3.08,
        dailyChange: 0.14,
        dailyChangePercent: 4.80,
        peRatio: 18.4,
        dividendYield: 2.1,
        analystConsensus: "Strong Buy",
        aiConfidenceScore: 88,
        fairValue: 4.20,
        healthScore: 95,
        valuationScore: 88,
        futureGrowthScore: 94,
        dividendScore: 58,
        pastPerformanceScore: 70,
        description: "Pilbara Minerals is a pure-play lithium exploration and mining company operating the 100% owned Pilgangoora hard-rock lithium deposit in Western Australia's resource-rich Pilbara region.",
        logoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "REA",
        name: "REA Group Ltd",
        sector: "Information Technology",
        industry: "Digital Real Estate Platforms",
        marketCap: "$27.5B",
        marketCapVal: 27.5,
        currentPrice: 208.40,
        dailyChange: 3.28,
        dailyChangePercent: 1.60,
        peRatio: 48.5,
        dividendYield: 1.1,
        analystConsensus: "Buy",
        aiConfidenceScore: 93,
        fairValue: 215.00,
        healthScore: 91,
        valuationScore: 58,
        futureGrowthScore: 89,
        dividendScore: 60,
        pastPerformanceScore: 94,
        description: "REA Group is a global digital advertising company specializing in property, operating Australia's #1 residential and commercial property websites realestate.com.au and realcommercial.com.au.",
        logoUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "WES",
        name: "Wesfarmers Limited",
        sector: "Consumer Discretionary",
        industry: "Retail Conglomerate & Chemicals",
        marketCap: "$78.2B",
        marketCapVal: 78.2,
        currentPrice: 69.10,
        dailyChange: 0.31,
        dailyChangePercent: 0.45,
        peRatio: 24.6,
        dividendYield: 3.1,
        analystConsensus: "Hold",
        aiConfidenceScore: 95,
        fairValue: 68.00,
        healthScore: 94,
        valuationScore: 68,
        futureGrowthScore: 76,
        dividendScore: 86,
        pastPerformanceScore: 95,
        description: "Wesfarmers is one of Australia's largest listed companies with diverse business operations covering home improvement (Bunnings), apparel and general merchandise (Kmart, Target), and chemicals.",
        logoUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "TLS",
        name: "Telstra Group Limited",
        sector: "Telecommunications",
        industry: "Integrated Telecom Services",
        marketCap: "$44.8B",
        marketCapVal: 44.8,
        currentPrice: 3.88,
        dailyChange: 0.01,
        dailyChangePercent: 0.25,
        peRatio: 21.0,
        dividendYield: 4.6,
        analystConsensus: "Buy",
        aiConfidenceScore: 96,
        fairValue: 4.30,
        healthScore: 86,
        valuationScore: 82,
        futureGrowthScore: 70,
        dividendScore: 92,
        pastPerformanceScore: 85,
        description: "Telstra is Australia's leading telecommunications and technology company, offering a full range of communications services and competing in all telecommunications markets.",
        logoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "MQG",
        name: "Macquarie Group Limited",
        sector: "Financials",
        industry: "Asset Management & Investment Banking",
        marketCap: "$84.2B",
        marketCapVal: 84.2,
        currentPrice: 220.50,
        dailyChange: 2.40,
        dailyChangePercent: 1.10,
        peRatio: 22.4,
        dividendYield: 3.2,
        analystConsensus: "Strong Buy",
        aiConfidenceScore: 91,
        fairValue: 245.00,
        healthScore: 88,
        valuationScore: 75,
        futureGrowthScore: 88,
        dividendScore: 82,
        pastPerformanceScore: 93,
        description: "Macquarie Group is a global financial services group providing asset management and finance, banking, advisory, and risk and capital solutions across debt, equity, and commodities.",
        logoUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "WOW",
        name: "Woolworths Group Limited",
        sector: "Consumer Staples",
        industry: "Food & Drug Retailing",
        marketCap: "$36.4B",
        marketCapVal: 36.4,
        currentPrice: 29.80,
        dailyChange: -0.15,
        dailyChangePercent: -0.50,
        peRatio: 20.8,
        dividendYield: 3.5,
        analystConsensus: "Buy",
        aiConfidenceScore: 93,
        fairValue: 33.50,
        healthScore: 85,
        valuationScore: 80,
        futureGrowthScore: 68,
        dividendScore: 85,
        pastPerformanceScore: 86,
        description: "Woolworths Group is Australia's largest retailer, operating flagship supermarket chains across Australia and New Zealand alongside everyday needs platforms and supply chain analytics.",
        logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=80",
      },
      {
        ticker: "ALL",
        name: "Aristocrat Leisure Limited",
        sector: "Consumer Discretionary",
        industry: "Gaming & Digital Entertainment",
        marketCap: "$38.6B",
        marketCapVal: 38.6,
        currentPrice: 60.20,
        dailyChange: 1.09,
        dailyChangePercent: 1.85,
        peRatio: 26.2,
        dividendYield: 1.3,
        analystConsensus: "Strong Buy",
        aiConfidenceScore: 90,
        fairValue: 68.00,
        healthScore: 93,
        valuationScore: 76,
        futureGrowthScore: 91,
        dividendScore: 64,
        pastPerformanceScore: 92,
        description: "Aristocrat Leisure is a leading global gaming content and technology company and a top-tier publisher of free-to-play mobile games through its Pixel United division.",
        logoUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&auto=format&fit=crop&q=80",
      }
    ];

    await db.insert(schema.asxCompanies).values(companiesData);

    // 4. Seed AI Insights (Enriched with Pictures, News Categories & International Bridge)
    const insightsData = [
      {
        title: "The 8:00 AM Australian Market Briefing: Resource Divergence & Wall Street Overnight Flows",
        subtitle: "Key overnight shifts: Dow Jones rallies +312 pts in US while Chinese domestic lithium spot prices surge +5.8%, setting up a strong divergence at ASX open.",
        companyTicker: null,
        companyName: "Australian Market Briefing",
        category: "Macroeconomic Event",
        impactLevel: "Critical",
        sentiment: "Bullish",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80",
        newsType: "MORNING_BRIEFING",
        internationalLink: "Overnight rally on Wall Street (Dow Jones +0.74%, Nasdaq +1.10%) provides strong tailwinds for Australian banking and technology equities at open, offsetting minor softness in NYMEX crude futures ($78.40/bbl).",
        whatHappened: [
          "Wall Street indices (Dow Jones, S&P 500) closed near record highs overnight as US labor cost inflation cooled, solidifying expectation of global rate cutting cycles.",
          "Chinese domestic lithium carbonate spot prices jumped +5.8% to $14,200/t on urgent EV supply chain restocking demand in Guangzhou.",
          "Iron ore futures in Singapore pulled back 1.2% to $102.50/t as steel mill profit margins remained disciplined in Hebei province.",
          "Australian 3-year government bond yields eased 4 basis points to 3.82%, pricing in 78% probability that RBA cash rate cuts initiate by Q3 2026."
        ],
        whyItMatters: "To understand the local Australian market, investors must look offshore first. Australia is an resource-exporting and financial capital hub. When US equities surge and bond yields fall, international institutional capital flows directly into ASX large-cap financials (CBA, NAB) and growth leaders (REA). Simultaneously, the rebound in Chinese lithium spot prices marks a crucial turning point for heavily shorted ASX clean energy miners (PLS, FMG).",
        implications: {
          shortTerm: "Positive momentum for lithium miners (PLS, LTM) and major banks (CBA, WBC) at open; slight early headwind for oil producers (WDS) due to NYMEX dip.",
          longTerm: "As global rate-cutting cycles mature in late 2026, dividend-paying ASX financials and high-margin tech leaders (REA, ALL) are structurally positioned to re-rate higher on lower equity discount rates.",
          cashflowImpact: "Resource companies with bottom-quartile operating costs (like Pilbara Minerals at ~US$650/t CIF) will immediately capture margin expansion from spot price recovery."
        },
        whatToWatch: [
          "ABS Quarterly Consumer Price Index (CPI) release next Wednesday at 11:30 AM AEST.",
          "BHP Group FY26 Operational Review briefing calls scheduled for Thursday afternoon.",
          "NYMEX Crude Oil and Singapore Iron Ore futures trading during early afternoon Asian trading hours."
        ],
        evidence: [
          { source: "Dow Jones & NYMEX Real-Time Feeds", metric: "US Equity Inflows & Crude Spot", detail: "S&P 500 advance-decline ratio hit 4.2-to-1, confirming broad market breadth leading into Asian trading hours." },
          { source: "Fastmarkets & Guangzhou Commodities Exchange", metric: "Lithium Spot Price Index", detail: "Battery-grade lithium carbonate increased +$780/t WoW with trading volumes up 34% in Mainland China." },
          { source: "RBA Interbank Cash Rate Futures", metric: "30-Day Interbank Cash Rate Implied Yield", detail: "Market prices a 78% probability of an RBA rate cut by August 2026, up from 62% last month." }
        ],
        aiConfidence: 94,
        aiConfidenceReason: "High confidence driven by cross-referenced NYSE exchange data, institutional fund flow filings, and liquid RBA futures pricing.",
        uncertainties: [
          "Whether Chinese lithium restocking represents sustained structural demand or temporary pre-holiday inventory building.",
          "Geopolitical trade tariff announcements that could alter global energy export shipping tariffs."
        ],
        isMorningBriefing: true,
        readTimeMinutes: 4,
        likesCount: 342,
        bookmarksCount: 189,
      },
      {
        title: "BHP Q3 Operational Review: Record Escondida Copper Production Offsets China Iron Ore Slowdown",
        subtitle: "BHP reported a 9% YoY increase in copper output, providing a crucial earnings hedge against softening Chinese steel construction.",
        companyTicker: "BHP",
        companyName: "BHP Group Limited",
        category: "ASX Announcement",
        impactLevel: "High",
        sentiment: "Bullish",
        imageUrl: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80",
        newsType: "TOP_NEWS",
        internationalLink: "LME Copper Futures in London hit US$9,750/t ($4.42/lb) overnight driven by US AI data center grid expansion, directly rewarding BHP's strategic pivot toward South American and Australian copper mining.",
        whatHappened: [
          "BHP released its operational review showing copper production reached 476kt for the quarter, driven by higher ore grades and concentrator throughput at Escondida in Chile.",
          "Western Australia Iron Ore (WAIO) shipments remained steady at 71.2 Mt, on track to meet full-year guidance of 282–294 Mt.",
          "Unit cash costs for WAIO were reaffirmed in the lower half of the US$18.00–US$19.50/t guidance range, demonstrating exceptional mining cost discipline."
        ],
        whyItMatters: "BHP is strategically transforming from a traditional iron ore dependency into a future-facing green metals powerhouse. With global electrification requiring 2x current copper supply by 2035, BHP's copper segment now generates nearly 45% of group EBITDA, insulating Australian shareholders from Chinese residential construction volatility.",
        implications: {
          shortTerm: "BHP share price expected to outperform pure-play bulk mining peers (RIO, FMG) due to copper exposure and low unit cost confirmation.",
          longTerm: "Sustained free cash flow generation ensures the 5.8% dividend yield is highly secure, with room for capital return buybacks in FY27.",
          cashflowImpact: "Every US$0.10/lb move in realized copper prices on the LME adds approximately US$220M to BHP's annualized after-tax cash flow."
        },
        whatToWatch: [
          "Jansen Potash Stage 1 project execution milestones and capital expenditure schedule in Canada.",
          "Global copper smelting treatment and refining charges (TC/RCs), which recently hit historic lows.",
          "Annual financial results presentation on August 19, 2026."
        ],
        evidence: [
          { source: "BHP Official ASX Release (Ref: #BHP-2026-OP-03)", metric: "Escondida Copper Grade", detail: "Average copper head grade increased from 0.79% to 0.88%, beating analyst consensus estimates of 0.84%." },
          { source: "LME & COMEX Copper Futures", metric: "Spot Copper Price", detail: "Copper is trading firm at US$4.42/lb, up 14% year-to-date on structural global grid and data center demand." }
        ],
        aiConfidence: 91,
        aiConfidenceReason: "Verified directly from audited operational filings and London Metal Exchange pricing feeds.",
        uncertainties: [
          "Potential labor union wage negotiation disruptions at Chilean copper operations in Q4.",
          "Adverse weather events during the upcoming Australian cyclone season affecting Port Hedland shipping berths."
        ],
        isMorningBriefing: false,
        readTimeMinutes: 3,
        likesCount: 214,
        bookmarksCount: 98,
      },
      {
        title: "CBA Valuation Divergence: Why Wall Street Consensus Holds Sell While Aussie Retail Inflows Hit Records",
        subtitle: "At 21.8x forward P/E, Commonwealth Bank trades at a historic 45% premium to US and European bank peers. Our AI unlocks the mechanics behind the premium.",
        companyTicker: "CBA",
        companyName: "Commonwealth Bank of Australia",
        category: "Analyst Consensus",
        impactLevel: "High",
        sentiment: "Neutral",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
        newsType: "TOP_NEWS",
        internationalLink: "While global investment banks (Morgan Stanley, Goldman Sachs) evaluate CBA using global P/E benchmarks (where US banks trade at ~12.5x), Australian SMSF retirement tax incentives and compulsory superannuation inflows create a unique local liquidity premium that offshore analysts consistently underestimate.",
        whatHappened: [
          "Morgan Stanley and UBS both maintained 'Underweight / Sell' ratings on CBA this morning with 12-month target prices around $105-$110, citing extreme valuation multiples.",
          "Despite broker downgrades, CBA shares reached $141.20, driven by persistent retail buying through SMSF accounts and institutional index-tracking passive flows.",
          "CBA's Return on Equity (ROE) expanded to 13.8%, widening its profitability gap over peers NAB (11.9%), WBC (11.2%), and ANZ (10.4%)."
        ],
        whyItMatters: "CBA has become the 'safety asset' of the Australian stock market. Rather than valuing it as a cyclical bank, local investors treat CBA like a high-quality consumer franchise and technology platform due to its #1 digital banking app (CommBank app has 8.5M active daily users) and industry-lowest bad debt impairment ratios.",
        implications: {
          shortTerm: "Share price may experience high sensitivity to any negative surprises in net interest margin (NIM) guidance during upcoming trading updates.",
          longTerm: "CBA's superior technology stack gives it a structural cost-to-income advantage (currently ~43%), ensuring consistent dividend payouts even if credit growth slows.",
          cashflowImpact: "Fully franked dividend yield of 3.6% (equivalent to ~5.1% grossed-up) remains attractive for Australian tax-sensitive retiree investors."
        },
        whatToWatch: [
          "APRA monthly banking statistics for household mortgage market share shifts.",
          "CBA's net interest margin (NIM) trajectory in the face of deposit rate repricing competition.",
          "Delinquency rates in 90+ day home loan arrears as households absorb past rate hikes."
        ],
        evidence: [
          { source: "APRA Monthly Banking Statistics", metric: "Owner-Occupied Home Loan Book Growth", detail: "CBA captured 26.4% of all new Australian residential mortgage lending in the past quarter." },
          { source: "Bloomberg Consensus Broker Survey", metric: "Forward P/E Multiple Premium", detail: "CBA trades at 21.8x forward earnings versus US peers (JPMorgan 12.5x) and European banks (7.8x)." }
        ],
        aiConfidence: 94,
        aiConfidenceReason: "Robust data concordance between APRA regulatory filings, ASX trading tape volumes, and broker research notes.",
        uncertainties: [
          "Potential RBA macroprudential intervention if residential property credit growth accelerates excessively.",
          "Changes to Australian superannuation tax legislation affecting dividend imputation credits."
        ],
        isMorningBriefing: false,
        readTimeMinutes: 4,
        likesCount: 286,
        bookmarksCount: 152,
      },
      {
        title: "Pilbara Minerals (PLS): Spodumene Cost Advantage Shines As High-Cost Chinese Lepidolite Mines Shut Down",
        subtitle: "Recent battery raw material price stabilization highlights PLS as the cleanest high-beta play on the energy transition.",
        companyTicker: "PLS",
        companyName: "Pilbara Minerals Limited",
        category: "Sector Movement",
        impactLevel: "High",
        sentiment: "Bullish",
        imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
        newsType: "TOP_NEWS",
        internationalLink: "Overnight confirmation from Beijing that two high-cost lepidolite mines in Jiangxi suspended operations immediately boosted European EV battery supply confidence, directly driving institutional demand for Pilbara Minerals' low-cost Australian spodumene.",
        whatHappened: [
          "Pilbara Minerals shares surged +4.80% today to $3.08 following confirmation that two high-cost lepidolite mines in Jiangxi, China, suspended operations due to unremunerative margins.",
          "PLS maintained strong cash reserves of $1.6B AUD, giving it an fortress balance sheet to fund the P1000 expansion project without debt dilution.",
          "Short interest in PLS dropped by 1.8% of free float this week as offshore hedge funds began covering short positions ahead of quarterly production figures."
        ],
        whyItMatters: "In commodity downturns, low-cost producers win. Pilbara Minerals' unit cost of ~US$650/t CIF positions it in the bottom quartile of the global lithium cost curve. When competitors are forced to close mines, PLS gains permanent market share and is primed for massive operational leverage when prices recover.",
        implications: {
          shortTerm: "Short-squeeze potential could drive rapid price volatility toward the $3.40 resistance level.",
          longTerm: "Completion of the P1000 project will increase annual production capacity to 1 million tonnes of spodumene concentrate, cementing PLS as the world's premier independent lithium supplier.",
          cashflowImpact: "At current spot prices ($14,200/t LCE equivalent), PLS generates positive free cash flow, unlike 40% of global non-integrated peers."
        },
        whatToWatch: [
          "Battery cell inventory levels reported by CATL and BYD in upcoming monthly disclosures.",
          "Monthly electric vehicle (EV) sales data from China and Europe for Q3 trends.",
          "Commissioning timeline milestones for the P1000 expansion crushing circuit."
        ],
        evidence: [
          { source: "S&P Global Commodity Insights", metric: "Global Lithium Cost Curve Quartiles", detail: "PLS Pilgangoora deposit confirmed in 1st quartile of hard-rock spodumene cash costs globally." },
          { source: "ASIC Short Position Reports", metric: "Gross Short Interest % of Float", detail: "Short interest declined from 19.4% to 17.6%, marking the sharpest weekly reduction in 8 months." }
        ],
        aiConfidence: 88,
        aiConfidenceReason: "Verified via ASIC short sale registry downloads and audited quarterly cash flow reports.",
        uncertainties: [
          "Adoption speed of alternative sodium-ion battery chemistries in lower-range urban electric vehicles.",
          "Permitting delays or environmental compliance reviews for expansion waste rock storage facilities."
        ],
        isMorningBriefing: false,
        readTimeMinutes: 3,
        likesCount: 220,
        bookmarksCount: 130,
      },
      {
        title: "NYMEX Oil Pullback & Woodside Energy (WDS): Why Trion Deepwater Execution Remains Critical",
        subtitle: "With NYMEX WTI cooling to $78.40/bbl, Woodside reaffirmed long-term contract pricing and an 80% dividend payout ratio target.",
        companyTicker: "WDS",
        companyName: "Woodside Energy Group Ltd",
        category: "International Market Driver",
        impactLevel: "Medium",
        sentiment: "Neutral",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
        newsType: "LATEST_NEWS",
        internationalLink: "Woodside's LNG revenue is heavily indexed to NYMEX and JKM Asian spot benchmarks. While NYMEX futures softened overnight (-1.57%), Woodside's long-term utility supply contracts in Japan and South Korea provide a strong revenue floor.",
        whatHappened: [
          "NYMEX WTI futures eased to $78.40/bbl overnight following inventory builds in North American storage facilities.",
          "Woodside released its quarterly activities report confirming Scarborough energy project is now over 67% complete, with first LNG cargo on track for 2026.",
          "Realized LNG prices averaged US$10.80/MMBtu during the quarter, reflecting stable long-term oil-indexed contract pricing despite European spot market softness."
        ],
        whyItMatters: "For income-focused Australian investors, Woodside's 7.2% dividend yield is a primary portfolio anchor. Understanding the interplay between volatile NYMEX crude spot futures and stable 15-year Asian LNG utility supply agreements prevents investor panic during short-term oil pullbacks.",
        implications: {
          shortTerm: "Share price expected to trade in tight correlation with Brent and NYMEX crude futures around US$78-$82/bbl.",
          longTerm: "Once Scarborough commences production, Woodside's unit production costs will drop significantly, generating substantial free cash flow for increased dividends through 2030.",
          cashflowImpact: "High dividend payout ratio (80% of underlying NPAT) ensures immediate cash return to shareholders."
        },
        whatToWatch: [
          "Scarborough offshore floating production unit (FPU) hull arrival and installation in WA waters.",
          "Global LNG demand growth from Asian utility buyers (Japan, South Korea, India).",
          "OPEC+ production quota meetings and geopolitical developments in the Middle East."
        ],
        evidence: [
          { source: "Woodside Quarterly Activities Report (Ref: ASX:WDS)", metric: "Project Completion Percentage", detail: "Scarborough project construction reached 67.2%, within 1% of baseline project timeline." },
          { source: "NYMEX WTI & JKM Spot LNG Index", metric: "Realized Price Basket", detail: "82% of Woodside LNG sales remain tied to oil-indexed contracts, insulating revenue from spot volatility." }
        ],
        aiConfidence: 87,
        aiConfidenceReason: "High confidence based on contractual disclosures and engineering progress certification reports.",
        uncertainties: [
          "Potential regulatory or environmental legal challenges from climate activism groups in federal court.",
          "Global macroeconomic slowdown impacting industrial gas demand in manufacturing hubs."
        ],
        isMorningBriefing: false,
        readTimeMinutes: 3,
        likesCount: 154,
        bookmarksCount: 82,
      },
      {
        title: "Tokyo Nikkei Rally & Western Australian Iron Ore: Why FMG Offers an 8.6% Dividend Hedge",
        subtitle: "Japanese economic expansion and steel demand stabilization support Fortescue's world-class operational cash generation.",
        companyTicker: "FMG",
        companyName: "Fortescue Ltd",
        category: "International Market Driver",
        impactLevel: "Medium",
        sentiment: "Bullish",
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80",
        newsType: "LATEST_NEWS",
        internationalLink: "Tokyo's Nikkei 225 rally (+1.39% overnight) highlights robust Asian manufacturing throughput outside of Mainland China, providing diversified demand support for Fortescue's Pilbara bulk ship loading berths at Port Hedland.",
        whatHappened: [
          "Fortescue confirmed full-year iron ore shipments remaining firm within the 192–197 Mt guidance corridor.",
          "Singapore 62% Iron Ore futures maintained structural support above $100/t ($102.50/t today), ensuring exceptional operational margins above FMG's US$18.20/t C1 cost.",
          "Institutional investors on the ASX rotated into FMG today seeking strong dividend income yield ahead of upcoming distributions."
        ],
        whyItMatters: "While headlines focus solely on Chinese real estate debt, total seaborne iron ore demand is increasingly buffered by industrial expansion across Japan, South Korea, and Southeast Asia. At $102.50/t iron ore, Fortescue generates over US$65/t in operating profit margin, sustaining Australia's highest pure-play dividend yield.",
        implications: {
          shortTerm: "FMG share price will find strong chart support around $18.00 as dividend yield hunters step in on any pullbacks.",
          longTerm: "Success of Fortescue Future Industries (FFI) green hydrogen pilot projects will determine long-term enterprise terminal value.",
          cashflowImpact: "Generates massive operational cash flow capable of covering both regular dividends and green energy R&D."
        },
        whatToWatch: [
          "Port Hedland monthly port shipping volumes and vessel wait times.",
          "China National Development and Reform Commission (NDRC) infrastructure stimulus deployment.",
          "FMG's capital expenditure efficiency on green ammonia and zero-carbon mining equipment."
        ],
        evidence: [
          { source: "Port Hedland Port Authority Export Logs", metric: "Monthly Iron Ore Throughput", detail: "Exports to Asian utility and steel mill buyers remained within 2% of historic monthly record." },
          { source: "FMG Quarterly Production Report", metric: "C1 Unit Cash Costs", detail: "Unit operating costs held steady at US$18.20 per wet metric tonne." }
        ],
        aiConfidence: 89,
        aiConfidenceReason: "Verified through audited shipping authority logs and quarterly operational disclosures.",
        uncertainties: [
          "Potential changes in environmental emissions compliance standards for bulk carriers in international waters.",
          "Currency fluctuations in AUD/USD affecting realized Australian dollar revenues."
        ],
        isMorningBriefing: false,
        readTimeMinutes: 3,
        likesCount: 168,
        bookmarksCount: 94,
      }
    ];

    await db.insert(schema.aiInsights).values(insightsData);

    // 5. Seed Macro Indicators
    const macroData = [
      {
        name: "RBA Cash Rate",
        category: "Monetary",
        currentValue: "4.35%",
        numericValue: 4.35,
        change: "Unchanged",
        trend: "Stable",
        aiImplicationForAsx: "Terminal rate reached. Supportive for bank net interest margins (CBA, NAB) and stabilizes property valuation multiples (REA).",
      },
      {
        name: "AUD / USD",
        category: "Currency",
        currentValue: "$0.6542",
        numericValue: 0.6542,
        change: "+0.42%",
        trend: "Rising",
        aiImplicationForAsx: "Slightly stronger AUD reduces unhedged offshore earnings for global earners (CSL, MQG) but lowers imported inflation for retailers (WOW, WES).",
      },
      {
        name: "Iron Ore (62% Fe CFR China)",
        category: "Commodities",
        currentValue: "$102.50/t",
        numericValue: 102.50,
        change: "-1.20%",
        trend: "Stable",
        aiImplicationForAsx: "Prices remain well above miner breakevens (~$45/t), ensuring robust dividend cash flow for major miners (BHP, FMG, RIO).",
      },
      {
        name: "Lithium Carbonate (Battery Grade)",
        category: "Commodities",
        currentValue: "$14,200/t",
        numericValue: 14200,
        change: "+5.80%",
        trend: "Rising",
        aiImplicationForAsx: "Spot price recovery triggers short-covering in clean energy miners (PLS, IGO, LTM) and improves long-term project IRR.",
      },
      {
        name: "Gold (Spot USD)",
        category: "Commodities",
        currentValue: "$2,642/oz",
        numericValue: 2642,
        change: "+0.85%",
        trend: "Rising",
        aiImplicationForAsx: "Record high gold prices drive margin expansion and record free cash flow for ASX gold producers (NST, EVN, GMD).",
      },
      {
        name: "Australian CPI Inflation (YoY)",
        category: "Inflation",
        currentValue: "2.8%",
        numericValue: 2.8,
        change: "-0.20%",
        trend: "Falling",
        aiImplicationForAsx: "Inflation entering RBA target band (2-3%) opens the door for monetary easing cycles starting late 2026, boosting growth equities.",
      }
    ];

    await db.insert(schema.macroIndicators).values(macroData);

    // 6. Seed Scenario Models
    const scenarioData = [
      {
        title: "RBA Cuts Cash Rate by 50bps in H2 2026",
        category: "Monetary Policy",
        probability: 75,
        summary: "As inflation settles comfortably within the 2-3% target band and labor market tightness eases, the Reserve Bank of Australia initiates a dual 25bps rate reduction cycle.",
        affectedSectors: [
          { sector: "Real Estate Tech & REITs", impact: "Positive", reasoning: "Lower mortgage rates stimulate housing turnover and listing volumes on portals like REA Group and Domain." },
          { sector: "Consumer Discretionary", impact: "Positive", reasoning: "Reduced mortgage repayments unlock disposable income for household retail spending at Wesfarmers (Bunnings/Kmart)." },
          { sector: "Cash Yield Accounts & Term Deposits", impact: "Negative", reasoning: "Investors shift out of term deposits and cash into dividend-paying ASX blue chips and growth equities." }
        ],
        topStockBeneficiaries: ["REA", "WES", "CBA", "ALL", "CSL"],
        topStockRisks: ["QAN", "CPU"],
        detailedAnalysis: "Historical quantitative modeling of ASX 200 performance across 5 rate-cutting cycles since 1990 shows that high-quality growth stocks with predictable cash flows outperform the broader index by an average of 8.4% in the 12 months following the initial rate cut. REA Group exhibits the highest statistical beta to mortgage rate easing, while Commonwealth Bank benefits from lower credit impairment defaults across its residential mortgage portfolio."
      },
      {
        title: "China Property Sector Fiscal Stimulus Surge",
        category: "China Economy",
        probability: 55,
        summary: "Chinese policymakers deploy a targeted 2 Trillion RMB infrastructure and urban redevelopment credit facility to stabilize residential property construction and infrastructure spending.",
        affectedSectors: [
          { sector: "Materials & Resources", impact: "Positive", reasoning: "Direct increase in steel demand drives iron ore and metallurgical coal spot prices higher by an estimated 15-20%." },
          { sector: "Heavy Logistics & Shipping", impact: "Positive", reasoning: "Increased dry bulk shipping rates and export volumes from Western Australian ports." },
          { sector: "Defensive Consumer Staples", impact: "Mixed", reasoning: "Institutional portfolio managers rotate out of defensive supermarkets (WOW) into high-beta resource cyclicals." }
        ],
        topStockBeneficiaries: ["BHP", "FMG", "WDS"],
        topStockRisks: ["WOW", "TLS"],
        detailedAnalysis: "An infrastructure-led stimulus in China directly translates into order book expansion for Australian bulk commodity exporters. Fortescue (FMG) has the highest sensitivity to iron ore spot prices, where every US$10/t increase in iron ore adds approximately US$1.4B to FMG's annualized EBITDA. BHP also captures significant upside across both its Western Australia Iron Ore division and Escondida copper exports."
      },
      {
        title: "Global Battery Transition Speedup & Lithium Deficit",
        category: "Energy Transition",
        probability: 65,
        summary: "Accelerated EV adoption in developing markets combined with grid-scale battery storage mandates creates a structural supply deficit in spodumene concentrate by 2027.",
        affectedSectors: [
          { sector: "Clean Energy Minerals", impact: "Positive", reasoning: "Long-term contract pricing for battery-grade lithium carbonate and spodumene concentrate returns above historical incentive pricing ($20,000/t)." },
          { sector: "Traditional Fossil Fuels", impact: "Negative", reasoning: "Long-term terminal value discounting applied to thermal coal and unhedged oil extraction assets." }
        ],
        topStockBeneficiaries: ["PLS", "CSL", "MQG"],
        topStockRisks: ["WDS", "NHC"],
        detailedAnalysis: "Under this scenario, tier-1 lithium producers with operating mines and low capital intensity expand profitability exponentially. Pilbara Minerals (PLS) is modeled to see free cash flow yield expand to over 11% at $20,000/t LCE spot prices, enabling aggressive share buybacks and special dividends. Macquarie Group (MQG) also benefits through its Green Investment Group (GIG) financing advisory pipeline."
      }
    ];

    await db.insert(schema.scenarioModels).values(scenarioData);

    // 7. Seed Watchlist & Items
    const [watchlist] = await db.insert(schema.watchlists).values({
      userId: user.id,
      name: "Core ASX Dividend & Growth Watchlist",
      isDefault: true,
    }).returning();

    await db.insert(schema.watchlistItems).values([
      { watchlistId: watchlist.id, companyTicker: "BHP", alertOnPriceChangePercent: 2.5, alertOnInsiderTrading: true, alertOnEarnings: true },
      { watchlistId: watchlist.id, companyTicker: "CBA", alertOnPriceChangePercent: 2.0, alertOnInsiderTrading: true, alertOnEarnings: true },
      { watchlistId: watchlist.id, companyTicker: "CSL", alertOnPriceChangePercent: 3.0, alertOnInsiderTrading: false, alertOnEarnings: true },
      { watchlistId: watchlist.id, companyTicker: "PLS", alertOnPriceChangePercent: 4.0, alertOnInsiderTrading: true, alertOnEarnings: true },
      { watchlistId: watchlist.id, companyTicker: "REA", alertOnPriceChangePercent: 3.0, alertOnInsiderTrading: true, alertOnEarnings: true },
    ]);

    // 8. Seed Portfolio & Holdings
    const [portfolio] = await db.insert(schema.portfolios).values({
      userId: user.id,
      name: "SMSF Long-Term Growth & Income",
      totalValue: 405860.00,
      dayChangeVal: 3120.40,
      dayChangePercent: 0.77,
      totalGainVal: 89600.00,
      totalGainPercent: 28.33,
      annualDividendIncome: 14820.00,
      portfolioRiskScore: 46,
    }).returning();

    await db.insert(schema.portfolioHoldings).values([
      {
        portfolioId: portfolio.id,
        companyTicker: "BHP",
        assetClass: "EQUITY",
        assetName: "BHP Group Limited",
        notes: "Core resource exposure — DRP enabled",
        sharesCount: 2500,
        averageBuyPrice: 36.50,
        currentPrice: 41.80,
        totalValue: 104500.00,
        gainLossVal: 13250.00,
        gainLossPercent: 14.52,
        weightPercent: 25.75,
        aiRiskFlag: "Moderate Concentration Risk: Resource sector represents over 25% of total SMSF allocation.",
      },
      {
        portfolioId: portfolio.id,
        companyTicker: "CBA",
        assetClass: "EQUITY",
        assetName: "Commonwealth Bank of Australia",
        notes: "Fully franked income anchor",
        sharesCount: 700,
        averageBuyPrice: 108.00,
        currentPrice: 141.20,
        totalValue: 98840.00,
        gainLossVal: 23240.00,
        gainLossPercent: 30.74,
        weightPercent: 24.35,
        aiRiskFlag: "Valuation Premium Flag: Currently trading 45% above global bank P/E peer average.",
      },
      {
        portfolioId: portfolio.id,
        companyTicker: "CSL",
        assetClass: "EQUITY",
        assetName: "CSL Limited",
        notes: null,
        sharesCount: 250,
        averageBuyPrice: 252.00,
        currentPrice: 298.50,
        totalValue: 74625.00,
        gainLossVal: 11625.00,
        gainLossPercent: 18.45,
        weightPercent: 18.39,
        aiRiskFlag: null,
      },
      {
        portfolioId: portfolio.id,
        companyTicker: "WBC",
        assetClass: "EQUITY",
        assetName: "Westpac Banking Corporation",
        notes: null,
        sharesCount: 1500,
        averageBuyPrice: 22.10,
        currentPrice: 28.40,
        totalValue: 42600.00,
        gainLossVal: 9450.00,
        gainLossPercent: 28.51,
        weightPercent: 10.50,
        aiRiskFlag: null,
      },
      {
        portfolioId: portfolio.id,
        companyTicker: "PLS",
        assetClass: "EQUITY",
        assetName: "Pilbara Minerals Limited",
        notes: "Energy transition satellite position",
        sharesCount: 9000,
        averageBuyPrice: 2.34,
        currentPrice: 3.08,
        totalValue: 27720.00,
        gainLossVal: 6660.00,
        gainLossPercent: 31.62,
        weightPercent: 6.83,
        aiRiskFlag: "High Beta Volatility: Lithium spot price sensitivity could trigger short-term price swings.",
      },
      {
        portfolioId: portfolio.id,
        companyTicker: "BTC",
        assetClass: "CRYPTO",
        assetName: "Bitcoin",
        notes: "Digital asset sleeve — reviewed quarterly",
        sharesCount: 0.35,
        averageBuyPrice: 92000.00,
        currentPrice: 164500.00,
        totalValue: 57575.00,
        gainLossVal: 25375.00,
        gainLossPercent: 78.80,
        weightPercent: 14.18,
        aiRiskFlag: "Digital Asset Volatility: 48.2% annualised volatility (approx. 4x ASX 200). At 14.2% weight this sleeve exceeds the 10% ceiling our AI models associate with a Moderate risk tolerance.",
      }
    ]);

    // 9. Seed Default AI Chat Query
    await db.insert(schema.aiChatQueries).values({
      userId: user.id,
      queryText: "How do overnight movements in the Dow Jones and NYMEX crude oil impact Australian large caps (CBA, BHP, WDS) today?",
      aiResponse: {
        title: "International Markets to ASX Local Impact Assessment",
        summary: "Overnight global benchmark trading provides a strong dual-speed directional indicator for today's Australian market. The Wall Street cyclical expansion (Dow Jones +312 pts) creates strong liquidity tailwinds for major financial blue chips (CBA, NAB). Conversely, NYMEX WTI cooling (-1.57% to $78.40) presents temporary margin hesitation for energy exporters like Woodside (WDS).",
        comparison: [
          { ticker: "CBA", impact: "Direct / Positive Inflow", reasoning: "Wall Street financial sector leadership reflects optimism over terminal interest rates and soft landing, stabilizing CBA's high valuation multiple." },
          { ticker: "WDS", impact: "Short-Term Softness / Long-Term Safe", reasoning: "NYMEX crude dip weighs on spot pricing sentiment, though WDS's long-term Asian LNG contracts provide a firm revenue floor for dividends." },
          { ticker: "BHP", impact: "Firm Positive / Copper Growth", reasoning: "While Singapore iron ore pulled back slightly (-1.16%), LME copper futures ($4.42/lb) provide a growing earnings offset for BHP." }
        ],
        confidenceScore: 94,
        recommendationForSmsf: "For Australian investors, monitoring overnight US equity indices (Dow Jones, S&P 500) and Asian commodity futures (NYMEX, Singapore Iron Ore) explains 80% of daily ASX sector opening direction. Rather than reacting to daily noise, use spot pullbacks in tier-1 producers (like WDS or BHP) to lock in high fully-franked dividend yields.",
        evidenceCitations: ["Dow Jones Overnight Exchange Feed", "NYMEX WTI Contract Closing Logs", "ASX Sector Flow Tracker"]
      }
    });

    console.log("StoxMate database successfully seeded with Global Indices, Top News, & Australian intelligence!");
    return { seeded: true, message: "StoxMate database successfully seeded with global indices and rich media market intelligence!" };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { seeded: false, error: String(error) };
  }
}
