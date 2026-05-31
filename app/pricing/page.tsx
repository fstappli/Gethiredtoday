import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PricingToggle from "@/components/pricing-toggle";
import PricingFAQ from "@/components/pricing-faq";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Pricing — Simple Plans for Every Job Seeker",
  description: "GetHiredToday is free to start. Upgrade to Pro for unlimited resumes, all templates, PDF downloads, full AI writing, and ATS checking. Cancel anytime.",
  alternates: { canonical: "https://hiredtodayapp.com/pricing" },
  openGraph: {
    title: "Pricing — Simple Plans for Every Job Seeker | GetHiredToday",
    description: "Free plan available. Pro plan unlocks unlimited resumes, AI writing, PDF downloads, and full ATS checking.",
    url: "https://hiredtodayapp.com/pricing",
  },
};

/* ─── Comparison table data ──────────────────────────────────────────── */

type CellValue = boolean | string;

interface ComparisonRow {
  feature: string;
  free: CellValue;
  pro: CellValue;
}

const comparisonRows: ComparisonRow[] = [
  { feature: "Number of Resumes",       free: "1",        pro: "Unlimited"       },
  { feature: "Templates",               free: "3 basic",  pro: "All 60+"         },
  { feature: "PDF Download",            free: false,      pro: true              },
  { feature: "Word Download",           free: false,      pro: true              },
  { feature: "AI Content Suggestions",  free: false,      pro: true              },
  { feature: "AI Bullet Point Writer",  free: false,      pro: true              },
  { feature: "AI Professional Summary", free: false,      pro: true              },
  { feature: "ATS Score & Checker",     free: "Basic",    pro: "Full 30-point"   },
  { feature: "Cover Letter Builder",    free: false,      pro: true              },
  { feature: "Auto-Apply (50 jobs/day)", free: false,     pro: true              },
  { feature: "Keyword Targeting",       free: false,      pro: true              },
  { feature: "Priority Support",        free: false,      pro: true              },
  { feature: "New Templates Monthly",   free: false,      pro: true              },
];

/* ─── Cell renderer ──────────────────────────────────────────────────── */

function FreeCell({ value }: { value: CellValue }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-[18px] h-[18px] mx-auto" style={{ color: "#4AB7A6" }} />
    ) : (
      <Minus className="w-[18px] h-[18px] mx-auto text-slate-300" />
    );
  }
  return <span className="text-sm text-slate-500">{value}</span>;
}

function ProCell({ value }: { value: CellValue }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-[18px] h-[18px] mx-auto" style={{ color: "#4AB7A6" }} />
    ) : (
      <Minus className="w-[18px] h-[18px] mx-auto text-slate-300" />
    );
  }
  return (
    <span className="text-sm font-semibold" style={{ color: "#4AB7A6" }}>
      {value}
    </span>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 animate-page-enter">

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 lg:py-28 px-4 border-b border-slate-100" style={{
          background: 'linear-gradient(180deg, #f0fdf9 0%, #f8fafc 60%, #ffffff 100%)',
        }}>
          {/* Background orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(74,183,166,0.08) 0%, transparent 70%)',
          }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(74,183,166,0.05) 0%, transparent 70%)',
          }} />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            {/* Badge */}
            <div className="animate-badge-pop inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-teal-200 text-teal-700 mb-8 shadow-sm" style={{ '--stagger-delay': '0ms' } as React.CSSProperties}>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-sparkle" />
              Transparent Pricing — No Hidden Fees
            </div>

            <h1 className="animate-fade-up text-5xl sm:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6" style={{ '--stagger-delay': '60ms' } as React.CSSProperties}>
              Simple Pricing.{" "}
              <span style={{ color: "#4AB7A6" }}>Real Value.</span>
            </h1>

            <p className="animate-fade-up text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto" style={{ '--stagger-delay': '120ms' } as React.CSSProperties}>
              Everything you need to get hired — unlimited resumes, cover letters, AI
              writing, and ATS scoring — for <span className="font-bold text-slate-900">$9.99/month</span>.
              Our goal is to remove cost as a barrier to getting hired.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                "14-Day Money-Back Guarantee",
                "Cancel Anytime",
                "No Hidden Fees",
              ].map((pill, i) => (
                <span
                  key={pill}
                  className="animate-fade-up inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm hover:border-teal-300 hover:shadow-md transition-all duration-200 cursor-default"
                  style={{ '--stagger-delay': `${180 + i * 60}ms` } as React.CSSProperties}
                >
                  <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4AB7A6" }} />
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING CARDS ─────────────────────────────────────── */}
        <section className="bg-white py-20 lg:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <PricingToggle />
          </div>
        </section>

        {/* ── COMPARISON TABLE ──────────────────────────────────── */}
        <section className="bg-slate-50 py-16 lg:py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12">
              Full Feature Comparison
            </h2>

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              {/* Table header */}
              <div className="grid grid-cols-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Feature
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 text-center">
                  Free
                </div>
                <div
                  className="text-xs font-semibold uppercase tracking-wider text-center"
                  style={{ color: "#4AB7A6" }}
                >
                  Pro
                </div>
              </div>

              {/* Rows */}
              {comparisonRows.map((row, idx) => (
                <ScrollReveal key={row.feature} delay={idx * 30}>
                <div
                  className={`grid grid-cols-3 px-6 py-4 items-center border-b border-slate-50 last:border-0 transition-colors duration-150 hover:bg-teal-50/40 ${
                    idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"
                  }`}
                >
                  <span className="text-sm font-medium text-slate-700">{row.feature}</span>
                  <div className="flex justify-center">
                    <FreeCell value={row.free} />
                  </div>
                  <div className="flex justify-center">
                    <ProCell value={row.pro} />
                  </div>
                </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section className="bg-white py-20 lg:py-28 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500">
                Still have questions?{" "}
                <Link
                  href="/contact"
                  className="font-medium hover:underline"
                  style={{ color: "#4AB7A6" }}
                >
                  Contact support
                </Link>
              </p>
            </div>

            <PricingFAQ />
          </div>
        </section>

        {/* ── BOTTOM CTA ────────────────────────────────────────── */}
        <section
          className="py-20 lg:py-28 px-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #3da090 0%, #4AB7A6 50%, #56c9b8 100%)' }}
        >
          {/* Decorative orbs */}
          <div className="absolute top-8 right-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute bottom-8 left-16 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Start Building for Free Today
            </h2>
            <p className="text-xl text-white/80 mb-10">
              No credit card required. Upgrade to Pro when you&apos;re ready.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-base font-bold bg-white transition-all duration-150 hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1 active:scale-[0.97]"
              style={{ color: "#4AB7A6", boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
            >
              Create My Free Resume
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-white/60 mt-5">
              14-day money-back guarantee · Cancel anytime
            </p>
            </ScrollReveal>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
