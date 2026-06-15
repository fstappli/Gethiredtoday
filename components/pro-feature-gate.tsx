import Link from 'next/link';
import { Crown, ArrowRight, Shield, Check } from 'lucide-react';

interface ProFeatureGateProps {
  title?: string;
  description?: string;
  features?: string[];
  from: string;
  icon?: React.ReactNode;
}

export function ProFeatureGate({
  title = 'This is a Pro feature',
  description = 'Upgrade to Pro to unlock this and everything else included.',
  features,
  from,
}: ProFeatureGateProps) {
  return (
    <div
      className="flex-1 flex items-center justify-center p-6 min-h-[460px]"
      style={{ background: 'linear-gradient(160deg, #f0fdf9 0%, #f8fafc 60%, #ffffff 100%)' }}
    >
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
          style={{
            background: 'linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)',
            boxShadow: '0 8px 24px -4px rgba(74,183,166,0.4)',
          }}
        >
          <Crown className="w-7 h-7 text-white" />
        </div>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
          style={{ backgroundColor: '#f0fdf9', color: '#0f766e', border: '1px solid #ccfbef' }}
        >
          Pro Feature
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{title}</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>

        {features && features.length > 0 && (
          <ul className="text-left bg-white rounded-xl border border-slate-100 p-4 mb-6 space-y-2.5"
            style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#f0fdf9' }}
                >
                  <Check className="w-3 h-3" style={{ color: '#4AB7A6' }} />
                </div>
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Pricing */}
        <div
          className="rounded-xl p-5 mb-4"
          style={{
            background: 'linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)',
            boxShadow: '0 8px 24px -4px rgba(74,183,166,0.4)',
          }}
        >
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-3xl font-bold text-white">$9.99</span>
            <span className="text-white/70 text-sm">/month</span>
          </div>
          <p className="text-white/80 text-xs mb-4">One plan · Everything included · Cancel anytime</p>
          <Link
            href={`/upgrade?from=${encodeURIComponent(from)}`}
            className="flex items-center justify-center gap-2 w-full px-6 py-2.5 rounded-full text-sm font-bold bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
            style={{ color: '#4AB7A6' }}
          >
            Upgrade to Pro
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          Secure checkout · Powered by Gumroad
        </p>
      </div>
    </div>
  );
}
