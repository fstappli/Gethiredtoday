import type { ReactNode } from 'react';
import Link from 'next/link';
import { Star, Check } from 'lucide-react';
import Logo from '@/components/logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
      <div className="flex flex-col w-full md:w-1/2 min-h-screen px-8 py-10 md:px-12 bg-white relative">
        {/* Subtle top-left gradient blob */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(74,183,166,0.06) 0%, transparent 70%)',
        }} />

        {/* Logo */}
        <div className="flex-shrink-0 relative z-10">
          <Logo href="/" variant="default" size="md" />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center py-12 relative z-10">
          <div className="w-full max-w-md mx-auto animate-auth-slide">
            {children}
          </div>
        </div>

        {/* Footer links */}
        <div className="flex-shrink-0 flex items-center justify-center gap-4 text-xs text-slate-400 relative z-10">
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-slate-600 transition-colors">Help</Link>
        </div>
      </div>

      {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
      <div
        className="hidden md:flex w-1/2 min-h-screen flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #e8faf7 0%, #f0fdf9 40%, #e6f4f1 100%)',
        }}
      >
        {/* Ambient gradient orbs */}
        <div className="absolute top-12 right-12 w-64 h-64 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(74,183,166,0.15) 0%, transparent 70%)',
          animation: 'float-up-down 6s ease-in-out infinite',
        }} />
        <div className="absolute bottom-20 left-8 w-48 h-48 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(74,183,166,0.10) 0%, transparent 70%)',
          animation: 'float-up-down 8s ease-in-out infinite',
          animationDelay: '2s',
        }} />

        <div className="max-w-sm w-full space-y-6 relative z-10">

          {/* Testimonial card */}
          <div
            className="bg-white rounded-2xl p-7 border border-[#c8edea] animate-fade-up"
            style={{
              boxShadow: '0 8px 32px rgba(74,183,166,0.12), 0 2px 8px rgba(0,0,0,0.05)',
              '--stagger-delay': '0ms',
            } as React.CSSProperties}
          >
            {/* Stars */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <blockquote className="text-slate-800 font-semibold text-lg leading-snug mb-5">
              &ldquo;The smartest career investment I&rsquo;ve ever made. Got hired in 3 weeks.&rdquo;
            </blockquote>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4AB7A6, #2d9e8e)' }}
              >
                MT
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Marcus T.</div>
                <div className="text-xs text-slate-500">Software Engineer · hired at Stripe</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            className="space-y-2 animate-fade-up"
            style={{ '--stagger-delay': '80ms' } as React.CSSProperties}
          >
            {[
              { label: 'Resumes Created', value: '127,400+', icon: '📄' },
              { label: 'ATS Pass Rate', value: '94%', icon: '✅' },
              { label: 'All-In Price', value: '$9.99/mo', icon: '💳' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-[#c8edea] transition-all duration-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{stat.icon}</span>
                  <span className="text-sm text-slate-500">{stat.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Animated resume preview card */}
          <div
            className="bg-white rounded-xl overflow-hidden border border-[#c8edea] animate-fade-up"
            style={{
              transform: 'rotate(-1.5deg)',
              boxShadow: '0 12px 36px rgba(74,183,166,0.16), 0 2px 8px rgba(0,0,0,0.06)',
              '--stagger-delay': '160ms',
            } as React.CSSProperties}
          >
            {/* Chrome bar */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            {/* Teal header band */}
            <div className="h-7 w-full" style={{ background: 'linear-gradient(135deg, #4AB7A6, #2d9e8e)' }}>
              <div className="flex items-center h-full px-4 gap-2">
                <div className="h-2 w-16 rounded-full bg-white/50" />
                <div className="h-1.5 w-10 rounded-full bg-white/30" />
              </div>
            </div>
            {/* Body */}
            <div className="p-4 space-y-2">
              <div className="h-2 w-2/3 rounded-full bg-slate-200 animate-bar-grow" style={{ '--bar-delay': '600ms' } as React.CSSProperties} />
              <div className="h-1.5 w-1/2 rounded-full bg-slate-100" />
              <div className="mt-2.5 space-y-1.5">
                {[100, 88, 75, 92].map((w, i) => (
                  <div key={i} className="h-1.5 rounded-full bg-slate-100 animate-bar-grow" style={{ width: `${w}%`, '--bar-delay': `${700 + i * 60}ms` } as React.CSSProperties} />
                ))}
              </div>
              <div className="mt-2.5 flex gap-1.5">
                {['Design', 'Strategy', 'Research'].map((tag) => (
                  <div key={tag} className="h-4 rounded-full px-2 flex items-center" style={{ backgroundColor: '#4AB7A615', border: '1px solid #4AB7A630' }}>
                    <div className="h-1 w-8 rounded-full" style={{ backgroundColor: '#4AB7A6' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* ATS badge overlay */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-slate-50 bg-gradient-to-r from-teal-50 to-emerald-50">
              <Check className="w-3 h-3 text-teal-500" strokeWidth={3} />
              <span className="text-[10px] font-semibold text-teal-700">ATS Score: 94/100 · Excellent</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
