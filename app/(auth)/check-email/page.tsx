'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthLogo } from '@/components/auth-bits';
import { createClient } from '@/lib/supabase';
import { callbackUrl, safeNext } from '@/lib/auth-flow';

function mailHref(email: string): string {
  const d = email.split('@')[1]?.toLowerCase() ?? '';
  if (d === 'gmail.com' || d === 'googlemail.com') return 'https://mail.google.com/';
  if (/^(outlook|hotmail|live|msn)\./.test(d)) return 'https://outlook.live.com/mail/';
  if (/^yahoo\./.test(d)) return 'https://mail.yahoo.com/';
  if (d === 'icloud.com' || d === 'me.com') return 'https://www.icloud.com/mail';
  return `mailto:${email}`;
}

function CheckEmail() {
  const sp = useSearchParams();
  const email = sp.get('email') ?? '';
  const mode = sp.get('mode') === 'login' ? 'login' : 'signup';
  const next = safeNext(sp.get('next'));
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    if (!email || cooldown > 0) return;
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: mode === 'signup', emailRedirectTo: callbackUrl(window.location.origin, next) },
    });
    if (error) setMsg({ ok: false, text: error.message });
    else setMsg({ ok: true, text: 'Sent again. Check your inbox.' });
    setCooldown(60);
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-5 py-8">
      <AuthLogo />
      <div role="status" className="mt-14 flex w-[min(480px,100%)] flex-col items-center gap-4 rounded-3xl border border-line bg-white px-7 py-9 text-center">
        <span className="grid h-[72px] w-[72px] place-items-center rounded-[22px] bg-mint-soft">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0B6E5F" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
        </span>
        <h1 className="font-display m-0 text-[32px] tracking-[-.8px]">Check your inbox</h1>
        <p className="m-0 leading-relaxed text-text-muted">
          We sent a magic link to <b className="text-ink">{email || 'your email'}</b>. Tap it on this device and you&apos;re in. It works for 15 minutes.
        </p>
        {email && (
          <a href={mailHref(email)} className="box-border w-full rounded-xl bg-brand p-[15px] text-center font-extrabold text-white no-underline hover:bg-brand-dark">Open my email app</a>
        )}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <button type="button" onClick={resend} disabled={cooldown > 0 || !email} className="min-h-[44px] font-bold text-brand disabled:text-text-subtle">
            {cooldown > 0 ? `Resend link (${cooldown}s)` : 'Resend link'}
          </button>
          <Link href={mode === 'login' ? '/login' : '/signup'} className="py-3 font-bold text-brand">Use a different email</Link>
        </div>
        {msg && <p role="status" className={`m-0 text-sm font-semibold ${msg.ok ? 'text-brand-dark' : 'text-danger-ink'}`}>{msg.text}</p>}
        <p className="m-0 text-[13px] text-text-subtle">Can&apos;t find it? Check spam or promotions.</p>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmail />
    </Suspense>
  );
}
