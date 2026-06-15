'use client';

import Link from 'next/link';
import {
  Crown,
  Check,
  FileText,
  Mail,
  Target,
  Layout,
  Zap,
  Sparkles,
  Shield,
  Download,
  Briefcase,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  { icon: FileText,  label: 'Unlimited Resumes',          desc: 'Build as many tailored resumes as you need' },
  { icon: Mail,      label: 'AI Cover Letter Builder',     desc: 'Generate tailored cover letters in seconds' },
  { icon: Sparkles,  label: 'AI Bullet Point Writer',      desc: 'Role-specific bullets with quantified achievements' },
  { icon: Target,    label: 'Full 30-Point ATS Checker',   desc: 'Score your resume and fix every gap before applying' },
  { icon: Zap,       label: 'Auto-Apply (50 jobs/day)',    desc: 'Submit applications automatically while you sleep' },
  { icon: Layout,    label: 'All 60+ Templates',           desc: 'Modern, Executive, Creative and more' },
  { icon: Download,  label: 'PDF + Word Download',         desc: 'Export pixel-perfect files for any application' },
  { icon: Briefcase, label: 'Job Search & Matching',       desc: 'Find and match jobs to your resume automatically' },
];

export default function ProGate() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto min-h-full" style={{ background: 'linear-gradient(160deg, #f0fdf9 0%, #f8fafc 50%, #ffffff 100%)' }}>
      <div className="w-full max-w-2xl py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
            style={{ background: 'linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)', color: '#fff', boxShadow: '0 4px 16px -4px rgba(74,183,166,0.5)' }}
          >
            <Crown className="w-4 h-4" />
            Pro Access Required
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 leading-tight">
            Unlock Your Full Job Search Suite
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Everything you need to build a great resume, pass ATS, and land interviews — all in one place.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-100"
              style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: '#f0fdf9' }}
              >
                <Icon className="w-4 h-4" style={{ color: '#4AB7A6' }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  {label}
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#4AB7A6' }} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing card + CTA */}
        <div
          className="rounded-2xl p-6 text-center mb-4"
          style={{ background: 'linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)', boxShadow: '0 12px 40px -8px rgba(74,183,166,0.5)' }}
        >
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl font-bold text-white">$9.99</span>
            <span className="text-white/70 text-base">/month</span>
          </div>
          <p className="text-white/80 text-sm mb-5">
            One plan · Everything included · Cancel anytime
          </p>
          <Link
            href="/upgrade?from=%2Fdashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
            style={{ color: '#4AB7A6', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
          >
            Get Pro Access
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center justify-center gap-1.5 mt-4 text-white/70 text-xs">
            <Shield className="w-3.5 h-3.5" />
            Secure checkout · Powered by Gumroad
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Already subscribed?{' '}
          <Link href="/dashboard/billing" className="underline hover:text-slate-600">
            Check your billing status
          </Link>
        </p>
      </div>
    </div>
  );
}
