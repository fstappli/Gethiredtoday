"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is the free plan actually free?",
    a: "Yes — forever. No credit card required. You can create and download your resume on the free plan without ever entering payment details. Upgrade only when you want more.",
  },
  {
    q: "What's included in the $9.99/month Pro plan?",
    a: "Everything: unlimited resumes, all 60+ templates, PDF and Word downloads, full AI content generation, AI bullet point writer, real-time ATS scoring, cover letter builder, priority support, and new templates added every month.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel in one click from your account settings. No penalties, no questions, no runaround. You keep access to Pro features through the end of your billing period.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) via Stripe. Apple Pay and Google Pay are also supported on compatible devices.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Yes — 14 days, no questions asked. If you're not completely satisfied within 14 days of upgrading to Pro, contact our support team and we'll issue a full refund immediately.",
  },
  {
    q: "Why is GetHiredToday priced at $9.99/month?",
    a: "We believe everyone deserves access to great career tools without paying premium SaaS prices. Our AI runs on modern cloud infrastructure that costs pennies per session — we pass those savings through. $9.99/month covers unlimited resumes, unlimited cover letters, AI writing, PDF + Word download, and our 30-point ATS checker. No hidden fees, cancel anytime.",
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
