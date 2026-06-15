import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PricingToggle from "@/components/pricing-toggle";
import PricingFAQ from "@/components/pricing-faq";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Pricing — $9.99/month for Everything",
  description: "GetHiredToday Pro gives you unlimited resumes, all 60+ templates, PDF + Word downloads, full AI writing, ATS checking, and Auto-Apply — all for $9.99/month. Cancel anytime.",
  alternates: { canonical: "https://hiredtodayapp.com/pricing" },
  openGraph: {
    title: "Pricing — $9.99/month | GetHiredToday",
    description: "Everything you need to get hired: unlimited resumes, AI writing, PDF downloads, ATS checking, and Auto-Apply for $9.99/month.",
    url: "https://hiredtodayapp.com/pricing",
  },
};

/* ─── Feature list data ──────────────────────────────────────────────── */

const proFeatures: string[] = [
  "Unlimited resumes",
  "All 60+ professional templates",
  "PDF download",
  "Word (.docx) download",
  "AI content suggestions",
  "AI bullet point writer",
  "AI professional summary",
  "Full 30-point ATS Score & Checker",
  "AI cover letter builder",
  "Auto-Apply (50 jobs/day)",
  "Keyword targeting",
  "Priority support",
  "New templates added monthly",
];


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
              One Plan.{" "}
              <span style={{ color: "#4AB7A6" }}>Everything Included.</span>
            </h1>

            <p className="animate-fade-up text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto" style={{ '--stagger-delay': '120ms' } as React.CSSProperties}>
              Unlimited resumes, cover letters, AI writing, ATS scoring, and Auto-Apply — all for{" "}
              <span className="font-bold text-slate-900">$9.99/month</span>.
              Cancel anytime. No commitments.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                "Cancel Anytime",
                "No Hidden Fees",
                "One Plan, Everything Included",
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

        {/* ── FEATURES INCLUDED ─────────────────────────────────── */}
        <section className="bg-slate-50 py-16 lg:py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-4">
              Everything Included with Pro
            </h2>
            <p className="text-center text-slate-500 mb-12 text-lg">
              One subscription. No limits. No tiers.
            </p>

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100" style={{ background: "linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Pro Plan — $9.99/month</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white">All features included</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                {proFeatures.map((feature, idx) => (
                  <ScrollReveal key={feature} delay={idx * 25}>
                  <div
                    className={`flex items-center gap-3 px-6 py-4 border-b border-slate-50 transition-colors duration-150 hover:bg-teal-50/40 ${
                      idx % 2 === 1 && idx !== proFeatures.length - 1 ? "sm:border-l border-slate-50" : ""
                    }`}
                  >
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#4AB7A6" }} />
                    <span className="text-sm font-medium text-slate-700">{feature}</span>
                  </div>
                  </ScrollReveal>
                ))}
              </div>
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
              Land Your Next Job Faster
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Get full access to every feature — unlimited resumes, AI writing, ATS checking, and Auto-Apply — for $9.99/month.
            </p>
            <Link
              href="/upgrade?from=%2Fpricing"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-base font-bold bg-white transition-all duration-150 hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1 active:scale-[0.97]"
              style={{ color: "#4AB7A6", boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
            >
              Get Pro Access — $9.99/mo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-white/60 mt-5">
              Cancel anytime · Powered by Gumroad
            </p>
            </ScrollReveal>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
