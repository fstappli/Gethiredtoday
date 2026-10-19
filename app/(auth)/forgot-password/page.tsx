'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLogo } from '@/components/auth-bits';
import { Field } from '@/components/gh-ui';
import { createClient } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-5 py-8">
      <AuthLogo />
      <div className="mt-12 flex w-[min(440px,100%)] flex-col gap-4 rounded-3xl border border-line bg-white p-8 shadow-[0_24px_48px_rgba(13,27,25,.08)]">
        {sent ? (
          <div role="status" className="flex flex-col items-center gap-3 text-center">
            <h1 className="font-display m-0 text-[30px] tracking-[-.8px]">Check your inbox</h1>
            <p className="m-0 text-text-muted">We sent a password reset link to <b className="text-ink">{email}</b>.</p>
            <button type="button" onClick={() => setSent(false)} className="min-h-[44px] font-bold text-brand">Try a different email</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div>
              <h1 className="font-display m-0 text-[30px] tracking-[-.8px]">Reset your password</h1>
              <p className="mt-2 text-text-muted">Enter your email and we will send you a reset link.</p>
            </div>
            <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p role="alert" className="m-0 rounded-xl bg-danger-soft px-3.5 py-3 text-sm font-semibold text-danger-ink">{error}</p>}
            <button type="submit" disabled={busy} className="min-h-[48px] rounded-xl bg-brand p-[15px] font-extrabold text-white hover:bg-brand-dark disabled:opacity-60">
              {busy ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
      <Link href="/login" className="mt-5 py-3 font-bold text-brand">Back to log in</Link>
    </div>
  );
}
