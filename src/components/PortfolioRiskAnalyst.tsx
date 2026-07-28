"use client";

import React, { useState } from "react";
import { 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  Pencil,
  Trash2, 
  Bell, 
  PieChart as PieChartIcon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Bitcoin,
  BarChart3,
  Wallet,
  Search
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";

interface PortfolioRiskAnalystProps {
  portfolios: any[];
  portfolioHoldings: any[];
  watchlists: any[];
  watchlistItems: any[];
  onRemoveFromWatchlist: (ticker: string) => void;
  onSelectCompanyByTicker: (ticker: string) => void;
  onAskAi: (question: string) => void;
  onAddHolding: () => void;
  onEditHolding: (holding: any) => void;
  onRemoveHolding: (holding: any) => void;
}

export default function PortfolioRiskAnalyst({
  portfolios,
  portfolioHoldings,
  watchlists,
  watchlistItems,
  onRemoveFromWatchlist,
  onSelectCompanyByTicker,
  onAskAi,
  onAddHolding,
  onEditHolding,
  onRemoveHolding,
}: PortfolioRiskAnalystProps) {
  const [activeView, setActiveView] = useState<"portfolio" | "watchlist">("portfolio");
  const [assetFilter, setAssetFilter] = useState<"ALL" | "EQUITY" | "CRYPTO">("ALL");

  const portfolio = portfolios?.[0] || {
    name: "SMSF Long-Term Growth & Income",
    totalValue: 0,
    dayChangeVal: 0,
    dayChangePercent: 0,
    totalGainVal: 0,
    totalGainPercent: 0,
    annualDividendIncome: 0,
    portfolioRiskScore: 0
  };

  const holdings = portfolioHoldings || [];
  const items = watchlistItems || [];

  const visibleHoldings = holdings.filter((h: any) => {
    if (assetFilter === "ALL") return true;
    if (assetFilter === "CRYPTO") return h.assetClass === "CRYPTO" || h.assetClass === "ETF";
    return h.assetClass === "EQUITY";
  });

  const cryptoWeight = holdings
    .filter((h: any) => h.assetClass === "CRYPTO" || h.assetClass === "ETF")
    .reduce((sum: number, h: any) => sum + (h.weightPercent || 0), 0);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f43f5e"];

  const pieData = holdings.map((h: any) => ({
    name: h.companyTicker,
    value: h.totalValue,
    weight: h.weightPercent
  }));

  const riskHoldings = holdings.filter((h: any) => h.aiRiskFlag);
  const dayPositive = (portfolio.dayChangeVal || 0) >= 0;
  const gainPositive = (portfolio.totalGainVal || 0) >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner & Navigation Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight">
              AI Risk & Opportunity Analyst
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Continuous Portfolio Surveillance
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Multi-asset tracking across ASX equities and digital assets — weights and risk flags recalculate on every change.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveView("portfolio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeView === "portfolio"
                  ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/30 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Portfolio ({holdings.length})</span>
            </button>
            <button
              onClick={() => setActiveView("watchlist")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeView === "watchlist"
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>Watchlist ({items.length})</span>
            </button>
          </div>

          {activeView === "portfolio" && (
            <button
              onClick={onAddHolding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Position</span>
            </button>
          )}
        </div>
      </div>

      {activeView === "portfolio" && (
        <div className="space-y-8">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Portfolio Value
              </span>
              <div className="text-2xl font-mono font-black text-slate-100">
                ${portfolio.totalValue.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center gap-1 text-xs font-mono font-semibold mt-1 ${dayPositive ? "text-emerald-400" : "text-rose-400"}`}>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {dayPositive ? "+" : ""}${portfolio.dayChangeVal.toLocaleString("en-AU", { maximumFractionDigits: 2 })} ({portfolio.dayChangePercent.toFixed(2)}%) Today
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Annual Dividend Income
              </span>
              <div className="text-2xl font-mono font-black text-emerald-400">
                ${portfolio.annualDividendIncome.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Franked equity income • digital assets pay none
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Unrealised Gain
              </span>
              <div className="text-2xl font-mono font-black text-slate-100">
                {gainPositive ? "+" : ""}${portfolio.totalGainVal.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className={`text-xs font-mono font-semibold mt-1 block ${gainPositive ? "text-emerald-400" : "text-rose-400"}`}>
                {gainPositive ? "+" : ""}{portfolio.totalGainPercent.toFixed(2)}% on cost base
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/20 via-slate-900/90 to-slate-900 border border-purple-500/30 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    AI Portfolio Risk Score
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    portfolio.portfolioRiskScore < 40
                      ? "bg-emerald-500/10 text-emerald-400"
                      : portfolio.portfolioRiskScore < 65
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {portfolio.portfolioRiskScore < 40 ? "Low / Moderate" : portfolio.portfolioRiskScore < 65 ? "Elevated" : "High"}
                  </span>
                </div>
                <div className="text-2xl font-mono font-black text-purple-400 mt-1">
                  {portfolio.portfolioRiskScore} / 100
                </div>
              </div>
              <span className="text-[11px] text-slate-400">
                Digital asset sleeve: <strong className="text-slate-200 font-mono">{cryptoWeight.toFixed(1)}%</strong> of portfolio
              </span>
            </div>
          </div>

          {/* AI Risk Flags */}
          {riskHoldings.length > 0 && (
            <div className="p-6 rounded-3xl bg-amber-950/10 border border-amber-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <div className="p-2 rounded-xl bg-amber-500/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-amber-300">
                      AI Surveillance Alerts: {riskHoldings.length} Active Portfolio Flags
                    </h3>
                    <p className="text-xs text-amber-200/80">
                      Recalculated automatically each time you add, edit or remove a position.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onAskAi("Analyse the concentration, valuation and digital asset volatility risks in my portfolio. What should I rebalance and why?")}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Ask AI How To Rebalance</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {riskHoldings.map((h: any) => (
                  <div key={h.id} className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono font-black text-sm text-slate-100">{h.companyTicker}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          {h.weightPercent?.toFixed(1)}% of Portfolio
                        </span>
                        {h.assetClass !== "EQUITY" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                            DIGITAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
                        {h.aiRiskFlag}
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectCompanyByTicker(h.companyTicker)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors flex-shrink-0"
                      title="Open company analysis"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Holdings Table & Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Holdings Table */}
            <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Holdings ({visibleHoldings.length})</span>
                </h3>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-[11px] font-bold">
                    <button
                      onClick={() => setAssetFilter("ALL")}
                      className={`px-2.5 py-1 rounded ${assetFilter === "ALL" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setAssetFilter("EQUITY")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded ${assetFilter === "EQUITY" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Equities</span>
                    </button>
                    <button
                      onClick={() => setAssetFilter("CRYPTO")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded ${assetFilter === "CRYPTO" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      <Bitcoin className="w-3 h-3" />
                      <span>Digital</span>
                    </button>
                  </div>

                  <button
                    onClick={onAddHolding}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {visibleHoldings.length === 0 ? (
                <div className="py-16 px-6 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">No positions in this view yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Add your ASX shares or digital assets and StoxMate AI will begin monitoring concentration, valuation and volatility risk immediately.
                  </p>
                  <button
                    onClick={onAddHolding}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Your First Position</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-4">Asset</th>
                        <th className="py-3 px-4">Units</th>
                        <th className="py-3 px-4">Avg Buy</th>
                        <th className="py-3 px-4">Current</th>
                        <th className="py-3 px-4">Value</th>
                        <th className="py-3 px-4">Gain/Loss</th>
                        <th className="py-3 px-4">Weight</th>
                        <th className="py-3 px-4 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
                      {visibleHoldings.map((h: any) => {
                        const positive = (h.gainLossVal || 0) >= 0;
                        return (
                          <tr key={h.id} className="hover:bg-slate-800/40 transition-colors group">
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => onSelectCompanyByTicker(h.companyTicker)}
                                className="flex items-center gap-2 text-left"
                              >
                                <span className="font-mono font-bold text-emerald-400 group-hover:underline">
                                  {h.companyTicker}
                                </span>
                                {h.assetClass !== "EQUITY" && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                    {h.assetClass}
                                  </span>
                                )}
                              </button>
                              {h.notes && (
                                <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[160px]">{h.notes}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300">
                              {h.sharesCount.toLocaleString("en-AU", { maximumFractionDigits: 6 })}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-400">
                              ${h.averageBuyPrice.toLocaleString("en-AU", { maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                              ${h.currentPrice.toLocaleString("en-AU", { maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                              ${h.totalValue.toLocaleString("en-AU", { maximumFractionDigits: 2 })}
                            </td>
                            <td className={`py-3.5 px-4 font-mono font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                              {positive ? "+" : ""}${h.gainLossVal.toLocaleString("en-AU", { maximumFractionDigits: 0 })} ({positive ? "+" : ""}{h.gainLossPercent.toFixed(1)}%)
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <div className="w-8 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, h.weightPercent)}%` }} />
                                </div>
                                <span>{h.weightPercent?.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onEditHolding(h)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                                  title="Edit position"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onRemoveHolding(h)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                                  title="Remove position"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Allocation Chart */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Allocation & Weight
                  </h3>
                </div>

                {pieData.length > 0 ? (
                  <>
                    <div className="w-full h-[210px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Value"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {pieData.map((d: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-200">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span>{d.name}</span>
                          </div>
                          <span className="font-mono text-slate-400">{d.weight?.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Digital asset exposure gauge */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <Bitcoin className="w-3.5 h-3.5 text-amber-400" />
                          <span>Digital Asset Exposure</span>
                        </span>
                        <span className={`font-mono ${cryptoWeight > 10 ? "text-amber-400" : "text-emerald-400"}`}>
                          {cryptoWeight.toFixed(1)}% / 10% guide
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cryptoWeight > 10 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, cryptoWeight * 5)}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-10 text-center text-xs text-slate-500">
                    Add positions to see your allocation breakdown.
                  </div>
                )}
              </div>

              <button
                onClick={() => onAskAi("Stress test my multi-asset portfolio: how would it perform in a commodity recession combined with a 50% digital asset drawdown?")}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider transition-all shadow flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Stress Test My Portfolio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === "watchlist" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-100">
                Core ASX Watchlist ({items.length} Companies)
              </h3>
              <p className="text-xs text-slate-400">
                StoxMate AI will proactively notify you if insider trading {">"} $500k, price drops {">"} 3%, or broker consensus changes occur.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Proactive AI Monitoring Active</span>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Your watchlist is empty</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Open the ASX Companies tab and select &ldquo;+ Watch&rdquo; on any company to begin AI monitoring.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((it: any) => (
                <div key={it.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => onSelectCompanyByTicker(it.companyTicker)}
                        className="text-lg font-mono font-black text-emerald-400 hover:underline"
                      >
                        {it.companyTicker}
                      </button>
                      <button
                        onClick={() => onRemoveFromWatchlist(it.companyTicker)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Price Drop Alert:</span>
                        <span className="font-mono font-bold text-slate-200">{">"} 3.0%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Insider Trading Alert:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Earnings Surprise Alert:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectCompanyByTicker(it.companyTicker)}
                    className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center"
                  >
                    View AI Snowflake & Fair Value
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
