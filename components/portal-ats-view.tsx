'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import UpgradePrompt from '@/components/upgrade-prompt';
import { clearLazyDraft, readLazyDraft } from '@/lib/lazy-draft';
import { resumeDataToText } from '@/lib/ats';
import type { ATSCheckResult, ResumeData } from '@/types';

interface ResumeRow { id: string; title: string; data: ResumeData; ats_score: number | null; finalized_at: string | null }

const SECTION_LABELS: Array<[keyof ATSCheckResult['sections'], string]> = [
  ['formatting', 'Formatting & parsing'],
  ['contact', 'Contact details'],
  ['keywords', 'Keywords'],
  ['experience', 'Measurable impact'],
  ['structure', 'Length & structure'],
];

const barColor = (s: number) => (s >= 80 ? '#0B6E5F' : s >= 60 ? '#E0A800' : '#C2410C');
const ringColor = (s: number) => (s >= 80 ? '#5FD3B3' : s >= 60 ? '#FFD166' : '#F08A5D');
const field = 'rounded-xl border-[1.5px] border-line-strong bg-white p-3 text-base font-medium';

export default function PortalAtsView() {
  const sp = useSearchParams();
  const claim = sp.get('claim') === '1';
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [resumeId, setResumeId] = useState('');
  const [pasted, setPasted] = useState('');
  const [job, setJob] = useState('');
  const [result, setResult] = useState<ATSCheckResult | null>(null);
  const [lastTitle, setLastTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(false);
  const claimed = useRef(false);

  const run = useCallback(
    async (text: string, jd: string, title: string, id: string) => {
      if (text.trim().length < 50) { setError('Add a resume or paste at least 50 characters of resume text.'); return; }
      setBusy(true);
      setError(null);
      try {
        const res = await fetch('/api/ats/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: text.trim(), jobDescription: jd.trim() || undefined }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setError(typeof data.error === 'string' ? data.error : 'The check failed. Please try again.'); return; }
        if (typeof data.overall_score !== 'number' || !data.sections) { setError('Unexpected response. Please try again.'); return; }
        setResult(data);
        track('ats_check_complete', { score: data.overall_score, logged_in: true });
        setLastTitle(title);
        if (id) {
          fetch(`/api/resume/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ats_score: data.overall_score }) }).catch(() => undefined);
          setResumes((rs) => rs.map((r) => (r.id === id ? { ...r, ats_score: data.overall_score } : r)));
        }
      } catch {
        setError('Network error. Please check your connection and try again.');
      } finally {
        setBusy(false);
      }
    },
    []
  );

  useEffect(() => {
    (async () => {
      const [sub, r] = await Promise.all([
        fetch('/api/user/subscription-status').then((x) => x.json()).catch(() => ({ isPro: false })),
        fetch('/api/resume', { cache: 'no-store' }).then((x) => (x.ok ? x.json() : { resumes: [] })).catch(() => ({ resumes: [] })),
      ]);
      setIsPro(Boolean(sub.isPro));
      const list: ResumeRow[] = r.resumes ?? [];
      setResumes(list);
      const pick = list.find((x) => x.finalized_at) ?? list[0];
      if (pick) setResumeId(pick.id);

      // Lazy registration: carry the logged-out ATS check into the account.
      if (claim && !claimed.current) {
        claimed.current = true;
        const d = readLazyDraft();
        if (d && d.kind === 'ats') {
          setPasted(d.resumeText);
          setJob(d.jobText ?? '');
          setResumeId('');
          clearLazyDraft();
          run(d.resumeText, d.jobText ?? '', 'Your resume', '');
        }
      }
    })();
  }, [claim, run]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const picked = resumes.find((x) => x.id === resumeId);
    const text = picked?.data ? resumeDataToText(picked.data) : pasted;
    run(text, job, picked?.title ?? 'Your resume', picked?.id ?? '');
  };

  const score = result?.overall_score ?? 0;
  const fixes = result ? (result.top_suggestions?.length ? result.top_suggestions : result.top_issues ?? []) : [];
  const showPasteBox = resumes.length === 0 || resumeId === '';
  const prev = resumes.find((r) => r.id === resumeId)?.ats_score;

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-[18px] px-5 pb-14 pt-7">
      <div>
        <h1 className="font-display m-0 text-[34px] tracking-[-0.8px]">ATS check</h1>
        <p className="mt-1 text-text-muted">Score a saved resume, optionally against a specific job ad.</p>
      </div>
      <div className="flex flex-wrap items-start gap-5">
        <form onSubmit={submit} className="flex min-w-0 flex-[1_1_360px] flex-col gap-3.5 rounded-[22px] border border-line bg-white p-[22px]">
          <label className="flex flex-col gap-1.5 font-bold">Resume
            <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className={field}>
              {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}{r.ats_score != null ? ` · last score ${r.ats_score}` : ''}</option>)}
              <option value="">Paste resume text instead</option>
            </select>
          </label>
          {showPasteBox ? (
            <label className="flex flex-col gap-1.5 font-bold">Resume text
              <textarea rows={6} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Paste the plain text of your resume" className={`${field} font-normal`} />
            </label>
          ) : null}
          <label className="flex flex-col gap-1.5 font-bold">Job ad (optional)
            <textarea rows={7} value={job} onChange={(e) => setJob(e.target.value)} placeholder="Paste a job description to match keywords line by line" className={`${field} text-[15px] font-normal`} />
          </label>
          {error ? <p role="alert" className="m-0 font-semibold text-danger-ink">{error}</p> : null}
          <button type="submit" disabled={busy} className="min-h-[54px] rounded-[14px] bg-brand text-base font-extrabold text-white hover:bg-brand-dark disabled:opacity-60">
            {busy ? 'Checking...' : 'Run check'}
          </button>
        </form>

        <section className="flex min-w-0 flex-[999_1_520px] flex-col gap-3.5" aria-live="polite">
          {!result ? (
            <div className="rounded-[22px] border border-line bg-white p-8 text-center text-text-muted">
              <b className="font-display block text-xl text-ink">Your score will appear here</b>
              <span>Pick a resume and run the check. It takes a few seconds.</span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-5 rounded-[22px] bg-ink p-[22px] text-white">
                <div role="img" aria-label={`Score ${score}`} className="grid h-[100px] w-[100px] flex-none place-items-center rounded-full" style={{ background: `conic-gradient(${ringColor(score)} 0 ${score}%, #2A3A37 ${score}%)` }}>
                  <div className="grid h-[82px] w-[82px] place-items-center rounded-full bg-ink"><span className="font-display text-[32px] font-extrabold">{score}</span></div>
                </div>
                <div className="min-w-[220px] flex-1">
                  <b className="font-display text-[22px]">{lastTitle}</b>
                  <p className="mb-0 mt-1 text-on-dark-muted">
                    {prev != null && prev !== score ? `${score > prev ? 'Up' : 'Down'} ${Math.abs(score - prev)} points since the last check. ` : ''}
                    {fixes.length ? `${Math.min(3, fixes.length)} quick fixes below.` : 'Nothing to fix.'}
                  </p>
                </div>
                {resumeId ? <Link href={`/builder/resume/${resumeId}`} className="rounded-xl bg-mint-bright px-[18px] py-[13px] font-extrabold text-ink no-underline">Fix in builder</Link> : null}
              </div>

              <div className="flex flex-col gap-3 rounded-[22px] border border-line bg-white p-[22px]">
                <h2 className="font-display m-0 text-xl">Top fixes</h2>
                <ol className="m-0 flex list-decimal flex-col gap-2 pl-5 leading-normal">
                  {fixes.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}
                </ol>
              </div>

              {isPro ? (
                <div className="flex flex-col gap-3.5 rounded-[22px] border border-line bg-white p-[22px]">
                  <h2 className="font-display m-0 text-xl">Breakdown</h2>
                  {SECTION_LABELS.map(([key, label]) => {
                    const s = result.sections[key];
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-[15px]"><span className="font-semibold">{label}</span><span>{s.score}/100</span></div>
                        <div className="mt-1.5 h-2.5 rounded-[5px] bg-[#EEEBE3]"><div className="h-2.5 rounded-[5px]" style={{ width: `${s.score}%`, background: barColor(s.score) }} /></div>
                        {[...s.issues, ...s.suggestions].length ? (
                          <ul className="mb-0 mt-2 list-disc pl-5 text-sm text-text-muted">
                            {s.issues.map((t, i) => <li key={`i${i}`}>{t}</li>)}
                            {s.suggestions.map((t, i) => <li key={`s${i}`}>{t}</li>)}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3.5 rounded-[18px] bg-sun-soft px-[18px] py-4">
                  <span className="min-w-[280px] flex-1 leading-normal"><b>See all 30 checks</b> and line-by-line job ad matching with Pro.</span>
                  <button type="button" onClick={() => setPrompt(true)} className="min-h-[44px] rounded-[10px] bg-ink px-3.5 font-extrabold text-white">Open the full report</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      <UpgradePrompt trigger="full_ats_report" open={prompt} onClose={() => setPrompt(false)} />
    </main>
  );
}
