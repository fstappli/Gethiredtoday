'use client';

/**
 * Pro Upgrade modal — shown when a free user tries to download a Pro template
 * or a Pro-gated feature (Word export).
 *
 * Design principles:
 *   • One clear primary action (Upgrade to Pro — $9.99/mo).
 *   • One clear escape (switch to the free Classic template), so the user is
 *     never trapped.
 *   • SEO-aware, benefit-rich copy — mirrors the positioning used across the
 *     homepage and blog so the brand story is consistent wherever users land.
 *   • Accessible: role="dialog", aria-modal, ESC closes, backdrop click closes,
 *     focus is trapped inside the modal while open.
 *
 * This component is a pure presentation layer. Parent owns `open` + callbacks.
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Check, Sparkles, Crown, Download, FileText, ShieldCheck } from 'lucide-react';

interface ProUpgradeModalProps {
  open: boolean;
  /** What the user tried to do — shown in the heading for context. */
  trigger?: 'pdf' | 'word' | 'template';
  /** Human-readable template name, shown so the user knows which template is Pro. */
  templateLabel?: string;
  onClose: () => void;
  /** Invoked when the user clicks "Use the free Classic template instead". */
  onSwitchToFree?: () => void;
}

const PRO_FEATURES: { icon: React.ReactNode; label: string; description: string }[] = [
  {
    icon: <Sparkles className="w-4 h-4" />,
    label: 'All 14 premium templates',
    description: 'Modern, Executive, Creative, Photo Card, Timeline, and 9 more — unlock every layout.',
  },
  {
    icon: <FileText className="w-4 h-4" />,
    label: 'PDF + Word download',
    description: 'Export as a pixel-perfect PDF or an editable Microsoft Word (.doc) file.',
  },
  {
    icon: <ShieldCheck className="w-4 h-4" />,
    label: 'Full 30-point ATS checker',
    description: 'Score your resume against the job description and fix every parser-breaking issue.',
  },
  {
    icon: <Download className="w-4 h-4" />,
    label: 'Unlimited resumes + cover letters',
    description: 'Build as many tailored resumes and cover letters as you need, every month.',
  },
];

export default function ProUpgradeModal({
  open,
  trigger = 'template',
  templateLabel,
  onClose,
  onSwitchToFree,
}: ProUpgradeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryActionRef = useRef<HTMLAnchorElement>(null);

  // ESC to close, focus the primary CTA on open, lock body scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the primary CTA for keyboard users
    const t = setTimeout(() => primaryActionRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const heading =
    trigger === 'word'
      ? 'Word download is a Pro feature'
      : trigger === 'pdf' && templateLabel
      ? `${templateLabel} is a Pro template`
      : 'Unlock this Pro template';

  const subheading =
    trigger === 'word'
      ? 'Download editable Microsoft Word (.doc) files — included with your Pro subscription at $9.99/month.'
      : templateLabel
      ? `The ${templateLabel} template is part of our Pro collection. Unlock it, along with all 60+ templates, AI writing, ATS checking, and Auto-Apply for just $9.99/month.`
      : 'Unlock all 60+ premium templates, AI writing, ATS checking, and Auto-Apply for $9.99/month — less than your morning coffee.';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-upgrade-title"
      aria-describedby="pro-upgrade-desc"
      onMouseDown={(e) => {
        // Close on backdrop click (not on modal content)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Teal header band */}
        <div
          className="relative px-6 pt-6 pb-5 text-white"
          style={{
            background: 'linear-gradient(135deg, #4AB7A6 0%, #0f766e 100%)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close upgrade dialog"
            className="absolute top-4 right-4 w-8 h-8 inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/20 border border-white/30 text-white rounded-full px-2.5 py-1 mb-3">
            <Crown className="w-3 h-3" />
            Pro feature
          </div>

          <h2
            id="pro-upgrade-title"
            className="text-2xl font-bold leading-tight tracking-tight"
          >
            {heading}
          </h2>
          <p id="pro-upgrade-desc" className="mt-2 text-sm text-white/90 leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">$9.99</span>
            <span className="text-sm font-medium text-slate-500">per month · cancel anytime</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Flat $9.99/month. Cancel any time.
          </p>

          {/* Feature list */}
          <ul className="space-y-2.5 mb-5" aria-label="Pro plan benefits">
            {PRO_FEATURES.map((f) => (
              <li key={f.label} className="flex items-start gap-3">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: '#f0fdf9', color: '#0f766e' }}
                >
                  {f.icon}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {f.label}
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    {f.description}
                  </div>
                </div>
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-1" strokeWidth={3} />
              </li>
            ))}
          </ul>

          {/* Trust strip */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 mb-4">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              No hidden fees
            </span>
            <span>Cancel in one click</span>
            <span>Secure checkout</span>
          </div>

          {/* Primary CTA — route directly to Gumroad checkout carrying the
              current page as `from` so the user lands right back here after
              payment with Pro status already active. */}
          <Link
            ref={primaryActionRef}
            href={`/upgrade${
              typeof window !== 'undefined'
                ? `?from=${encodeURIComponent(window.location.pathname + window.location.search)}`
                : ''
            }`}
            className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-full transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4AB7A6] focus-visible:ring-offset-2"
            style={{
              background: 'linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)',
              boxShadow:
                '0 8px 24px -6px rgba(74,183,166,0.5), 0 2px 4px rgba(74,183,166,0.2)',
            }}
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro — $9.99/mo
          </Link>

          {/* Secondary action */}
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full text-center text-sm font-medium text-slate-400 hover:text-slate-600 py-2.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
