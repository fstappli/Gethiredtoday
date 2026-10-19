'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StripJob { id: string; title: string; company: string | null; location: string | null }
const TINTS = [['#EDE9FF', '#4B3BA8'], ['#EDE9FF', '#4B3BA8'], ['#FBE3EC', '#8A1F48']];

/** Shows 3 real, current openings from the public job search. Renders nothing if none are available. */
export default function HomeJobStrip() {
  const [jobs, setJobs] = useState<StripJob[]>([]);
  useEffect(() => {
    let alive = true;
    fetch('/api/jobs/public?query=manager')
      .then((r) => (r.ok ? r.json() : { jobs: [] }))
      .then((b) => { if (alive) setJobs((b.jobs ?? []).slice(0, 3)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  if (jobs.length === 0) return null;
  return (
    <>
      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
        {jobs.map((j, i) => (
          <Link key={j.id} href="/jobs" className="flex items-center gap-3 rounded-[14px] bg-ink-soft p-3.5 text-white no-underline">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] font-extrabold" style={{ background: TINTS[i][0], color: TINTS[i][1] }} aria-hidden="true">
              {(j.company || j.title).charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <b className="block truncate">{j.title}</b>
              <span className="block truncate text-[13px] text-on-dark-muted">{[j.company, j.location].filter(Boolean).join(' · ')}</span>
            </span>
            <span className="flex-none text-[13px] font-extrabold text-mint-bright">See match</span>
          </Link>
        ))}
      </div>
      <span className="text-[13px] text-on-dark-muted">Create a free account to see how well you match each job.</span>
    </>
  );
}
