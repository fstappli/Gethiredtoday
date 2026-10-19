'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  applyOnCompanySite, contractLabel, formatSalary, keywordGap, listSavedJobIds, postedLabel, saveJob, tileFor, unsaveJob, workTypeLabel,
} from '@/components/jobs/job-utils';
import UpgradePrompt from '@/components/upgrade-prompt';
import { extractResumeProfile, scoreJobMatch } from '@/lib/jobs/match';
import { resumeDataToText } from '@/lib/ats';
import type { Job } from '@/types/jobs';
import type { ResumeData } from '@/types';

interface ResumeRow {
  id: string;
  title: string;
  data: ResumeData;
  finalized_at: string | null;
}

export default function JobDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? decodeURIComponent(params.id) : '';
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [resume, setResume] = useState<ResumeRow | null>(null);
  const [top3, setTop3] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [prompt, setPrompt] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const cached = sessionStorage.getItem(`job_${id}`);
        if (cached) { setJob(JSON.parse(cached)); setLoading(false); }
      } catch { /* ignore */ }
    });
    fetch(`/api/jobs/${encodeURIComponent(id)}`)
      .then((r) => { if (!r.ok) throw new Error('nf'); return r.json(); })
      .then((d) => setJob(d.job))
      .catch(() => setJob((cur) => { if (!cur) setNotFound(true); return cur; }))
      .finally(() => setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    (async () => {
      const [sub, resumes, m, ids] = await Promise.all([
        fetch('/api/user/subscription-status').then((r) => r.json()).catch(() => ({ isPro: false })),
        fetch('/api/resume', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { resumes: [] })).catch(() => ({ resumes: [] })),
        fetch('/api/jobs/matches', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { matches: [] })).catch(() => ({ matches: [] })),
        listSavedJobIds().catch(() => new Set<string>()),
      ]);
      setIsPro(Boolean(sub.isPro));
      const list: ResumeRow[] = resumes.resumes ?? [];
      setResume(list.find((r) => r.finalized_at) ?? list[0] ?? null);
      const sorted = [...(m.matches ?? [])].sort((a: { match_score: number }, b: { match_score: number }) => b.match_score - a.match_score);
      setTop3(new Set(sorted.slice(0, 3).map((x: { job?: { id: string } }) => x.job?.id).filter(Boolean) as string[]));
      setSaved(ids.has(id));
    })();
  }, [id]);

  const match = useMemo(() => {
    if (!job || !resume?.data) return null;
    const profile = extractResumeProfile(resume.data);
    const { score, reasons } = scoreJobMatch(profile, job);
    const text = resumeDataToText(resume.data);
    const have = profile.skills.filter((s) => `${job.title} ${job.description ?? ''}`.toLowerCase().includes(s.toLowerCase())).slice(0, 6);
    return { score, reasons, have, missing: keywordGap(`${job.title} ${job.description ?? ''}`, text, 4) };
  }, [job, resume]);

  const canSeeMatch = isPro === true || top3.has(id);

  const toggleSave = async () => {
    if (!job) return;
    const next = !saved;
    setSaved(next);
    const ok = next ? await saveJob(job) : await unsaveJob(job.id);
    if (!ok) setSaved(!next);
  };

  if (loading && !job) {
    return <main className="mx-auto w-full max-w-[1240px] px-5 py-6" aria-busy="true"><div className="h-64 animate-pulse rounded-[22px] bg-white" /></main>;
  }
  if (notFound || !job) {
    return (
      <main className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-3 px-5 py-16 text-center">
        <h1 className="font-display m-0 text-3xl">Job not found</h1>
        <p className="m-0 text-text-muted">This job may have expired or been removed.</p>
        <Link href="/dashboard/find-jobs" className="inline-flex min-h-[44px] items-center rounded-xl bg-brand px-4 font-extrabold text-white no-underline">Back to search</Link>
      </main>
    );
  }

  const tile = tileFor(job.company);
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);
  const meta = [job.company, job.location, workTypeLabel(job.work_type), contractLabel(job.contract_type)].filter(Boolean).join(' · ');
  const paragraphs = (job.description ?? '').split(/\n{1,}/).map((s) => s.trim()).filter(Boolean);
  const tailorHref = resume ? `/builder/resume/${resume.id}?tailor=${encodeURIComponent(job.id)}` : '/builder/resume/new';
  const pill = 'rounded-full bg-ground-portal px-3 py-1.5';

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-[18px] px-5 pb-14 pt-6">
      <Link href="/dashboard/find-jobs" className="inline-flex min-h-[44px] items-center self-start font-bold text-brand no-underline">← All matches</Link>
      <div className="flex flex-wrap items-start gap-5">
        <section className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
          <div className="flex flex-col gap-3.5 rounded-[22px] border border-line bg-white p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span aria-hidden="true" className="grid h-[60px] w-[60px] place-items-center rounded-2xl text-2xl font-extrabold" style={{ background: tile.bg, color: tile.fg }}>{tile.initial}</span>
              <span className="min-w-[240px] flex-1">
                <h1 className="font-display m-0 text-[30px] tracking-[-0.6px]">{job.title}</h1>
                <span className="text-text-muted">{meta}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {postedLabel(job.posted_at) ? <span className={pill}>{postedLabel(job.posted_at)}</span> : null}
              <span className={pill}>{salary || 'Salary not listed'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-7 text-base leading-[1.7]">
            <h2 className="font-display m-0 text-[22px]">About the role</h2>
            {paragraphs.length ? paragraphs.map((p, i) => <p key={i} className="m-0 text-text-muted">{p}</p>) : <p className="m-0 text-text-muted">The employer has not shared a description. Open the company site for full details.</p>}
          </div>
        </section>

        <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
          <div className="flex flex-col gap-3.5 rounded-[22px] bg-ink p-[22px] text-white">
            {match && canSeeMatch ? (
              <>
                <div className="flex items-center gap-3.5">
                  <span role="img" aria-label={`Match ${match.score} percent`} className="grid h-[72px] w-[72px] flex-none place-items-center rounded-full" style={{ background: `conic-gradient(#5FD3B3 0 ${match.score}%, #2A3A37 ${match.score}%)` }}>
                    <span className="font-display grid h-[58px] w-[58px] place-items-center rounded-full bg-ink text-[22px] font-extrabold">{match.score}%</span>
                  </span>
                  <span>
                    <b className="font-display text-xl">{match.score >= 80 ? 'Strong match' : match.score >= 60 ? 'Good match' : 'Partial match'}</b>
                    <br />
                    <span className="text-sm text-on-dark-muted">for &quot;{resume?.title}&quot;</span>
                  </span>
                </div>
                {match.have.length ? <div className="text-sm"><b className="text-mint-bright">You have:</b> {match.have.join(', ')}</div> : match.reasons[0] ? <div className="text-sm"><b className="text-mint-bright">You have:</b> {match.reasons[0]}</div> : null}
                {match.missing.length ? <div className="text-sm"><b className="text-sun">Missing:</b> {match.missing.join(', ')}</div> : null}
              </>
            ) : isPro === false && resume ? (
              <div className="flex flex-col gap-2">
                <b className="font-display text-xl">See how you match</b>
                <span className="text-sm leading-normal text-on-dark-muted">Free shows your top 3 matches each day. Pro scores every job against your resume.</span>
                <button type="button" onClick={() => setPrompt(true)} className="min-h-[44px] rounded-xl bg-sun font-extrabold text-ink">Unlock this match</button>
              </div>
            ) : !resume && isPro !== null ? (
              <span className="text-sm leading-normal text-on-dark-muted">Create a resume and we will show how well you match this job.</span>
            ) : null}
            <Link href={tailorHref} className="rounded-xl bg-mint-bright p-[15px] text-center font-extrabold text-ink no-underline">Tailor my resume for this job</Link>
            <button type="button" onClick={() => applyOnCompanySite(job)} className="min-h-[48px] rounded-xl border-[1.5px] border-[#3F4D49] bg-transparent p-3.5 text-center font-bold text-white">Apply on company site</button>
            <button type="button" onClick={toggleSave} aria-pressed={saved} className="min-h-[44px] bg-transparent font-bold text-on-dark-muted">{saved ? 'Saved' : 'Save for later'}</button>
          </div>
          <div className="flex flex-col gap-2 rounded-[22px] border border-line bg-white p-5">
            <b>Write a cover letter for this job</b>
            <span className="text-sm leading-normal text-text-muted">We will use this job ad and your resume. About 60 seconds.</span>
            <Link href={`/builder/cover-letter/new?job=${encodeURIComponent(job.id)}`} className="inline-flex min-h-[44px] items-center font-extrabold text-brand no-underline">Start cover letter →</Link>
          </div>
        </aside>
      </div>
      <UpgradePrompt trigger="locked_matches" open={prompt} onClose={() => setPrompt(false)} />
    </main>
  );
}
