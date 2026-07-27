"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CommandBar from "@/components/CommandBar";
import MorningBriefingHero from "@/components/MorningBriefingHero";
import AiInsightCard from "@/components/AiInsightCard";
import CompanySnowflakeModal from "@/components/CompanySnowflakeModal";
import AiAnalystChat from "@/components/AiAnalystChat";
import ScenarioModellingTab from "@/components/ScenarioModellingTab";
import PortfolioRiskAnalyst from "@/components/PortfolioRiskAnalyst";
import AsxCompaniesTab from "@/components/AsxCompaniesTab";
import SubscriptionModal from "@/components/SubscriptionModal";
import LegalComplianceFooter from "@/components/LegalComplianceFooter";
import GlobalMarketsBar from "@/components/GlobalMarketsBar";
import CryptoIntelligenceTab from "@/components/CryptoIntelligenceTab";
import HoldingFormModal from "@/components/HoldingFormModal";
import { 
  Sparkles, 
  Zap, 
  BarChart3, 
  Activity, 
  Layers, 
  Bot, 
  RefreshCw,
  Globe,
  Newspaper,
  Bitcoin
} from "lucide-react";

export default function StoxMateApp() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("briefing"); // 'briefing' | 'intelligence' | 'companies' | 'portfolio' | 'crypto' | 'scenarios' | 'chat'
  const [newsFilter, setNewsFilter] = useState<"ALL" | "TOP_NEWS" | "LATEST_NEWS" | "INTERNATIONAL">("ALL");

  // Modals & Sliders State
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Holding form (add / edit) state
  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState(false);
  const [holdingModalMode, setHoldingModalMode] = useState<"add" | "edit">("add");
  const [editingHolding, setEditingHolding] = useState<any>(null);
  const [presetSymbol, setPresetSymbol] = useState<string | null>(null);
  const [isSavingHolding, setIsSavingHolding] = useState(false);

  // Toast notification for actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/data");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (error) {
      console.error("Failed to load StoxMate intelligence:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Ask AI from any tab/component
  const handleAskAi = async (question: string) => {
    setActiveTab("chat");
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryText: question, userId: data?.user?.id || 1 }),
      });
      const json = await res.json();
      if (json.success) {
        await loadData();
        showToast("AI Analysis generated and saved to your research history.");
      }
    } catch (err) {
      console.error("Error asking AI:", err);
      showToast("Error generating AI analysis.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle Watchlist Toggles
  const handleWatchlistToggle = async (ticker: string) => {
    const isCurrentlyWatching = data?.watchlistItems?.some((it: any) => it.companyTicker === ticker);
    const action = isCurrentlyWatching ? "remove" : "add";

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyTicker: ticker, action, watchlistId: data?.watchlists?.[0]?.id || 1 }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        await loadData();
      }
    } catch (err) {
      console.error("Error modifying watchlist:", err);
    }
  };

  // ---- Portfolio holdings CRUD ----
  const openAddHolding = (symbol?: string) => {
    setHoldingModalMode("add");
    setEditingHolding(null);
    setPresetSymbol(symbol || null);
    setIsHoldingModalOpen(true);
  };

  const openEditHolding = (holding: any) => {
    setHoldingModalMode("edit");
    setEditingHolding(holding);
    setPresetSymbol(null);
    setIsHoldingModalOpen(true);
  };

  const submitHolding = async (payload: any) => {
    setIsSavingHolding(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          portfolioId: data?.portfolios?.[0]?.id || 1,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setIsHoldingModalOpen(false);
        setEditingHolding(null);
        setPresetSymbol(null);
        await loadData();
      } else {
        showToast(json.error || "Could not save this position.");
      }
    } catch (err) {
      console.error("Error saving holding:", err);
      showToast("Error saving position.");
    } finally {
      setIsSavingHolding(false);
    }
  };

  const removeHolding = async (holding: any) => {
    if (!holding) return;
    const confirmed = window.confirm(
      `Remove ${holding.companyTicker} from your portfolio? Weights and AI risk flags will be recalculated.`
    );
    if (!confirmed) return;

    setIsSavingHolding(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          holdingId: holding.id,
          portfolioId: data?.portfolios?.[0]?.id || 1,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setIsHoldingModalOpen(false);
        setEditingHolding(null);
        await loadData();
      } else {
        showToast(json.error || "Could not remove this position.");
      }
    } catch (err) {
      console.error("Error removing holding:", err);
      showToast("Error removing position.");
    } finally {
      setIsSavingHolding(false);
    }
  };

  // Handle Subscription Upgrades
  const handleSubscriptionUpgrade = async (tier: string) => {
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data?.user?.id || 1, tier }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        await loadData();
      }
    } catch (err) {
      console.error("Error upgrading:", err);
    }
  };

  // Select company by ticker helper
  const handleSelectCompanyByTicker = (ticker: string) => {
    const comp = data?.companies?.find((c: any) => c.ticker === ticker);
    if (comp) {
      setSelectedCompany(comp);
      return;
    }
    const crypto = data?.cryptoAssets?.find((c: any) => c.symbol === ticker);
    if (crypto) {
      setActiveTab("crypto");
      showToast(`Opening digital asset intelligence for ${ticker}.`);
      return;
    }
    showToast(`Company ${ticker} analysis loading...`);
    handleAskAi(`Provide detailed financial analysis and valuation snowflake for ASX company ${ticker}.`);
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black text-3xl shadow-2xl shadow-emerald-500/20 mb-4 animate-bounce">
          S
        </div>
        <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">StoxMate AI Intelligence Engine</h1>
        <p className="text-xs text-slate-400 font-mono mt-2 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Synthesizing global benchmarks, ASX announcements, and macro models...</span>
        </p>
      </div>
    );
  }

  const morningBriefing = data?.insights?.find((i: any) => i.isMorningBriefing) || data?.insights?.[0];
  const regularInsights = data?.insights?.filter((i: any) => !i.isMorningBriefing) || [];

  const filteredInsights = regularInsights.filter((ins: any) => {
    if (newsFilter === "TOP_NEWS") return ins.newsType === "TOP_NEWS";
    if (newsFilter === "LATEST_NEWS") return ins.newsType === "LATEST_NEWS";
    if (newsFilter === "INTERNATIONAL") return ins.internationalLink != null || ins.category === "International Market Driver";
    return true;
  });

  const watchlistTickers = data?.watchlistItems?.map((it: any) => it.companyTicker) || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-slate-900 border border-emerald-500/50 shadow-2xl shadow-emerald-500/20 text-slate-100 text-xs font-bold flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 ring-1 ring-emerald-500/30 max-w-sm">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        macroIndicators={data?.macroIndicators || []}
        user={data?.user}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
        
        {/* Bloomberg-Style Top Global Securities Ribbon */}
        <GlobalMarketsBar 
          indices={data?.globalIndices || []}
          onSelectCompanyByTicker={handleSelectCompanyByTicker}
          onAskAi={handleAskAi}
        />

        {/* Mobile Navigation Tabs Bar */}
        <div className="flex md:hidden items-center justify-between gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setActiveTab("briefing")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 ${activeTab === "briefing" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Briefing</span>
          </button>
          <button
            onClick={() => setActiveTab("intelligence")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 ${activeTab === "intelligence" ? "bg-slate-800 text-slate-100" : "text-slate-400"}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Research</span>
          </button>
          <button
            onClick={() => setActiveTab("companies")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 ${activeTab === "companies" ? "bg-slate-800 text-slate-100" : "text-slate-400"}`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ASX</span>
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 ${activeTab === "portfolio" ? "bg-slate-800 text-slate-100" : "text-slate-400"}`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Portfolio</span>
          </button>
          <button
            onClick={() => setActiveTab("crypto")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 ${activeTab === "crypto" ? "bg-slate-800 text-amber-400" : "text-slate-400"}`}
          >
            <Bitcoin className="w-3.5 h-3.5" />
            <span>Crypto</span>
          </button>
          <button
            onClick={() => setActiveTab("scenarios")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 ${activeTab === "scenarios" ? "bg-slate-800 text-slate-100" : "text-slate-400"}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Scenarios</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 ${activeTab === "chat" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400"}`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </div>

        {/* Tab 1: 8:00 AM Morning Briefing */}
        {activeTab === "briefing" && (
          <div className="space-y-12 animate-in fade-in duration-200">
            {morningBriefing && (
              <MorningBriefingHero
                briefing={morningBriefing}
                onAskAiAboutThis={handleAskAi}
              />
            )}

            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                    <Newspaper className="w-6 h-6 text-amber-400" />
                    <span>Top Stories & International Intelligence</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                    Proactively filtering global markets and ASX announcements with evidence-based analysis.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold flex-wrap">
                  <button
                    onClick={() => setNewsFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${newsFilter === "ALL" ? "bg-slate-800 text-emerald-400 shadow-sm font-bold" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    All Articles ({regularInsights.length})
                  </button>
                  <button
                    onClick={() => setNewsFilter("TOP_NEWS")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${newsFilter === "TOP_NEWS" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    ★ Top News
                  </button>
                  <button
                    onClick={() => setNewsFilter("LATEST_NEWS")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${newsFilter === "LATEST_NEWS" ? "bg-slate-800 text-slate-100 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    • Latest News
                  </button>
                  <button
                    onClick={() => setNewsFilter("INTERNATIONAL")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${newsFilter === "INTERNATIONAL" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>International Impact</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInsights.map((ins: any) => (
                  <AiInsightCard
                    key={ins.id}
                    insight={ins}
                    onSelectCompanyByTicker={handleSelectCompanyByTicker}
                    onAskAi={handleAskAi}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Research Feed */}
        {activeTab === "intelligence" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
                  <Zap className="w-6 h-6 text-amber-400" />
                  <span>StoxMate Continuous Intelligence Feed</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Every recommendation answers: What happened? Why does it matter? What are the implications? Evidence & Confidence.
                </p>
              </div>

              <button
                onClick={() => handleAskAi("Summarize today's most critical ASX earnings announcements and how offshore NYMEX and Dow Jones movements affect them.")}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider transition-all shadow flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Ask AI For Custom Digest</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.insights?.map((ins: any) => (
                <AiInsightCard
                  key={ins.id}
                  insight={ins}
                  onSelectCompanyByTicker={handleSelectCompanyByTicker}
                  onAskAi={handleAskAi}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: ASX Companies */}
        {activeTab === "companies" && (
          <AsxCompaniesTab
            companies={data?.companies || []}
            onSelectCompany={(c) => setSelectedCompany(c)}
            onAddToWatchlist={handleWatchlistToggle}
            watchlistTickers={watchlistTickers}
          />
        )}

        {/* Tab 4: AI Risk Analyst & Portfolio */}
        {activeTab === "portfolio" && (
          <PortfolioRiskAnalyst
            portfolios={data?.portfolios || []}
            portfolioHoldings={data?.portfolioHoldings || []}
            watchlists={data?.watchlists || []}
            watchlistItems={data?.watchlistItems || []}
            onRemoveFromWatchlist={handleWatchlistToggle}
            onSelectCompanyByTicker={handleSelectCompanyByTicker}
            onAskAi={handleAskAi}
            onAddHolding={() => openAddHolding()}
            onEditHolding={openEditHolding}
            onRemoveHolding={removeHolding}
          />
        )}

        {/* Tab 5: Digital Assets Intelligence */}
        {activeTab === "crypto" && (
          <CryptoIntelligenceTab
            cryptoAssets={data?.cryptoAssets || []}
            onAddToPortfolio={(symbol) => openAddHolding(symbol)}
            onAskAi={handleAskAi}
          />
        )}

        {/* Tab 6: Scenario Modelling */}
        {activeTab === "scenarios" && (
          <ScenarioModellingTab
            scenarios={data?.scenarioModels || []}
            onSelectCompanyByTicker={handleSelectCompanyByTicker}
            onAskAi={handleAskAi}
          />
        )}

        {/* Tab 7: Ask StoxMate AI */}
        {activeTab === "chat" && (
          <AiAnalystChat
            chatQueries={data?.chatQueries || []}
            onAskAi={handleAskAi}
            isLoading={isAiLoading}
          />
        )}
      </main>

      {/* Command Bar Modal (Cmd+K) */}
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        companies={data?.companies || []}
        insights={data?.insights || []}
        onSelectCompany={(c) => setSelectedCompany(c)}
        onSelectInsight={() => setActiveTab("intelligence")}
        onAskAi={handleAskAi}
      />

      {/* Company Snowflake Modal */}
      <CompanySnowflakeModal
        company={selectedCompany}
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        onAddToWatchlist={handleWatchlistToggle}
        isWatching={selectedCompany && watchlistTickers.includes(selectedCompany.ticker)}
        onAskAi={handleAskAi}
      />

      {/* Add / Edit Holding Modal */}
      <HoldingFormModal
        isOpen={isHoldingModalOpen}
        mode={holdingModalMode}
        holding={editingHolding}
        companies={data?.companies || []}
        cryptoAssets={data?.cryptoAssets || []}
        isSaving={isSavingHolding}
        presetSymbol={presetSymbol}
        onClose={() => {
          setIsHoldingModalOpen(false);
          setEditingHolding(null);
          setPresetSymbol(null);
        }}
        onSubmit={submitHolding}
        onDelete={removeHolding}
      />

      {/* Subscription Launch Promotion Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        user={data?.user}
        onUpgradeSuccess={handleSubscriptionUpgrade}
      />

      {/* Australian Legal & Compliance Footer */}
      <LegalComplianceFooter />
    </div>
  );
}
