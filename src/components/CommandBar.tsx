"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  BarChart2, 
  Bot, 
  TrendingUp, 
  ArrowRight, 
  X, 
  FileText, 
  ShieldCheck, 
  Zap,
  Activity
} from "lucide-react";

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  companies: any[];
  insights: any[];
  onSelectCompany: (company: any) => void;
  onSelectInsight: (insight: any) => void;
  onAskAi: (question: string) => void;
}

export default function CommandBar({
  isOpen,
  onClose,
  companies,
  insights,
  onSelectCompany,
  onSelectInsight,
  onAskAi,
}: CommandBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // Controlled by parent toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCompanies = companies
    ? companies.filter(
        (c) =>
          c.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.sector.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredInsights = insights
    ? insights.filter(
        (i) =>
          i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 4)
    : [];

  const quickAiPrompts = [
    "Compare CBA vs WBC dividends in a cutting rate cycle",
    "Why did Pilbara Minerals (PLS) surge +4.8% today?",
    "What happens if the RBA cuts cash rates by 50bps in Q3?",
    "Evaluate BHP Group's copper transformation vs iron ore risk",
    "What are the top concentration risks in my SMSF portfolio?"
  ];

  const handlePromptClick = (prompt: string) => {
    onAskAi(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-emerald-500/10 overflow-hidden ring-1 ring-slate-700/50">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <Search className="w-5 h-5 text-emerald-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ASX tickers (e.g. CBA, BHP, PLS), AI insights, or ask any question..."
            className="flex-1 bg-transparent text-slate-100 text-sm font-medium placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-800 rounded border border-slate-700 hover:text-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
          {/* If user typed a custom search that looks like a question */}
          {searchTerm.length > 3 && (
            <div className="p-2">
              <button
                onClick={() => handlePromptClick(searchTerm)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 text-left hover:bg-emerald-500/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      Ask StoxMate AI Research Assistant
                    </span>
                    <span className="text-sm font-semibold text-slate-100 line-clamp-1">
                      "{searchTerm}"
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Quick AI Research Prompts */}
          {!searchTerm && (
            <div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Suggested AI Research Questions</span>
              </div>
              <div className="space-y-1 mt-1">
                {quickAiPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bot className="w-4 h-4 text-emerald-400/70 group-hover:text-emerald-400" />
                      <span>{prompt}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ASX Companies List */}
          {filteredCompanies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
                <span>ASX Listed Companies</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredCompanies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCompany(c);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-slate-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 font-mono text-xs font-bold text-emerald-400 ring-1 ring-slate-700">
                        {c.ticker}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{c.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {c.sector}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Cap: {c.marketCap} • PE: {c.peRatio}x • Yield: {c.dividendYield}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-100">${c.currentPrice.toFixed(2)}</div>
                      <div className={`text-[10px] font-mono font-semibold ${
                        c.dailyChangePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {c.dailyChangePercent >= 0 ? "+" : ""}{c.dailyChangePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights List */}
          {filteredInsights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Research Feed</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredInsights.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => {
                      onSelectInsight(i);
                      onClose();
                    }}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-800/80 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 line-clamp-1">{i.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{i.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono font-bold bg-emerald-500/10 px-2 py-1 rounded">
                      <span>{i.aiConfidence}% Conf.</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredCompanies.length === 0 && filteredInsights.length === 0 && searchTerm && (
            <div className="py-8 text-center text-slate-500 text-xs">
              No matching ASX tickers found. Press Enter to ask StoxMate AI about "{searchTerm}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400">↑↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400">ENTER</kbd> to select</span>
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400">ESC</kbd> to close</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AFSL Compliance Mode Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
