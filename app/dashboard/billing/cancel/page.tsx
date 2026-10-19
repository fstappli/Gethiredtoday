'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatEndsAt, isProActive } from '@/lib/subscription';

const REASONS = ['I got a job', 'It is too expensive', 'I am taking a break from searching', 'Missing a feature I need', 'Something else'];

export default function CancelFlowPage() {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('subscription_status, subscription_ends_at, full_name').eq('id', user.id).single();
      if (p?.subscription_ends_at) setEndsAt(formatEndsAt(p.subscription_ends_at as string));
      setName(((p?.full_name as string) || '').split(' ')[0]);
      if (p?.subscription_status === 'cancelled' && isProActive(p)) setDone(true);
    });
  }, []);

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: reason || undefined }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) { setError(json?.error || 'We could not cancel your subscription. Please contact support and we will take care of it.'); return; }
      if (json.endsAt) setEndsAt(formatEndsAt(json.endsAt));
      setDone(true);
    } catch {
      setError('Network error. Please try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  const until = endsAt || 'the end of your billing period';

  if (done) {
    return (
      <main className="mx-auto flex w-full max-w-[640px] flex-col gap-[18px] px-5 py-12">
        <div role="status" className="flex flex-col items-center gap-3.5 rounded-3xl border border-line bg-white p-8 text-center">
          <span className="grid h-[72px] w-[72px] place-items-center rounded-[22px] bg-mint-soft">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0B6E5F" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
          </span>
          <h1 className="font-display m-0 text-[32px]">Your subscription is cancelled</h1>
          <p className="m-0 leading-[1.55] text-text-muted">Pro stays active until {until}. Good luck out there{name ? `, ${name}` : ''}.</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/dashboard" className="inline-flex min-h-[48px] items-center rounded-xl bg-ink px-[18px] font-extrabold text-white no-underline">Back to dashboard</Link>
            <Link href="/upgrade?from=billing" className="inline-flex min-h-[48px] items-center rounded-xl border-[1.5px] border-line-strong bg-white px-[18px] font-bold text-ink no-underline">Changed your mind? Resubscribe</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-[18px] px-5 py-12">
      <Link href="/dashboard/billing" className="inline-flex min-h-[44px] items-center self-start font-bold text-brand no-underline">← Plan &amp; billing</Link>
      <h1 className="font-display m-0 text-[38px] leading-[1.05] tracking-[-1px]">Cancel Pro?</h1>
      <p className="m-0 text-[17px] leading-[1.55] text-text-muted">You will keep Pro until {until}. After that you move to Free, and all your resumes stay in your account.</p>
      <fieldset className="flex flex-col gap-1 rounded-[20px] border border-line bg-white p-[18px]">
        <legend className="px-1 font-extrabold">Mind telling us why? (optional)</legend>
        {REASONS.map((r) => (
          <label key={r} className="flex min-h-[46px] cursor-pointer items-center gap-3">
            <input type="radio" name="why" value={r} checked={reason === r} onChange={() => setReason(r)} className="m-0 h-5 w-5 accent-[#0B6E5F]" />
            {r}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap items-center gap-3 rounded-[18px] bg-sun-soft px-[18px] py-4">
        <span className="min-w-[260px] flex-1 leading-normal"><b>Taking a break?</b> Cancelling keeps Pro until {until}, and your work stays put. You can rejoin any time.</span>
      </div>
      {error ? <p role="alert" className="m-0 font-semibold text-danger-ink">{error}</p> : null}
      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={confirm} disabled={busy} className="min-h-[52px] rounded-[14px] border-[1.5px] border-[#E8A48A] bg-white px-5 font-extrabold text-danger-ink disabled:opacity-60">
          {busy ? 'Cancelling...' : 'Cancel subscription'}
        </button>
        <Link href="/dashboard" className="inline-flex min-h-[52px] items-center rounded-[14px] bg-brand px-5 font-extrabold text-white no-underline">Keep Pro</Link>
      </div>
    </main>
  );
}
