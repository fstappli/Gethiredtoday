"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What's included in the $9.99/month Pro plan?",
    a: "Everything — unlimited resumes, all 60+ templates, PDF and Word downloads, full AI content generation, AI bullet point writer, real-time ATS scoring, cover letter builder, Auto-Apply (up to 50 jobs/day), priority support, and new templates added every month. There are no feature tiers or hidden upgrades.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel in one click from your account settings. No penalties, no questions, no runaround. You keep access to all Pro features through the end of your billing period.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) via Gumroad. PayPal is also supported. Your payment information is handled securely by Gumroad — we never store card details.",
  },
  {
    q: "Why is GetHiredToday priced at $9.99/month?",
    a: "We believe everyone deserves access to professional career tools without paying enterprise SaaS prices. $9.99/month covers unlimited resumes, unlimited cover letters, full AI writing, PDF + Word download, our 30-point ATS checker, and Auto-Apply. One price, everything included, no hidden fees.",
  },
  {
    q: "How does the subscription work?",
    a: "Sign up and get instant access to every Pro feature. Your subscription renews monthly on the same date. You can cancel anytime before your next renewal and retain access until the end of your current billing period.",
  },
];

export default function PricingFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm"
        >
          <button
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
            onClick={() => setOpen(open === idx ? null : idx)}
            aria-expanded={open === idx}
          >
            <span className="font-semibold text-gray-900 text-sm sm:text-base">{faq.q}</span>
            <ChevronDown
              className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform"
              style={{ transform: open === idx ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          {open === idx && (
            <div className="px-6 pb-5">
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
