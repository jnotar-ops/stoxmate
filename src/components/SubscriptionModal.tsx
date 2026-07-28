"use client";

import React, { useState } from "react";
import { 
  Crown, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Lock, 
  Heart,
  Award,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import confetti from "canvas-confetti";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpgradeSuccess: (tier: string) => Promise<void>;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  user,
  onUpgradeSuccess,
}: SubscriptionModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!isOpen) return null;

  const isFoundingMember = user?.subscriptionTier === "FOUNDING_MEMBER" || user?.subscriptionTier === "PRO";

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await onUpgradeSuccess("FOUNDING_MEMBER");
      
      // Fire celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#fbbf24", "#f59e0b", "#38bdf8"],
      });

      setTimeout(() => {
        setIsUpgrading(false);
        onClose();
      }, 1500);
    } catch (err) {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-amber-500/30 my-8">
        
        {/* Modal Header */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider w-fit mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Founding Member Launch Promotion</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight leading-tight">
            Secure 50% Off For Life As An Early Adopter
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-lg">
            StoxMate is a premium subscription intelligence platform. No advertising. No sponsored stocks. No payment for order flow. No sale of user data. Ever.
          </p>
        </div>

        {/* Pricing Comparison */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Standard Tier Box */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Standard Pricing</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-black text-slate-300">$39.99</span>
                  <span className="text-xs text-slate-400">AUD / month</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Full product access after 30-day trial expires.
                </p>
              </div>
              <div className="mt-4 text-xs text-slate-500 italic">
                Standard rate applies after promotion closes.
              </div>
            </div>

            {/* Founding Member Tier Box (Featured) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-slate-900 border-2 border-amber-500/60 flex flex-col justify-between relative shadow-lg">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                Best Value • 50% Off Lifetime
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Founding Member Status</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-black text-amber-400">$19.99</span>
                  <span className="text-xs text-slate-300">AUD / month</span>
                  <span className="text-xs text-slate-500 line-through font-mono">$39.99</span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-medium">
                  50% lifetime discount remains active as long as subscription is continuous.
                </p>
              </div>
              
              <div className="mt-4 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Locks in $19.99/mo rate permanently</span>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Included in Your Founding Member Subscription:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Daily 8:00 AM Australian Market Briefings</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlimited &ldquo;Ask StoxMate AI Analyst&rdquo; Queries</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>5-Dimension AI Health Snowflakes (All ASX Stocks)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Proactive AI Insider Trading & Price Drop Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>AI Portfolio Risk & Concentration Surveillance</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Interactive Macro Scenario Modelling & Stress Tests</span>
              </div>
            </div>
          </div>

          {/* Our Pledge & Ethics */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5">The StoxMate Premium Software Pledge:</strong>
              Because we charge a transparent subscription, our loyalty is 100% to our investors. We never accept fees from ASX companies to promote their stock, we never sell your trading data to hedge funds, and we never display advertisements.
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading || isFoundingMember}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-black text-base transition-all shadow-xl shadow-amber-500/20 disabled:opacity-75 flex items-center justify-center gap-2"
          >
            {isUpgrading ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                <span>Activating Founding Member Status...</span>
              </>
            ) : isFoundingMember ? (
              <>
                <Award className="w-5 h-5" />
                <span>You Are Already A Founding Member (Active)</span>
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 fill-slate-950 animate-bounce" />
                <span>Claim Founding Member Discount ($19.99 AUD/mo)</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-500">
          30-day free trial active. Cancel anytime with 1-click from your dashboard.
        </div>
      </div>
    </div>
  );
}
