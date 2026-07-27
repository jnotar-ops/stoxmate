"use client";

import React, { useState } from "react";
import { 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  BarChart2, 
  HelpCircle, 
  CheckCircle2,
  DollarSign,
  Activity,
  Sliders
} from "lucide-react";

interface ScenarioModellingTabProps {
  scenarios: any[];
  onSelectCompanyByTicker: (ticker: string) => void;
  onAskAi: (question: string) => void;
}

export default function ScenarioModellingTab({
  scenarios,
  onSelectCompanyByTicker,
  onAskAi,
}: ScenarioModellingTabProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | null>(scenarios?.[0]?.id || null);
  const [customInterestRateShift, setCustomInterestRateShift] = useState(0); // -50bps to +50bps

  if (!scenarios || scenarios.length === 0) return null;

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const affectedSectors = Array.isArray(activeScenario.affectedSectors)
    ? activeScenario.affectedSectors
    : [];

  const topBeneficiaries = Array.isArray(activeScenario.topStockBeneficiaries)
    ? activeScenario.topStockBeneficiaries
    : [];

  const topRisks = Array.isArray(activeScenario.topStockRisks)
    ? activeScenario.topStockRisks
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner & Description */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/30 border border-slate-800 shadow-xl relative overflow-hidden ring-1 ring-indigo-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight">
                AI Macroeconomic Scenario Modelling & Stress Testing
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Quantitative simulations of potential RBA policy shifts, commodity supercycles, and geopolitical events.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
            <Sliders className="w-4 h-4" />
            <span>Interactive Simulator Active</span>
          </div>
        </div>

        {/* Scenario Select Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
          {scenarios.map((sc) => {
            const isSelected = sc.id === activeScenario.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/50 text-slate-100 shadow-lg shadow-indigo-500/10 scale-[1.02]"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-indigo-400 border border-slate-800">
                    {sc.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {sc.probability}% Prob.
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-200 line-clamp-1 mb-1">
                  {sc.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {sc.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Scenario Deep Dive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left 8 Columns: Detailed Analysis & Sector Impact */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Detailed Summary Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">
                  Scenario Focus: {activeScenario.category}
                </span>
                <h3 className="text-xl font-bold text-slate-100">
                  {activeScenario.title}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-black text-emerald-400 block">
                  {activeScenario.probability}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">AI Probability Estimate</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {activeScenario.summary}
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
              <strong className="text-indigo-400 uppercase tracking-wider block text-[11px] font-bold">
                Quantitative AI Simulation Analysis:
              </strong>
              <p>{activeScenario.detailedAnalysis}</p>
            </div>
          </div>

          {/* Sector Breakdown Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Projected Impact Across ASX Sectors</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {affectedSectors.map((sec: any, idx: number) => {
                const isPos = sec.impact === "Positive";
                const isNeg = sec.impact === "Negative";
                return (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      isPos ? "bg-emerald-950/10 border-emerald-500/30" : 
                      isNeg ? "bg-rose-950/10 border-rose-500/30" : 
                      "bg-slate-900/80 border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-200">{sec.sector}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isPos ? "bg-emerald-500/20 text-emerald-300" :
                          isNeg ? "bg-rose-500/20 text-rose-300" :
                          "bg-amber-500/20 text-amber-300"
                        }`}>
                          {sec.impact}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal">{sec.reasoning}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Top Stock Beneficiaries & Risks */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Beneficiaries Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-lg">
            <div className="flex items-center gap-2 mb-3.5 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Top Stock Beneficiaries
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              These ASX companies exhibit the highest positive statistical correlation to this scenario occurring:
            </p>
            <div className="flex flex-wrap gap-2">
              {topBeneficiaries.map((ticker: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => onSelectCompanyByTicker(ticker)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 text-xs font-mono font-bold text-emerald-400 transition-all group shadow-sm"
                >
                  <span>{ticker}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Top Risk Stocks Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-lg">
            <div className="flex items-center gap-2 mb-3.5 text-rose-400">
              <TrendingDown className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Top Portfolio Vulnerabilities
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Companies facing structural headwinds or valuation multiple contraction under this scenario:
            </p>
            <div className="flex flex-wrap gap-2">
              {topRisks.map((ticker: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => onSelectCompanyByTicker(ticker)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-xs font-mono font-bold text-rose-400 transition-all group shadow-sm"
                >
                  <span>{ticker}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Custom Shock Slider */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulate Rate Shock</span>
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                customInterestRateShift > 0 ? "bg-rose-500/10 text-rose-400" :
                customInterestRateShift < 0 ? "bg-emerald-500/10 text-emerald-400" :
                "bg-slate-800 text-slate-400"
              }`}>
                {customInterestRateShift > 0 ? `+${customInterestRateShift} bps` : `${customInterestRateShift} bps`}
              </span>
            </div>

            <input
              type="range"
              min="-50"
              max="50"
              step="25"
              value={customInterestRateShift}
              onChange={(e) => setCustomInterestRateShift(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-50bps (Cut)</span>
              <span>0 (Hold)</span>
              <span>+50bps (Hike)</span>
            </div>

            <button
              onClick={() => onAskAi(`What happens to my SMSF portfolio and ASX banks (CBA, WBC) if the RBA moves cash rates by ${customInterestRateShift} basis points?`)}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simulate {customInterestRateShift} bps Shock with AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
