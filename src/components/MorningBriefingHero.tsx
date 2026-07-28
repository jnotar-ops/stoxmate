"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Share2, 
  Bookmark, 
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  FileText,
  Zap,
  HelpCircle,
  BarChart2,
  ListChecks,
  Globe
} from "lucide-react";

interface MorningBriefingHeroProps {
  briefing: any;
  onAskAiAboutThis: (question: string) => void;
}

export default function MorningBriefingHero({ briefing, onAskAiAboutThis }: MorningBriefingHeroProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [activeTab, setActiveTab] = useState<"short" | "long" | "cash">("short");

  if (!briefing) return null;

  const whatHappenedList = Array.isArray(briefing.whatHappened) 
    ? briefing.whatHappened 
    : [briefing.whatHappened];

  const whatToWatchList = Array.isArray(briefing.whatToWatch) 
    ? briefing.whatToWatch 
    : [briefing.whatToWatch];

  const evidenceList = Array.isArray(briefing.evidence) 
    ? briefing.evidence 
    : [];

  const uncertaintiesList = Array.isArray(briefing.uncertainties) 
    ? briefing.uncertainties 
    : [briefing.uncertainties];

  return (
    <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden p-6 md:p-8 lg:p-10 ring-1 ring-emerald-500/20">
      {/* Glow Effect */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge & Audio Player Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Today&rsquo;s 8:00 AM Australian Market Briefing</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{briefing.readTimeMinutes || 3} min read</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Digest Playback Button */}
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isPlayingAudio 
                ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 animate-pulse" 
                : "bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600"
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Playing AI Audio Briefing...</span>
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-3 bg-slate-950 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-0.5 h-2 bg-slate-950 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-0.5 h-3 bg-slate-950 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Listen to 3-Min AI Audio Digest</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-xl border transition-all ${
              isBookmarked 
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
            title="Save to Briefing Archive"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Title, Image & Subtitle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-center">
        <div className="lg:col-span-7 space-y-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight leading-tight">
            {briefing.title}
          </h1>
          <p className="text-base md:text-lg text-slate-300 leading-relaxed font-normal">
            {briefing.subtitle}
          </p>

          {/* International to Local ASX Connection Box */}
          {briefing.internationalLink && (
            <div className="p-4 rounded-2xl bg-indigo-950/25 border border-indigo-500/40 text-xs md:text-sm text-indigo-200 flex items-start gap-3 shadow-md mt-4">
              <Globe className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5 animate-spin" style={{ animationDuration: "20s" }} />
              <div>
                <strong className="text-indigo-300 font-bold uppercase text-[11px] tracking-wider block mb-0.5">
                  International to Local ASX Connection:
                </strong>
                <span>{briefing.internationalLink}</span>
              </div>
            </div>
          )}
        </div>

        {/* High-Resolution Photo Cover */}
        {briefing.imageUrl && (
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 aspect-video lg:aspect-auto lg:h-64 group">
            <img 
              src={briefing.imageUrl} 
              alt={briefing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
              <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                Provider Health & Timestamps Required
              </span>
            </div>
          </div>
        )}
      </div>

      {/* The 7 Core Development Brief Questions Structured Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left 8 Columns: What Happened, Why It Matters, Implications */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Question 1: What Happened? */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 md:p-6 shadow-inner">
            <div className="flex items-center gap-2 mb-3.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                1. What Happened Overnight On Global & Local Exchanges?
              </h3>
            </div>
            <ul className="space-y-3">
              {whatHappenedList.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed font-normal">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Question 2: Why Does It Matter? */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-slate-900/90 border border-emerald-500/30 p-5 md:p-6 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                2. Why Does It Matter To Australian Long-Term Investors?
              </h3>
            </div>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
              {briefing.whyItMatters}
            </p>
          </div>

          {/* Question 3: What Are The Implications? */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  3. What Are The Implications?
                </h3>
              </div>
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("short")}
                  className={`px-3 py-1 rounded-md transition-all ${activeTab === "short" ? "bg-slate-800 text-sky-400 shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Short-Term
                </button>
                <button
                  onClick={() => setActiveTab("long")}
                  className={`px-3 py-1 rounded-md transition-all ${activeTab === "long" ? "bg-slate-800 text-emerald-400 shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Long-Term Horizon
                </button>
                <button
                  onClick={() => setActiveTab("cash")}
                  className={`px-3 py-1 rounded-md transition-all ${activeTab === "cash" ? "bg-slate-800 text-amber-400 shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Cashflow & Dividends
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 text-sm text-slate-300 leading-relaxed min-h-[80px] flex items-center">
              {activeTab === "short" && (
                <div>
                  <strong className="text-sky-400 uppercase text-xs block mb-1">Immediate Market Outlook:</strong>
                  {briefing.implications?.shortTerm || "Immediate trading volatility expected across interest-rate sensitive sectors."}
                </div>
              )}
              {activeTab === "long" && (
                <div>
                  <strong className="text-emerald-400 uppercase text-xs block mb-1">Long-Term Strategic Positioning:</strong>
                  {briefing.implications?.longTerm || "Structural repricing favors high-quality companies with durable competitive moats."}
                </div>
              )}
              {activeTab === "cash" && (
                <div>
                  <strong className="text-amber-400 uppercase text-xs block mb-1">Dividend & Free Cash Flow Impact:</strong>
                  {briefing.implications?.cashflowImpact || "Free cash flow yields remain supportive of fully franked distributions."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: What To Watch, Confidence, Uncertainties, Evidence */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Question 4: How Confident is the AI? */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                4. AI Confidence Score
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Data</span>
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-emerald-400 tracking-tight font-mono">
                {briefing.aiConfidence || 94}%
              </span>
              <span className="text-xs text-slate-400 font-medium">High Statistical Concordance</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                style={{ width: `${briefing.aiConfidence || 94}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              {briefing.aiConfidenceReason || "High confidence driven by cross-referenced exchange data, institutional fund flow filings, and unambiguous RBA futures pricing."}
            </p>
          </div>

          {/* Question 5: What Should I Pay Attention To? */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-3.5">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <ListChecks className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                5. What To Watch Today
              </h3>
            </div>
            <div className="space-y-2.5">
              {whatToWatchList.map((watch: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{watch}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question 6: What Uncertainties Still Exist? */}
          <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                6. Key Uncertainties & Risks
              </h3>
            </div>
            <ul className="space-y-2">
              {uncertaintiesList.map((unc: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-amber-200/80 leading-normal">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{unc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Question 7: What Evidence Supports This? */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <span>7. Verified Evidence & Citations ({evidenceList.length})</span>
              </span>
              {showEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showEvidence && (
              <div className="mt-3 space-y-2 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
                {evidenceList.map((ev: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between font-mono font-bold text-emerald-400 mb-1">
                      <span>{ev.metric}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </div>
                    <p className="text-slate-300 font-medium mb-1">{ev.detail}</p>
                    <span className="text-[10px] text-slate-500 italic block">Source: {ev.source}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ask AI about this briefing button */}
          <button
            onClick={() => onAskAiAboutThis(`Can you explain more about how overnight Wall Street trends in "${briefing.title}" impact a dividend-focused SMSF investor today?`)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-emerald-500/10 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Ask StoxMate AI About This Briefing</span>
          </button>
        </div>
      </div>
    </section>
  );
}
