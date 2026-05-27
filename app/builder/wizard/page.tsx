'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Check,
  Upload,
  PlusCircle,
  Loader2,
  SlidersHorizontal,
  FileText,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { TemplatePreview, type TemplateLayout } from '@/components/template-preview';
import Logo from '@/components/logo';

type ExperienceLevel = 'no-experience' | 'less-3' | '3-5' | '5-10' | '10-plus';
type StartType = 'fresh' | 'upload';

// ─── Catalog ───────────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string; description: string }[] = [
  { id: 'no-experience', label: 'No Experience',    description: 'Entry-level or first job' },
  { id: 'less-3',        label: 'Less Than 3 Years', description: 'Early career' },
  { id: '3-5',           label: '3 – 5 Years',       description: 'Mid career' },
  { id: '5-10',          label: '5 – 10 Years',      description: 'Experienced professional' },
  { id: '10-plus',       label: '10+ Years',         description: 'Senior / leadership' },
];

interface WizardTemplate {
  templateId: string;
  name: string;
  layout: TemplateLayout;
  accent: string;
  pro: boolean;
  categories: ExperienceLevel[];
  columns: 1 | 2;
  headshot: boolean;
  tag?: 'RECOMMENDED';
}

// Curated pool; surface the best 3 per experience level.
const TEMPLATES: WizardTemplate[] = [
  { templateId: 'classic',      name: 'Classic Professional', layout: 'classic',      accent: '#4AB7A6', pro: false, categories: ['no-experience','less-3','3-5','5-10','10-plus'], columns: 1, headshot: false },
  { templateId: 'modern',       name: 'Modern Sidebar',       layout: 'sidebar',      accent: '#1e293b', pro: false, categories: ['less-3','3-5','5-10','10-plus'],                columns: 2, headshot: true  },
  { templateId: 'executive',    name: 'Executive Bold',       layout: 'executive',    accent: '#0f172a', pro: true,  categories: ['5-10','10-plus'],                               columns: 1, headshot: false },
  { templateId: 'creative',     name: 'Creative Spectrum',    layout: 'creative',     accent: '#7c3aed', pro: true,  categories: ['3-5','5-10'],                                   columns: 2, headshot: true  },
  { templateId: 'minimal',      name: 'Academic Harvard',     layout: 'minimal',      accent: '#1d4ed8', pro: false, categories: ['no-experience','less-3','3-5','5-10','10-plus'], columns: 1, headshot: false },
  { templateId: 'simple',       name: 'Graduate Fresh',       layout: 'centered',     accent: '#0891b2', pro: false, categories: ['no-experience','less-3'],                       columns: 1, headshot: false },
  { templateId: 'bold-header',  name: 'Bold Impact',          layout: 'bold-header',  accent: '#4AB7A6', pro: true,  categories: ['3-5','5-10','10-plus'],                         columns: 1, headshot: false },
  { templateId: 'split-right',  name: 'Corporate Right',      layout: 'split-right',  accent: '#1d4ed8', pro: true,  categories: ['3-5','5-10','10-plus'],                         columns: 2, headshot: false },
  { templateId: 'timeline',     name: 'Journey Timeline',     layout: 'timeline',     accent: '#7c3aed', pro: true,  categories: ['3-5','5-10'],                                   columns: 1, headshot: false },
  { templateId: 'mono',         name: 'Engineer Console',     layout: 'mono',         accent: '#0d9488', pro: true,  categories: ['less-3','3-5','5-10'],                          columns: 1, headshot: false },
  { templateId: 'photo-card',   name: 'Portfolio Card',       layout: 'photo-card',   accent: '#2563eb', pro: true,  categories: ['3-5','5-10'],                                   columns: 1, headshot: true  },
  { templateId: 'compact',      name: 'Compact ATS',          layout: 'compact',      accent: '#475569', pro: true,  categories: ['no-experience','less-3','3-5','5-10','10-plus'], columns: 1, headshot: false },
  { templateId: 'serif',        name: 'Elegant Serif',        layout: 'serif',        accent: '#9f1239', pro: true,  categories: ['5-10','10-plus'],                               columns: 1, headshot: false },
  { templateId: 'split-accent', name: 'Aurora Split',         layout: 'split-accent', accent: '#7c3aed', pro: true,  categories: ['3-5','5-10','10-plus'],                         columns: 1, headshot: false },
];

const LEVEL_LABEL: Record<ExperienceLevel, string> = {
  'no-experience': 'no experience',
  'less-3':        'less than 3 years of experience',
  '3-5':           '3-5 years of experience',
  '5-10':          '5-10 years of experience',
  '10-plus':       '10+ years of experience',
};

// ─── Main Wizard ───────────────────────────────────────────────────────────

function WizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If entered via /builder/wizard?upload=1, jump straight to step 3 (start)
  // so the user can pick a file immediately — read from searchParams at mount
  // using the lazy initial-state pattern (avoids setState-in-effect).
  const wantsUpload = searchParams.get('upload') === '1';

  const [step, setStep] = useState<0 | 1 | 2 | 3>(() => (wantsUpload ? 3 : 0));
  const [experience, setExperience] = useState<ExperienceLevel | null>(() =>
    wantsUpload ? '3-5' : null
  );
  const [chosenTemplate, setChosenTemplate] = useState<string | null>(() =>
    wantsUpload ? 'classic' : null
  );
  const [startType, setStartType] = useState<StartType | null>(null);
  const [filterHeadshot, setFilterHeadshot] = useState<'all' | 'with' | 'without'>('all');
  const [filterColumns, setFilterColumns] = useState<'all' | 1 | 2>('all');
  const [creating, setCreating] = useState(false);

  // Upload flow state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Keep the experience persisted across reloads inside this wizard
  useEffect(() => {
    if (experience) sessionStorage.setItem('wizard.experience', experience);
  }, [experience]);
  useEffect(() => {
    if (!experience) {
      const saved = sessionStorage.getItem('wizard.experience') as ExperienceLevel | null;
      if (saved) setExperience(saved);
    }
  }, [experience]);

  const stepLabels = ['Intro', 'Experience', 'Template', 'Start'];

  // ─── Step renderers ──────────────────────────────────────────────────────

  const renderIntro = () => (
    <div className="min-h-[70vh] flex items-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full items-center max-w-5xl mx-auto">
        {/* Left */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-8 tracking-tight">
            Just three <span style={{ color: '#4AB7A6' }}>easy</span> steps
          </h1>
          <div className="space-y-6">
            {[
              'Whatever your job title or industry, pick a template to match your experience and style.',
              'Generate and add expertly written descriptions — tailored to your background.',
              'Customize the details and wrap it up. You\u2019re ready to send!',
            ].map((text, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div
                  className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center flex-shrink-0"
                  style={{ fontSize: 14 }}
                >
                  {i + 1}
                </div>
                <p className="text-slate-700 text-base leading-relaxed pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — stat + next */}
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="relative w-full max-w-[320px] aspect-[4/5] bg-gradient-to-br from-violet-100 to-teal-50 rounded-3xl p-6 overflow-hidden shadow-sm">
            <div className="absolute inset-4 bg-white/70 rounded-2xl backdrop-blur-sm border border-white/80 flex items-center justify-center">
              <div className="w-[70%]">
                <TemplatePreview layout="classic" accent="#4AB7A6" />
              </div>
            </div>
            {[
              { top: '30%', icon: PlusCircle },
              { top: '48%', icon: PlusCircle },
              { top: '66%', icon: PlusCircle },
            ].map((it, i) => (
              <div
                key={i}
                className="absolute left-4 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg"
                style={{ top: it.top }}
              >
                <it.icon size={20} />
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            className="w-full max-w-[320px] py-4 rounded-full font-semibold text-white text-base shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor: '#34D399' }}
          >
            Next
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-violet-50 px-4 py-2 rounded-full">
            <span className="font-mono tabular-nums font-bold text-slate-900">12 : 01</span>
            <span className="text-xs">Average time to create a resume</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 text-center">
        How long have you been working?
      </h1>
      <p className="text-slate-500 mb-12 text-center">
        We&apos;ll find the best templates for your experience level.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 max-w-5xl w-full">
        {EXPERIENCE_LEVELS.map((lvl) => {
          const active = experience === lvl.id;
          return (
            <button
              key={lvl.id}
              onClick={() => {
                setExperience(lvl.id);
                setTimeout(() => setStep(2), 220);
              }}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                active ? 'border-[#4AB7A6] bg-teal-50 shadow-md' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold text-slate-900 text-sm mb-1">{lvl.label}</div>
              <div className="text-xs text-slate-500">{lvl.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderTemplate = () => {
    const filtered = TEMPLATES.filter((t) => {
      if (experience && !t.categories.includes(experience)) return false;
      if (filterHeadshot === 'with' && !t.headshot) return false;
      if (filterHeadshot === 'without' && t.headshot) return false;
      if (filterColumns !== 'all' && t.columns !== filterColumns) return false;
      return true;
    });
    // First 3 get the "RECOMMENDED" tag
    const display = filtered.map((t, i) => ({ ...t, tag: i < 3 ? ('RECOMMENDED' as const) : undefined }));

    return (
      <div>
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Best templates for {experience ? LEVEL_LABEL[experience] : 'your experience'}
          </h1>
          <p className="text-slate-500">You can always change your template later.</p>
        </div>

        <div className="grid grid-cols-12 gap-6 max-w-6xl mx-auto">
          {/* Filters */}
          <aside className="col-span-12 lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Filters</h3>
              <button
                onClick={() => { setFilterHeadshot('all'); setFilterColumns('all'); }}
                className="text-sm text-slate-500 underline hover:text-slate-700"
              >
                Clear filters
              </button>
            </div>

            {/* Filters are one-of-many picks, so they render as radios (not
                checkboxes). Clicking the currently-selected option clears it
                back to "Any". Each group is independent — selecting Headshot
                does not disable Columns. */}
            <div>
              <div className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Headshot
              </div>
              {[
                { id: 'all' as const, label: 'Any' },
                { id: 'with' as const, label: 'With photo' },
                { id: 'without' as const, label: 'Without photo' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-700 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="filter-headshot"
                    className="text-[#4AB7A6] border-slate-300 focus:ring-[#4AB7A6]"
                    checked={filterHeadshot === opt.id}
                    onChange={() => setFilterHeadshot(opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-900 mb-2">Columns</div>
              {[
                { id: 'all' as const, label: 'Any' },
                { id: 1 as const, label: '1 column' },
                { id: 2 as const, label: '2 columns' },
              ].map((opt) => (
                <label key={String(opt.id)} className="flex items-center gap-2 text-sm text-slate-700 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="filter-columns"
                    className="text-[#4AB7A6] border-slate-300 focus:ring-[#4AB7A6]"
                    checked={filterColumns === opt.id}
                    onChange={() => setFilterColumns(opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </aside>

          {/* Template grid */}
          <div className="col-span-12 lg:col-span-9">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {display.map((t) => {
                const selected = chosenTemplate === t.templateId;
                return (
                  <button
                    key={t.templateId}
                    onClick={() => setChosenTemplate(t.templateId)}
                    className={`group relative text-left rounded-2xl overflow-hidden border-2 transition-all ${
                      selected ? 'border-[#2563eb] shadow-xl ring-4 ring-blue-100' : 'border-transparent hover:shadow-lg'
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="aspect-[8.5/11] bg-slate-50 border border-slate-200 rounded-t-2xl overflow-hidden relative">
                      <TemplatePreview layout={t.layout} accent={t.accent} />
                      {t.tag && (
                        <div className="absolute bottom-3 right-3 text-[10px] font-bold bg-amber-300 text-amber-900 rounded px-2 py-1 shadow-sm">
                          {t.tag}
                        </div>
                      )}
                      {t.pro && (
                        <div className="absolute top-3 left-3 text-[10px] font-bold bg-amber-400 text-amber-900 rounded-full px-2 py-0.5 shadow-sm">
                          PRO
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <div className="text-sm font-semibold text-slate-900 truncate">{t.name}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {[t.accent, '#2563eb', '#f97316', '#f59e0b', '#64748b'].map((c, i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {display.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                No templates match these filters. <button onClick={() => { setFilterHeadshot('all'); setFilterColumns('all'); }} className="underline text-[#4AB7A6] font-semibold">Clear filters</button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setStep(3)}
            className="text-sm font-semibold text-slate-700 underline"
          >
            Choose later
          </button>
          <button
            onClick={() => chosenTemplate && setStep(3)}
            disabled={!chosenTemplate}
            className={`px-8 py-3 rounded-full font-semibold text-white transition-all ${
              chosenTemplate ? 'shadow-md hover:shadow-lg' : 'opacity-40 cursor-not-allowed'
            }`}
            style={{ backgroundColor: '#34D399' }}
          >
            Use this template
          </button>
        </div>
      </div>
    );
  };

  const renderStart = () => {
    const fileSizeMB = uploadFile ? (uploadFile.size / 1024 / 1024).toFixed(2) : '0';
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 text-center">
          Are you uploading an existing resume?
        </h1>
        <p className="text-slate-500 mb-12 text-center">
          Just review, edit, and update it with new information
        </p>

        {/* Hidden file input, triggered by the Upload card */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setUploadError(null);
            setUploadFile(f);
            setStartType('upload');
            // reset the input so selecting the same file again re-triggers change
            e.target.value = '';
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl w-full">
          {/* Upload */}
          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              fileInputRef.current?.click();
            }}
            disabled={uploading}
            className={`relative p-10 rounded-2xl border-2 text-center bg-white transition-all ${
              uploadFile
                ? 'border-[#4AB7A6] bg-teal-50 shadow-md'
                : startType === 'upload'
                ? 'border-[#4AB7A6] bg-teal-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            } ${uploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-100 text-violet-700 text-[10px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI-powered
            </div>
            <div className="mx-auto w-16 h-16 mb-4 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-violet-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 mb-2">Yes, upload my resume</div>
            <div className="text-sm text-slate-500">
              We&apos;ll parse it and pre-fill the builder with your info
            </div>

            {uploadFile && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-teal-200 text-xs text-slate-700 max-w-full">
                <FileText className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                <span className="font-medium truncate max-w-[200px]">{uploadFile.name}</span>
                <span className="text-slate-400">· {fileSizeMB} MB</span>
              </div>
            )}

            <div className="mt-4 text-[11px] text-slate-400">
              PDF, DOCX or TXT — up to 8 MB
            </div>
          </button>

          {/* Fresh */}
          <button
            type="button"
            onClick={() => {
              setUploadFile(null);
              setUploadError(null);
              setStartType('fresh');
            }}
            disabled={uploading}
            className={`p-10 rounded-2xl border-2 text-center bg-white transition-all ${
              startType === 'fresh' && !uploadFile
                ? 'border-[#4AB7A6] bg-teal-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            } ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <div className="mx-auto w-16 h-16 mb-4 rounded-2xl bg-orange-100 flex items-center justify-center">
              <PlusCircle className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 mb-2">No, start from scratch</div>
            <div className="text-sm text-slate-500">
              We&apos;ll guide you step-by-step, with AI-written suggestions
            </div>
          </button>
        </div>

        {uploadError && (
          <div className="mt-6 max-w-4xl w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 leading-relaxed">{uploadError}</div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between w-full max-w-4xl">
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={(!startType && !uploadFile) || creating || uploading}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white transition-all ${
              (startType || uploadFile) && !creating && !uploading
                ? 'shadow-md hover:shadow-lg'
                : 'opacity-40 cursor-not-allowed'
            }`}
            style={{ backgroundColor: '#34D399' }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reading your resume…
              </>
            ) : creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : uploadFile ? (
              <>
                <Sparkles className="w-4 h-4" />
                Parse & open builder
              </>
            ) : (
              <>
                Next <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // ─── Finish: create resume, route to builder ──────────────────────────────

  const handleFinish = async () => {
    const templateId = chosenTemplate ?? 'classic';

    // ── Upload path — user chose to import an existing resume ──
    if (uploadFile) {
      setUploading(true);
      setUploadError(null);
      try {
        const form = new FormData();
        form.append('file', uploadFile);
        form.append('template_id', templateId);

        const res = await fetch('/api/resume/import', {
          method: 'POST',
          body: form,
        });

        if (res.status === 401) {
          router.push('/login?redirect=/builder/wizard');
          return;
        }

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.resume_id) {
          setUploadError(
            json?.error ||
              'We couldn\'t parse that resume. Try a different file or start from scratch.'
          );
          setUploading(false);
          return;
        }

        try {
          sessionStorage.setItem(
            'dashboard_toast',
            `Imported ${json.extracted?.work_count ?? 0} jobs and ${json.extracted?.skills_count ?? 0} skills. Review and edit below.`
          );
        } catch {}

        router.push(
          `/builder/resume/${json.resume_id}?imported=1&template=${templateId}`
        );
        return;
      } catch (err) {
        console.error('[wizard] upload failed:', err);
        setUploadError(
          'Upload failed. Please check your connection and try again.'
        );
        setUploading(false);
        return;
      }
    }

    // ── Fresh start path ──
    setCreating(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getTemplateStarterData } = require('@/lib/example-to-resume') as typeof import('@/lib/example-to-resume');
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'My Resume',
          template_id: templateId,
          data: getTemplateStarterData(),
        }),
      });
      if (res.status === 401) {
        router.push('/login?redirect=/builder/wizard');
        return;
      }
      if (res.ok) {
        const { resume } = await res.json();
        router.push(`/builder/resume/${resume.id}?wizard=1&template=${templateId}`);
        return;
      }
      setUploadError('Failed to create resume. Please try again.');
    } catch {
      setUploadError('Failed to create resume. Please check your connection and try again.');
    }
    setCreating(false);
  };

  // ─── Top progress + step body ────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo href="/" size="md" />
          {/* Step indicator */}
          <div className="hidden md:flex items-center gap-3">
            {stepLabels.map((label, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-2 ${done ? 'text-emerald-600' : current ? 'text-slate-900' : 'text-slate-400'}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        done
                          ? 'bg-emerald-500 text-white'
                          : current
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-xs font-semibold">{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && <div className="w-6 h-px bg-slate-200" />}
                </div>
              );
            })}
          </div>
          {/* Header shows a "Dashboard" shortcut on the intro step only.
              Steps 1-3 already have a primary "Back" button in the body so
              we hide the header duplicate to avoid confusion. */}
          {step === 0 ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {step === 0 && renderIntro()}
          {step === 1 && renderExperience()}
          {step === 2 && renderTemplate()}
          {step === 3 && renderStart()}
        </div>
      </main>
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={null}>
      <WizardInner />
    </Suspense>
  );
}
