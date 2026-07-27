"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  Activity,
  ChevronRight,
  HelpCircle
} from "lucide-react";

interface GlobalMarketsBarProps {
  indices: any[];
  onSelectCompanyByTicker: (ticker: string) => void;
  onAskAi: (question: string) => void;
}

export default function GlobalMarketsBar({
  indices,
  onSelectCompanyByTicker,
  onAskAi,
}: GlobalMarketsBarProps) {
  const [selectedIndex, setSelectedIndex] = useState<any | null>(null);

  if (!indices || indices.length === 0) return null;

  return (
    <div className="space-y-4 mb-2">
      {/* Ribbon Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span>Bloomberg Global Benchmarks & Securities</span>
          </div>
          <span className="text-xs text-slate-300 font-semibold hidden sm:inline-block">
            International Markets to Local ASX AI Impact Bridge
          </span>
        </div>

        <span className="text-[11px] text-slate-400">
          Click any world index (Dow Jones, NYMEX, Nikkei) to analyze its impact on local Australian stocks
        </span>
      </div>

      {/* Grid of Top Global Securities / Indices */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2.5">
        {indices.map((idxItem) => {
          const isPos = idxItem.dailyChange >= 0;
          const isSelected = selectedIndex?.id === idxItem.id;
          return (
            <button
              key={idxItem.id}
              onClick={() => setSelectedIndex(isSelected ? null : idxItem)}
              className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between group relative overflow-hidden ${
                isSelected
                  ? "bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.02] ring-1 ring-emerald-500/40"
                  : "bg-slate-900/90 border-slate-800/90 hover:bg-slate-800/70 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-mono font-black text-slate-100 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {idxItem.ticker}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isPos ? "bg-emerald-400" : "bg-rose-500"}`} />
                </div>
                <div className="text-[13px] font-mono font-bold text-slate-200">
                  {idxItem.currentValue}
                </div>
              </div>

              <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono font-semibold">
                <span className={isPos ? "text-emerald-400 flex items-center gap-0.5" : "text-rose-400 flex items-center gap-0.5"}>
                  {isPos ? <TrendingUp className="w-3 h-3 flex-shrink-0" /> : <TrendingDown className="w-3 h-3 flex-shrink-0" />}
                  <span>{isPos ? "+" : ""}{idxItem.dailyChangePercent.toFixed(2)}%</span>
                </span>
              </div>

              {/* Status subtle indicator */}
              <div className="mt-1 text-[9px] uppercase tracking-wider font-sans text-slate-500 line-clamp-1">
                {idxItem.status}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Interactive AI Bridge Card (When user clicks an Index like Dow Jones or NYMEX) */}
      {selectedIndex && (
        <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/25 to-slate-900 border-2 border-indigo-500/40 shadow-2xl space-y-4 animate-in slide-in-from-top-3 duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg md:text-xl font-black text-slate-100 tracking-tight">
                    {selectedIndex.name} ({selectedIndex.ticker})
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedIndex.currentValue}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${selectedIndex.dailyChange >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"}`}>
                    {selectedIndex.dailyChange >= 0 ? "+" : ""}{selectedIndex.dailyChangePercent.toFixed(2)}% ({selectedIndex.status})
                  </span>
                </div>
                <span className="text-xs text-indigo-300 font-semibold mt-0.5 block">
                  Region: {selectedIndex.region} • International to Australian (ASX) Bridge
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedIndex(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left 8 columns: AI Impact summary */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Why Does This International Benchmark Move Today's Australian Market?</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                {selectedIndex.aiAsxImpactSummary}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-bold text-slate-300">Affected Local ASX Stocks To Watch:</span>
                {selectedIndex.affectedAsxTickers?.map((ticker: string) => (
                  <button
                    key={ticker}
                    onClick={() => onSelectCompanyByTicker(ticker)}
                    className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-emerald-500/20 text-emerald-400 border border-slate-800 hover:border-emerald-500/40 font-mono font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>{ticker}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right 4 columns: Ask AI for custom simulation */}
            <div className="md:col-span-4 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Cross-Border AI Correlation</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Our AI models calculate direct statistical betas between offshore futures ({selectedIndex.ticker}) and local sector openings on the ASX.
                </p>
              </div>

              <button
                onClick={() => {
                  onAskAi(`Explain in detail how overnight trading in ${selectedIndex.name} (${selectedIndex.ticker}) impacts Australian equities and which specific ASX sectors I should prioritize today.`);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all shadow flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask AI About {selectedIndex.ticker} & ASX</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
