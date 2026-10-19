'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { previewFromResumeData } from '@/components/template-preview';
import ResumeThumb from '@/components/resume-thumb';
import UpgradePrompt from '@/components/upgrade-prompt';
import { btnClass } from '@/components/gh-ui';
import { createClient } from '@/lib/supabase';
import { isProActive } from '@/lib/subscription';
import { scoreResume } from '@/lib/ats';
import { atsPill, templateMeta, TEMPLATE_META, timeAgo } from '@/lib/template-meta';
import type { UpgradeTrigger } from '@/lib/upgrade-triggers';
import type { ResumeData } from '@/types';

interface ResumeRow {
  id: string;
  title: string;
  updated_at: string;
  ats_score: number | null;
  template_id: string;
  data?: ResumeData;
}

function ResumesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isPro, setIsPro] = useState(false);
  const [prompt, setPrompt] = useState<UpgradeTrigger | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/resume');
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) throw new Error('bad status');
      const json = await res.json();
      setResumes(json.resumes ?? []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('subscription_status, subscription_ends_at').eq('id', user.id).single();
      setIsPro(isProActive(profile));
    });
  }, []);

  // /dashboard/resumes?new=1 comes from "+ New resume" on the dashboard for free users.
  useEffect(() => {
    if (params.get('new') === '1' && state === 'ready') {
      if (!isPro && resumes.length >= 1) setPrompt('second_resume');
      else router.replace('/builder/wizard');
    }
  }, [params, state, isPro, resumes.length, router]);

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(null), 3500); };

  const handleNew = () => {
    if (!isPro && resumes.length >= 1) { setPrompt('second_resume'); return; }
    router.push('/builder/wizard');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    setResumes((p) => p.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/resume/${id}`, { method: 'DELETE' });
      if (!res.ok) load();
    } catch { load(); }
  };

  const handleDuplicate = async (r: ResumeRow) => {
    if (!isPro) { setPrompt('second_resume'); return; }
    try {
      const res = await fetch(`/api/resume/${r.id}`);
      if (!res.ok) return;
      const { resume: full } = await res.json();
      const create = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${r.title} (Copy)`, template_id: r.template_id, data: full.data ?? {} }),
      });
      if (create.ok) load(); else flash('Could not duplicate this resume.');
    } catch { flash('Could not duplicate this resume.'); }
  };

  const handleRename = async (r: ResumeRow) => {
    const title = window.prompt('Rename resume', r.title)?.trim();
    if (!title || title === r.title) return;
    setResumes((p) => p.map((x) => (x.id === r.id ? { ...x, title } : x)));
    const res = await fetch(`/api/resume/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
    if (!res.ok) { flash('Could not rename.'); load(); }
  };

  const handleShare = async (r: ResumeRow) => {
    const res = await fetch(`/api/resume/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_public: true }) });
    if (!res.ok) { flash('Could not create a share link.'); return; }
    const link = `${window.location.origin}/resume/public/${r.id}`;
    try { await navigator.clipboard.writeText(link); flash('Share link copied.'); } catch { flash(link); }
  };

  const handleWord = async (r: ResumeRow) => {
    if (!isPro) { setPrompt('word_export'); return; }
    try {
      const res = await fetch(`/api/resume/${r.id}/word`);
      if (res.status === 402 || res.status === 403) { setPrompt('word_export'); return; }
      if (!res.ok) { flash('Word download failed.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (res.headers.get('Content-Disposition') || '').match(/filename="?([^"]+)"?/)?.[1] ?? 'resume.doc';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch { flash('Word download failed.'); }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-5 pb-14 pt-7">
      {notice && <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white min-[761px]:bottom-6">{notice}</div>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display m-0 text-[34px] tracking-[-0.8px]">My resumes</h1>
          <p className="mt-1 text-text-muted">Keep one per role you are targeting. Each one is scored separately.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/onboarding" className={btnClass('outline')}>Upload</Link>
          <button type="button" onClick={handleNew} className={btnClass('primary', 'font-extrabold')}>+ New resume</button>
        </div>
      </div>

      {state === 'loading' ? (
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-[420px] animate-pulse rounded-[20px] bg-[#ECE9E0]" />)}
        </div>
      ) : state === 'error' ? (
        <div className="flex items-center justify-between gap-3 rounded-[20px] border border-line bg-white p-6">
          <span className="text-text-muted">We could not load your resumes.</span>
          <button type="button" onClick={() => { setState('loading'); load(); }} className={btnClass('outline')}>Try again</button>
        </div>
      ) : (
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
          {resumes.map((r) => {
            const meta = templateMeta(r.template_id);
            const pill = atsPill(r.data ? scoreResume(r.data) : r.ats_score);
            return (
              <article key={r.id} className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-white">
                <Link href={`/builder/resume/${r.id}`} aria-label={`Edit ${r.title}`} className="flex h-[230px] justify-center overflow-hidden bg-[#F2EFE7] pt-5">
                  <ResumeThumb layout={meta.layout} accent={meta.accent} content={previewFromResumeData(r.data)} width={210} className="rounded-t shadow-[0_10px_24px_rgba(13,27,25,.12)]" />
                </Link>
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-2.5">
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-[17px]">{r.title}</b>
                      <span className="text-[13px] text-text-muted">{TEMPLATE_META[r.template_id]?.label ?? 'Classic'} · {timeAgo(r.updated_at)}</span>
                    </span>
                    <span className="rounded-full px-2.5 py-1 text-[13px] font-extrabold" style={{ background: pill.bg, color: pill.fg }}>{pill.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Link href={`/builder/resume/${r.id}`} className="grid min-h-[44px] place-items-center rounded-[10px] bg-ink text-sm font-bold text-white no-underline">Edit</Link>
                    <Link href={`/builder/resume/${r.id}?download=1`} className="grid min-h-[44px] place-items-center rounded-[10px] border border-line-strong bg-white text-sm font-bold text-ink no-underline">PDF</Link>
                    <button type="button" onClick={() => handleWord(r)} className="min-h-[44px] rounded-[10px] border border-line-strong bg-white text-sm font-bold text-ink">{isPro ? 'Word' : 'Word · Pro'}</button>
                  </div>
                  <details>
                    <summary className="flex min-h-[44px] cursor-pointer items-center text-sm font-bold text-text-muted">More actions</summary>
                    <div className="mt-1 flex flex-col text-sm">
                      <button type="button" onClick={() => handleDuplicate(r)} className="min-h-[44px] bg-transparent text-left">Duplicate for another role</button>
                      <button type="button" onClick={() => handleShare(r)} className="min-h-[44px] bg-transparent text-left">Copy share link</button>
                      <button type="button" onClick={() => handleRename(r)} className="min-h-[44px] bg-transparent text-left">Rename</button>
                      <button type="button" onClick={() => handleDelete(r.id)} className="min-h-[44px] bg-transparent text-left text-danger-ink">Delete</button>
                    </div>
                  </details>
                </div>
              </article>
            );
          })}
          <button type="button" onClick={handleNew} className="flex min-h-[360px] flex-col items-center justify-center gap-2.5 rounded-[20px] border-2 border-dashed border-[#C9C4B6] bg-transparent p-5 text-center text-ink">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint-soft text-[28px] font-extrabold text-brand" aria-hidden="true">+</span>
            <b>{resumes.length === 0 ? 'Create your first resume' : 'Create another resume'}</b>
            <span className="text-sm text-text-muted">Tailor a version for each type of role</span>
          </button>
        </div>
      )}
      <UpgradePrompt trigger={prompt ?? 'second_resume'} open={prompt !== null} onClose={() => setPrompt(null)} />
    </div>
  );
}

export default function ResumesPage() {
  return (
    <Suspense fallback={null}>
      <ResumesInner />
    </Suspense>
  );
}
