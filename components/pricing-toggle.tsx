"use client";

import { useState } from "react";
import { Check, Loader2, Shield, Sparkles } from "lucide-react";
import { startCheckout } from "@/lib/subscription";

const proFeatures: Array<{ label: string }> = [
  { label: "Unlimited resumes"       },
  { label: "All 60+ templates"       },
  { label: "PDF + Word download"     },
  { label: "AI bullet point writer"  },
  { label: "AI professional summary" },
  { label: "Full 30-point ATS Score & Checker" },
  { label: "AI cover letter builder" },
  { label: "Auto-Apply (50 jobs/day)"},
  { label: "Keyword targeting"       },
  { label: "Real-time preview"       },
  { label: "Priority support"        },
  { label: "New templates monthly"   },
];

export default function PricingToggle() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleGetPro = async () => {
    setCheckoutLoading(true);
    await startCheckout('/pricing');
    setCheckoutLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Single Pro card — centered */}
      <div
        className="rounded-2xl p-8 flex flex-col relative overflow-hidden bg-white shadow-2xl"
        style={{ border: "2px solid #4AB7A6" }}
      >
        {/* Most Popular ribbon */}
        <div
          className="absolute top-0 right-0 px-5 py-1.5 text-xs font-bold text-white"
          style={{ backgroundColor: "#4AB7A6", borderBottomLeftRadius: "12px" }}
        >
          ALL INCLUSIVE
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: "#4AB7A6" }}
            >
              Pro
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#f0fdf9", color: "#4AB7A6" }}>
              <Sparkles className="w-3 h-3" /> Full Access
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold" style={{ color: "#4AB7A6" }}>$9.99</span>
            <span className="text-slate-400 text-sm">/month</span>
          </div>

          <p className="text-sm text-slate-500 mt-2">Everything you need to get hired — unlimited.</p>
          <p className="text-sm text-slate-400 mt-0.5 italic">Cancel anytime. No lock-in.</p>
        </div>

        <div className="border-t border-slate-100 my-2" />

        {/* Features grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 flex-1 mt-4 mb-8">
          {proFeatures.map((f) => (
            <li key={f.label} className="flex items-center gap-2.5">
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#4AB7A6" }} />
              <span className="text-sm text-slate-700">{f.label}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleGetPro}
          disabled={checkoutLoading}
          className="block w-full text-center py-3.5 px-6 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)", boxShadow: "0 8px 24px -6px rgba(74,183,166,0.45)" }}
        >
          {checkoutLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to checkout…
            </span>
          ) : (
            "Get Pro Access — $9.99/mo →"
          )}
        </button>
        <p className="text-xs text-center text-slate-400 mt-3 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" />
          Cancel anytime · Powered by Gumroad
        </p>
      </div>
    </div>
  );
}
