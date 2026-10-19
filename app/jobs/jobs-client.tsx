'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { Chip } from '@/components/gh-ui';

interface PublicJob {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  work_type: 'remote' | 'hybrid' | 'on_site' | null;
  contract_type: string | null;
  posted_at: string | null;
  snippet: string;
}

const POPULAR = ['Designer', 'Software Engineer', 'Nurse', 'Data Analyst', 'Marketing'];
const TINTS = [
  ['#EDE9FF', '#4B3BA8'], ['#FFE9D6', '#8A3B12'], ['#E3F4EE', '#08574B'],
  ['#FFF1CC', '#6B4A00'], ['#E8EEF8', '#1F3F6B'], ['#FBE3EC', '#8A1F48'],
];
const WORK: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', on_site: 'On-site' };

function typeLabel(j: PublicJob) {
  const ct = (j.contract_type ?? '').replace(/_/g, '-');
  const parts = [j.work_type ? WORK[j.work_type] : null, ct ? ct.charAt(0).toUpperCase() + ct.slice(1) : null].filter(Boolean);
  return parts.join(' · ');
}

function postedLabel(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const ageH = (Date.now() - d.getTime()) / 36e5;
  return ageH < 24 ? 'Posted today' : `Posted ${formatDistanceToNowStrict(d)} ago`;
}

