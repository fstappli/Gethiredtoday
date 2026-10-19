'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import FreePlanCard from '@/components/portal/free-plan-card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { isProActive } from '@/lib/subscription';
import { resumeDataToText, calculateATSScore, scoreResume } from '@/lib/ats';
import { previewFromResumeData } from '@/components/template-preview';
import ResumeThumb from '@/components/resume-thumb';
import { btnClass, Card } from '@/components/gh-ui';
import { atsPill, templateMeta, timeAgo, TEMPLATE_META } from '@/lib/template-meta';
import { upgradeHref } from '@/lib/upgrade-triggers';
import type { ResumeData } from '@/types';

interface ResumeRow {
  id: string;
  title: string;
  updated_at: string;
  ats_score: number | null;
  template_id: string;
  data?: ResumeData;
}

interface MatchRow {
  id: string;
  match_score: number;
  job: {
    id: string;
    title: string;
    company: string | null;
    location: string | null;
    work_type: string | null;
    contract_type: string | null;
    posted_at: string | null;
  } | null;
}

const LOGO_TINTS = [
  { bg: '#EDE9FF', fg: '#4B3BA8' },
  { bg: '#FFE9D6', fg: '#8A3B12' },
  { bg: '#E3F4EE', fg: '#08574B' },
  { bg: '#FFF1CC', fg: '#6B4A00' },
];

function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-[#ECE9E0] ${className}`} />;
}

