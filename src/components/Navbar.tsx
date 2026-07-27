"use client";

import React from "react";
import { 
  Sparkles, 
  Search, 
  TrendingUp, 
  ShieldAlert, 
  Crown, 
  Bot, 
  Activity, 
  Globe, 
  ChevronRight,
  Zap,
  BarChart3,
  Layers,
  MessageSquare,
  Bitcoin
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCommandBar: () => void;
  onOpenSubscription: () => void;
  macroIndicators: any[];
  user: any;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenCommandBar,
  onOpenSubscription,
  macroIndicators,
  user,
}: NavbarProps) {
  const isFoundingMember = user?.subscriptionTier === "FOUNDING_MEMBER" || user?.subscriptionTier === "PRO";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      {/* Top Real-Time Macro Ticker Bar */}
      <div className="border-b border-slate-900 bg-slate-950/50 py-1.5 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-300">STOXMATE AI ENGINE:</span>
            <span className="text-emerald-400">Continuous Market Monitoring Active</span>
            <span className="text-slate-600">•</span>
            <span>Researched 1,482 ASX announcements & news items today</span>
          </div>
          
          <div className="flex items-center gap-6 text-slate-300 font-medium">
            {macroIndicators && macroIndicators.length > 0 ? (
              macroIndicators.slice(0, 5).map((m, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-slate-500">{m.name}:</span>
                  <span className="text-slate-200">{m.currentValue}</span>
                  <span className={`text-[11px] font-bold px-1 py-0.5 rounded ${
                    m.change.startsWith("+") ? "text-emerald-400 bg-emerald-500/10" : 
                    m.change.startsWith("-") ? "text-rose-400 bg-rose-500/10" : 
                    "text-slate-400 bg-slate-800"
                  }`}>
                    {m.change}
                  </span>
                </div>
              ))
            ) : (
              <>
                <span className="text-slate-400">RBA Cash Rate: <strong className="text-slate-200">4.35%</strong> (Unchanged)</span>
                <span className="text-slate-400">AUD/USD: <strong className="text-emerald-400">$0.6542 (+0.42%)</strong></span>
                <span className="text-slate-400">Iron Ore: <strong className="text-slate-200">$102.50/t (-1.2%)</strong></span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                StoxMate
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
                AI Intelligence
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5">Australia's AI Investment Analyst</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setActiveTab("briefing")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "briefing"
                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>8:00 AM Briefing</span>
          </button>

          <button
            onClick={() => setActiveTab("intelligence")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "intelligence"
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Research Feed</span>
          </button>

          <button
            onClick={() => setActiveTab("companies")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "companies"
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            <span>ASX Companies</span>
          </button>

          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "portfolio"
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Risk & Portfolio</span>
          </button>

          <button
            onClick={() => setActiveTab("crypto")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "crypto"
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Bitcoin className="w-3.5 h-3.5 text-amber-400" />
            <span>Digital Assets</span>
          </button>

          <button
            onClick={() => setActiveTab("scenarios")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "scenarios"
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Scenarios</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "chat"
                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Ask StoxMate AI</span>
          </button>
        </nav>

        {/* Action Controls & Membership */}
        <div className="flex items-center gap-3">
          {/* Command Bar Trigger */}
          <button
            onClick={onOpenCommandBar}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all shadow-inner group"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            <span className="hidden sm:inline">Search ASX or Ask AI...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 rounded border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Founding Member Badge Button */}
          <button
            onClick={onOpenSubscription}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/30 hover:border-amber-500/60 text-xs font-bold text-amber-300 transition-all shadow-sm hover:shadow-amber-500/10 group"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">
              {isFoundingMember ? "Founding Member 50% Off" : "Trial Active • Upgrade 50% Off"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
