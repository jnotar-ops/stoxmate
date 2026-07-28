"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Plus,
  Pencil,
  Bitcoin,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Check,
  Trash2,
} from "lucide-react";

interface HoldingFormModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  holding?: any;
  companies: any[];
  cryptoAssets: any[];
  isSaving?: boolean;
  presetSymbol?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    action: "add" | "edit";
    holdingId?: number;
    ticker?: string;
    assetClass?: string;
    sharesCount: number;
    averageBuyPrice: number;
    notes?: string;
  }) => Promise<void>;
  onDelete?: (holding: any) => void;
}

export default function HoldingFormModal({
  isOpen,
  mode,
  holding,
  companies,
  cryptoAssets,
  isSaving = false,
  presetSymbol = null,
  onClose,
  onSubmit,
  onDelete,
}: HoldingFormModalProps) {
  const [assetTab, setAssetTab] = useState<"EQUITY" | "CRYPTO">("EQUITY");
  const [search, setSearch] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [units, setUnits] = useState<string>("");
  const [buyPrice, setBuyPrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && holding) {
      // Modal props intentionally reset the draft when the selected holding changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSymbol(holding.companyTicker);
      setUnits(String(holding.sharesCount));
      setBuyPrice(String(holding.averageBuyPrice));
      setNotes(holding.notes || "");
      setAssetTab(holding.assetClass === "EQUITY" ? "EQUITY" : "CRYPTO");
    } else {
      const preset = presetSymbol || "";
      const presetCrypto = (cryptoAssets || []).find((c) => c.symbol === preset);
      const presetEquity = (companies || []).find((c) => c.ticker === preset);
      setSelectedSymbol(preset);
      setUnits("");
      setBuyPrice(
        presetCrypto?.currentPriceAud != null ? String(presetCrypto.currentPriceAud) : presetEquity?.currentPrice != null ? String(presetEquity.currentPrice) : ""
      );
      setNotes("");
      setAssetTab(presetCrypto ? "CRYPTO" : "EQUITY");
    }
    setSearch("");
    setError(null);
  }, [isOpen, mode, holding, presetSymbol, companies, cryptoAssets]);

  const universe = useMemo(() => {
    const equities = (companies || []).map((c) => ({
      symbol: c.ticker,
      name: c.name,
      detail: `${c.sector} • ${c.marketCap}`,
      price: c.currentPrice,
      change: c.dailyChangePercent,
      assetClass: "EQUITY" as const,
    }));
    const digital = (cryptoAssets || []).map((c) => ({
      symbol: c.symbol,
      name: c.name,
      detail: `${c.assetType} • Vol ${c.volatility30d}%`,
      price: c.currentPriceAud,
      change: c.dailyChangePercent,
      assetClass: "CRYPTO" as const,
    }));
    return assetTab === "EQUITY" ? equities : digital;
  }, [companies, cryptoAssets, assetTab]);

  const filtered = universe.filter(
    (a) =>
      a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAsset = useMemo(() => {
    const all = [
      ...(companies || []).map((c) => ({
        symbol: c.ticker,
        name: c.name,
        price: c.currentPrice,
        assetClass: "EQUITY" as const,
      })),
      ...(cryptoAssets || []).map((c) => ({
        symbol: c.symbol,
        name: c.name,
        price: c.currentPriceAud,
        assetClass: "CRYPTO" as const,
      })),
    ];
    return all.find((a) => a.symbol === selectedSymbol) || null;
  }, [companies, cryptoAssets, selectedSymbol]);

  if (!isOpen) return null;

  const unitsNum = Number(units);
  const priceNum = Number(buyPrice);
  const latestPrice = typeof selectedAsset?.price === "number" ? selectedAsset.price : null;
  const projectedValue = Number.isFinite(unitsNum) && latestPrice !== null ? unitsNum * latestPrice : null;
  const projectedCost = Number.isFinite(unitsNum) && Number.isFinite(priceNum) ? unitsNum * priceNum : 0;
  const projectedGain = projectedValue === null ? null : projectedValue - projectedCost;
  const projectedGainPct = projectedGain !== null && projectedCost > 0 ? (projectedGain / projectedCost) * 100 : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "add" && !selectedSymbol) {
      setError("Select an ASX company or digital asset to continue.");
      return;
    }
    if (!Number.isFinite(unitsNum) || unitsNum <= 0) {
      setError("Enter the number of units or shares held (must be greater than zero).");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("Enter your average buy price in AUD (must be greater than zero).");
      return;
    }

    await onSubmit({
      action: mode,
      holdingId: holding?.id,
      ticker: selectedSymbol,
      assetClass: selectedAsset?.assetClass ?? "EQUITY",
      sharesCount: unitsNum,
      averageBuyPrice: priceNum,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl ring-1 ring-emerald-500/20 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {mode === "add" ? <Plus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 tracking-tight">
                {mode === "add" ? "Add Position to Portfolio" : `Edit Position — ${holding?.companyTicker}`}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === "add"
                  ? "Add ASX equities or digital assets. AI surveillance begins immediately."
                  : "Update units and cost base. Weights and AI risk flags recalculate on save."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Asset picker (add mode only) */}
          {mode === "add" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  1. Select Asset
                </span>
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAssetTab("EQUITY")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      assetTab === "EQUITY"
                        ? "bg-slate-800 text-emerald-400 shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>ASX Equities</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetTab("CRYPTO")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      assetTab === "CRYPTO"
                        ? "bg-slate-800 text-amber-400 shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Bitcoin className="w-3.5 h-3.5" />
                    <span>Digital Assets</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={assetTab === "EQUITY" ? "Search ASX ticker or company (BHP, CBA, CSL)..." : "Search digital asset (BTC, ETH, VBTC)..."}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {filtered.map((a) => {
                  const isSelected = selectedSymbol === a.symbol;
                  return (
                    <button
                      key={a.symbol}
                      type="button"
                      onClick={() => {
                        setSelectedSymbol(a.symbol);
                        if (!buyPrice && a.price != null) setBuyPrice(String(a.price));
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-emerald-500/15 border-emerald-500/50 ring-1 ring-emerald-500/30"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-emerald-400">{a.symbol}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-xs font-semibold text-slate-200 truncate">{a.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{a.detail}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-mono font-bold text-slate-100">
                          {a.price == null ? "Unavailable" : `$${a.price >= 1000 ? a.price.toLocaleString("en-AU", { maximumFractionDigits: 0 }) : a.price.toFixed(2)}`}
                        </div>
                        <div className={`text-[10px] font-mono font-bold ${a.change == null ? "text-slate-500" : a.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {a.change == null ? "No provider quote" : `${a.change >= 0 ? "+" : ""}${a.change.toFixed(2)}%`}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="col-span-full py-6 text-center text-xs text-slate-500">
                    No matching assets in StoxMate&rsquo;s covered universe.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Units & cost base */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {mode === "add" ? "2. Position Details" : "Position Details"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Units / Shares Held
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Average Buy Price (AUD)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="e.g. 36.50"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Note (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. DRP enabled, long-term core holding"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Provider-price preview */}
          {selectedAsset && unitsNum > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Latest Provider Price</span>
                <span className="text-sm font-mono font-bold text-slate-100">
                  {latestPrice === null ? "Unavailable" : `$${latestPrice >= 1000 ? latestPrice.toLocaleString("en-AU", { maximumFractionDigits: 0 }) : latestPrice.toFixed(2)}`}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Market Value</span>
                <span className="text-sm font-mono font-bold text-slate-100">
                  {projectedValue === null ? "Unavailable" : `$${projectedValue.toLocaleString("en-AU", { maximumFractionDigits: 2 })}`}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Cost Base</span>
                <span className="text-sm font-mono font-bold text-slate-300">
                  ${projectedCost.toLocaleString("en-AU", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Unrealised</span>
                <span className={`text-sm font-mono font-bold ${projectedGain === null ? "text-slate-500" : projectedGain >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {projectedGain === null || projectedGainPct === null ? "Unavailable" : `${projectedGain >= 0 ? "+" : ""}$${projectedGain.toLocaleString("en-AU", { maximumFractionDigits: 2 })} (${projectedGainPct.toFixed(1)}%)`}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Portfolio tracking is provided for research and risk-analysis purposes only. StoxMate does not execute trades and does not provide personal financial advice.
            </span>
          </div>
        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {mode === "edit" && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(holding)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Position</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">
              Adding an existing ticker merges parcels at a blended cost base.
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{mode === "add" ? "Add Position & Start AI Monitoring" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