function postedLabel(iso: string | null): string {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  return `Posted ${days} days ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [isPro, setIsPro] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [resumesState, setResumesState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [coverLetterCount, setCoverLetterCount] = useState<number | null>(null);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [matchesState, setMatchesState] = useState<'loading' | 'ready'>('loading');
  const [hasActiveResume, setHasActiveResume] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const url = new URL(window.location.href);
      const upgraded = url.searchParams.get('upgraded');
      if (upgraded) {
        url.searchParams.delete('upgraded');
        window.history.replaceState(null, '', url.toString());
        if (upgraded === 'pending') setToast('Your payment is processing. Pro access will activate within a minute.');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_ends_at, full_name, email')
        .eq('id', user.id)
        .single();
      setIsPro(isProActive(profile));
      setFirstName(profile?.full_name?.trim().split(/\s+/)[0] || profile?.email?.split('@')[0] || '');

      if (upgraded === '1' && isProActive(profile)) setToast('Welcome to Pro. All features are now unlocked.');

      try {
        if (sessionStorage.getItem('pending_plan') === 'pro') {
          sessionStorage.removeItem('pending_plan');
          router.push('/upgrade?from=billing');
        }
      } catch { /* ignore */ }
    })();
    try {
      const pending = sessionStorage.getItem('dashboard_toast');
      if (pending) { setToast(pending); sessionStorage.removeItem('dashboard_toast'); }
      setPdfDone(localStorage.getItem('ght:pdf-downloaded') === '1');
    } catch { /* ignore */ }
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const loadResumes = useCallback(async () => {
    try {
      const res = await fetch('/api/resume');
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) throw new Error('bad status');
      const json = await res.json();
      setResumes(json.resumes ?? []);
      setResumesState('ready');
    } catch {
      setResumesState('error');
    }
  }, [router]);

  useEffect(() => {
    loadResumes();
    fetch('/api/cover-letter').then((r) => (r.ok ? r.json() : null)).then((d) => setCoverLetterCount(d ? (d.coverLetters ?? []).length : 0)).catch(() => setCoverLetterCount(0));
    fetch('/api/jobs/applications?status=applied,viewed,interview,offer,rejected').then((r) => r.json()).then((d) => setAppliedCount(d.counts?.applied ?? 0)).catch(() => setAppliedCount(0));
    fetch('/api/jobs/matches').then((r) => r.json()).then((d) => {
      setHasActiveResume(Boolean(d.has_finalized_resume));
      setMatches(d.matches ?? []);
    }).catch(() => {}).finally(() => setMatchesState('ready'));
  }, [loadResumes]);

  // Single source of truth for every resume number on this page (same list My Resumes shows).
  const scored = useMemo(
    () => resumes.map((r) => ({ ...r, score: r.data ? scoreResume(r.data) : r.ats_score })),
    [resumes],
  );
  const best = scored.reduce<(typeof scored)[number] | null>((b, r) => ((r.score ?? -1) > (b?.score ?? -1) ? r : b), null);
  const bestScore = best?.score ?? null;
  const issueCount = useMemo(() => {
    if (!best?.data) return 0;
    const res = calculateATSScore(resumeDataToText(best.data));
    return res.top_issues.length + res.top_suggestions.length;
  }, [best]);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  })();

  const loading = resumesState === 'loading';
  const hasResume = resumes.length > 0;
  const shownMatches = isPro ? matches.slice(0, 3) : matches.slice(0, 2);
  const hiddenMatches = Math.max(0, matches.length - shownMatches.length);

  const checklist = [
    { label: 'Create your first resume', done: hasResume },
    { label: 'Reach an ATS score of 80+', done: (bestScore ?? 0) >= 80 },
    { label: 'Download your PDF', done: pdfDone },
    { label: matches.length ? `Review your ${matches.length} job match${matches.length === 1 ? '' : 'es'}` : 'Review your job matches', done: (appliedCount ?? 0) > 0 },
  ];
  const nextIdx = checklist.findIndex((c) => !c.done);

  const stats = [
    { label: 'Resumes', value: loading ? null : resumes.length },
    { label: 'Best ATS score', value: loading ? null : bestScore ?? 'None' },
    { label: 'Applications', value: appliedCount },
    { label: 'Cover letters', value: coverLetterCount },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-[22px] px-5 pb-14 pt-7">
      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lg min-[761px]:bottom-6">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display m-0 text-[34px] tracking-[-0.8px]">{greeting}{firstName ? `, ${firstName}` : ''}</h1>
          <p className="mt-1 text-text-muted">
            {!loading && hasResume && issueCount > 0
              ? `You're ${issueCount} fix${issueCount === 1 ? '' : 'es'} away from a stronger resume.`
              : !loading && !hasResume
                ? 'Start with a resume and we will guide you from there.'
                : 'Here is where you stand today.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/onboarding" className={btnClass('outline')}>Upload resume</Link>
          <Link href={!isPro && resumes.length >= 1 ? '/dashboard/resumes?new=1' : '/builder/wizard'} className={btnClass('primary', 'font-extrabold')}>+ New resume</Link>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
          {/* Next best action */}
          <section className="grid items-center gap-6 rounded-3xl bg-ink p-[26px] text-white [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
            {loading ? (
              <Skeleton className="h-[100px] !bg-ink-line" />
            ) : hasResume ? (
              <div className="flex items-center gap-5">
                <div
                  role="img"
                  aria-label={`ATS score ${bestScore ?? 0}`}
                  className="grid h-[100px] w-[100px] flex-none place-items-center rounded-full"
                  style={{ background: `conic-gradient(#FFD166 0 ${bestScore ?? 0}%, #2A3A37 ${bestScore ?? 0}%)` }}
                >
                  <div className="grid h-[82px] w-[82px] place-items-center rounded-full bg-ink">
                    <span className="font-display text-[32px] font-extrabold">{bestScore ?? 0}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-on-dark-muted">{best?.title} · ATS score</span>
                  <b className="font-display text-[23px] leading-[1.15]">
                    {(bestScore ?? 0) >= 85 ? 'Your resume is in great shape' : issueCount > 0 ? `Fix ${issueCount} issue${issueCount === 1 ? '' : 's'} to reach 85+` : 'Keep improving your score'}
                  </b>
                  <Link href={`/builder/resume/${best?.id}`} className="self-start rounded-xl bg-mint-bright px-[18px] py-3 font-extrabold text-ink no-underline">
                    {(bestScore ?? 0) >= 85 ? 'Open resume' : 'Fix with AI'}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <b className="font-display text-[26px] leading-[1.15]">Build your first resume</b>
                <span className="text-on-dark-muted">About 3 minutes. We score it for ATS as you go.</span>
                <Link href="/builder/wizard" className="self-start rounded-xl bg-mint-bright px-[18px] py-3 font-extrabold text-ink no-underline">Start my resume</Link>
              </div>
            )}
            <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
              {checklist.map((c, i) => (
                <li key={c.label} className="flex items-center gap-3">
                  {c.done ? (
                    <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-mint-bright">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D1B19" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
                    </span>
                  ) : (
                    <span aria-hidden="true" className={`box-border h-[26px] w-[26px] rounded-full border-2 ${i === nextIdx ? 'border-sun' : 'border-text-subtle'}`} />
                  )}
                  <span className={c.done ? 'text-on-dark-muted line-through' : i === nextIdx ? 'font-bold' : ''}>
                    {c.label}<span className="sr-only">{c.done ? ' (done)' : ''}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Job matches */}
          <section className="flex flex-col gap-3.5 rounded-[22px] border border-line bg-white p-[22px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display m-0 text-[22px]">
                {matchesState === 'loading' ? 'Job matches' : matches.length ? `${matches.length} jobs match your resume` : 'Job matches'}
              </h2>
              <Link href="/dashboard/find-jobs" className="font-extrabold text-brand">See all</Link>
            </div>
            {matchesState === 'loading' ? (
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr))]"><Skeleton className="h-[100px]" /><Skeleton className="h-[100px]" /></div>
            ) : !hasActiveResume ? (
              <div className="flex flex-col items-start gap-2.5 text-text-muted">
                <p className="m-0">Pick the resume you want to match jobs against and we will score open roles for you.</p>
                <Link href={hasResume ? '/dashboard/find-jobs' : '/builder/wizard'} className={btnClass('primary')}>{hasResume ? 'Choose a resume to match' : 'Build a resume first'}</Link>
              </div>
            ) : matches.length === 0 ? (
              <p className="m-0 text-text-muted">No matches yet. Search jobs to find roles that fit you.</p>
            ) : (
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr))]">
                {shownMatches.map((m, i) => {
                  if (!m.job) return null;
                  const tint = LOGO_TINTS[i % LOGO_TINTS.length];
                  return (
                    <Link key={m.id} href={`/dashboard/find-jobs/${m.job.id}`} className="flex flex-col gap-2.5 rounded-2xl border border-line p-4 text-ink no-underline hover:border-line-strong">
                      <span className="flex items-center gap-3">
                        <span className="grid h-[42px] w-[42px] place-items-center rounded-[10px] font-extrabold" style={{ background: tint.bg, color: tint.fg }}>{(m.job.company || m.job.title).charAt(0).toUpperCase()}</span>
                        <span className="min-w-0 flex-1">
                          <b className="block truncate">{m.job.title}</b>
                          <span className="block truncate text-sm text-text-muted">{[m.job.company, m.job.location].filter(Boolean).join(' · ')}</span>
                        </span>
                        <b className="text-brand">{Math.round(m.match_score)}%</b>
                      </span>
                      <span className="text-[13px] text-text-muted">{[postedLabel(m.job.posted_at), m.job.work_type || m.job.contract_type].filter(Boolean).join(' · ')}</span>
                    </Link>
                  );
                })}
                {!isPro && hiddenMatches > 0 && (
                  <Link href={upgradeHref('locked_matches')} className="flex flex-col justify-center gap-2 rounded-2xl border border-[#F2DB9A] bg-[#FFF6DC] p-4 text-ink no-underline">
                    <b>+{hiddenMatches} more match{hiddenMatches === 1 ? '' : 'es'}</b>
                    <span className="text-sm text-text-muted">Free shows your top matches each day</span>
                    <span className="font-extrabold text-brand">Unlock with Pro →</span>
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* Resumes */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display m-0 text-[22px]">My resumes</h2>
              <Link href="/dashboard/resumes" className="font-extrabold text-brand">View all{!loading ? ` (${resumes.length})` : ''}</Link>
            </div>
            {loading ? (
              <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]"><Skeleton className="h-[240px]" /><Skeleton className="h-[240px]" /></div>
            ) : resumesState === 'error' ? (
              <Card className="flex items-center justify-between gap-3">
                <span className="text-text-muted">We could not load your resumes.</span>
                <button type="button" onClick={() => { setResumesState('loading'); loadResumes(); }} className={btnClass('outline')}>Try again</button>
              </Card>
            ) : resumes.length === 0 ? (
              <Card className="text-text-muted">No resumes yet. Your first one takes about 3 minutes.</Card>
            ) : (
              <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
                {scored.slice(0, 3).map((r) => {
                  const meta = templateMeta(r.template_id);
                  const pill = atsPill(r.score);
                  return (
                    <Link key={r.id} href={`/builder/resume/${r.id}`} className="flex flex-col overflow-hidden rounded-[18px] border border-line bg-white text-ink no-underline hover:border-line-strong">
                      <span className="flex h-[170px] justify-center overflow-hidden bg-[#F2EFE7] pt-4">
                        <ResumeThumb layout={meta.layout} accent={meta.accent} content={previewFromResumeData(r.data)} width={168} className="rounded-t shadow-[0_8px_20px_rgba(13,27,25,.12)]" />
                      </span>
                      <span className="flex items-center gap-2.5 px-4 py-3.5">
                        <span className="min-w-0 flex-1">
                          <b className="block truncate">{r.title}</b>
                          <span className="text-[13px] text-text-muted">{TEMPLATE_META[r.template_id]?.label ?? 'Classic'} · {timeAgo(r.updated_at)}</span>
                        </span>
                        <span className="rounded-full px-2.5 py-1 text-[13px] font-extrabold" style={{ background: pill.bg, color: pill.fg }}>{pill.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-4">
          <dl className="m-0 grid grid-cols-2 gap-3.5 rounded-[22px] border border-line bg-white p-5">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-display m-0 text-[28px] font-extrabold">{s.value === null ? <Skeleton className="h-8 w-10" /> : s.value}</dd>
                <dt className="text-[13px] text-text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-1.5 rounded-[22px] border border-line bg-white p-5">
            <b className="mb-1.5">Quick actions</b>
            <Link href="/builder/cover-letter/new" className="border-b border-[#EEEBE3] py-2.5 font-semibold text-ink no-underline">Write a cover letter</Link>
            <Link href="/dashboard/ats-checker" className="border-b border-[#EEEBE3] py-2.5 font-semibold text-ink no-underline">Match resume to a job ad</Link>
            <Link href="/resume-templates" className="py-2.5 font-semibold text-ink no-underline">Try a new template</Link>
          </div>
          {!isPro && <FreePlanCard resumeCount={resumes.length} />}
        </aside>
      </div>
    </div>
  );
}
