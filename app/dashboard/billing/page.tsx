'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatEndsAt, isCancelledWithGrace, isProActive } from '@/lib/subscription';
import { upgradeHref } from '@/lib/upgrade-triggers';

interface Meter { label: string; value: string; pct: number; warn?: boolean }

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [meters, setMeters] = useState<Meter[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('subscription_status, subscription_ends_at').eq('id', user.id).single();
      const pro = isProActive(profile);
      setIsPro(pro);
      setCancelled(isCancelledWithGrace(profile) || profile?.subscription_status === 'cancelled');
      setEndsAt((profile?.subscription_ends_at as string | null) ?? null);
      if (!pro) {
        const [r, m] = await Promise.all([
          fetch('/api/resume', { cache: 'no-store' }).then((x) => (x.ok ? x.json() : { resumes: [] })).catch(() => ({ resumes: [] })),
          fetch('/api/jobs/matches', { cache: 'no-store' }).then((x) => (x.ok ? x.json() : { matches: [] })).catch(() => ({ matches: [] })),
        ]);
        const count = (r.resumes ?? []).length;
        const total = (m.matches ?? []).length;
        const list: Meter[] = [{ label: 'Resumes', value: `${count} of 1`, pct: Math.min(100, count * 100), warn: count >= 1 }];
        if (total > 0) list.push({ label: 'Job matches visible', value: `${Math.min(3, total)} of ${total}`, pct: Math.min(100, (Math.min(3, total) / total) * 100) });
        setMeters(list);
      }
      setLoading(false);
    })();
  }, []);

  const date = endsAt ? formatEndsAt(endsAt) : '';

  return (
    <main className="mx-auto flex w-full max-w-[1000px] flex-col gap-[18px] px-5 pb-14 pt-7">
      <h1 className="font-display m-0 text-[34px] tracking-[-0.8px]">Plan &amp; billing</h1>

      {loading ? (
        <div aria-busy="true" className="h-40 animate-pulse rounded-[22px] bg-white" />
      ) : isPro ? (
        <section className="flex flex-col gap-4 rounded-[22px] bg-ink p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              <span className="text-sm font-semibold text-on-dark-muted">Current plan</span><br />
              <b className="font-display text-[28px]">Pro</b>
            </span>
            <span className="rounded-full bg-mint-bright px-3 py-1 text-[13px] font-extrabold text-ink">{cancelled ? 'Cancelled' : 'Active'}</span>
          </div>
          <div className="text-[#C9D8D3]">
            {cancelled
              ? `Your subscription is cancelled. Pro stays active${date ? ` until ${date}` : ' until the end of this billing period'}.`
              : `Renews monthly at $9.99${date ? `. Current period ends ${date}` : ''}.`}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="https://app.gumroad.com/library" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center rounded-[10px] bg-white px-3.5 font-bold text-ink no-underline">Update payment method</a>
            {cancelled ? (
              <Link href="/upgrade?from=billing" className="inline-flex min-h-[44px] items-center rounded-[10px] bg-mint-bright px-3.5 font-extrabold text-ink no-underline">Resubscribe</Link>
            ) : (
              <Link href="/dashboard/billing/cancel" className="inline-flex min-h-[44px] items-center px-2 font-bold text-[#FFB4A0] no-underline">Cancel subscription</Link>
            )}
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              <span className="text-sm font-semibold text-text-muted">Current plan</span><br />
              <b className="font-display text-[28px]">Free</b>
            </span>
            <Link href={upgradeHref('billing')} className="inline-flex min-h-[44px] items-center rounded-xl bg-brand px-[18px] font-extrabold text-white no-underline hover:bg-brand-dark">Upgrade to Pro · $9.99/mo</Link>
          </div>
          {meters.length ? (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
              {meters.map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm"><span>{m.label}</span><b>{m.value}</b></div>
                  <div className="mt-1.5 h-2 rounded bg-[#EEEBE3]"><div className="h-2 rounded" style={{ width: `${m.pct}%`, background: m.warn ? '#E0A800' : '#0B6E5F' }} /></div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      )}

      <section className="flex flex-col gap-2.5 rounded-[22px] border border-line bg-white p-[22px]">
        <h2 className="font-display m-0 text-[22px]">Receipts</h2>
        <p className="m-0 text-[15px] leading-normal text-text-muted">
          {isPro || cancelled
            ? 'Receipts are emailed to you after each payment. You can also find them in your payment provider library.'
            : 'No payments yet. Receipts will be emailed to you after you upgrade.'}
        </p>
        {isPro || cancelled ? (
          <a href="https://app.gumroad.com/library" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center self-start font-extrabold text-brand no-underline">Open receipts →</a>
        ) : null}
      </section>
    </main>
  );
}
