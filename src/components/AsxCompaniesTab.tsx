"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ShieldCheck, 
  BarChart2, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  Award
} from "lucide-react";

interface AsxCompaniesTabProps {
  companies: any[];
  onSelectCompany: (company: any) => void;
  onAddToWatchlist: (ticker: string) => void;
  watchlistTickers: string[];
}

export default function AsxCompaniesTab({
  companies,
  onSelectCompany,
  onAddToWatchlist,
  watchlistTickers = [],
}: AsxCompaniesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [sortBy, setSortBy] = useState<"marketCap" | "peRatio" | "dividendYield" | "dailyChange" | "aiConfidence">("marketCap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (!companies) return null;

  const sectors = ["All", "Materials", "Financials", "Health Care", "Energy", "Information Technology", "Consumer Discretionary", "Telecommunications", "Consumer Staples"];

  const filtered = companies.filter((c) => {
    const matchesSearch = 
      c.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === "All" || c.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    if (sortBy === "marketCap") {
      valA = a.marketCapVal ?? Number.NEGATIVE_INFINITY;
      valB = b.marketCapVal ?? Number.NEGATIVE_INFINITY;
    } else if (sortBy === "peRatio") {
      valA = a.peRatio ?? Number.NEGATIVE_INFINITY;
      valB = b.peRatio ?? Number.NEGATIVE_INFINITY;
    } else if (sortBy === "dividendYield") {
      valA = a.dividendYield ?? Number.NEGATIVE_INFINITY;
      valB = b.dividendYield ?? Number.NEGATIVE_INFINITY;
    } else if (sortBy === "dailyChange") {
      valA = a.dailyChangePercent ?? Number.NEGATIVE_INFINITY;
      valB = b.dailyChangePercent ?? Number.NEGATIVE_INFINITY;
    } else if (sortBy === "aiConfidence") {
      valA = a.aiConfidenceScore;
      valB = b.aiConfidenceScore;
    }

    return sortOrder === "desc" ? valB - valA : valA - valB;
  });

  const toggleSort = (metric: any) => {
    if (sortBy === metric) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(metric);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Control Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
              <span>ASX Listed Companies Intelligence Catalog</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/30">
                {sorted.length} Companies
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any company to view its 5-Dimension Health Snowflake, AI Fair Value estimate, and consensus breakdown.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter ticker (e.g. CBA, BHP)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Sector:
          </span>
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-slate-400 font-semibold">
        <span className="uppercase tracking-wider">Sort Companies By:</span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleSort("marketCap")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
              sortBy === "marketCap" ? "bg-slate-800 text-slate-100 border-slate-700 font-bold shadow" : "bg-slate-900 border-slate-800 hover:text-slate-200"
            }`}
          >
            <span>Market Cap</span>
            {sortBy === "marketCap" && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
          </button>

          <button
            onClick={() => toggleSort("peRatio")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
              sortBy === "peRatio" ? "bg-slate-800 text-slate-100 border-slate-700 font-bold shadow" : "bg-slate-900 border-slate-800 hover:text-slate-200"
            }`}
          >
            <span>P/E Ratio</span>
            {sortBy === "peRatio" && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
          </button>

          <button
            onClick={() => toggleSort("dividendYield")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
              sortBy === "dividendYield" ? "bg-slate-800 text-slate-100 border-slate-700 font-bold shadow" : "bg-slate-900 border-slate-800 hover:text-slate-200"
            }`}
          >
            <span>Div Yield</span>
            {sortBy === "dividendYield" && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
          </button>

          <button
            onClick={() => toggleSort("dailyChange")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
              sortBy === "dailyChange" ? "bg-slate-800 text-slate-100 border-slate-700 font-bold shadow" : "bg-slate-900 border-slate-800 hover:text-slate-200"
            }`}
          >
            <span>24h Change</span>
            {sortBy === "dailyChange" && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
          </button>

          <button
            onClick={() => toggleSort("aiConfidence")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
              sortBy === "aiConfidence" ? "bg-slate-800 text-slate-100 border-slate-700 font-bold shadow" : "bg-slate-900 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>AI Confidence</span>
            {sortBy === "aiConfidence" && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((c) => {
          const isWatching = watchlistTickers.includes(c.ticker);
          const hasPrice = typeof c.currentPrice === "number";
          const hasFairValue = typeof c.fairValue === "number";
          const isUndervalued = hasPrice && hasFairValue && c.currentPrice < c.fairValue;
          return (
            <div
              key={c.id}
              onClick={() => onSelectCompany(c)}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Ticker & Sector */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 font-mono text-base font-black text-emerald-400 ring-1 ring-slate-700 shadow-inner group-hover:scale-105 transition-transform">
                      {c.ticker}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-100 tracking-tight group-hover:text-emerald-400 transition-colors">
                        {c.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {c.sector} • Cap: <strong className="text-slate-300">{c.marketCap}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToWatchlist(c.ticker);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      isWatching 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                        : "bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700"
                    }`}
                  >
                    {isWatching ? "Watching" : "+ Watch"}
                  </button>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 my-3 text-center font-mono">
                  <div className="p-1.5 rounded bg-slate-950/60">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Price</span>
                    <span className="text-xs font-bold text-slate-100">{hasPrice ? `$${c.currentPrice.toFixed(2)}` : "Unavailable"}</span>
                    <span className={`text-[10px] font-bold block ${c.dailyChangePercent == null ? "text-slate-500" : c.dailyChangePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {c.dailyChangePercent == null ? c.staleStatus : `${c.dailyChangePercent >= 0 ? "+" : ""}${c.dailyChangePercent.toFixed(2)}%`}
                    </span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-950/60">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">P/E Ratio</span>
                    <span className="text-xs font-bold text-slate-200">{c.peRatio == null ? "—" : `${c.peRatio}x`}</span>
                    <span className="text-[10px] text-slate-400 block">Multiple</span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-950/60">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Div Yield</span>
                    <span className="text-xs font-bold text-emerald-400">{c.dividendYield == null ? "—" : `${c.dividendYield}%`}</span>
                    <span className="text-[10px] text-slate-400 block">Trailing</span>
                  </div>
                </div>

                {/* Snowflake Health Preview & Fair Value */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Balance Sheet Health:</span>
                    <span className="font-mono font-bold text-slate-200">{c.healthScore} / 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">AI Fair Value Target:</span>
                    <span className={`font-mono font-bold ${isUndervalued ? "text-emerald-400" : "text-amber-400"}`}>
                      {hasFairValue && hasPrice ? `$${c.fairValue.toFixed(2)} (${isUndervalued ? "Undervalued" : "Premium"})` : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Analyst Consensus:</span>
                    <span className="font-bold text-slate-200">{c.analystConsensus}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{c.aiConfidenceScore}% Confidence</span>
                </div>
                <span className="text-slate-400 font-semibold group-hover:text-emerald-400 flex items-center gap-0.5 transition-colors">
                  <span>View Snowflake</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                {c.dataProvider ? `${c.dataProvider} · ${c.delayClassification} · ${c.staleStatus}` : "No provider quote stored"}
                {c.providerTimestamp ? ` · ${new Date(c.providerTimestamp).toLocaleString("en-AU")}` : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
