'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { tileFor, workTypeLabel } from '@/components/jobs/job-utils';
import type { ApplicationStatus } from '@/types/jobs';

interface AppRow {
  id: string;
  status: ApplicationStatus;
  source: string | null;
  created_at: string;
  applied_at: string | null;
  job: { id: string; title: string; company: string | null; location: string | null; work_type: 'remote' | 'hybrid' | 'on_site' | null } | null;
}

type ColId = 'saved' | 'applied' | 'interview' | 'offer';
const COLS: { id: ColId; title: string; statuses: ApplicationStatus[]; moveTo: ApplicationStatus }[] = [
  { id: 'saved', title: 'Saved', statuses: ['matched'], moveTo: 'matched' },
  { id: 'applied', title: 'Applied', statuses: ['redirected', 'applied', 'viewed'], moveTo: 'applied' },
  { id: 'interview', title: 'Interview', statuses: ['interview'], moveTo: 'interview' },
  { id: 'offer', title: 'Offer', statuses: ['offer'], moveTo: 'offer' },
];

function ago(d: string | null) {
  if (!d) return '';
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  return days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
}

export default function ApplicationsPage() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs/applications', { cache: 'no-store' });
      if (!res.ok) throw new Error('failed');
      const d = await res.json();
      setRows(d.applications ?? []);
    } catch {
      setError('We could not load your applications. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const move = async (row: AppRow, to: ColId) => {
    const target = COLS.find((c) => c.id === to)!;
    if (target.statuses.includes(row.status)) return;
    const prev = row.status;
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: target.moveTo } : r)));
    const patch: Record<string, unknown> = { status: target.moveTo };
    if (to === 'applied') patch.applied_at = new Date().toISOString();
    const { error: err } = await createClient().from('applications').update(patch).eq('id', row.id);
    if (err) {
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: prev } : r)));
      setLive('Could not move that card. Please try again.');
    } else {
      setLive(`Moved to ${target.title}`);
    }
  };

  const colOf = (r: AppRow): ColId | null => COLS.find((c) => c.statuses.includes(r.status))?.id ?? null;

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-[18px] px-5 pb-14 pt-7">
      <div>
        <h1 className="font-display m-0 text-[34px] tracking-[-0.8px]">Applications</h1>
        <p className="mt-1 text-text-muted">Every job you save or apply to, in one place. Use the menu on each card to move it along.</p>
      </div>
      <p role="status" className="sr-only">{live}</p>
      {error ? <div role="alert" className="rounded-[18px] bg-danger-soft p-4 font-semibold text-danger-ink">{error}</div> : null}
      <div className="grid items-start gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
        {COLS.map((c) => {
          const cards = rows.filter((r) => colOf(r) === c.id && r.job);
          return (
            <section key={c.id} aria-label={c.title} className="flex flex-col gap-2.5 rounded-[20px] bg-[#EEEBE3] p-3">
              <h2 className="m-0 flex justify-between px-1.5 pb-0.5 pt-1.5 text-[15px]">
                <span>{c.title}</span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[13px]">{cards.length}</span>
              </h2>
              {loading ? <div aria-hidden="true" className="h-20 animate-pulse rounded-[14px] bg-white" /> : null}
              {cards.map((r) => {
                const j = r.job!;
                const t = tileFor(j.company);
                const note =
                  c.id === 'saved' ? `Saved ${ago(r.created_at)}`
                  : r.source === 'auto_apply' ? 'Applied via Auto-Apply'
                  : c.id === 'applied' ? `Applied ${ago(r.applied_at ?? r.created_at)}`
                  : '';
                return (
                  <article key={r.id} className="flex flex-col gap-2 rounded-[14px] bg-white p-3.5">
                    <div className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="grid h-9 w-9 flex-none place-items-center rounded-[10px] font-extrabold" style={{ background: t.bg, color: t.fg }}>{t.initial}</span>
                      <span className="min-w-0">
                        <Link href={`/dashboard/find-jobs/${encodeURIComponent(j.id)}`} className="text-[15px] font-bold text-ink no-underline hover:text-brand">{j.title}</Link>
                        <span className="block text-[13px] text-text-muted">{[j.company, j.location, workTypeLabel(j.work_type)].filter(Boolean).join(' · ')}</span>
                      </span>
                    </div>
                    {note ? <span className="text-xs text-text-muted">{note}</span> : null}
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                      Move to
                      <select
                        value={c.id}
                        onChange={(e) => move(r, e.target.value as ColId)}
                        className="min-h-[44px] flex-1 rounded-[10px] border-[1.5px] border-line-strong bg-white px-2 text-base text-ink"
                      >
                        {COLS.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
                      </select>
                    </label>
                  </article>
                );
              })}
              {!loading && cards.length === 0 ? <p className="m-0 px-1.5 pb-1.5 text-sm text-text-muted">Nothing here yet.</p> : null}
            </section>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3.5 rounded-[18px] border border-line bg-white px-[18px] py-4">
        <span className="min-w-[260px] flex-1 leading-normal"><b>Tip:</b> following up 5 to 7 days after applying keeps you top of mind.</span>
        <Link href="/resources" className="inline-flex min-h-[44px] items-center font-extrabold text-brand no-underline">Read career advice →</Link>
      </div>
    </main>
  );
}
