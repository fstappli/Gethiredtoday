'use client';

import Link from 'next/link';
import { tileFor, workTypeLabel, contractLabel, postedLabel, formatSalary } from './job-utils';
import type { Job } from '@/types/jobs';

export interface JobScore {
  score: number;
  reasons: string[];
}

export function JobResultCard({
  job,
  score,
  locked,
  saved,
  onSave,
  onUnlock,
  gap,
}: {
  job: Job;
  score?: JobScore | null;
  locked?: boolean;
  saved: boolean;
  onSave: (job: Job, saved: boolean) => void;
  onUnlock: () => void;
  gap?: string[];
}) {
  const tile = tileFor(job.company);
  const meta = [job.company, job.location, workTypeLabel(job.work_type), contractLabel(job.contract_type), postedLabel(job.posted_at)]
    .filter(Boolean)
    .join(' · ');
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);
  const href = `/dashboard/find-jobs/${encodeURIComponent(job.id)}`;
  const remember = () => {
    try { sessionStorage.setItem(`job_${job.id}`, JSON.stringify(job)); } catch { /* ignore */ }
  };

  return (
    <article className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-[18px]">
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="grid h-12 w-12 flex-none place-items-center rounded-xl text-lg font-extrabold"
          style={{ background: tile.bg, color: tile.fg }}
        >
          {tile.initial}
        </span>
        <span className="min-w-0 flex-1">
          <Link href={href} onClick={remember} className="text-lg font-bold leading-tight text-ink no-underline hover:text-brand">
            {job.title}
          </Link>
          <span className="mt-0.5 block text-sm text-text-muted">{meta}</span>
          {salary ? <span className="mt-0.5 block text-sm text-text-muted">{salary}</span> : null}
        </span>
        <span className="flex-none text-right">
          {score ? (
            <>
              <b className="font-display block text-2xl leading-none text-brand">{score.score}%</b>
              <span className="text-xs text-text-muted">match</span>
            </>
          ) : locked ? (
            <button
              type="button"
              onClick={onUnlock}
              className="min-h-[44px] rounded-full bg-sun-soft px-3 text-xs font-extrabold text-warning-ink"
            >
              See your match %
            </button>
          ) : null}
        </span>
      </div>
      {gap && gap.length > 0 && score ? (
        <div className="text-sm text-text-muted">
          Missing from your resume: <b className="text-ink">{gap.join(', ')}</b>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Link href={href} onClick={remember} className="inline-flex min-h-[44px] items-center rounded-xl bg-brand px-4 font-extrabold text-white no-underline hover:bg-brand-dark">
          {score ? 'Tailor & apply' : 'View job'}
        </Link>
        {score ? (
          <Link href={href} onClick={remember} className="inline-flex min-h-[44px] items-center rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 font-bold text-ink no-underline">
            View job
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => onSave(job, !saved)}
          aria-pressed={saved}
          className="min-h-[44px] rounded-xl px-3 font-bold text-text-muted hover:text-ink"
        >
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </article>
  );
}

export function JobResultSkeleton() {
  return <div aria-hidden="true" className="h-[140px] animate-pulse rounded-[20px] border border-line bg-white" />;
}
