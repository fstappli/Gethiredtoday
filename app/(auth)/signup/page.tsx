'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLogo, OAuthButtons, OrDivider } from '@/components/auth-bits';
import ResumeThumb from '@/components/resume-thumb';
import { Field } from '@/components/gh-ui';
import { createClient } from '@/lib/supabase';
import { callbackUrl, carryParams, signupNext } from '@/lib/auth-flow';

const PERKS = [
  'A complete resume with free templates',
  'Your ATS score with the top fixes',
  'PDF download, as many times as you like',
  'Your top 3 job matches every day',
];

function SignupForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = signupNext(sp);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(sp.get('email') ?? '');
  const [weekly, setWeekly] = useState(false);
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
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { full_name: name.trim(), weekly_email: weekly },
        emailRedirectTo: callbackUrl(window.location.origin, next),
      },
    });
    setBusy(false);
    if (err) {
      setError(err.message || 'We could not send your link. Please try again.');
      return;
    }
    router.push(`/check-email${carryParams(sp, { email, mode: 'signup', next })}`);
  };

  return (
    <div className="flex min-h-screen flex-wrap">
      <main className="flex min-w-0 flex-[1_1_480px] flex-col items-center px-6 pb-12 pt-8">
        <div className="flex w-full max-w-[440px] items-center justify-between">
          <AuthLogo size={34} />
          <Link href={`/login${carryParams(sp)}`} className="px-1 py-3 font-bold text-brand">Log in</Link>
        </div>
        <div className="mt-14 flex w-full max-w-[440px] flex-col gap-[18px]">
          <div>
            <span className="inline-block rounded-full bg-sun-soft px-3 py-1.5 text-[13px] font-extrabold text-warning-ink">Welcome</span>
            <h1 className="font-display mt-3 text-[42px] leading-[1.04] tracking-[-1.3px]">Let&apos;s get you hired.</h1>
            <p className="mt-2.5 text-[17px] leading-normal text-text-muted">Create your free account in about 30 seconds. No card, no password.</p>
          </div>
          <OAuthButtons next={next} onError={setError} large />
          <OrDivider>or with email</OrDivider>
          <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
            <Field label="First name" autoComplete="given-name" placeholder="What should we call you?" value={name} onChange={(e) => setName(e.target.value)} />
            <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-snug text-text-muted">
              <input type="checkbox" checked={weekly} onChange={(e) => setWeekly(e.target.checked)} className="m-0 h-5 w-5 flex-none accent-brand" />
              Send me one helpful job-search email a week (optional)
            </label>
            {error && <p role="alert" className="m-0 rounded-xl bg-danger-soft px-3.5 py-3 text-sm font-semibold text-danger-ink">{error}</p>}
            <button type="submit" disabled={busy} className="min-h-[52px] rounded-[14px] bg-brand p-4 text-base font-extrabold text-white hover:bg-brand-dark disabled:opacity-60">
              {busy ? 'Sending your link...' : 'Create my free account'}
            </button>
          </form>
          <p className="m-0 text-center text-[13px] leading-normal text-text-muted">
            By continuing you agree to the <Link href="/terms" className="text-brand underline">Terms</Link> and <Link href="/privacy" className="text-brand underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>

      <aside className="relative hidden min-w-0 flex-[1_1_480px] flex-col justify-center gap-7 overflow-hidden bg-brand px-12 py-14 text-white min-[761px]:flex">
        <div aria-hidden="true" className="absolute -right-[140px] -top-[140px] h-[420px] w-[420px] rounded-full bg-[#0D5C50]" />
        <div className="relative flex items-end gap-5">
          <ResumeThumb layout="sidebar" accent="#16302C" width={210} className="-rotate-4 rounded-md shadow-[0_24px_48px_rgba(0,0,0,.3)]" />
          <div className="mb-6 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 text-ink shadow-[0_16px_32px_rgba(0,0,0,.2)]">
            <span className="font-display grid h-11 w-11 place-items-center rounded-full bg-mint-bright font-extrabold">94</span>
            <span className="text-sm leading-tight"><b>ATS score</b><br />Excellent</span>
          </div>
        </div>
        <h2 className="font-display relative m-0 text-[38px] leading-[1.08] tracking-[-1px]">Free with your account</h2>
        <ul className="relative m-0 flex list-none flex-col gap-3.5 p-0 text-[17px]">
          {PERKS.map((p) => (
            <li key={p} className="flex gap-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD166" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" className="flex-none"><path d="M5 12l5 5 9-10" /></svg>
              {p}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
