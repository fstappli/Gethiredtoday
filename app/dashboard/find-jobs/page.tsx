'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { JobResultCard, JobResultSkeleton, type JobScore } from '@/components/jobs/job-result-card';
import { keywordGap, listSavedJobIds, postedDays, saveJob, unsaveJob } from '@/components/jobs/job-utils';
import UpgradePrompt from '@/components/upgrade-prompt';
import { upgradeHref } from '@/lib/upgrade-triggers';
import { createClient } from '@/lib/supabase';
import { resumeDataToText } from '@/lib/ats';
import { extractResumeProfile, scoreJobMatch } from '@/lib/jobs/match';
import type { Job, ResumeProfile } from '@/types/jobs';
import type { ResumeData } from '@/types';

type Tab = 'match' | 'all' | 'saved';
const FREE_VISIBLE_SCORES = 3;

interface MatchRow {
  match_score: number;
  matched_reasons: string[];
  job: Job | null;
}

function FindJobsContent() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('query') ?? '');
  const [loc, setLoc] = useState(sp.get('location') ?? '');
  const [tab, setTab] = useState<Tab>('match');
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [workTypes, setWorkTypes] = useState({ hybrid: false, remote: false, on_site: false });
  const [posted, setPosted] = useState<'today' | 'week' | 'any'>('any');
  const [minMatch, setMinMatch] = useState(50);

  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [hasResume, setHasResume] = useState(true);
  const [results, setResults] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searched, setSearched] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [alertOn, setAlertOn] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // Initial data: plan, resume (for scoring), matches, saved ids.
  useEffect(() => {
    (async () => {
      try {
        const [sub, resumes, m, ids] = await Promise.all([
          fetch('/api/user/subscription-status').then((r) => r.json()).catch(() => ({ isPro: false })),
          fetch('/api/resume', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { resumes: [] })).catch(() => ({ resumes: [] })),
          fetch('/api/jobs/matches', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { matches: [], has_finalized_resume: false })).catch(() => ({ matches: [], has_finalized_resume: false })),
          listSavedJobIds().catch(() => new Set<string>()),
        ]);
        setIsPro(Boolean(sub.isPro));
        const list: Array<{ data: ResumeData; finalized_at: string | null }> = resumes.resumes ?? [];
        const chosen = list.find((r) => r.finalized_at) ?? list[0];
        if (chosen?.data) {
          setProfile(extractResumeProfile(chosen.data));
          setResumeText(resumeDataToText(chosen.data));
        }
        setHasResume(list.length > 0);
        setMatches((m.matches ?? []).filter((x: MatchRow) => x.job));
        setSaved(ids);
        const meta = (await createClient().auth.getUser()).data.user?.user_metadata as { job_alert?: { enabled?: boolean } } | undefined;
        setAlertOn(Boolean(meta?.job_alert?.enabled));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const runSearch = useCallback(
    async (nextPage = 1) => {
      setError(null);
      setLoading(true);
      setSearched(true);
      const p = new URLSearchParams();
      if (q.trim()) p.set('query', q.trim());
      if (loc.trim()) p.set('location', loc.trim());
      if (workTypes.remote) p.set('remote', 'true');
      if (workTypes.hybrid) p.set('hybrid', 'true');
      if (workTypes.on_site) p.set('on_site', 'true');
      if (nextPage > 1) p.set('page', String(nextPage));
      try {
        const res = await fetch(`/api/jobs/search?${p.toString()}`);
        if (!res.ok) {
          setError(res.status === 401 ? 'Please log in again to search.' : 'Search is unavailable right now. Please try again in a moment.');
          return;
        }
        const data = await res.json();
        if (data.unconfigured) setError('Job search is not connected yet.');
        setTotal(data.total ?? 0);
        setPage(nextPage);
        setResults((prev) => (nextPage > 1 ? [...prev, ...(data.jobs ?? [])] : data.jobs ?? []));
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [q, loc, workTypes]
  );

  // Saved tab: fetch the saved jobs themselves.
  useEffect(() => {
    if (tab !== 'saved') return;
    fetch('/api/jobs/applications?status=matched')
      .then((r) => (r.ok ? r.json() : { applications: [] }))
      .then((d) => setSavedJobs((d.applications ?? []).map((a: { job: Job | null }) => a.job).filter(Boolean)))
      .catch(() => setSavedJobs([]));
  }, [tab, saved]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTab('all');
    runSearch(1);
  };

  const toggleSave = async (job: Job, next: boolean) => {
    setSaved((prev) => {
      const s = new Set(prev);
      if (next) s.add(job.id); else s.delete(job.id);
      return s;
    });
    const ok = next ? await saveJob(job) : await unsaveJob(job.id);
    if (!ok) {
      setSaved((prev) => {
        const s = new Set(prev);
        if (next) s.delete(job.id); else s.add(job.id);
        return s;
      });
    }
  };

  const toggleAlert = async (on: boolean) => {
    setAlertOn(on);
    const { error: err } = await createClient().auth.updateUser({ data: { job_alert: { enabled: on, query: q.trim(), location: loc.trim() } } });
    setAlertMsg(err ? 'Could not save your alert. Try again.' : on ? 'Alert saved.' : 'Alert turned off.');
  };

  // Score lookup. Free: only the top 3 server matches are unlocked. Pro: everything is scored.
  const scoreMap = useMemo(() => {
    const m = new Map<string, JobScore>();
    const sorted = [...matches].sort((a, b) => b.match_score - a.match_score);
    sorted.forEach((row, i) => {
      if (row.job && (isPro || i < FREE_VISIBLE_SCORES)) m.set(row.job.id, { score: row.match_score, reasons: row.matched_reasons ?? [] });
    });
    if (isPro && profile) {
      for (const j of [...results, ...savedJobs]) {
        if (!m.has(j.id)) {
          const s = scoreJobMatch(profile, j);
          m.set(j.id, s);
        }
      }
    }
    return m;
  }, [matches, results, savedJobs, isPro, profile]);

  const matchJobs: Job[] = useMemo(
    () => [...matches].sort((a, b) => b.match_score - a.match_score).map((r) => r.job as Job),
    [matches]
  );

  const visible = useMemo(() => {
    let list = tab === 'match' ? matchJobs : tab === 'saved' ? savedJobs : results;
    const nq = q.trim().toLowerCase();
    const nl = loc.trim().toLowerCase();
    if (tab !== 'all') {
      list = list.filter(
        (j) =>
          (!nq || `${j.title} ${j.company ?? ''}`.toLowerCase().includes(nq)) &&
          (!nl || (j.location ?? '').toLowerCase().includes(nl) || j.work_type === 'remote')
      );
    }
    const wt = Object.entries(workTypes).filter(([, v]) => v).map(([k]) => k);
    if (wt.length) list = list.filter((j) => (j.work_type ? wt.includes(j.work_type) : false));
    if (posted !== 'any') list = list.filter((j) => postedDays(j.posted_at) <= (posted === 'today' ? 0 : 7));
    if (tab === 'match' || (isPro && minMatch > 50)) {
      list = list.filter((j) => {
        const s = scoreMap.get(j.id);
        return !s || s.score >= minMatch;
      });
    }
    return list;
  }, [tab, matchJobs, savedJobs, results, q, loc, workTypes, posted, minMatch, scoreMap, isPro]);

  const lockedExists = isPro === false && visible.some((j) => !scoreMap.has(j.id));
  const tabs: { id: Tab; label: string }[] = [
    { id: 'match', label: 'Matched to my resume' },
    { id: 'all', label: 'All results' },
    { id: 'saved', label: 'Saved' },
  ];
  const countLabel = `${visible.length} ${visible.length === 1 ? 'job' : 'jobs'}${q.trim() ? ` for "${q.trim()}"` : ''}${loc.trim() ? ` near ${loc.trim()}` : ''}`;

  const checkbox = 'h-5 w-5 accent-[#0B6E5F]';

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 px-5 pb-14 pt-7">
      <div>
        <h1 className="font-display m-0 text-[34px] tracking-[-0.8px]">Find jobs</h1>
        <p className="mt-1 text-text-muted">Search any role, or browse jobs matched to your resume.</p>
      </div>

      <form role="search" onSubmit={onSearch} className="flex flex-wrap gap-2 rounded-[18px] border border-line bg-white p-2">
        <label className="flex min-h-[54px] flex-[2_1_260px] items-center gap-2.5 rounded-xl bg-ground-portal px-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F4D49" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <span className="sr-only">Job title or keyword</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill or company" className="min-w-0 flex-1 border-0 bg-transparent text-base outline-none" />
        </label>
        <label className="flex min-h-[54px] flex-[1_1_200px] items-center gap-2.5 rounded-xl bg-ground-portal px-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F4D49" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
          <span className="sr-only">Location</span>
          <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="City or Remote" className="min-w-0 flex-1 border-0 bg-transparent text-base outline-none" />
        </label>
        <button type="submit" className="min-h-[54px] rounded-xl bg-brand px-6 font-extrabold text-white hover:bg-brand-dark">Search</button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div role="tablist" aria-label="Job lists" className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => { setTab(t.id); if (t.id === 'all' && !searched) runSearch(1); }}
              className={`min-h-[44px] rounded-full border-[1.5px] px-4 text-sm font-bold ${tab === t.id ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white text-ink'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <b className="text-[15px]" aria-live="polite">{countLabel}</b>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <aside aria-label="Filters" className="flex max-w-[320px] min-w-0 flex-[1_1_260px] flex-col gap-3.5 rounded-[20px] border border-line bg-white p-[18px]">
          <b className="text-base">Filters</b>
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-1.5 text-sm font-bold">Work type</legend>
            {([['hybrid', 'Hybrid'], ['remote', 'Remote'], ['on_site', 'On-site']] as const).map(([k, label]) => (
              <label key={k} className="flex min-h-[44px] items-center gap-2.5">
                <input type="checkbox" className={checkbox} checked={workTypes[k]} onChange={(e) => setWorkTypes((w) => ({ ...w, [k]: e.target.checked }))} />
                {label}
              </label>
            ))}
          </fieldset>
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-1.5 text-sm font-bold">Posted</legend>
            {([['today', 'Today'], ['week', 'Past week'], ['any', 'Any time']] as const).map(([k, label]) => (
              <label key={k} className="flex min-h-[44px] items-center gap-2.5">
                <input type="radio" name="posted" className={checkbox} checked={posted === k} onChange={() => setPosted(k)} />
                {label}
              </label>
            ))}
          </fieldset>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Minimum match: {minMatch}%
            <input type="range" min={50} max={100} value={minMatch} onChange={(e) => setMinMatch(Number(e.target.value))} className="accent-[#0B6E5F]" />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-2.5 border-t border-[#EEEBE3] pt-3.5">
            <span>
              <b>Alert me about new jobs like this</b>
              <br />
              <span className="text-[13px] text-text-muted">Saves your search as an alert preference</span>
            </span>
            <input type="checkbox" className="h-[22px] w-[22px] accent-[#0B6E5F]" checked={alertOn} onChange={(e) => toggleAlert(e.target.checked)} />
          </label>
          <span role="status" className="text-[13px] text-text-muted">{alertMsg}</span>
        </aside>

        <section className="flex min-w-0 flex-[999_1_520px] flex-col gap-3">
          {error ? <div role="alert" className="rounded-[18px] bg-danger-soft p-4 font-semibold text-danger-ink">{error}</div> : null}
          {loading && visible.length === 0 ? (
            <>
              <JobResultSkeleton /><JobResultSkeleton /><JobResultSkeleton />
            </>
          ) : null}
          {visible.map((j) => (
            <JobResultCard
              key={j.id}
              job={j}
              score={scoreMap.get(j.id) ?? null}
              locked={isPro === false && !scoreMap.has(j.id)}
              saved={saved.has(j.id)}
              onSave={toggleSave}
              onUnlock={() => setPromptOpen(true)}
              gap={scoreMap.has(j.id) && resumeText ? keywordGap(`${j.title} ${j.description ?? ''}`, resumeText, 2) : undefined}
            />
          ))}
          {!loading && visible.length === 0 && !error ? (
            <div className="flex flex-col items-center gap-2 rounded-[20px] border border-line bg-white p-7 text-center">
              <b className="font-display text-[22px]">
                {tab === 'match' && !hasResume ? 'Add a resume to see matches' : tab === 'saved' ? 'No saved jobs yet' : 'Nothing here yet'}
              </b>
              <span className="text-text-muted">
                {tab === 'match' && !hasResume
                  ? 'Create a resume and we will score jobs against it.'
                  : tab === 'match'
                  ? 'Run a search to see jobs, or turn on alerts and we will keep your preference.'
                  : 'Try a broader search.'}
              </span>
              {tab === 'match' && !hasResume ? (
                <Link href="/builder/resume/new" className="mt-1 inline-flex min-h-[44px] items-center rounded-xl bg-brand px-4 font-extrabold text-white no-underline">Create a resume</Link>
              ) : null}
            </div>
          ) : null}
          {tab === 'all' && results.length > 0 && results.length < total ? (
            <button type="button" onClick={() => runSearch(page + 1)} disabled={loading} className="min-h-[48px] self-center rounded-xl border-[1.5px] border-line-strong bg-white px-5 font-bold">
              {loading ? 'Loading...' : 'Load more'}
            </button>
          ) : null}
          {lockedExists ? (
            <div className="rounded-[22px] bg-ink p-6 text-white">
              <b className="font-display block text-2xl leading-tight">See every result with a match score</b>
              <p className="mb-3 mt-2 leading-normal text-on-dark-muted">
                Free shows your top 3 matches a day. Pro scores every job you search and lets Auto-Apply send the best ones.
              </p>
              <a href={upgradeHref('locked_matches')} className="block rounded-xl bg-mint-bright p-[15px] text-center font-extrabold text-ink no-underline">Unlock all results</a>
              <span className="mt-2 block text-center text-[13px] text-on-dark-muted">Cancel in two clicks</span>
            </div>
          ) : null}
        </section>
      </div>
      <UpgradePrompt trigger="locked_matches" open={promptOpen} onClose={() => setPromptOpen(false)} />
    </main>
  );
}

export default function FindJobsPage() {
  return (
    <Suspense>
      <FindJobsContent />
    </Suspense>
  );
}
