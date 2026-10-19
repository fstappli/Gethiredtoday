'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLogo } from '@/components/auth-bits';
import ResumeThumb from '@/components/resume-thumb';
import type { TemplateLayout } from '@/components/template-preview';
import { createClient } from '@/lib/supabase';

type Start = 'upload' | 'scratch';
type Look = { id: string; layout: TemplateLayout; accent: string; title: string };

// Free templates the builder already supports.
const LOOKS: Look[] = [
  { id: 'classic', layout: 'classic', accent: '#0B6E5F', title: 'Classic' },
  { id: 'modern', layout: 'sidebar', accent: '#1e293b', title: 'Modern Sidebar' },
  { id: 'simple', layout: 'centered', accent: '#0891b2', title: 'Simple' },
];

const LEVELS = ['Student or graduate', '1 to 4 years', '5 to 10 years', '10+ years'];
const MAX_BYTES = 5 * 1024 * 1024;

function Onboarding() {
  const router = useRouter();
  const sp = useSearchParams();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState('');
  const [level, setLevel] = useState(LEVELS[1]);
  const [where, setWhere] = useState('');
  const [start, setStart] = useState<Start>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [look, setLook] = useState(sp.get('template') && LOOKS.some((l) => l.id === sp.get('template')) ? (sp.get('template') as string) : 'classic');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      const m = (user?.user_metadata ?? {}) as Record<string, string | undefined>;
      const full = m.full_name || m.name || '';
      setFirstName(full.split(' ')[0] ?? '');
      if (m.target_role) setRole(m.target_role);
      if (m.target_location) setWhere(m.target_location);
    });
  }, []);

  useEffect(() => { headingRef.current?.focus(); }, [step]);

  const pickFile = (f: File | null) => {
    setError(null);
    if (!f) return setFile(null);
    if (f.size > MAX_BYTES) return setError('That file is over 5 MB. Please choose a smaller one.');
    if (!/\.(pdf|docx?|txt)$/i.test(f.name)) return setError('Please choose a PDF or Word file.');
    setFile(f);
  };

  const next = () => {
    setError(null);
    if (step === 1 && !role.trim()) return setError('Tell us the job title you are going for.');
    if (step === 2 && start === 'upload' && !file) return setError('Choose a resume file, or switch to Start fresh.');
    setStep((s) => Math.min(3, s + 1));
  };

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      await createClient().auth.updateUser({ data: { target_role: role.trim(), experience_level: level, target_location: where.trim() } });
    } catch { /* profile hints are best-effort */ }
    const from = sp.get('from');
    if (start === 'upload' && file) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('template_id', look);
      try {
        const res = await fetch('/api/resume/import', { method: 'POST', body: fd });
        const body = (await res.json()) as { resume_id?: string; error?: string };
        if (res.ok && body.resume_id) return router.push(`/builder/resume/${body.resume_id}`);
        setBusy(false);
        return setError(body.error || 'We could not read that file. Try another, or start fresh.');
      } catch {
        setBusy(false);
        return setError('Upload failed. Check your connection and try again.');
      }
    }
    const q = new URLSearchParams({ template: look });
    if (role.trim()) q.set('role', role.trim());
    if (from) q.set('from', from);
    router.push(`/builder/resume/new?${q.toString()}`);
  };

  const h1 = 'font-display m-0 text-[34px] leading-[1.05] tracking-[-1.2px] outline-none min-[761px]:text-[40px]';

  return (
    <div className="flex min-h-screen flex-col items-center px-5 pb-12 pt-6">
      <div className="flex w-[min(760px,100%)] items-center gap-4">
        <AuthLogo size={36} />
        <div className="grid flex-1 grid-cols-3 gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label="Setup progress">
          {[1, 2, 3].map((n) => <span key={n} className={`h-2 rounded ${step >= n ? 'bg-brand' : 'bg-[#E0DCD1]'}`} />)}
        </div>
        <span className="whitespace-nowrap text-sm font-bold text-text-muted">Step {step} of 3</span>
      </div>

      <main className="mt-10 flex w-[min(760px,100%)] flex-col gap-[22px]">
        {step === 1 && (
          <>
            <div className="flex flex-col gap-1.5">
              {firstName && <span className="font-extrabold text-brand">Hi {firstName}, nice to meet you.</span>}
              <h1 ref={headingRef} tabIndex={-1} className={h1}>What job are you going for?</h1>
              <p className="m-0 text-[17px] text-text-muted">We&apos;ll tailor suggestions, keywords and job matches to it. You can change it later.</p>
            </div>
            <label className="flex flex-col gap-1.5 font-bold">
              Target job title
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior UX Designer" autoComplete="organization-title" className="min-h-[56px] rounded-[14px] border-[1.5px] border-brand bg-white p-4 text-lg font-medium" />
            </label>
            <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
              <legend className="mb-2.5 font-bold">Experience level</legend>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <label key={l} className={`flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-4 ${level === l ? 'border-brand bg-mint-soft font-bold' : 'border-line-strong bg-white font-semibold'}`}>
                    <input type="radio" name="lvl" checked={level === l} onChange={() => setLevel(l)} className="accent-brand" />
                    {l}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-1.5 font-bold">
              Where do you want to work?
              <input value={where} onChange={(e) => setWhere(e.target.value)} placeholder="City, or Remote" className="min-h-[52px] rounded-[14px] border-[1.5px] border-line-strong bg-white p-3.5 text-base font-medium" />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 ref={headingRef} tabIndex={-1} className={h1}>How would you like to start?</h1>
              <p className="m-0 text-[17px] text-text-muted">Pick whatever is easiest. Every path ends with a polished resume.</p>
            </div>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]" role="radiogroup" aria-label="How to start">
              {([
                { id: 'upload', title: 'Upload my resume', body: 'PDF or Word. We fill every section in seconds.', badge: 'FASTEST' },
                { id: 'scratch', title: 'Start fresh', body: 'Answer a few questions and AI drafts it for you.' },
              ] as { id: Start; title: string; body: string; badge?: string }[]).map((o) => (
                <label key={o.id} className={`flex cursor-pointer flex-col gap-2 rounded-[20px] bg-white p-5 ${start === o.id ? 'border-2 border-brand' : 'border-[1.5px] border-line'}`}>
                  <span className="flex items-center justify-between">
                    <input type="radio" name="start" checked={start === o.id} onChange={() => setStart(o.id)} className="m-0 h-[22px] w-[22px] accent-brand" />
                    {o.badge && <span className="rounded-full bg-sun px-2 py-0.5 text-[11px] font-extrabold">{o.badge}</span>}
                  </span>
                  <b className="font-display text-xl">{o.title}</b>
                  <span className="text-[15px] leading-snug text-text-muted">{o.body}</span>
                </label>
              ))}
            </div>
            {start === 'upload' && (
              <label className="relative flex cursor-pointer items-center gap-3.5 rounded-[18px] border-2 border-dashed border-[#C9C4B6] bg-white p-[22px] focus-within:outline focus-within:outline-[3px] focus-within:outline-brand">
                <span className="grid h-12 w-12 flex-none place-items-center rounded-[14px] bg-mint-soft">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B6E5F" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
                </span>
                <span>
                  <b>{file ? file.name : 'Drop your resume here or choose a file'}</b><br />
                  <span className="text-sm text-text-muted">PDF or Word, up to 5 MB</span>
                </span>
                <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Choose your resume file" />
              </label>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex flex-col gap-1.5">
              <h1 ref={headingRef} tabIndex={-1} className={h1}>Pick a look. You can switch any time.</h1>
              <p className="m-0 text-[17px] text-text-muted">{role ? `Free templates that work well for ${role} roles:` : 'Free templates to start with:'}</p>
            </div>
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(210px,100%),1fr))]">
              {LOOKS.map((l) => (
                <button key={l.id} type="button" onClick={() => setLook(l.id)} aria-pressed={look === l.id} className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-[18px] bg-white p-3.5 text-ink ${look === l.id ? 'border-2 border-brand' : 'border-2 border-line'}`}>
                  <ResumeThumb layout={l.layout} accent={l.accent} width={168} className="rounded shadow-[0_8px_20px_rgba(13,27,25,.12)]" />
                  <b>{l.title}</b>
                </button>
              ))}
            </div>
          </>
        )}

        {error && <p role="alert" className="m-0 rounded-xl bg-danger-soft px-3.5 py-3 text-sm font-semibold text-danger-ink">{error}</p>}

        <div className="mt-2 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button type="button" onClick={() => { setError(null); setStep((s) => s - 1); }} className="min-h-[54px] rounded-[14px] border-[1.5px] border-line-strong bg-white px-[22px] font-bold">Back</button>
          ) : (
            <Link href="/dashboard" className="py-3.5 font-bold text-text-muted">Skip for now</Link>
          )}
          {step < 3 ? (
            <button type="button" onClick={next} className="min-h-[54px] rounded-[14px] bg-brand px-7 text-[17px] font-extrabold text-white hover:bg-brand-dark">Continue</button>
          ) : (
            <button type="button" onClick={finish} disabled={busy} className="min-h-[54px] rounded-[14px] bg-brand px-7 text-[17px] font-extrabold text-white hover:bg-brand-dark disabled:opacity-60">
              {busy ? (start === 'upload' ? 'Reading your resume...' : 'Opening...') : 'Open my resume'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <Onboarding />
    </Suspense>
  );
}
