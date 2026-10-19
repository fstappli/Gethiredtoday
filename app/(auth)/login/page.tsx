'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLogo, OAuthButtons, OrDivider } from '@/components/auth-bits';
import { Field } from '@/components/gh-ui';
import { createClient } from '@/lib/supabase';
import { callbackUrl, carryParams, claimPath, safeNext } from '@/lib/auth-flow';

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get('redirect') ?? sp.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(sp.get('error') ? 'That sign-in link did not work. Please try again.' : null);
  const [busy, setBusy] = useState(false);

  const validEmail = () => {
    if (/^\S+@\S+\.\S+$/.test(email)) return true;
    setError('Please enter a valid email address.');
    return false;
  };

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validEmail()) return;
    setBusy(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: callbackUrl(window.location.origin, next) },
    });
    setBusy(false);
    if (err) {
      setError(/signups not allowed|not found/i.test(err.message) ? 'We could not find an account with that email. Create a free account instead.' : err.message);
      return;
    }
    router.push(`/check-email${carryParams(sp, { email, mode: 'login', next })}`);
  };

  const withPassword = async () => {
    setError(null);
    if (!validEmail()) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) {
      setError(/email not confirmed/i.test(err.message) ? 'Please confirm your email first. Use the log-in link option to get a fresh one.' : err.message);
      return;
    }
    try { sessionStorage.setItem('dashboard_toast', 'Login successful. Welcome back!'); } catch {}
    router.push(claimPath(next));
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-5 py-8">
      <div aria-hidden="true" className="absolute -left-40 top-[200px] h-[420px] w-[420px] rounded-full bg-mint-soft" />
      <div aria-hidden="true" className="absolute -bottom-[120px] -right-[140px] h-[380px] w-[380px] rounded-full bg-sun-soft" />
      <div className="relative"><AuthLogo /></div>
      <div className="relative mt-12 flex w-[min(440px,100%)] flex-col gap-4 rounded-3xl border border-line bg-white p-8 shadow-[0_24px_48px_rgba(13,27,25,.08)]">
        <div className="text-center">
          <h1 className="font-display m-0 text-[34px] tracking-[-1px]">Welcome back!</h1>
          <p className="mt-2 text-text-muted">Your resumes and job matches are waiting.</p>
        </div>
        <OAuthButtons next={next} onError={setError} />
        <OrDivider>or</OrDivider>
        <form onSubmit={sendLink} className="flex flex-col gap-4" noValidate>
          <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <p role="alert" className="m-0 rounded-xl bg-danger-soft px-3.5 py-3 text-sm font-semibold text-danger-ink">{error}</p>}
          <button type="submit" disabled={busy} className="min-h-[48px] rounded-xl bg-brand p-[15px] font-extrabold text-white hover:bg-brand-dark disabled:opacity-60">
            {busy ? 'Working...' : 'Email me a log-in link'}
          </button>
        </form>
        <details>
          <summary className="flex min-h-[44px] cursor-pointer items-center justify-center text-sm font-bold text-brand">Use a password instead</summary>
          <div className="mt-2 flex flex-col gap-2.5">
            <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={withPassword} disabled={busy} className="min-h-[48px] rounded-xl bg-ink p-3.5 font-bold text-white hover:bg-ink-soft disabled:opacity-60">Log in</button>
            <Link href="/forgot-password" className="p-2 text-center text-sm text-brand">Forgot password?</Link>
          </div>
        </details>
      </div>
      <p className="relative mt-5 text-text-muted">
        New here? <Link href={`/signup${carryParams(sp)}`} className="font-extrabold text-brand">Create a free account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
