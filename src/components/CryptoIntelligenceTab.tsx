"use client";

import React, { useState } from "react";
import {
  Bitcoin,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Scale,
  Landmark,
  Plus,
  Activity,
  Info,
  Globe,
} from "lucide-react";

interface CryptoIntelligenceTabProps {
  cryptoAssets: any[];
  onAddToPortfolio: (symbol: string) => void;
  onAskAi: (question: string) => void;
}

function CorrelationBar({ label, value }: { label: string; value: number | null | undefined }) {
  if (typeof value !== "number") {
    return <div className="flex items-center justify-between text-[10px] text-slate-500"><span>{label}</span><span>Unavailable</span></div>;
  }
  const pct = Math.abs(value) * 100;
  const positive = value >= 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-semibold">
        <span className="text-slate-400">{label}</span>
        <span className={`font-mono font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
          {value >= 0 ? "+" : ""}{value.toFixed(2)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${positive ? "bg-emerald-500" : "bg-rose-500"}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

export default function CryptoIntelligenceTab({
  cryptoAssets,
  onAddToPortfolio,
  onAskAi,
}: CryptoIntelligenceTabProps) {
  const [filter, setFilter] = useState<"ALL" | "Digital Asset" | "ASX Listed Crypto ETF" | "ASX Listed Crypto Equity">("ALL");

  if (!cryptoAssets || cryptoAssets.length === 0) return null;

  const filtered = filter === "ALL" ? cryptoAssets : cryptoAssets.filter((c) => c.assetType === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Product stance banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-amber-950/20 border border-slate-800 ring-1 ring-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Bitcoin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
                Digital Assets — Through an Australian Investor Lens
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Crypto covered the same way we cover equities: evidence, correlation, risk and regulation — never hype.
              </p>
            </div>
          </div>

          <button
            onClick={() => onAskAi("How much Bitcoin exposure is appropriate alongside an ASX dividend portfolio, and what are the SMSF and ATO implications?")}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider transition-all shadow flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Ask AI About Sizing & SMSF Rules</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Why We Cover It</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Australian investors already hold digital assets — roughly 1 in 5 adults. Ignoring that exposure would leave a
              blind spot in portfolio risk analysis. StoxMate measures it rather than promotes it.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Why It Explains the ASX</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Digital-asset markets can provide a rapid signal about global liquidity, but correlation
              changes over time and should not be treated as a live predictor of ASX performance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Landmark className="w-3.5 h-3.5" />
              <span>How We Frame It</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              We prioritise regulated, CHESS-settled ASX access routes (spot ETFs) over unregulated exchanges, and surface
              AUSTRAC and ATO CGT obligations on every asset.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Covered Universe ({filtered.length})
        </span>
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          {[
            { key: "ALL", label: "All Assets" },
            { key: "Digital Asset", label: "Direct Crypto" },
            { key: "ASX Listed Crypto ETF", label: "ASX Spot ETFs" },
            { key: "ASX Listed Crypto Equity", label: "ASX Equities" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === f.key
                  ? "bg-slate-800 text-amber-400 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asset cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((c) => {
          const hasPrice = typeof c.currentPriceAud === "number";
          const isPos = typeof c.dailyChangePercent === "number" && c.dailyChangePercent >= 0;
          const isRegulated = c.assetType !== "Digital Asset";
          return (
            <div
              key={c.id}
              className="rounded-2xl bg-slate-900/95 border border-slate-800 hover:border-slate-700 transition-all shadow-lg overflow-hidden flex flex-col"
            >
              {/* Card header */}
              <div className="p-5 border-b border-slate-800/80 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 font-mono text-sm font-black text-amber-400 ring-1 ring-slate-700">
                    {c.symbol}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-100 tracking-tight">{c.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isRegulated
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {isRegulated ? "ASX Regulated Access" : "Direct Digital Asset"}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        {c.riskLevel ? `${c.riskLevel} Risk` : "Risk not assessed"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-mono font-black text-slate-100">
                    {hasPrice ? `$${c.currentPriceAud >= 1000
                      ? c.currentPriceAud.toLocaleString("en-AU", { maximumFractionDigits: 0 })
                      : c.currentPriceAud.toFixed(2)}` : "Unavailable"}
                  </div>
                  <div className={`text-xs font-mono font-bold flex items-center justify-end gap-0.5 ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                    {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{c.dailyChangePercent == null ? c.staleStatus : `${isPos ? "+" : ""}${c.dailyChangePercent.toFixed(2)}%`}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{c.marketCap} · {c.dataProvider ?? "no provider"} · {c.staleStatus}</div>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1">
                {/* Correlations */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Correlation Matrix (90-day)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {c.volatility30d == null ? "Volatility unavailable" : `Vol ${c.volatility30d}% p.a.`}
                    </span>
                  </div>
                  <CorrelationBar label="vs ASX 200" value={c.correlationAsx200} />
                  <CorrelationBar label="vs Nasdaq 100" value={c.correlationNasdaq} />
                  <CorrelationBar label="vs Gold" value={c.correlationGold} />
                </div>

                {/* Thesis */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-300 font-bold uppercase text-[10px] tracking-wider block mb-0.5">
                      AI Evidence-Based Observation
                    </strong>
                    {c.aiThesis ?? "No AI observation is available for this asset."}
                  </div>
                </div>

                {/* Access route */}
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-100 leading-relaxed flex items-start gap-2.5">
                  <Landmark className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-300 font-bold uppercase text-[10px] tracking-wider block mb-0.5">
                      Australian Access Route
                    </strong>
                    {c.asxAccessRoute ?? "Direct digital-asset market data only."}
                  </div>
                </div>

                {/* Risk + regulatory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-amber-950/15 border border-amber-500/30 text-[11px] text-amber-100/90 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Key Risk</span>
                    </div>
                    {c.aiRiskNote ?? "Digital assets can experience substantial price volatility."}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-slate-300 font-bold uppercase text-[10px] tracking-wider mb-1">
                      <Info className="w-3.5 h-3.5 text-emerald-400" />
                      <span>AU Regulatory & Tax</span>
                    </div>
                    {c.regulatoryNote ?? "Confirm current Australian tax and regulatory obligations independently."}
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{c.aiConfidenceScore == null ? "Confidence unavailable" : `${c.aiConfidenceScore}% Data Confidence`}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAskAi(`Analyse ${c.name} (${c.symbol}) for an Australian long-term investor: what does the evidence support, what are the risks, and how does it interact with an ASX dividend portfolio?`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all"
                  >
                    Ask AI
                  </button>
                  <button
                    onClick={() => onAddToPortfolio(c.symbol)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Portfolio</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compliance strip */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-200">Digital asset warning:</strong> most crypto assets are not regulated financial
          products in Australia and are not covered by the financial claims scheme. Prices are highly volatile and you may
          lose your entire capital. StoxMate provides general information and research only — never personal financial advice.
        </span>
      </div>
    </div>
  );
}
