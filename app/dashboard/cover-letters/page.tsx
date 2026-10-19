'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { btnClass } from '@/components/gh-ui';
import { upgradeHref } from '@/lib/upgrade-triggers';

interface CoverLetterRow {
  id: string;
  title: string;
  updated_at: string;
  template_id: string;
}

interface Excerpt { body: string }

function editedLabel(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'edited today';
  if (days === 1) return 'edited yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CoverLettersPage() {
  const router = useRouter();
  const [letters, setLetters] = useState<CoverLetterRow[]>([]);
  const [excerpts, setExcerpts] = useState<Record<string, Excerpt>>({});
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isPro, setIsPro] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/user/subscription-status').then((r) => r.json()).then((d) => setIsPro(Boolean(d.isPro))).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/cover-letter');
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) throw new Error('bad status');
      const json = await res.json();
      const rows: CoverLetterRow[] = json.coverLetters ?? [];
      setLetters(rows);
      setState('ready');
      // The list endpoint omits the body, so fetch a short excerpt for the first few cards.
      rows.slice(0, 9).forEach((r) => {
        fetch(`/api/cover-letter/${r.id}`)
          .then((x) => (x.ok ? x.json() : null))
          .then((d) => {
            const body: string = d?.coverLetter?.data?.body ?? '';
            setExcerpts((p) => ({ ...p, [r.id]: { body } }));
          })
          .catch(() => {});
      });
    } catch {
      setState('error');
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleNew = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled cover letter', template_id: 'professional', data: {}, contact: {} }),
      });
      if (res.ok) {
        const { coverLetter } = await res.json();
        router.push(`/builder/cover-letter/${coverLetter.id}`);
        return;
      }
    } catch { /* fall through */ }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cover letter?')) return;
    setLetters((p) => p.filter((c) => c.id !== id));
    try { await fetch(`/api/cover-letter/${id}`, { method: 'DELETE' }); } catch { load(); }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-5 pb-14 pt-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display m-0 text-[34px] tracking-[-0.8px]">Cover letters</h1>
          <p className="mt-1 text-text-muted">Paste a job ad and get a letter that matches your resume.</p>
        </div>
        <button type="button" onClick={handleNew} disabled={creating} className={btnClass('primary', 'font-extrabold')}>
          {creating ? 'Creating...' : '+ New cover letter'}
        </button>
      </div>

      {!isPro && (
        <div className="flex flex-wrap items-center gap-3.5 rounded-[18px] bg-sun-soft px-[18px] py-4">
          <span className="min-w-[240px] flex-1 leading-normal"><b>Write and preview as many as you like.</b> Downloading cover letters is part of Pro.</span>
          <Link href={upgradeHref('cover_letter_download')} className="grid min-h-[44px] place-items-center rounded-[10px] bg-ink px-3.5 font-extrabold text-white no-underline">Go Pro</Link>
        </div>
      )}

      {state === 'loading' ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-[220px] animate-pulse rounded-[20px] bg-[#ECE9E0]" />)}
        </div>
      ) : state === 'error' ? (
        <div className="flex items-center justify-between gap-3 rounded-[20px] border border-line bg-white p-6">
          <span className="text-text-muted">We could not load your cover letters.</span>
          <button type="button" onClick={() => { setState('loading'); load(); }} className={btnClass('outline')}>Try again</button>
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
          {letters.map((c) => {
            const body = excerpts[c.id]?.body;
            const ready = Boolean(body && body.trim().length > 0);
            return (
              <article key={c.id} className="flex flex-col gap-3 rounded-[20px] border border-line bg-white p-5">
                <Link href={`/builder/cover-letter/${c.id}`} className="flex flex-col gap-3 text-ink no-underline">
                  <div className="h-[120px] overflow-hidden rounded-xl bg-ground-site p-4 text-[13px] leading-[1.55] text-text-muted">
                    {body === undefined ? '' : ready ? body : 'No text yet. Open it to write your letter.'}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <b className="block truncate">{c.title}</b>
                      <span className="text-[13px] text-text-muted">{editedLabel(c.updated_at)}</span>
                    </span>
                    {body !== undefined && (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${ready ? 'bg-mint-soft text-brand-dark' : 'bg-warning-soft text-warning-ink'}`}>{ready ? 'Ready' : 'Draft'}</span>
                    )}
                  </div>
                </Link>
                <button type="button" onClick={() => handleDelete(c.id)} className="self-start text-sm font-semibold text-danger-ink min-h-[44px]">Delete</button>
              </article>
            );
          })}
          <button type="button" onClick={handleNew} disabled={creating} className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-[#C9C4B6] bg-transparent p-5 text-center text-ink">
            <span aria-hidden="true" className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-mint-soft text-[26px] font-extrabold text-brand">+</span>
            <b>Write a new one</b>
            <span className="text-sm text-text-muted">About 60 seconds</span>
          </button>
        </div>
      )}
    </div>
  );
}
