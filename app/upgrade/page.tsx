'use client';

import { Suspense, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Sparkles, Shield, Star, ArrowRight, Zap, FileText, Download, Target } from 'lucide-react';

const PRO_FEATURES = [
  { icon: Zap, text: 'Unlimited AI bullet-point generation' },
  { icon: Target, text: 'AI resume tailoring to any job description' },
  { icon: Download, text: 'Word (.docx) download for ATS uploads' },
  { icon: FileText, text: 'All professional templates unlocked' },
  { icon: Sparkles, text: 'AI cover letter writer' },
  { icon: Star, text: 'Priority support' },
];

const TESTIMONIALS = [
  {
    quote: "Got an interview at Stripe within a week. The AI tailoring made every bullet actually relevant.",
    name: "Marcus T.",
    role: "Software Engineer",
  },
  {
    quote: "I applied to Mass General Hospital and landed a callback the same day I sent my resume.",
    name: "Priya S.",
    role: "Healthcare Administrator",
  },
  {
    quote: "Three Shopify interviews in two weeks. Worth every penny.",
    name: "Jordan K.",
    role: "Product Manager",
  },
];

function UpgradeContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/dashboard';
  const [loading, setLoading] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const handleCheckout = () => {
    setLoading(true);
    // Fire GA4 begin_checkout event
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag?.('event', 'begin_checkout', {
        currency: 'USD',
        value: 9.99,
        items: [{ item_id: 'pro_monthly', item_name: 'Pro Plan', price: 9.99 }],
      });
    } catch {}
    window.location.href = `/api/lemonsqueezy/checkout-redirect?from=${encodeURIComponent(from)}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <a href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
          ← Back
        </a>
        <span
          className="text-sm font-semibold px-3 py-1 rounded-full text-white"
          style={{ backgroundColor: '#4AB7A6' }}
        >
          30-Day Money-Back Guarantee
        </span>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-8">
        {/* Hero */}
        <div className="text-center">
          <div
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: '#E8F7F5', color: '#4AB7A6' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Pro Plan
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-3">
            Land interviews<br />faster with AI
          </h1>
          <p className="text-slate-500 text-base">
            Everything you need to get past the ATS bots and in front of real recruiters.
          </p>
        </div>

        {/* Pricing card */}
        <div
          className="rounded-2xl border-2 p-6 text-center"
          style={{ borderColor: '#4AB7A6', background: 'linear-gradient(135deg, #f0fdfb 0%, #ffffff 100%)' }}
        >
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl font-bold text-slate-900">$9.99</span>
            <span className="text-slate-500 text-base">/month</span>
          </div>
          <p className="text-sm text-slate-400 mb-4">Cancel anytime. No commitment.</p>
          <button
            ref={ctaRef}
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3.5 rounded-full font-semibold text-white text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
            style={{
              background: loading ? '#4AB7A6' : 'linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)',
              boxShadow: '0 8px 24px -6px rgba(74,183,166,0.45)',
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Taking you to checkout…
              </>
            ) : (
              <>
                Continue to Payment
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Secure checkout powered by Gumroad
          </p>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Everything included
          </h2>
          <ul className="space-y-3">
            {PRO_FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#4AB7A6' }} />
                <span className="text-sm text-slate-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonials */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Real results
          </h2>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-2">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-xs font-semibold text-slate-500">
                {t.name} · {t.role}
              </p>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex gap-3 items-start">
          <Shield className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">30-day money-back guarantee</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Not happy? Email us within 30 days and we&apos;ll refund you — no questions asked.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pb-6">
          By continuing you agree to our{' '}
          <a href="/terms" className="underline hover:text-slate-600">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="underline hover:text-slate-600">Privacy Policy</a>.
        </p>
      </main>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense>
      <UpgradeContent />
    </Suspense>
  );
}
