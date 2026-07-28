"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  HelpCircle, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock
} from "lucide-react";

export default function LegalComplianceFooter() {
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);

  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs mt-16 pb-12 pt-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        
        {/* Top Disclaimer Highlight Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block text-sm">
                Australian Legal & Compliance Framework
              </span>
              <span className="text-slate-400 text-xs">
                Investment Intelligence vs Regulated Personal Financial Advice distinction active.
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowFullDisclaimer(!showFullDisclaimer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            <span>{showFullDisclaimer ? "Hide Legal Disclaimer" : "Read Full AFSL General Advice Warning"}</span>
            {showFullDisclaimer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-100/90 leading-relaxed">
          <strong className="text-amber-300">Closed-beta market-data notice:</strong> ASX equity and index
          prices may be delayed 15–20 minutes, are provided for informational purposes only, and are
          sourced under a personal-use beta tier that is not licensed for redistribution. StoxMate must
          move to a commercial market-data licence before public or paid launch.
        </div>

        {/* Full Disclaimer Details */}
        {showFullDisclaimer && (
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>General Advice Warning (Corporations Act 2001)</span>
            </div>
            <p>
              StoxMate Intelligence Pty Ltd (ABN 82 612 345 678) provides investment research, data analytics, educational insights, scenario modelling, and AI-generated observations. <strong>StoxMate is not a broker and does not execute financial transactions.</strong>
            </p>
            <p>
              Any advice or information contained on the StoxMate platform is <strong>General Financial Product Advice only</strong>. It has been prepared without taking into account your individual objectives, financial situation, or personal needs. Because of this, before acting on any information or AI recommendation, you should consider the appropriateness of the advice having regard to your objectives, financial situation, and needs.
            </p>
            <p>
              If the advice relates to the acquisition, or possible acquisition, of a particular financial product, you should obtain the relevant Product Disclosure Statement (PDS) or Target Market Determination (TMD) from the product issuer before making any decision about whether to acquire the product.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              StoxMate AI models use historical market data, audited ASX announcements, and quantitative consensus estimates. While every effort is made to verify data integrity, AI conclusions carry statistical uncertainties and should be cross-referenced with licensed professional financial advisors.
            </div>
          </div>
        )}

        {/* Bottom Navigation Links & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black text-xs">
              S
            </div>
            <span className="font-semibold text-slate-400">StoxMate Intelligence Pty Ltd</span>
            <span>•</span>
            <span>Australia&rsquo;s Leading AI Investment Analyst</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service (Subscription)</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Financial Services Guide (FSG)</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Lock className="w-3 h-3" />
              <span>256-Bit Bank Grade Encryption</span>
            </span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} StoxMate. All rights reserved. Made in Australia for Australian Investors.
          </div>
        </div>
      </div>
    </footer>
  );
}
