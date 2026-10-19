'use client';

import Link from 'next/link';
import { track } from '@/lib/analytics';
import { createClient } from '@/lib/supabase';
import { APPLE_ENABLED, LINKEDIN_ENABLED, callbackUrl } from '@/lib/auth-flow';

export function AuthLogo({ size = 36 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2 text-ink no-underline" aria-label="GetHiredToday home">
      <span className="font-display grid place-items-center rounded-[10px] bg-brand font-extrabold text-white" style={{ width: size, height: size }}>G</span>
      <span className="font-display text-xl font-bold">GetHired<span className="text-brand">Today</span></span>
    </Link>
  );
}

type Provider = 'google' | 'linkedin_oidc' | 'apple';

/** Google always; LinkedIn and Apple only when their env flag is on, so we never ship dead buttons. */
export function OAuthButtons({ next, onError, large = false }: { next: string; onError: (m: string) => void; large?: boolean }) {
  const go = async (provider: Provider) => {
    track('sign_up_start', { method: provider });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl(window.location.origin, next) },
    });
    if (error) onError(error.message || 'Sign-in failed. Please try again.');
  };
  const secondary = [
    LINKEDIN_ENABLED ? { p: 'linkedin_oidc' as const, label: 'LinkedIn' } : null,
    APPLE_ENABLED ? { p: 'apple' as const, label: 'Apple' } : null,
  ].filter(Boolean) as { p: Provider; label: string }[];
  return (
    <>
      <button
        type="button"
        onClick={() => go('google')}
        className={`flex min-h-[48px] items-center justify-center gap-3 bg-ink font-bold text-white hover:bg-ink-soft ${large ? 'rounded-[14px] p-4' : 'rounded-xl p-[15px]'}`}
      >
        <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white text-[13px] font-extrabold text-ink" aria-hidden="true">G</span>
        Continue with Google
      </button>
      {secondary.length > 0 && (
        <div className={`grid gap-2.5 ${secondary.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {secondary.map((s) => (
            <button
              key={s.p}
              type="button"
              onClick={() => go(s.p)}
              className="min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-white p-3.5 font-bold text-ink hover:border-ink"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function OrDivider({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-text-subtle">
      <span className="h-px flex-1 bg-line" />
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
