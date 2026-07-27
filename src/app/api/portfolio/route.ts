import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Recalculates every derived portfolio metric from the raw holdings.
 * Keeping this server-side guarantees a single source of truth so the UI can
 * never drift out of sync after an add / edit / remove operation.
 */
async function recalculatePortfolio(portfolioId: number) {
  const holdings = await db
    .select()
    .from(schema.portfolioHoldings)
    .where(eq(schema.portfolioHoldings.portfolioId, portfolioId));

  const companies = await db.select().from(schema.asxCompanies);
  const cryptos = await db.select().from(schema.cryptoAssets);

  let totalValue = 0;
  let totalCost = 0;
  let dayChangeVal = 0;
  let annualDividendIncome = 0;
  let cryptoValue = 0;

  // Pass 1: refresh live prices and compute absolute figures
  const enriched = holdings.map((h) => {
    const company = companies.find((c) => c.ticker === h.companyTicker);
    const crypto = cryptos.find((c) => c.symbol === h.companyTicker);

    const livePrice = company?.currentPrice ?? crypto?.currentPriceAud ?? h.currentPrice;
    const changePercent = company?.dailyChangePercent ?? crypto?.dailyChangePercent ?? 0;

    const value = livePrice * h.sharesCount;
    const cost = h.averageBuyPrice * h.sharesCount;
    const priorValue = value / (1 + changePercent / 100);

    totalValue += value;
    totalCost += cost;
    dayChangeVal += value - priorValue;

    if (company) {
      annualDividendIncome += value * (company.dividendYield / 100);
    }
    if (h.assetClass === "CRYPTO") {
      cryptoValue += value;
    }

    return { holding: h, livePrice, value, cost, company, crypto };
  });

  // Pass 2: persist per-holding derived values (weights need the total first)
  for (const row of enriched) {
    const gainLossVal = row.value - row.cost;
    const gainLossPercent = row.cost > 0 ? (gainLossVal / row.cost) * 100 : 0;
    const weightPercent = totalValue > 0 ? (row.value / totalValue) * 100 : 0;

    // Evidence-based AI risk flags, recomputed on every mutation
    let aiRiskFlag: string | null = null;
    if (row.holding.assetClass === "CRYPTO" && weightPercent > 10) {
      aiRiskFlag = `Digital Asset Volatility: ${row.crypto?.volatility30d ?? 48}% annualised volatility. At ${weightPercent.toFixed(1)}% weight this sleeve exceeds the 10% ceiling our AI models associate with a Moderate risk tolerance.`;
    } else if (weightPercent > 25) {
      aiRiskFlag = `Concentration Risk: ${row.holding.companyTicker} represents ${weightPercent.toFixed(1)}% of total portfolio value, above the 25% single-position threshold used in our diversification model.`;
    } else if (row.company && row.company.currentPrice > row.company.fairValue * 1.05) {
      const premium = ((row.company.currentPrice - row.company.fairValue) / row.company.fairValue) * 100;
      aiRiskFlag = `Valuation Premium Flag: trading ${premium.toFixed(1)}% above our AI fair value estimate of $${row.company.fairValue.toFixed(2)}.`;
    } else if (row.company && row.company.dividendYield > 8) {
      aiRiskFlag = `Elevated Yield Signal: ${row.company.dividendYield}% trailing yield can indicate a cyclical earnings peak rather than durable income.`;
    }

    await db
      .update(schema.portfolioHoldings)
      .set({
        currentPrice: row.livePrice,
        totalValue: Number(row.value.toFixed(2)),
        gainLossVal: Number(gainLossVal.toFixed(2)),
        gainLossPercent: Number(gainLossPercent.toFixed(2)),
        weightPercent: Number(weightPercent.toFixed(2)),
        aiRiskFlag,
      })
      .where(eq(schema.portfolioHoldings.id, row.holding.id));
  }

  const totalGainVal = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGainVal / totalCost) * 100 : 0;
  const dayChangePercent = totalValue > 0 ? (dayChangeVal / (totalValue - dayChangeVal)) * 100 : 0;

  // AI risk score: blends digital-asset weight, position concentration and diversification
  const cryptoWeight = totalValue > 0 ? (cryptoValue / totalValue) * 100 : 0;
  const largestWeight = totalValue > 0
    ? Math.max(0, ...enriched.map((r) => (r.value / totalValue) * 100))
    : 0;
  const diversificationPenalty = enriched.length > 0 ? Math.max(0, 6 - enriched.length) * 4 : 0;
  const riskScore = Math.min(
    100,
    Math.round(20 + cryptoWeight * 1.4 + Math.max(0, largestWeight - 20) * 0.8 + diversificationPenalty)
  );

  const [updated] = await db
    .update(schema.portfolios)
    .set({
      totalValue: Number(totalValue.toFixed(2)),
      dayChangeVal: Number(dayChangeVal.toFixed(2)),
      dayChangePercent: Number(dayChangePercent.toFixed(2)),
      totalGainVal: Number(totalGainVal.toFixed(2)),
      totalGainPercent: Number(totalGainPercent.toFixed(2)),
      annualDividendIncome: Number(annualDividendIncome.toFixed(2)),
      portfolioRiskScore: riskScore,
    })
    .where(eq(schema.portfolios.id, portfolioId))
    .returning();

  return updated;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      holdingId,
      portfolioId = 1,
      ticker,
      assetClass = "EQUITY",
      sharesCount,
      averageBuyPrice,
      notes,
    } = body;

    const pid = Number(portfolioId);

    // Guard: never mutate holdings against a portfolio that does not exist
    const [targetPortfolio] = await db
      .select()
      .from(schema.portfolios)
      .where(eq(schema.portfolios.id, pid))
      .limit(1);

    if (!targetPortfolio) {
      return NextResponse.json({ error: `Portfolio ${pid} was not found.` }, { status: 404 });
    }

    if (action === "remove") {
      if (!holdingId) {
        return NextResponse.json({ error: "holdingId is required to remove a position" }, { status: 400 });
      }
      await db.delete(schema.portfolioHoldings).where(eq(schema.portfolioHoldings.id, Number(holdingId)));
      const portfolio = await recalculatePortfolio(pid);
      return NextResponse.json({
        success: true,
        portfolio,
        message: "Position removed. Portfolio weights and AI risk score recalculated.",
      });
    }

    const shares = Number(sharesCount);
    const buyPrice = Number(averageBuyPrice);

    if (!Number.isFinite(shares) || shares <= 0) {
      return NextResponse.json({ error: "Units held must be greater than zero" }, { status: 400 });
    }
    if (!Number.isFinite(buyPrice) || buyPrice <= 0) {
      return NextResponse.json({ error: "Average buy price must be greater than zero" }, { status: 400 });
    }

    if (action === "edit") {
      if (!holdingId) {
        return NextResponse.json({ error: "holdingId is required to edit a position" }, { status: 400 });
      }
      await db
        .update(schema.portfolioHoldings)
        .set({
          sharesCount: shares,
          averageBuyPrice: buyPrice,
          notes: notes ?? null,
        })
        .where(eq(schema.portfolioHoldings.id, Number(holdingId)));

      const portfolio = await recalculatePortfolio(pid);
      return NextResponse.json({
        success: true,
        portfolio,
        message: "Position updated. AI has re-run concentration and valuation checks.",
      });
    }

    // Default action: add
    const symbol = String(ticker || "").trim().toUpperCase();
    if (!symbol) {
      return NextResponse.json({ error: "A ticker or symbol is required" }, { status: 400 });
    }

    const [company] = await db
      .select()
      .from(schema.asxCompanies)
      .where(eq(schema.asxCompanies.ticker, symbol))
      .limit(1);
    const [crypto] = await db
      .select()
      .from(schema.cryptoAssets)
      .where(eq(schema.cryptoAssets.symbol, symbol))
      .limit(1);

    if (!company && !crypto) {
      return NextResponse.json(
        { error: `${symbol} is not in StoxMate's covered universe yet. Try an ASX ticker (BHP, CBA, CSL) or digital asset (BTC, ETH, VBTC).` },
        { status: 404 }
      );
    }

    const resolvedAssetClass = crypto
      ? crypto.assetType === "Digital Asset"
        ? "CRYPTO"
        : "ETF"
      : assetClass;
    const livePrice = company?.currentPrice ?? crypto?.currentPriceAud ?? buyPrice;

    // If the position already exists, blend into a weighted average cost base
    const [existing] = await db
      .select()
      .from(schema.portfolioHoldings)
      .where(
        and(
          eq(schema.portfolioHoldings.portfolioId, pid),
          eq(schema.portfolioHoldings.companyTicker, symbol)
        )
      )
      .limit(1);

    if (existing) {
      const combinedUnits = existing.sharesCount + shares;
      const blendedCost =
        (existing.sharesCount * existing.averageBuyPrice + shares * buyPrice) / combinedUnits;

      await db
        .update(schema.portfolioHoldings)
        .set({
          sharesCount: combinedUnits,
          averageBuyPrice: Number(blendedCost.toFixed(4)),
          notes: notes ?? existing.notes,
        })
        .where(eq(schema.portfolioHoldings.id, existing.id));
    } else {
      await db.insert(schema.portfolioHoldings).values({
        portfolioId: pid,
        companyTicker: symbol,
        assetClass: resolvedAssetClass,
        assetName: company?.name ?? crypto?.name ?? symbol,
        notes: notes ?? null,
        sharesCount: shares,
        averageBuyPrice: buyPrice,
        currentPrice: livePrice,
        totalValue: livePrice * shares,
        gainLossVal: (livePrice - buyPrice) * shares,
        gainLossPercent: ((livePrice - buyPrice) / buyPrice) * 100,
        weightPercent: 0,
        aiRiskFlag: null,
      });
    }

    const portfolio = await recalculatePortfolio(pid);
    return NextResponse.json({
      success: true,
      portfolio,
      message: existing
        ? `${symbol} parcel merged at a blended cost base. AI surveillance updated.`
        : `${symbol} added to your portfolio. AI is now monitoring this position.`,
    });
  } catch (error) {
    console.error("Error updating portfolio holdings:", error);
    return NextResponse.json({ error: "Failed to update portfolio" }, { status: 500 });
  }
}
