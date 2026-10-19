'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { isUpgradeTrigger, type UpgradeTrigger } from '@/lib/upgrade-triggers';

const BENEFITS = [
  'All job matches, scored daily',
  'Auto-Apply with review mode',
  'Unlimited resumes and cover letter downloads',
  'Word export and all 60+ templates',
  'Full 30-point ATS report',
  'Unlimited AI bullet rewrites',
];

const SAFE_PATH = /^\/[a-zA-Z0-9\-._~:@!$&'()*+,;=%/?#[\]]*$/;

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6E5F" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" className="flex-none">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

function UpgradeContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const fromRaw = sp.get('from');
  const trigger: UpgradeTrigger | null = isUpgradeTrigger(fromRaw) ? fromRaw : null;
  const returnRaw = sp.get('return') ?? (!trigger ? fromRaw : null);
  const returnPath = returnRaw && SAFE_PATH.test(returnRaw) && !returnRaw.startsWith('//') ? returnRaw : '/upgrade/success';
  const [plan, setPlan] = useState<'monthly' | 'quarterly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/user/subscription-status')
      .then((r) => r.json())
      .then((d) => { if (d.isPro) router.replace('/dashboard'); })
      .catch(() => undefined);
    createClient().auth.getUser().then(({ data: { user } }) => {
      const n = (user?.user_metadata?.full_name || user?.user_metadata?.name || '') as string;
      setName(n.trim().split(/\s+/)[0] ?? '');
    });
  }, [router]);

  const checkout = () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag?.('event', 'begin_checkout', { currency: 'USD', value: 9.99, items: [{ item_id: 'pro_monthly', item_name: 'Pro Plan', price: 9.99 }], trigger: trigger ?? 'direct' });
    } catch { /* analytics must never block checkout */ }
    const q = new URLSearchParams({ from: returnPath, plan });
    if (trigger) q.set('trigger', trigger);
    window.location.href = `/api/lemonsqueezy/checkout-redirect?${q.toString()}`;
  };

  const planCls = (on: boolean) =>
    `flex items-center gap-3.5 rounded-2xl p-4 ${on ? 'border-2 border-brand bg-[#F2FBF8]' : 'border-[1.5px] border-line bg-white'}`;

  return (
    <div className="min-h-screen bg-ground-site text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 py-3">
          <Link href="/dashboard" className="inline-flex min-h-[44px] items-center font-bold text-brand no-underline">← Back</Link>
          <span className="flex items-center gap-2">
            <span className="font-display grid h-8 w-8 place-items-center rounded-[9px] bg-brand font-extrabold text-white">G</span>
            <span className="font-display text-lg font-bold">GetHired<span className="text-brand">Today</span></span>
          </span>
          <span className="flex items-center gap-1.5 text-sm text-text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B6E5F" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>
            Secure
          </span>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1100px] flex-wrap items-start gap-8 px-5 pb-16 pt-10">
        <section className="flex min-w-0 flex-[999_1_480px] flex-col gap-5">
          <div>
            <span className="inline-block rounded-full bg-sun px-3 py-1.5 text-[13px] font-extrabold">PRO</span>
            <h1 className="font-display mb-0 mt-3 text-[36px] leading-[1.04] tracking-[-1.4px] min-[761px]:text-[46px]">Land interviews faster{name ? `, ${name}` : ''}.</h1>
            <p className="mb-0 mt-2.5 text-lg leading-normal text-text-muted">Everything unlocks the moment you upgrade. Your work so far comes with you.</p>
          </div>
          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 font-extrabold">Choose billing</legend>
            <label className={`${planCls(plan === 'monthly')} cursor-pointer`}>
              <input type="radio" name="plan" checked={plan === 'monthly'} onChange={() => setPlan('monthly')} className="m-0 h-[22px] w-[22px] accent-[#0B6E5F]" />
              <span className="flex-1"><b className="text-[17px]">Monthly</b><br /><span className="text-sm text-text-muted">Cancel any time in two clicks</span></span>
              <b className="font-display text-2xl">$9.99<span className="text-sm font-medium">/mo</span></b>
            </label>
            <label className={`${planCls(false)} opacity-80`}>
              <input type="radio" name="plan" disabled className="m-0 h-[22px] w-[22px]" />
              <span className="flex-1">
                <b className="text-[17px]">Every 3 months</b> <span className="rounded-md bg-sun px-1.5 py-0.5 text-[11px] font-extrabold">SAVE [X]%</span><br />
                <span className="text-sm text-text-muted">[$ total] billed every 3 months</span>
              </span>
              <b className="font-display text-2xl">[$]<span className="text-sm font-medium">/mo</span></b>
            </label>
          </fieldset>
          <ul className="m-0 grid list-none gap-2.5 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
            {BENEFITS.map((b) => <li key={b} className="flex gap-2.5"><Check />{b}</li>)}
          </ul>
        </section>
        <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-3.5 rounded-3xl border border-line bg-white p-6 shadow-[0_24px_48px_rgba(13,27,25,.08)]">
          <b className="font-display text-[22px]">Order summary</b>
          <div className="flex justify-between"><span>GetHiredToday Pro, monthly</span><b>$9.99</b></div>
          <div className="flex justify-between text-sm text-text-muted"><span>Tax</span><span>Calculated at payment</span></div>
          <div className="flex justify-between border-t border-[#EEEBE3] pt-3 text-lg"><b>Due today</b><b>$9.99</b></div>
          <button type="button" onClick={checkout} disabled={loading} className="min-h-[54px] rounded-[14px] bg-brand p-4 text-[17px] font-extrabold text-white hover:bg-brand-dark disabled:opacity-70">
            {loading ? 'Taking you to secure payment...' : 'Continue to secure payment'}
          </button>
          <span className="text-center text-[13px] leading-normal text-text-muted">Payment methods: [confirm with your payment provider]. Renews monthly until you cancel.</span>
          <p className="m-0 rounded-[14px] bg-ground-site p-3.5 text-sm leading-normal"><b>Cancel anytime.</b> Cancel from Plan &amp; billing in two clicks. Your resumes stay yours.</p>
          <p className="m-0 text-center text-xs text-text-subtle">By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
        </aside>
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
