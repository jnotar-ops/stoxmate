"use client";

import React from "react";
import { 
  X, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Plus, 
  Check, 
  Bot, 
  BarChart2, 
  DollarSign, 
  Award,
  AlertCircle
} from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from "recharts";

interface CompanySnowflakeModalProps {
  company: any;
  isOpen: boolean;
  onClose: () => void;
  onAddToWatchlist: (ticker: string) => void;
  isWatching?: boolean;
  onAskAi: (question: string) => void;
}

export default function CompanySnowflakeModal({
  company,
  isOpen,
  onClose,
  onAddToWatchlist,
  isWatching = false,
  onAskAi,
}: CompanySnowflakeModalProps) {
  if (!isOpen || !company) return null;

  const snowflakeData = [
    { subject: "Health (Balance Sheet)", value: company.healthScore || 85, fullMark: 100 },
    { subject: "Valuation vs Price", value: company.valuationScore || 70, fullMark: 100 },
    { subject: "Future Growth Outlook", value: company.futureGrowthScore || 75, fullMark: 100 },
    { subject: "Dividend Sustainability", value: company.dividendScore || 80, fullMark: 100 },
    { subject: "Past Performance Track", value: company.pastPerformanceScore || 85, fullMark: 100 },
  ];

  const priceDiff = company.currentPrice - company.fairValue;
  const isUndervalued = priceDiff < 0;
  const percentDiff = Math.abs((priceDiff / company.fairValue) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-slate-700/50 my-8">
        
        {/* Modal Header */}
        <div className="p-6 pb-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 font-mono text-xl font-black text-emerald-400 ring-1 ring-slate-700 shadow-inner">
              {company.ticker}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">{company.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 font-semibold text-slate-400">
                  {company.sector}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {company.industry} • Market Cap: <strong className="text-slate-200">{company.marketCap}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToWatchlist(company.ticker)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isWatching 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {isWatching ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isWatching ? "Monitored by AI" : "Add to AI Watchlist"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
          
          {/* Left 5 Columns: Snowflake Radar Chart */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 relative">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>5-Dimension AI Snowflake</span>
            </div>

            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={snowflakeData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: "#64748b", fontSize: 9 }} />
                  <Radar
                    name={company.ticker}
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-center text-slate-400 mt-1">
              Snowflake scores calculated automatically via financial statement metrics & consensus forecasts.
            </p>
          </div>

          {/* Right 7 Columns: Valuation, Price, Consensus, Description */}
          <div className="md:col-span-7 space-y-5">
            
            {/* Top Metrics Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase text-slate-400 font-semibold block">Current Price</span>
                <div className="text-lg font-mono font-bold text-slate-100 mt-0.5">${company.currentPrice.toFixed(2)}</div>
                <div className={`text-[11px] font-mono font-semibold flex items-center gap-0.5 ${company.dailyChangePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {company.dailyChangePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{company.dailyChangePercent >= 0 ? "+" : ""}{company.dailyChangePercent.toFixed(2)}%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase text-slate-400 font-semibold block">P/E Multiple</span>
                <div className="text-lg font-mono font-bold text-slate-100 mt-0.5">{company.peRatio}x</div>
                <span className="text-[10px] text-slate-400">vs Sector Avg</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase text-slate-400 font-semibold block">Div Yield</span>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{company.dividendYield}%</div>
                <span className="text-[10px] text-slate-400">Trailing 12M</span>
              </div>
            </div>

            {/* AI Fair Value Estimate Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    AI Fair Value Estimate
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isUndervalued ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {isUndervalued ? `Undervalued by ${percentDiff}%` : `Trading ${percentDiff}% Premium`}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-2xl font-mono font-black text-slate-100">${company.fairValue.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 ml-1.5 font-medium">Target Estimate (AUD)</span>
                </div>
                <div className="text-right text-xs text-slate-400">
                  Consensus: <strong className="text-slate-200">{company.analystConsensus}</strong>
                </div>
              </div>

              {/* Price visual bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div 
                  className={`h-full ${isUndervalued ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${Math.min(100, Math.max(20, (company.currentPrice / company.fairValue) * 70))}%` }}
                />
              </div>
            </div>

            {/* Company Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Company Profile & AI Summary
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {company.description}
              </p>
            </div>

            {/* Ask AI Action Button */}
            <button
              onClick={() => {
                onClose();
                onAskAi(`Evaluate ${company.name} (${company.ticker}) for a dividend and growth investor in 2026. What are the key risks?`);
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Ask StoxMate AI For Deep Dive Analysis On {company.ticker}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Confidence Score: <strong className="text-slate-200 font-mono">{company.aiConfidenceScore}%</strong></span>
          </div>
          <span className="text-[11px] text-slate-500">
            Last AI analysis updated today at 8:00 AM AEST
          </span>
        </div>
      </div>
    </div>
  );
}
