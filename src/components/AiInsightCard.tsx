"use client";

import React, { useState } from "react";
import { 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Bookmark, 
  Share2, 
  ArrowUpRight, 
  Clock, 
  Activity,
  CheckCircle2,
  Globe,
  Newspaper
} from "lucide-react";

interface AiInsightCardProps {
  insight: any;
  onSelectCompanyByTicker?: (ticker: string) => void;
  onAskAi?: (question: string) => void;
}

export default function AiInsightCard({
  insight,
  onSelectCompanyByTicker,
  onAskAi,
}: AiInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"short" | "long" | "cash">("short");

  if (!insight) return null;

  const whatHappenedList = Array.isArray(insight.whatHappened) 
    ? insight.whatHappened 
    : [insight.whatHappened];

  const whatToWatchList = Array.isArray(insight.whatToWatch) 
    ? insight.whatToWatch 
    : [insight.whatToWatch];

  const evidenceList = Array.isArray(insight.evidence) 
    ? insight.evidence 
    : [];

  const uncertaintiesList = Array.isArray(insight.uncertainties) 
    ? insight.uncertainties 
    : [insight.uncertainties];

  const impactColor = 
    insight.impactLevel === "Critical" ? "text-rose-400 bg-rose-500/10 border-rose-500/30" :
    insight.impactLevel === "High" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
    insight.impactLevel === "Medium" ? "text-sky-400 bg-sky-500/10 border-sky-500/30" :
    "text-slate-400 bg-slate-800 border-slate-700";

  const isTopNews = insight.newsType === "TOP_NEWS";

  return (
    <div className="rounded-2xl bg-slate-900/95 border border-slate-800 hover:border-slate-700 transition-all shadow-lg overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Bloomberg Style High-Res Photo Cover & Badge Bar */}
        {insight.imageUrl && (
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-48 sm:h-52 relative overflow-hidden bg-slate-950 cursor-pointer"
          >
            <img 
              src={insight.imageUrl} 
              alt={insight.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg ${
                  isTopNews 
                    ? "bg-amber-500 text-slate-950" 
                    : "bg-indigo-500/90 text-white backdrop-blur-md"
                }`}>
                  {isTopNews ? "★ TOP AI NEWS" : "• LATEST INTELLIGENCE"}
                </span>

                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-300 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{insight.aiConfidence}% Conf.</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  {insight.category}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-950/90 ${impactColor}`}>
                  {insight.impactLevel} Impact
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Header Bar when No Image */}
        {!insight.imageUrl && (
          <div className="p-5 pb-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                {isTopNews ? "★ Top News" : "• Latest News"}
              </span>
              <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800">
                {insight.category}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{insight.aiConfidence}% Confidence</span>
            </div>
          </div>
        )}

        {/* Main Text Content */}
        <div className="p-5 md:p-6 space-y-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            {insight.companyTicker ? (
              <button
                onClick={() => onSelectCompanyByTicker && onSelectCompanyByTicker(insight.companyTicker)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs hover:bg-emerald-500/25 transition-all shadow-sm"
              >
                <span>{insight.companyTicker}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs">
                {insight.companyName || "ASX Market Overview"}
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{insight.readTimeMinutes || 3} min read</span>
            </span>
          </div>

          <h2 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-lg md:text-xl font-bold text-slate-100 hover:text-emerald-400 transition-colors cursor-pointer leading-snug"
          >
            {insight.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {insight.subtitle}
          </p>

          {/* International Markets to Local ASX Connection (Bridge Box) */}
          {insight.internationalLink && (
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5 shadow-inner">
              <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <strong className="text-indigo-300 font-bold uppercase text-[10px] tracking-wider block mb-0.5">
                  International Markets to Local ASX Connection:
                </strong>
                {insight.internationalLink}
              </div>
            </div>
          )}

          {/* Why Does It Matter Quick Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs text-slate-300 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold uppercase text-[10px] tracking-wider block mb-0.5">Why This Matters To Investors:</strong>
              {insight.whyItMatters}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar (Expand toggle & Ask AI) */}
      <div>
        <div className="px-5 md:px-6 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
          >
            <span>{isExpanded ? "Hide Full AI Analysis (7 Questions)" : "Read Full AI Analysis & Evidence"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {onAskAi && (
            <button
              onClick={() => onAskAi(`Explain how international benchmark trends in "${insight.title}" impact an ASX growth investor.`)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <span>Ask AI About This</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}
        </div>

        {/* Expanded 7-Question Breakdown */}
        {isExpanded && (
          <div className="p-5 md:p-6 bg-slate-950 border-t border-slate-800 space-y-6 animate-in slide-in-from-top-2 duration-200">
            
            {/* 1. What Happened */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Detailed Overnight Event & Data Breakdown</span>
              </h4>
              <ul className="space-y-2 pl-2">
                {whatHappenedList.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Implications (Short, Long, Cashflow) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>3. Investment & Cash Flow Implications</span>
                </h4>
                <div className="flex rounded bg-slate-900 p-0.5 border border-slate-800 text-[10px] font-semibold">
                  <button
                    onClick={() => setActiveTab("short")}
                    className={`px-2 py-0.5 rounded ${activeTab === "short" ? "bg-slate-800 text-sky-400" : "text-slate-400"}`}
                  >
                    Short-Term
                  </button>
                  <button
                    onClick={() => setActiveTab("long")}
                    className={`px-2 py-0.5 rounded ${activeTab === "long" ? "bg-slate-800 text-emerald-400" : "text-slate-400"}`}
                  >
                    Long-Term
                  </button>
                  <button
                    onClick={() => setActiveTab("cash")}
                    className={`px-2 py-0.5 rounded ${activeTab === "cash" ? "bg-slate-800 text-amber-400" : "text-slate-400"}`}
                  >
                    Cashflow
                  </button>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {activeTab === "short" && insight.implications?.shortTerm}
                {activeTab === "long" && insight.implications?.longTerm}
                {activeTab === "cash" && insight.implications?.cashflowImpact}
              </div>
            </div>

            {/* Grid: Watchlist & Uncertainties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 5. What To Watch */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>5. What To Watch Next</span>
                </h4>
                <ul className="space-y-1.5">
                  {whatToWatchList.map((w: string, idx: number) => (
                    <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 6. Uncertainties */}
              <div className="p-4 rounded-xl bg-amber-950/10 border border-amber-500/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>6. Uncertainties & Risks</span>
                </h4>
                <ul className="space-y-1.5">
                  {uncertaintiesList.map((u: string, idx: number) => (
                    <li key={idx} className="text-[11px] text-amber-200/80 flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 7. Evidence & Citations */}
            {evidenceList.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  7. Supporting Evidence ({evidenceList.length} sources verified)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {evidenceList.map((ev: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
                      <div className="font-mono font-bold text-emerald-400 mb-0.5">{ev.metric}</div>
                      <p className="text-slate-300 font-medium mb-1">{ev.detail}</p>
                      <span className="text-[10px] text-slate-500 italic">Source: {ev.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