export default function JobsClient() {
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState('');
  const [remote, setRemote] = useState(false);
  const [full, setFull] = useState(false);
  const [today, setToday] = useState(false);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unconfigured, setUnconfigured] = useState(false);
  const [searched, setSearched] = useState({ q: '', loc: '' });
  const reqId = useRef(0);

  const run = useCallback(async (query: string, location: string, remoteOnly: boolean) => {
    const id = ++reqId.current;
    setLoading(true);
    setError('');
    try {
      const sp = new URLSearchParams();
      if (query) sp.set('query', query);
      if (location && location.toLowerCase() !== 'remote') sp.set('location', location);
      if (remoteOnly || location.toLowerCase() === 'remote') sp.set('remote', 'true');
      const res = await fetch(`/api/jobs/public?${sp.toString()}`);
      const body = await res.json();
      if (id !== reqId.current) return;
      if (!res.ok) throw new Error(body.error || 'Search is unavailable right now.');
      setJobs(body.jobs ?? []);
      setUnconfigured(!!body.unconfigured);
      setSearched({ q: query, loc: location });
    } catch (e) {
      if (id !== reqId.current) return;
      setJobs([]);
      setError(e instanceof Error ? e.message : 'Search is unavailable right now.');
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const iq = sp.get('query') ?? '';
    const il = sp.get('location') ?? '';
    setQ(iq);
    setLoc(il);
    run(iq, il, false);
  }, [run]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(q.trim(), loc.trim(), remote);
  };

  const visible = jobs.filter((j) => {
    if (full && !(j.contract_type ?? '').toLowerCase().includes('full')) return false;
    if (today && !(j.posted_at && Date.now() - new Date(j.posted_at).getTime() < 864e5)) return false;
    if (remote && j.work_type !== 'remote') return false;
    return true;
  });

  const count = `${visible.length} ${visible.length === 1 ? 'job' : 'jobs'}${searched.q ? ` for "${searched.q}"` : ''}${searched.loc ? ` near ${searched.loc}` : ''}`;

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-[18px] px-5 pb-10 pt-14 text-center">
          <span className="rounded-full bg-ink-soft px-3 py-1.5 text-[13px] font-extrabold text-mint-bright">JOBS FROM EMPLOYERS WORLDWIDE</span>
          <h1 className="font-display m-0 max-w-[820px] text-[40px] font-bold leading-[1.02] tracking-[-1.8px] min-[761px]:text-[58px]">
            Find your next job, then apply with a resume that fits it.
          </h1>
          <p className="m-0 max-w-[640px] text-lg leading-normal text-[#C9D8D3]">
            Search here, see how well you match each role, and tailor your resume in one click.
          </p>
          <form role="search" onSubmit={submit} className="box-border flex w-[min(860px,100%)] flex-wrap gap-2 rounded-[18px] bg-white p-2">
            <label className="flex min-h-[54px] flex-[2_1_260px] items-center gap-2.5 rounded-xl bg-ground-site px-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F4D49" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
              <span className="sr-only">Job title or keyword</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill or company" className="min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none placeholder:text-text-subtle" />
            </label>
            <label className="flex min-h-[54px] flex-[1_1_200px] items-center gap-2.5 rounded-xl bg-ground-site px-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F4D49" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
              <span className="sr-only">Location</span>
              <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="City or Remote" className="min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none placeholder:text-text-subtle" />
            </label>
            <button type="submit" className="min-h-[54px] flex-none rounded-xl bg-brand px-[26px] text-base font-extrabold text-white hover:bg-brand-dark">Search jobs</button>
          </form>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="py-2 text-on-dark-muted">Popular:</span>
            {POPULAR.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => { setQ(p); setLoc(''); run(p, '', remote); }}
                className="min-h-[44px] rounded-full bg-ink-soft px-3.5 text-sm font-bold text-white hover:bg-ink-line"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1240px] flex-wrap items-start gap-6 px-5 pb-16 pt-7">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-3" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <b className="text-[17px]">{loading ? 'Searching...' : count}</b>
            <div role="group" aria-label="Quick filters" className="flex flex-wrap gap-1.5">
              <Chip active={remote} onClick={() => { const n = !remote; setRemote(n); run(q.trim(), loc.trim(), n); }}>Remote</Chip>
              <Chip active={full} onClick={() => setFull(!full)}>Full-time</Chip>
              <Chip active={today} onClick={() => setToday(!today)}>Posted today</Chip>
            </div>
          </div>

          {visible.map((j, idx) => {
            const [bg, fg] = TINTS[idx % TINTS.length];
            return (
              <article key={j.id} className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-[18px]">
                <div className="flex flex-wrap items-start gap-3.5">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-xl font-extrabold" style={{ background: bg, color: fg }} aria-hidden="true">
                    {(j.company || j.title).charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-[220px] flex-[1_1_220px]">
                    <b className="text-lg">{j.title}</b>
                    <br />
                    <span className="text-sm text-text-muted">{[j.company, j.location, typeLabel(j)].filter(Boolean).join(' · ')}</span>
                  </span>
                  <Link href="/signup?from=job_match" className="flex min-h-[44px] flex-none items-center gap-1.5 rounded-full bg-sun-soft px-3 text-[13px] font-extrabold text-warning-ink no-underline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
                    See your match %
                  </Link>
                </div>
                {j.snippet ? <p className="m-0 text-[15px] leading-normal text-text-muted">{j.snippet}</p> : null}
                <div className="flex flex-wrap items-center gap-2">
                  <Link href="/signup?from=job_apply" className="flex min-h-[44px] items-center rounded-xl bg-brand px-4 font-extrabold text-white no-underline hover:bg-brand-dark">Apply with my resume</Link>
                  <Link href="/signup?from=job_save" className="flex min-h-[44px] items-center rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 font-bold text-ink no-underline">Save job</Link>
                  <span className="ml-auto text-[13px] text-text-subtle">{postedLabel(j.posted_at)}</span>
                </div>
              </article>
            );
          })}

          {!loading && visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-[20px] border border-line bg-white p-7 text-center">
              {error ? (
                <>
                  <b className="font-display text-[22px]">Search is unavailable right now</b>
                  <span className="text-text-muted">{error}</span>
                </>
              ) : unconfigured ? (
                <>
                  <b className="font-display text-[22px]">Job listings are being connected</b>
                  <span className="text-text-muted">Create a free account and we will let you know as soon as jobs are live.</span>
                  <Link href="/signup" className="font-extrabold text-brand">Create a free account</Link>
                </>
              ) : (
                <>
                  <b className="font-display text-[22px]">No jobs match that search yet</b>
                  <span className="text-text-muted">Try a broader title, or let us alert you when one is posted.</span>
                  <Link href="/signup?from=job_alert" className="font-extrabold text-brand">Create a job alert</Link>
                </>
              )}
            </div>
          ) : null}
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-[22px] bg-brand p-[22px] text-white">
            <b className="font-display text-2xl leading-[1.15]">See how well you match every job</b>
            <span className="leading-normal text-[#CFEDE4]">Create a free account and we will score each job against your resume and show what is missing.</span>
            <Link href="/signup?from=job_match" className="rounded-xl bg-sun p-[15px] text-center font-extrabold text-ink no-underline">Get my match scores, free</Link>
            <span className="text-center text-[13px] text-[#CFEDE4]">Your top 3 matches free every day</span>
          </div>
          <div className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-5">
            <b>How job search works here</b>
            <ol className="m-0 flex list-decimal flex-col gap-2 pl-5 text-[15px] leading-[1.45] text-text-muted">
              <li>Search or let us match jobs to your resume</li>
              <li>Tailor your resume to a job in one click</li>
              <li>Apply, then track every application in one place</li>
              <li>With Pro, Auto-Apply sends the best ones for you</li>
            </ol>
          </div>
        </aside>
      </section>
    </>
  );
}
