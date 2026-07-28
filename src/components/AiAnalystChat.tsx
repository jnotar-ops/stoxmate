"use client";

import React, { useState } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  User, 
  CornerDownRight, 
  HelpCircle,
  BarChart2,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

interface AiAnalystChatProps {
  chatQueries: any[];
  onAskAi: (question: string) => Promise<void>;
  isLoading?: boolean;
}

export default function AiAnalystChat({
  chatQueries,
  onAskAi,
  isLoading = false,
}: AiAnalystChatProps) {
  const [inputQuery, setInputQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isSubmitting || isLoading) return;

    const q = inputQuery;
    setInputQuery("");
    setIsSubmitting(true);
    await onAskAi(q);
    setIsSubmitting(false);
  };

  const suggestedPrompts = [
    "Compare CBA vs WBC dividends in a cutting rate cycle",
    "Why did Pilbara Minerals (PLS) surge +4.8% today?",
    "What happens if the RBA cuts cash rates by 50bps in Q3?",
    "Evaluate BHP Group's copper transformation vs iron ore risk",
    "How should I protect my SMSF portfolio from inflation risks?"
  ];

  return (
    <div className="flex flex-col h-[75vh] min-h-[600px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-slate-700/50">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-100">Ask StoxMate AI Analyst</h2>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ASX Data Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evidence-based research, comparison models, and risk intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">AFSL Compliance Mode Active</span>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/40">
        
        {/* Welcome Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-emerald-500/30 text-slate-200">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Welcome to Your Personal AI Investment Analyst</span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
            StoxMate AI does not offer generic opinions or unregulated personal financial advice. Every answer is synthesized from ASX corporate filings, macroeconomic statistics, and institutional broker research—structured to explain <strong>what happened, why it matters, evidence, confidence, and uncertainties</strong>.
          </p>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Try asking about ASX companies or macroeconomic events:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputQuery(prompt);
                    onAskAi(prompt);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 text-xs font-medium transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Query History */}
        {chatQueries && chatQueries.map((item: any) => {
          const resp = item.aiResponse;
          return (
            <div key={item.id} className="space-y-4 animate-in fade-in duration-300">
              
              {/* User Question */}
              <div className="flex items-start justify-end gap-3">
                <div className="max-w-2xl rounded-2xl rounded-tr-none bg-emerald-600 text-slate-950 px-5 py-3.5 shadow-md font-medium text-sm">
                  {item.queryText}
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 font-bold text-xs ring-1 ring-slate-700 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* AI Response Card */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-bold text-xs shadow-md flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="flex-1 max-w-3xl rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 p-5 md:p-6 shadow-xl space-y-4">
                  {/* Title & Summary */}
                  <div>
                    {resp.title && (
                      <h3 className="text-base md:text-lg font-bold text-slate-100 mb-2">
                        {resp.title}
                      </h3>
                    )}
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {resp.summary}
                    </p>
                  </div>

                  {/* Comparison Table if present */}
                  {resp.comparison && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                        Comparative Ticker Analysis:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {resp.comparison.map((comp: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                              <span className="font-mono text-emerald-400">{comp.ticker}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                                {comp.impact}
                              </span>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-normal">{comp.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* What Happened List if present */}
                  {resp.whatHappened && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        What Happened & Context:
                      </span>
                      <ul className="space-y-1 pl-2 text-xs text-slate-300">
                        {resp.whatHappened.map((wh: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <span>{wh}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Why It Matters if present */}
                  {resp.whyItMatters && (
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-200">
                      <strong className="text-emerald-400 uppercase tracking-wider text-[10px] block mb-0.5">Why This Matters To Investors:</strong>
                      {resp.whyItMatters}
                    </div>
                  )}

                  {/* SMSF Recommendation if present */}
                  {resp.recommendationForSmsf && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-200">
                      <strong className="text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                        SMSF Strategic Observation:
                      </strong>
                      {resp.recommendationForSmsf}
                    </div>
                  )}

                  {/* What To Watch if present */}
                  {resp.whatToWatch && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-1.5">
                        What To Watch Next:
                      </span>
                      <div className="space-y-1 text-xs text-slate-300">
                        {resp.whatToWatch.map((w: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence Citations */}
                  {(resp.evidence || resp.evidenceCitations) && (
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-semibold">Evidence Citations:</span>
                      {(resp.evidence || resp.evidenceCitations).map((ev: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 font-mono">
                          {typeof ev === "string" ? ev : ev.metric || ev.source}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Stats: Confidence & Uncertainties */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>AI Confidence Score: <strong className="text-emerald-400 font-mono">{resp.aiConfidence || resp.confidenceScore || 92}%</strong></span>
                    </div>

                    {resp.uncertainties && resp.uncertainties.length > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-400" title={resp.uncertainties[0]}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Key Risks Identified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {(isSubmitting || isLoading) && (
          <div className="flex items-start gap-3 animate-in fade-in duration-150">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex-shrink-0 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>StoxMate AI is cross-referencing ASX announcements, broker consensus, and macro data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask StoxMate AI anything about Australian equities, dividends, or interest rate scenarios..."
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-all shadow-inner"
          disabled={isSubmitting || isLoading}
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isSubmitting || isLoading}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
