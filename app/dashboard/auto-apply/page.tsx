'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import UpgradePrompt from '@/components/upgrade-prompt';
import { tileFor } from '@/components/jobs/job-utils';
import { createClient } from '@/lib/supabase';
import type { AutoApplyRun, AutoApplySettings } from '@/types/jobs';

interface QueueItem {
  id: string;
  created_at: string;
  job: { id: string; title: string; company: string | null; location: string | null; redirect_url: string } | null;
}
interface ResumeOpt { id: string; title: string; ats_score: number | null; finalized_at: string | null }

const inputCls = 'min-h-[48px] rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 py-3 text-base font-medium';

export default function AutoApplyPage() {
  const [tab, setTab] = useState<'setup' | 'queue'>('setup');
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<AutoApplySettings | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [runs, setRuns] = useState<AutoApplyRun[]>([]);
  const [resumes, setResumes] = useState<ResumeOpt[]>([]);
  const [titles, setTitles] = useState('');
  const [locations, setLocations] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [minScore, setMinScore] = useState(80);
  const [cap, setCap] = useState(25);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [prompt, setPrompt] = useState(false);

  const load = useCallback(async () => {
    const [sub, s, q, r] = await Promise.all([
      fetch('/api/user/subscription-status').then((x) => x.json()).catch(() => ({ isPro: false })),
      fetch('/api/jobs/auto-apply/settings').then((x) => (x.ok ? x.json() : { settings: null })).catch(() => ({ settings: null })),
      fetch('/api/jobs/auto-apply/queue').then((x) => (x.ok ? x.json() : { queue: [], runs: [] })).catch(() => ({ queue: [], runs: [] })),
      fetch('/api/resume', { cache: 'no-store' }).then((x) => (x.ok ? x.json() : { resumes: [] })).catch(() => ({ resumes: [] })),
    ]);
    setIsPro(Boolean(sub.isPro));
    const st: AutoApplySettings | null = s.settings;
    setSettings(st);
    if (st) {
      setMinScore(st.min_match_score ?? 80);
      setCap(st.daily_cap ?? 25);
      setTitles(st.filters?.query ?? '');
      setLocations(st.filters?.location ?? '');
    }
    setQueue(q.queue ?? []);
    setRuns(q.runs ?? []);
    const list: ResumeOpt[] = r.resumes ?? [];
    setResumes(list);
    setResumeId((list.find((x) => x.finalized_at) ?? list[0])?.id ?? '');
  }, []);

  useEffect(() => { load(); }, [load]);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) { setPrompt(true); return; }
    setBusy(true);
    setMsg('');
    try {
      if (resumeId) {
        await fetch('/api/resume/finalize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume_id: resumeId }) });
      }
      const res = await fetch('/api/jobs/auto-apply/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: true,
          min_match_score: minScore,
          daily_cap: cap,
          paused_at: null,
          filters: { ...(settings?.filters ?? {}), query: titles.trim(), location: locations.trim(), mode: 'review' },
        }),
      });
      if (!res.ok) { setMsg('We could not save your settings. Please try again.'); return; }
      const run = await fetch('/api/jobs/auto-apply/queue', { method: 'POST' });
      const out = run.ok ? await run.json().catch(() => ({})) : {};
      setMsg(`Auto-Apply is on. ${out.queued ?? 0} jobs are waiting for your OK.`);
      await load();
      setTab('queue');
    } finally {
      setBusy(false);
    }
  };

  const togglePause = async () => {
    const paused = Boolean(settings?.paused_at);
    const res = await fetch('/api/jobs/auto-apply/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paused_at: paused ? null : new Date().toISOString() }),
    });
    setMsg(res.ok ? (paused ? 'Auto-Apply resumed.' : 'Auto-Apply paused.') : 'Could not update. Try again.');
    if (res.ok) load();
  };

  const approve = async (item: QueueItem) => {
    if (item.job?.redirect_url) window.open(item.job.redirect_url, '_blank', 'noopener,noreferrer');
    const res = await fetch('/api/jobs/apply/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: item.id, confirmed: true }),
    });
    if (res.ok) setQueue((q) => q.filter((x) => x.id !== item.id));
    else setMsg('Could not record that application. Try again.');
  };

  const skip = async (item: QueueItem) => {
    const { error } = await createClient().from('applications').delete().eq('id', item.id);
    if (!error) setQueue((q) => q.filter((x) => x.id !== item.id));
    else setMsg('Could not skip that job. Try again.');
  };

  const running = Boolean(settings?.enabled) && !settings?.paused_at;
  const lastRun = runs[0];

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-[18px] px-5 pb-14 pt-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display m-0 text-[34px] tracking-[-0.8px]">
            Auto-Apply <span className="align-middle font-sans text-[13px] font-extrabold" style={{ background: '#FFD166', padding: '4px 10px', borderRadius: 999 }}>PRO</span>
          </h1>
          <p className="mt-1 text-text-muted">Set it once. Approve applications each morning.</p>
        </div>
        <div role="tablist" aria-label="Auto-Apply" className="flex gap-1 rounded-[14px] border border-line bg-white p-1">
          {([['setup', 'Settings'], ['queue', `Queue${queue.length ? ` (${queue.length})` : ''}`]] as const).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`min-h-[44px] rounded-[10px] px-[18px] font-bold ${tab === id ? 'bg-ink text-white' : 'bg-transparent text-ink'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <p role="status" className="m-0 min-h-[1px] font-semibold text-brand-dark">{msg}</p>

      {tab === 'setup' ? (
        <div className="flex flex-wrap items-start gap-5">
          <form onSubmit={start} className="flex min-w-0 flex-[999_1_520px] flex-col gap-[18px] rounded-[22px] border border-line bg-white p-6">
            <label className="flex flex-col gap-1.5 font-bold">Job titles
              <input value={titles} onChange={(e) => setTitles(e.target.value)} placeholder="Senior UX Designer" className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5 font-bold">Locations
              <input value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="City or Remote" className={inputCls} />
            </label>
            <label className="flex flex-col gap-1.5 font-bold">Resume to send
              <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className={inputCls}>
                {resumes.length === 0 ? <option value="">No resumes yet</option> : null}
                {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}{r.ats_score != null ? ` (ATS ${r.ats_score})` : ''}</option>)}
              </select>
              <span className="text-[13px] font-medium text-text-muted">This is also the resume we match jobs against.</span>
            </label>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
              <label className="flex flex-col gap-1.5 font-bold">Minimum match: {minScore}%
                <input type="range" min={50} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="accent-[#0B6E5F]" />
              </label>
              <label className="flex flex-col gap-1.5 font-bold">Up to {cap} a day
                <input type="range" min={5} max={50} value={cap} onChange={(e) => setCap(Number(e.target.value))} className="accent-[#0B6E5F]" />
              </label>
            </div>
            <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
              <legend className="mb-2 font-bold">How should we send them?</legend>
              <label className="flex items-start gap-3 rounded-[14px] border-2 border-brand bg-[#F2FBF8] p-3.5">
                <input type="radio" name="mode" checked readOnly className="mt-0.5 h-5 w-5 accent-[#0B6E5F]" />
                <span><b>Review first (recommended)</b><br /><span className="text-sm text-text-muted">We queue matches. Nothing is sent until you approve.</span></span>
              </label>
              <label className="flex items-start gap-3 rounded-[14px] border-[1.5px] border-line p-3.5 opacity-70">
                <input type="radio" name="mode" disabled className="mt-0.5 h-5 w-5" />
                <span><b>Fully automatic</b><br /><span className="text-sm text-text-muted">Not available yet. Employers apply on their own sites, so you confirm each one.</span></span>
              </label>
            </fieldset>
            <button type="submit" disabled={busy} className="min-h-[52px] rounded-[14px] bg-brand p-4 text-[17px] font-extrabold text-white hover:bg-brand-dark disabled:opacity-60">
              {busy ? 'Starting...' : isPro ? 'Save and start Auto-Apply' : 'Start Auto-Apply with Pro'}
            </button>
          </form>
          <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-2.5 rounded-[22px] border border-line bg-white p-5">
            <b className="font-display text-xl">With these settings</b>
            <div className="flex justify-between"><span className="text-text-muted">Minimum match</span><b>{minScore}%</b></div>
            <div className="flex justify-between"><span className="text-text-muted">Daily limit</span><b>{cap}</b></div>
            <div className="flex justify-between"><span className="text-text-muted">Mode</span><b>Review first</b></div>
            {lastRun ? (
              <div className="flex justify-between"><span className="text-text-muted">Last run queued</span><b>{lastRun.queued}</b></div>
            ) : null}
            <span className="border-t border-[#EEEBE3] pt-2.5 text-[13px] leading-normal text-text-muted">Pause or stop any time. Every application appears in your <Link href="/dashboard/applied-jobs" className="font-bold">tracker</Link>.</span>
          </aside>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3.5 rounded-[20px] bg-ink px-5 py-[18px] text-white">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${running ? 'bg-mint-bright' : 'bg-sun'}`} />
            <b className="min-w-[200px] flex-1">
              {settings?.enabled ? (running ? 'Running' : 'Paused') : 'Not started'} · review mode{lastRun ? ` · last run queued ${lastRun.queued}` : ''}
            </b>
            {settings?.enabled ? (
              <button type="button" onClick={togglePause} className="min-h-[44px] rounded-[10px] bg-white px-4 font-bold text-ink">{settings.paused_at ? 'Resume' : 'Pause'}</button>
            ) : null}
          </div>
          <h2 className="font-display m-0 text-[22px]">Needs your OK · {queue.length}</h2>
          {queue.length === 0 ? (
            <div className="rounded-[18px] border border-line bg-white p-6 text-center text-text-muted">
              Nothing waiting. {settings?.enabled ? 'New matches appear here after each run.' : 'Start Auto-Apply in Settings to fill your queue.'}
            </div>
          ) : null}
          {queue.map((item) => {
            const j = item.job;
            if (!j) return null;
            const t = tileFor(j.company);
            return (
              <article key={item.id} className="flex flex-wrap items-center gap-3.5 rounded-[18px] border border-line bg-white p-4">
                <span aria-hidden="true" className="grid h-11 w-11 flex-none place-items-center rounded-xl font-extrabold" style={{ background: t.bg, color: t.fg }}>{t.initial}</span>
                <span className="min-w-[240px] flex-1">
                  <b>{j.title}</b><br />
                  <span className="text-sm text-text-muted">{[j.company, j.location].filter(Boolean).join(' · ')}</span>
                </span>
                <span className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/find-jobs/${encodeURIComponent(j.id)}`} className="inline-flex min-h-[44px] items-center px-3 font-bold text-brand no-underline">Preview</Link>
                  <button type="button" onClick={() => skip(item)} className="min-h-[44px] rounded-[10px] border border-line-strong bg-white px-3.5 font-bold">Skip</button>
                  <button type="button" onClick={() => approve(item)} className="min-h-[44px] rounded-[10px] bg-brand px-3.5 font-extrabold text-white">Approve &amp; send</button>
                </span>
              </article>
            );
          })}
        </div>
      )}
      <UpgradePrompt trigger="auto_apply" open={prompt} onClose={() => setPrompt(false)} />
    </main>
  );
}
