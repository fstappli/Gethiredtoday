'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Zap,
  Award,
  Globe,
  Code,
  Heart,
  Plus,
  Trash2,
  Loader2,
  Pencil,
  Check,
  X,
  Download,
  Camera,
  Lightbulb,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import ClassicTemplate from '@/components/resume-templates/classic';
import ModernTemplate from '@/components/resume-templates/modern';
import MinimalTemplate from '@/components/resume-templates/minimal';
import ExecutiveTemplate from '@/components/resume-templates/executive';
import CreativeTemplate from '@/components/resume-templates/creative';
import SimpleTemplate from '@/components/resume-templates/simple';
import {
  BoldHeaderTemplate,
  SplitRightTemplate,
  TimelineTemplate,
  MonoTemplate,
  PhotoCardTemplate,
  CompactTemplate,
  SerifTemplate,
  SplitAccentTemplate,
} from '@/components/resume-templates/pro-templates';
import { createClient } from '@/lib/supabase';
import { isProActive } from '@/lib/subscription';
import { resumeDataToText, scoreResume } from '@/lib/ats';
import { SuggestionPanel } from '@/components/suggestion-panel';
import {
  ProTipBox,
  SectionTipPage,
  RelatedTitles,
  WarningPill,
  SECTION_TIPS,
} from '@/components/wizard-helpers';
import { TemplatePickerPopover } from '@/components/template-picker-popover';
import ProUpgradeModal from '@/components/pro-upgrade-modal';

import { generateId } from '@/lib/utils';
import type {
  ResumeData,
  WorkExperience,
  Education,
  Skill,
  Certification,
  Language,
  Project,
  VolunteerWork,
  CustomSection,
} from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_RESUME: ResumeData = {
  contact: {
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    github: '',
    photo_url: '',
  },
  summary: '',
  work_experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  volunteer_work: [],
  projects: [],
  custom_sections: [],
};

const COLOR_OPTIONS = [
  { id: 'teal',   label: 'Teal',   bg: '#0d9488' },
  { id: 'blue',   label: 'Blue',   bg: '#2563eb' },
  { id: 'purple', label: 'Purple', bg: '#7c3aed' },
  { id: 'rose',   label: 'Rose',   bg: '#e11d48' },
  { id: 'slate',  label: 'Slate',  bg: '#475569' },
] as const;

type ColorScheme = (typeof COLOR_OPTIONS)[number]['id'];
type FontSize = 'small' | 'medium' | 'large';
type Template =
  | 'classic' | 'modern' | 'minimal' | 'executive' | 'creative' | 'simple'
  | 'bold-header' | 'split-right' | 'timeline' | 'mono'
  | 'photo-card' | 'compact' | 'serif' | 'split-accent';

import type { TemplateLayout } from '@/components/template-preview';

const TEMPLATES: { id: Template; label: string; isPro: boolean; layout: TemplateLayout; accent: string }[] = [
  { id: 'classic',      label: 'Classic',       isPro: false, layout: 'classic',      accent: '#4AB7A6' },
  { id: 'modern',       label: 'Modern',        isPro: true,  layout: 'sidebar',      accent: '#1e293b' },
  { id: 'minimal',      label: 'Minimal',       isPro: true,  layout: 'minimal',      accent: '#1d4ed8' },
  { id: 'executive',    label: 'Executive',     isPro: true,  layout: 'executive',    accent: '#0f172a' },
  { id: 'creative',     label: 'Creative',      isPro: true,  layout: 'creative',     accent: '#7c3aed' },
  { id: 'simple',       label: 'Simple',        isPro: true,  layout: 'centered',     accent: '#0891b2' },
  // New pro templates
  { id: 'bold-header',  label: 'Bold Header',   isPro: true,  layout: 'bold-header',  accent: '#4AB7A6' },
  { id: 'split-right',  label: 'Split Right',   isPro: true,  layout: 'split-right',  accent: '#1d4ed8' },
  { id: 'timeline',     label: 'Timeline',      isPro: true,  layout: 'timeline',     accent: '#7c3aed' },
  { id: 'mono',         label: 'Mono',          isPro: true,  layout: 'mono',         accent: '#0d9488' },
  { id: 'photo-card',   label: 'Photo Card',    isPro: true,  layout: 'photo-card',   accent: '#2563eb' },
  { id: 'compact',      label: 'Compact ATS',   isPro: true,  layout: 'compact',      accent: '#475569' },
  { id: 'serif',        label: 'Elegant Serif', isPro: true,  layout: 'serif',        accent: '#9f1239' },
  { id: 'split-accent', label: 'Split Accent',  isPro: true,  layout: 'split-accent', accent: '#7c3aed' },
];

// Templates that have a visible photo / avatar slot in their layout.
// Used to conditionally show the Profile Photo upload in the Contact editor
// so the form stays in sync with the preview (no stale photo when you switch
// to a template that has no image slot).
const PHOTO_TEMPLATES: readonly Template[] = ['modern', 'photo-card'] as const;
const templateSupportsPhoto = (t: Template) => PHOTO_TEMPLATES.includes(t);

const SECTIONS = [
  { id: 'contact',       label: 'Contact',        Icon: User },
  { id: 'summary',       label: 'Summary',         Icon: FileText },
  { id: 'experience',    label: 'Experience',      Icon: Briefcase },
  { id: 'education',     label: 'Education',       Icon: GraduationCap },
  { id: 'skills',        label: 'Skills',          Icon: Zap },
  { id: 'certifications',label: 'Certifications',  Icon: Award },
  { id: 'languages',     label: 'Languages',       Icon: Globe },
  { id: 'projects',      label: 'Projects',        Icon: Code },
  { id: 'volunteer',     label: 'Volunteer',       Icon: Heart },
  { id: 'custom',        label: 'Custom',          Icon: Plus },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

// ---------------------------------------------------------------------------
// Small shared helpers
// ---------------------------------------------------------------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-gray-500 mb-1">{children}</label>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
      {title}
    </h2>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  );
}

function AIButton({
  onClick,
  loading,
  children,
}: {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-medium bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Zap className="w-3.5 h-3.5" />
      )}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ResumeBuilderPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeId = params.id;

  const initialTemplate = (searchParams.get('template') as Template | null) ?? 'classic';

  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME);
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('teal');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [activeSection, setActiveSection] = useState<SectionId>('contact');
  // In wizard mode we show a tip-page before entering each section the first time
  const [tipSeen, setTipSeen] = useState<Record<string, boolean>>({});
  const [showTipOverride, setShowTipOverride] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('Untitled Resume');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('Untitled Resume');
  const [saved, setSaved] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [bulletsLoading, setBulletsLoading] = useState<Record<string, boolean>>({});
  const [newSkillName, setNewSkillName] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const isWizard = searchParams.get('wizard') === '1';
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [isPro, setIsPro] = useState(false);
  // Full-screen paywall modal — shown when a free user hits a Pro-gated action.
  const [proModal, setProModal] = useState<null | { trigger: 'pdf' | 'word'; templateLabel?: string }>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const shouldDownload = searchParams.get('download') === '1';

  // Fetch Pro status (including the post-cancel grace period — users keep
  // Pro features until subscription_ends_at passes).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_ends_at')
        .eq('id', user.id)
        .single();
      setIsPro(isProActive(profile));
    });
  }, []);

  // ─── Local draft safety net ────────────────────────────────────────────
  // Every change to the resume is mirrored to localStorage within a few
  // hundred milliseconds, keyed by resume id. If the page ever reloads for
  // any reason (auth refresh, tab recovery, webview quirk), we restore from
  // localStorage the next time this builder opens — so a user never loses
  // typing they haven't explicitly saved.
  const draftStorageKey = resumeId ? `ght:resume-draft:${resumeId}` : null;
  interface DraftSnapshot {
    v: 1;
    savedAt: number;
    title: string;
    template: Template;
    colorScheme: ColorScheme;
    fontSize: FontSize;
    data: ResumeData;
  }

  // Load from API on mount, then reconcile with any local draft that's newer
  useEffect(() => {
    if (!resumeId || resumeId === 'new') { setDataLoaded(true); return; }

    // Peek at any local draft first so we can compare to server timestamps.
    let localDraft: DraftSnapshot | null = null;
    if (draftStorageKey && typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(draftStorageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as DraftSnapshot;
          if (parsed && parsed.v === 1 && typeof parsed.savedAt === 'number') {
            localDraft = parsed;
          }
        }
      } catch { /* corrupted draft, ignore */ }
    }

    fetch(`/api/resume/${resumeId}`)
      .then((r) => r.json())
      .then(({ resume }) => {
        if (!resume) return;

        const serverUpdatedAt = resume.updated_at ? new Date(resume.updated_at).getTime() : 0;
        // If the local draft is newer than the server version, prefer it —
        // this is a session where the user made changes that never persisted.
        const preferLocal = !!localDraft && localDraft.savedAt > serverUpdatedAt + 1000; // 1s grace

        const chosen = preferLocal && localDraft ? {
          data: localDraft.data,
          template_id: localDraft.template,
          color_scheme: localDraft.colorScheme,
          font_size: localDraft.fontSize,
          title: localDraft.title,
        } : {
          data: resume.data,
          template_id: resume.template_id,
          color_scheme: resume.color_scheme,
          font_size: resume.font_size,
          title: resume.title,
        };

        // Merge with INITIAL_RESUME so templates never crash on missing fields
        if (chosen.data) {
          setResumeData({
            ...INITIAL_RESUME,
            ...chosen.data,
            contact: { ...INITIAL_RESUME.contact, ...(chosen.data.contact ?? {}) },
            work_experience: chosen.data.work_experience ?? [],
            education: chosen.data.education ?? [],
            skills: chosen.data.skills ?? [],
            certifications: chosen.data.certifications ?? [],
            languages: chosen.data.languages ?? [],
            volunteer_work: chosen.data.volunteer_work ?? [],
            projects: chosen.data.projects ?? [],
            custom_sections: (chosen.data.custom_sections ?? []).map((s: Record<string, unknown>) => ({
              id: (s.id as string | undefined) ?? generateId(),
              title: (s.title as string | undefined) ?? '',
              items: Array.isArray(s.items)
                ? (s.items as Record<string, unknown>[]).map((it) => ({
                    id: (it.id as string | undefined) ?? generateId(),
                    title: (it.title as string | undefined) ?? '',
                    subtitle: (it.subtitle as string | undefined) ?? '',
                    date: (it.date as string | undefined) ?? '',
                    description: (it.description as string | undefined) ?? '',
                  }))
                : [],
            })),
          });
        }
        if (chosen.template_id)  setTemplate(chosen.template_id as Template);
        if (chosen.color_scheme) setColorScheme(chosen.color_scheme as ColorScheme);
        if (chosen.font_size)    setFontSize(chosen.font_size as FontSize);
        if (chosen.title)        { setResumeTitle(chosen.title); setTitleDraft(chosen.title); }
        setDataLoaded(true);

        if (preferLocal) {
          // Let the user know we restored unsaved work — small non-blocking
          // indicator via the existing aiError banner. They can then click
          // Save to persist to the server.
          setAiError('Restored unsaved changes from your last session. Click Save to keep them.');
          setTimeout(() => setAiError(null), 6000);
        }
      })
      .catch(() => {
        // Even if the API fails, try to hydrate from local draft
        if (localDraft) {
          setResumeData(localDraft.data);
          setTemplate(localDraft.template);
          setColorScheme(localDraft.colorScheme);
          setFontSize(localDraft.fontSize);
          setResumeTitle(localDraft.title);
          setTitleDraft(localDraft.title);
        }
        setDataLoaded(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  // Persist every meaningful state change to localStorage (debounced 300ms)
  // so nothing short of clearing the browser cache loses the user's work.
  useEffect(() => {
    if (!dataLoaded || !draftStorageKey || typeof window === 'undefined') return;
    const t = setTimeout(() => {
      try {
        const snapshot: DraftSnapshot = {
          v: 1,
          savedAt: Date.now(),
          title: resumeTitle,
          template,
          colorScheme,
          fontSize,
          data: resumeData,
        };
        window.localStorage.setItem(draftStorageKey, JSON.stringify(snapshot));
      } catch { /* quota / private-mode — non-fatal */ }
    }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData, template, colorScheme, fontSize, resumeTitle, dataLoaded]);

  // Warn the user if they try to close the tab with unsaved edits pending.
  useEffect(() => {
    if (!dataLoaded) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if there's recent local state that we believe hasn't hit
      // the server yet (Save button shows "Saved!" briefly after each save;
      // if `saved` is false the user hasn't confirmed recent persistence).
      if (!saved) {
        e.preventDefault();
        // The string return is ignored by modern browsers but kept for legacy
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dataLoaded, saved]);

  // Auto-download when ?download=1
  useEffect(() => {
    if (shouldDownload && dataLoaded) {
      const timer = setTimeout(() => handleDownload(), 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldDownload, dataLoaded]);

  const updateContact = useCallback(
    (field: keyof ResumeData['contact'], value: string) =>
      setResumeData((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } })),
    []
  );

  // Build a plain text representation of the resume for ATS scoring.
  // Delegates to the shared lib so the builder, the public /ats-checker, the
  // dashboard card, and the resume-import flow all score identically.
  const buildResumeText = (data: ResumeData): string => resumeDataToText(data);

  const handleSave = async () => {
    try {
      // Compute the ATS score locally from the current resume data.
      // Previously this was a network round-trip to /api/ats/check — but
      // the scoring logic is pure client-side (no LLM calls), so we can
      // compute synchronously from the shared lib and avoid the extra RTT.
      let ats_score: number | undefined;
      try {
        const text = buildResumeText(resumeData);
        if (text.trim().length >= 50) {
          ats_score = scoreResume(resumeData);
        }
      } catch { /* ATS scoring is non-critical */ }

      const patchRes = await fetch(`/api/resume/${resumeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resumeTitle,
          template_id: template,
          color_scheme: colorScheme,
          font_size: fontSize,
          data: resumeData,
          ...(ats_score !== undefined && { ats_score }),
        }),
      });
      if (patchRes.ok) {
        // Clear the local-draft safety net — the server is now the source
        // of truth and we no longer need the duplicate copy.
        if (draftStorageKey && typeof window !== 'undefined') {
          try { window.localStorage.removeItem(draftStorageKey); } catch { /* ignore */ }
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setAiError('Save failed — your changes are kept locally. Please try again.');
        setTimeout(() => setAiError(null), 5000);
      }
    } catch {
      setAiError('Save failed — your changes are kept locally. Please try again.');
      setTimeout(() => setAiError(null), 5000);
    }
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    // Check if the selected template is Pro and user is not Pro
    const tpl = TEMPLATES.find((x) => x.id === template);
    if (tpl?.isPro && !isPro) {
      // Surface the upgrade paywall modal instead of silently failing or
      // showing a tiny auto-dismissing pill. Gives the user a clear path to
      // upgrade or to switch to the free Classic template.
      setProModal({ trigger: 'pdf', templateLabel: tpl.label });
      return;
    }
    setDownloadingPdf(true);
    try {
      // html-to-image renders the live DOM (with full CSS, fonts, backgrounds)
      // into a canvas/image. We then hand that to jsPDF for the actual export.
      //
      // Quality notes:
      //   - toPng (lossless) — JPEG with quality:0.98 was still introducing
      //     visible text artefacts around serif fonts and colored blocks.
      //   - pixelRatio: 3 — renders at 3× the CSS resolution. 2× was too soft
      //     on retina screens and looked washed-out once scaled into a PDF.
      //   - Multi-page: we compute the total height of the rendered image in
      //     mm and slice it across N A4 pages. Previously the entire image
      //     was squashed into a single 210×297mm page, which cropped any
      //     resume longer than one page.
      const { toPng } = await import('html-to-image');
      const jsPDF = (await import('jspdf')).default;

      const element = printRef.current;
      const dataUrl = await toPng(element, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      // Decode the PNG to get pixel dimensions so we can paginate cleanly.
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const pageWidth = 210;   // A4 mm
      const pageHeight = 297;  // A4 mm

      // Calculate the rendered height of the full image at A4 width.
      const imgHeightMm = (img.height * pageWidth) / img.width;

      if (imgHeightMm <= pageHeight + 1) {
        // Single-page case — render at natural size (no stretching).
        pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, imgHeightMm, undefined, 'FAST');
      } else {
        // Multi-page case — slice the source image into A4-sized pages.
        //
        // Two bugs the previous slicer had:
        //   1. The slicing canvas was always pageHeightPx tall, even on the
        //      final page where the slice was shorter. We then exported the
        //      whole canvas (with white padding) but told jsPDF to render it
        //      at the proportional height of just the slice content — which
        //      vertically squeezed the entire image, producing a thick
        //      stretched/distorted band at the bottom of the last page.
        //      Fix: size the slice canvas to the actual slice each page so
        //      source PNG and destination box share an aspect ratio.
        //
        //   2. The cut was always at exactly pageHeightPx, which can land in
        //      the middle of a line of body text. The result: the bottom of
        //      one page and the top of the next each show half a row of
        //      glyphs.
        //      Fix: scan the rasterized resume for a "safe" break — a row
        //      in the content area that's all whitespace — and slice there
        //      instead. Whitespace gaps between paragraphs and sections are
        //      usually 4–8px tall at pixelRatio:3, so a small lookback is
        //      enough to land cleanly without losing real content.

        const pageHeightPx = (pageHeight * img.width) / pageWidth;
        const MAX_BREAK_LOOKBACK = Math.max(40, Math.floor(pageHeightPx * 0.06));

        // Scanner canvas — rasterized full image so we can read pixel rows.
        // willReadFrequently keeps Chrome from optimizing the canvas for GPU
        // compositing, which would otherwise make getImageData slow.
        const scanCanvas = document.createElement('canvas');
        scanCanvas.width = img.width;
        scanCanvas.height = img.height;
        const scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true });
        if (!scanCtx) throw new Error('2D canvas unavailable');
        scanCtx.drawImage(img, 0, 0);

        // Returns true if the central 50% of pixels in row `rowY` are all
        // close to white. We scan the middle band rather than the whole row
        // because sidebar templates have a dark column on one side that
        // continues across every row — the middle band is content area in
        // every layout we ship, so this works for both classic and sidebar
        // designs without per-template logic.
        const sampleStartX = Math.floor(img.width * 0.25);
        const sampleWidth = Math.max(1, Math.floor(img.width * 0.5));
        const isContentRowEmpty = (rowY: number): boolean => {
          if (rowY < 0 || rowY >= img.height) return false;
          const row = scanCtx.getImageData(sampleStartX, rowY, sampleWidth, 1).data;
          for (let i = 0; i < row.length; i += 4) {
            if (row[i] < 240 || row[i + 1] < 240 || row[i + 2] < 240) return false;
          }
          return true;
        };

        // From `desiredEnd`, walk back up to MAX_BREAK_LOOKBACK rows looking
        // for a row we can safely cut on. Returns the original value if no
        // clean break is found, so we never get stuck.
        const findSafeBreak = (desiredEnd: number, minEnd: number): number => {
          for (
            let testY = desiredEnd;
            testY >= Math.max(minEnd, desiredEnd - MAX_BREAK_LOOKBACK);
            testY--
          ) {
            if (isContentRowEmpty(testY)) return testY;
          }
          return desiredEnd;
        };

        let y = 0;
        let pageIndex = 0;
        while (y < img.height) {
          // Default slice fills a whole page (or whatever's left on the
          // last page).
          let sliceHeight = Math.min(pageHeightPx, img.height - y);

          // For every page except the last, look for a cleaner break point
          // a little above the desired end so we don't bisect a line of
          // text. Floor at 80% of pageHeightPx so we never produce a tiny
          // page.
          const isLastPage = y + sliceHeight >= img.height;
          if (!isLastPage) {
            const desiredEnd = y + sliceHeight;
            const minEnd = y + Math.floor(pageHeightPx * 0.8);
            const safeEnd = findSafeBreak(desiredEnd, minEnd);
            sliceHeight = safeEnd - y;
          }

          // Slice canvas matches the EXACT slice height so the exported PNG
          // and the PDF destination rectangle share the same aspect ratio.
          // No white padding, no vertical squeeze.
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = img.width;
          sliceCanvas.height = Math.ceil(sliceHeight);
          const sliceCtx = sliceCanvas.getContext('2d');
          if (!sliceCtx) throw new Error('2D canvas unavailable');
          sliceCtx.fillStyle = '#ffffff';
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          sliceCtx.drawImage(
            img,
            0,
            y,
            img.width,
            sliceHeight,
            0,
            0,
            img.width,
            sliceHeight
          );

          const sliceUrl = sliceCanvas.toDataURL('image/png');
          if (pageIndex > 0) pdf.addPage();
          const sliceHeightMm = (sliceHeight * pageWidth) / img.width;
          pdf.addImage(sliceUrl, 'PNG', 0, 0, pageWidth, sliceHeightMm, undefined, 'FAST');

          y += sliceHeight;
          pageIndex += 1;
        }
      }

      // Add subtle watermark for free users (classic template)
      if (!isPro) {
        const pageCount = pdf.getNumberOfPages();
        pdf.setPage(pageCount);
        pdf.setFontSize(7);
        pdf.setTextColor(180, 180, 180);
        pdf.text('Created with hiredtodayapp.com — Free Resume Builder', 105, 294, { align: 'center' });
      }
      pdf.save(`${resumeTitle || 'resume'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
      setAiError('PDF download failed. Please try again — if it keeps failing, try a shorter resume or a different template.');
      setTimeout(() => setAiError(null), 6000);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // ----- Word (.doc) download — pro-gated, uses /api/resume/[id]/word -----
  const handleDownloadWord = async () => {
    if (!isPro) {
      // Word export is Pro-only regardless of template — surface the paywall.
      setProModal({ trigger: 'word' });
      return;
    }
    setDownloadingWord(true);
    try {
      const res = await fetch(`/api/resume/${resumeId}/word`);
      if (!res.ok) {
        const msg = res.status === 403 ? 'Word download is a Pro feature.' : 'Failed to generate Word file.';
        setAiError(msg);
        setTimeout(() => setAiError(null), 5000);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeTitle || 'resume'}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Word download failed', err);
      setAiError('Word download failed. Please try again.');
      setTimeout(() => setAiError(null), 5000);
    } finally {
      setDownloadingWord(false);
    }
  };

  // ----- AI: Generate Summary -----
  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: resumeData.contact, work_experience: resumeData.work_experience }),
      });
      if (res.ok) {
        const { summary } = await res.json();
        setResumeData((prev) => ({ ...prev, summary }));
      } else {
        setAiError('Failed to generate summary.');
        setTimeout(() => setAiError(null), 5000);
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  // ----- AI: Enhance bullets for a specific experience -----
  const handleEnhanceBullets = async (expId: string) => {
    setBulletsLoading((prev) => ({ ...prev, [expId]: true }));
    try {
      const exp = resumeData.work_experience.find((e) => e.id === expId);
      if (!exp) return;
      const res = await fetch('/api/ai/bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_title: exp.job_title, company: exp.company, description: exp.description, achievements: exp.achievements }),
      });
      if (res.ok) {
        const { bullets } = await res.json();
        setResumeData((prev) => ({
          ...prev,
          work_experience: prev.work_experience.map((e) =>
            e.id === expId ? { ...e, achievements: bullets ?? [] } : e
          ),
        }));
      } else {
        setAiError('Failed to enhance bullets. Please check your API key.');
        setTimeout(() => setAiError(null), 5000);
      }
    } finally {
      setBulletsLoading((prev) => ({ ...prev, [expId]: false }));
    }
  };

  // ---------------------------------------------------------------------------
  // Section editors
  // ---------------------------------------------------------------------------

  const renderSection = () => {
    // Wizard-only: show section tip page before the editor, once per section.
    const tipInfo = SECTION_TIPS[activeSection as string];
    const shouldShowTip = isWizard && tipInfo && (showTipOverride || !tipSeen[activeSection]);
    if (shouldShowTip) {
      return (
        <SectionTipPage
          title={tipInfo.title}
          sectionName={tipInfo.sectionName}
          tips={tipInfo.tips}
          templateLayout={'sidebar'}
          accent={'#4AB7A6'}
          onStart={() => {
            setTipSeen((prev) => ({ ...prev, [activeSection]: true }));
            setShowTipOverride(false);
          }}
        />
      );
    }

    switch (activeSection) {
      case 'contact':   return <ContactSection data={resumeData} updateContact={updateContact} template={template} />;
      case 'summary':   return <SummarySection data={resumeData} setResumeData={setResumeData} loading={summaryLoading} onGenerate={handleGenerateSummary} />;
      case 'experience': return <ExperienceSection data={resumeData} setResumeData={setResumeData} bulletsLoading={bulletsLoading} onEnhanceBullets={handleEnhanceBullets} />;
      case 'education': return <EducationSection data={resumeData} setResumeData={setResumeData} />;
      case 'skills':    return <SkillsSection data={resumeData} setResumeData={setResumeData} newSkillName={newSkillName} setNewSkillName={setNewSkillName} />;
      case 'certifications': return <CertificationsSection data={resumeData} setResumeData={setResumeData} />;
      case 'languages': return <LanguagesSection data={resumeData} setResumeData={setResumeData} />;
      case 'projects':  return <ProjectsSection data={resumeData} setResumeData={setResumeData} />;
      case 'volunteer': return <VolunteerSection data={resumeData} setResumeData={setResumeData} />;
      case 'custom':    return <CustomSectionEditor data={resumeData} setResumeData={setResumeData} />;
      default: return null;
    }
  };

  const renderTemplate = () => {
    const props = { data: resumeData, colorScheme, fontSize };
    if (template === 'modern')       return <ModernTemplate {...props} />;
    if (template === 'minimal')      return <MinimalTemplate {...props} />;
    if (template === 'executive')    return <ExecutiveTemplate {...props} />;
    if (template === 'creative')     return <CreativeTemplate {...props} />;
    if (template === 'simple')       return <SimpleTemplate {...props} />;
    if (template === 'bold-header')  return <BoldHeaderTemplate {...props} />;
    if (template === 'split-right')  return <SplitRightTemplate {...props} />;
    if (template === 'timeline')     return <TimelineTemplate {...props} />;
    if (template === 'mono')         return <MonoTemplate {...props} />;
    if (template === 'photo-card')   return <PhotoCardTemplate {...props} />;
    if (template === 'compact')      return <CompactTemplate {...props} />;
    if (template === 'serif')        return <SerifTemplate {...props} />;
    if (template === 'split-accent') return <SplitAccentTemplate {...props} />;
    return <ClassicTemplate {...props} />;
  };

  const handleTemplateChange = (t: Template) => {
    setTemplate(t);
    // Close the upgrade paywall if it's open — user may be switching to a
    // free template as the "escape" action from the modal.
    setProModal(null);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">

      {/* Pro upgrade paywall — shown when a free user tries to download a Pro
          template (PDF) or any Word export. Proper modal with clear value
          proposition + escape hatch to the free Classic template. */}
      <ProUpgradeModal
        open={proModal !== null}
        trigger={proModal?.trigger}
        templateLabel={proModal?.templateLabel}
        onClose={() => setProModal(null)}
        onSwitchToFree={() => handleTemplateChange('classic')}
      />

      {/* Capture target for PDF — off-screen but in normal flow so html-to-image renders it */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '-9999px',
          width: '794px',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <div ref={printRef}>
          {renderTemplate()}
        </div>
      </div>

      {/* ======================== TOP HEADER ======================== */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm flex items-center gap-2 px-4 h-14 flex-shrink-0">
        {/* Back */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0 mr-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm hidden sm:inline font-medium">Dashboard</span>
        </Link>

        <div className="w-px h-5 bg-gray-200 flex-shrink-0" />

        {/* Editable title */}
        <div className="flex items-center gap-1 min-w-0">
          {editingTitle ? (
            <>
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { setResumeTitle(titleDraft); setEditingTitle(false); }
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
                className="text-sm font-semibold text-gray-800 border-b-2 border-teal-500 outline-none bg-transparent w-36"
              />
              <button onClick={() => { setResumeTitle(titleDraft); setEditingTitle(false); }} className="text-teal-600 hover:text-teal-700 ml-1">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditingTitle(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => { setTitleDraft(resumeTitle); setEditingTitle(true); }}
              className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-teal-600 group truncate max-w-[140px]"
              title={resumeTitle}
            >
              <span className="truncate">{resumeTitle}</span>
              <Pencil className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        <div className="flex-1" />

        {/* ── Design controls group ── */}
        <div className="hidden sm:flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50">
          {/* Template — visual picker popover with thumbnails */}
          <TemplatePickerPopover
            templates={TEMPLATES}
            currentId={template}
            onChange={(id) => handleTemplateChange(id as Template)}
            isPro={isPro}
          />

          <div className="w-px h-4 bg-gray-300" />

          {/* Color */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Color</span>
            <div className="flex gap-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColorScheme(c.id)}
                  title={c.label}
                  className={`w-4.5 h-4.5 rounded-full border-2 transition-all hover:scale-110 ${
                    colorScheme === c.id ? 'border-gray-800 scale-110 shadow-sm' : 'border-white'
                  }`}
                  style={{ background: c.bg, width: '18px', height: '18px' }}
                />
              ))}
            </div>
          </div>

          <div className="w-px h-4 bg-gray-300" />

          {/* Font size */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Size</span>
            <div className="flex gap-0.5 border border-gray-200 rounded-lg overflow-hidden bg-white">
              {(['small', 'medium', 'large'] as const).map((s, i) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  title={s}
                  className={`w-7 py-0.5 text-xs font-semibold transition-colors ${
                    fontSize === s ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {['S', 'M', 'L'][i]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-px h-5 bg-gray-200 flex-shrink-0 hidden sm:block" />

        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 ${
            saved
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400 hover:text-teal-700'
          }`}
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : null}
          {saved ? 'Saved!' : 'Save'}
        </button>

        {/* Tips button in wizard mode */}
        {isWizard && (
          <button
            onClick={() => setShowTipOverride(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 hover:bg-amber-100 transition-colors flex-shrink-0"
            title="Show section tips"
          >
            <Lightbulb className="w-3 h-3" />
            <span className="hidden sm:inline">Tips</span>
          </button>
        )}

        {/* Mobile preview tab toggle */}
        <div className="flex lg:hidden rounded-full border border-gray-200 p-0.5 flex-shrink-0">
          <button
            onClick={() => setMobileTab('edit')}
            className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${mobileTab === 'edit' ? 'bg-teal-600 text-white' : 'text-gray-500'}`}
          >
            Edit
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${mobileTab === 'preview' ? 'bg-teal-600 text-white' : 'text-gray-500'}`}
          >
            Preview
          </button>
        </div>

        {/* Download PDF */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Pro paywall is handled by ProUpgradeModal rendered at the top of
              this component — nothing inline needed here. */}
          <button
            onClick={handleDownloadWord}
            disabled={downloadingWord}
            title={isPro ? 'Download as Word (.doc)' : 'Word download — Pro only'}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-teal-400 hover:text-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 bg-white transition-colors"
          >
            {downloadingWord
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <FileText className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{downloadingWord ? 'Generating…' : 'Download Word'}</span>
            <span className="sm:hidden">{downloadingWord ? '…' : 'Word'}</span>
            {!isPro && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1 py-0.5 rounded ml-0.5">PRO</span>}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors"
          >
            {downloadingPdf
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{downloadingPdf ? 'Generating…' : 'Download PDF'}</span>
            <span className="sm:hidden">{downloadingPdf ? '…' : 'PDF'}</span>
          </button>
        </div>
      </header>

      {/* ======================== MAIN AREA ======================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* -------- LEFT PANEL: Editor -------- */}
        <div className={`bg-white border-r border-gray-200 overflow-hidden lg:w-[44%] lg:flex-none ${mobileTab === 'preview' ? 'hidden lg:flex' : 'flex flex-1'}`}>
          {/* Section nav sidebar — wizard mode shows numbered steps + completeness */}
          <WizardSidebar
            sections={SECTIONS}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            resumeData={resumeData}
            wizardMode={isWizard}
          />


          {/* Section content */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1 px-4 sm:px-5 py-5">
              {aiError && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2.5 rounded-lg">
                  <span className="flex-1">{aiError}</span>
                  <button
                    onClick={() => setAiError(null)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0 mt-0.5"
                    aria-label="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {renderSection()}
            </div>

            {/* Wizard-mode bottom bar with "Next: [Section]" */}
            {isWizard && (() => {
              const idx = SECTIONS.findIndex((s) => s.id === activeSection);
              const prev = idx > 0 ? SECTIONS[idx - 1] : null;
              const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null;
              return (
                <div className="border-t border-slate-200 bg-white px-4 sm:px-5 py-3 flex items-center justify-between flex-shrink-0 sticky bottom-0">
                  {prev ? (
                    <button
                      onClick={() => setActiveSection(prev.id)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> {prev.label}
                    </button>
                  ) : (
                    <div />
                  )}
                  {next ? (
                    <button
                      onClick={() => setActiveSection(next.id)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2 rounded-full shadow-sm transition-all hover:shadow-md"
                      style={{ backgroundColor: '#4AB7A6' }}
                    >
                      Next: {next.label} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2 rounded-full shadow-sm transition-all hover:shadow-md"
                        style={{ backgroundColor: '#4AB7A6' }}
                      >
                        Download PDF <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white"
                      >
                        Finish — Back to Dashboard
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* -------- RIGHT PANEL: Preview -------- */}
        <div className={`flex-1 overflow-y-auto bg-gray-200 flex-col ${mobileTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Preview bar */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex-shrink-0">
            <div className="px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Preview</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{template}</span>
              </div>
              <span className="text-[10px] text-gray-400">A4 · 210×297mm</span>
            </div>
            {/* Template quick-switch strip - highly visible */}
            <div className="px-3 py-2 bg-teal-50 border-t border-teal-100 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex-shrink-0">Switch Template:</span>
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`flex-shrink-0 px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all ${
                    template === t.id
                      ? 'text-white border-teal-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-600'
                  }`}
                  style={template === t.id ? { backgroundColor: '#0d9488' } : {}}
                >
                  {t.label}{t.isPro ? ' ★' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Scaled resume */}
          <div className="flex-1 flex justify-center py-8 px-4">
            <div
              style={{
                transform: 'scale(0.76)',
                transformOrigin: 'top center',
                width: '210mm',
                flexShrink: 0,
              }}
            >
              <div className="overflow-hidden bg-white shadow-2xl ring-1 ring-black/5">
                {renderTemplate()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Section editors
// ===========================================================================

// ----- Contact -----
function ContactSection({
  data,
  updateContact,
  template,
}: {
  data: ResumeData;
  updateContact: (field: keyof ResumeData['contact'], value: string) => void;
  template: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fields: { field: keyof ResumeData['contact']; label: string; placeholder: string; type?: string }[] = [
    { field: 'full_name', label: 'Full Name',   placeholder: 'Jane Doe' },
    { field: 'email',     label: 'Email',        placeholder: 'jane@example.com', type: 'email' },
    { field: 'phone',     label: 'Phone',        placeholder: '+1 (555) 000-0000', type: 'tel' },
    { field: 'location',  label: 'Location',     placeholder: 'New York, NY' },
    { field: 'linkedin',  label: 'LinkedIn URL', placeholder: 'linkedin.com/in/janedoe' },
    { field: 'website',   label: 'Website',      placeholder: 'janedoe.dev' },
    { field: 'github',    label: 'GitHub',       placeholder: 'github.com/janedoe' },
  ];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        updateContact('photo_url', result);
      }
    };
    reader.readAsDataURL(file);
  };

  const showPhoto = templateSupportsPhoto(template as Template);

  return (
    <div>
      <SectionHeader title="Contact Information" />

      {/* Photo upload — only shown for templates that actually render a photo.
          When the user switches to a non-photo template, this block is hidden
          so the editor stays in sync with the preview. The photo_url stays in
          state, so switching back restores the uploaded image. */}
      {!showPhoto && data.contact.photo_url && (
        <div className="mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2.5 rounded-lg">
          <Camera className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-600" />
          <span>
            The <span className="font-semibold capitalize">{template}</span> template
            doesn&apos;t display a profile photo. Your uploaded photo is saved — switch
            to <span className="font-semibold">Modern</span> or <span className="font-semibold">Photo Card</span> to show it.
          </span>
        </div>
      )}
      {showPhoto && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <FieldLabel>Profile Photo</FieldLabel>
          <div className="flex items-center gap-4 mt-1">
            {/* Avatar preview */}
            <div
              className="relative flex-shrink-0 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {data.contact.photo_url ? (
                <img
                  src={data.contact.photo_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-teal-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-teal-100 border-2 border-dashed border-teal-300 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-teal-500" />
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-sm font-medium text-teal-600 border border-teal-300 bg-white hover:bg-teal-50 px-3 py-2 rounded-lg transition-colors"
              >
                {data.contact.photo_url ? 'Change Photo' : 'Upload Photo'}
              </button>
              {data.contact.photo_url && (
                <button
                  type="button"
                  onClick={() => updateContact('photo_url', '')}
                  className="mt-1.5 w-full text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove photo
                </button>
              )}
              <p className="mt-1 text-[10px] text-gray-400">JPG or PNG, square crop works best</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      )}

      <div className="space-y-3">
        {fields.map(({ field, label, placeholder, type }) => (
          <div key={field}>
            <FieldLabel>{label}</FieldLabel>
            <Input
              type={type ?? 'text'}
              placeholder={placeholder}
              value={data.contact[field] ?? ''}
              onChange={(e) => updateContact(field, e.target.value)}
              className="text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <ProTipBox>{SECTION_TIPS.contact.proTip}</ProTipBox>
      </div>
    </div>
  );
}

// ----- Summary -----
function SummarySection({
  data,
  setResumeData,
  loading,
  onGenerate,
}: {
  data: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  loading: boolean;
  onGenerate: () => void;
}) {
  const firstJobTitle = data.work_experience[0]?.job_title || '';
  return (
    <div>
      <SectionHeader title="Professional Summary" />
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
        {/* Left: Your summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel>Your Summary</FieldLabel>
            <AIButton onClick={onGenerate} loading={loading}>
              Generate with AI
            </AIButton>
          </div>
          <Textarea
            rows={10}
            placeholder="A results-driven professional with 5+ years of experience..."
            value={data.summary}
            onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
            className="text-sm resize-none"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Tip: A concise 2–4 sentence summary tailored to the role improves ATS scores.
          </p>
        </div>
        {/* Right: Expert-written examples */}
        <div className="bg-violet-50/40 rounded-xl p-4 border border-violet-100">
          <SuggestionPanel
            type="summary"
            jobTitle={firstJobTitle}
            onAdd={(text) => setResumeData((prev) => ({ ...prev, summary: text }))}
            maxHeight={480}
            compact
          />
        </div>
      </div>
      <div className="mt-5">
        <ProTipBox>{SECTION_TIPS.summary.proTip}</ProTipBox>
      </div>
    </div>
  );
}

// ----- Experience -----
function ExperienceSection({
  data,
  setResumeData,
  bulletsLoading,
  onEnhanceBullets,
}: {
  data: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  bulletsLoading: Record<string, boolean>;
  onEnhanceBullets: (id: string) => void;
}) {
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: generateId(),
      job_title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      achievements: [],
    };
    setResumeData((prev) => ({ ...prev, work_experience: [...prev.work_experience, newExp] }));
  };

  const removeExperience = (id: string) => {
    setResumeData((prev) => ({ ...prev, work_experience: prev.work_experience.filter((e) => e.id !== id) }));
  };

  const updateExp = (id: string, field: keyof WorkExperience, value: unknown) => {
    setResumeData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  const addAchievement = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((e) =>
        e.id === id ? { ...e, achievements: [...e.achievements, ''] } : e
      ),
    }));
  };

  const removeAchievement = (expId: string, achIdx: number) => {
    setResumeData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((e) =>
        e.id === expId
          ? { ...e, achievements: e.achievements.filter((_, i) => i !== achIdx) }
          : e
      ),
    }));
  };

  const updateAchievement = (expId: string, achIdx: number, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.map((e) =>
        e.id === expId
          ? { ...e, achievements: e.achievements.map((a, i) => (i === achIdx ? value : a)) }
          : e
      ),
    }));
  };

  return (
    <div>
      <SectionHeader title="Work Experience" />
      {data.work_experience.length === 0 && (
        <p className="text-sm text-gray-400 mb-3">No experience added yet.</p>
      )}
      <div className="space-y-5">
        {data.work_experience.map((exp) => {
          const hasDescription = (exp.description ?? '').trim().length > 0 || (exp.achievements ?? []).filter(Boolean).length > 0;
          return (
          <div key={exp.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Position</span>
                {exp.job_title && exp.company && !hasDescription && (
                  <WarningPill text="Missing description" />
                )}
              </div>
              <button
                onClick={() => removeExperience(exp.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Remove experience"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Job Title</FieldLabel>
                <Input value={exp.job_title} onChange={(e) => updateExp(exp.id, 'job_title', e.target.value)} placeholder="Software Engineer" className="text-sm" />
                <RelatedTitles jobTitle={exp.job_title} onPick={(t) => updateExp(exp.id, 'job_title', t)} />
              </div>
              <div>
                <FieldLabel>Company</FieldLabel>
                <Input value={exp.company} onChange={(e) => updateExp(exp.id, 'company', e.target.value)} placeholder="Acme Corp" className="text-sm" />
              </div>
            </div>

            <div>
              <FieldLabel>Location</FieldLabel>
              <Input
                value={exp.location ?? ''}
                onChange={(e) => updateExp(exp.id, 'location', e.target.value)}
                placeholder="San Francisco, CA"
                className="text-sm"
                disabled={(exp.location ?? '').toLowerCase() === 'remote'}
              />
              <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  checked={(exp.location ?? '').toLowerCase() === 'remote'}
                  onChange={(e) => updateExp(exp.id, 'location', e.target.checked ? 'Remote' : '')}
                />
                This role is remote
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Start Date</FieldLabel>
                <Input type="month" value={exp.start_date} onChange={(e) => updateExp(exp.id, 'start_date', e.target.value)} className="text-sm" />
              </div>
              <div>
                <FieldLabel>End Date</FieldLabel>
                <Input type="month" value={exp.end_date ?? ''} disabled={exp.is_current} onChange={(e) => updateExp(exp.id, 'end_date', e.target.value)} className="text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id={`current-${exp.id}`}
                checked={exp.is_current}
                onCheckedChange={(checked) => {
                  updateExp(exp.id, 'is_current', checked);
                  if (checked) updateExp(exp.id, 'end_date', '');
                }}
              />
              <label htmlFor={`current-${exp.id}`} className="text-sm text-gray-600 cursor-pointer">
                Currently working here (Present)
              </label>
            </div>

            <div>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                rows={3}
                value={exp.description}
                onChange={(e) => updateExp(exp.id, 'description', e.target.value)}
                placeholder="Brief overview of your responsibilities..."
                className="text-sm resize-none"
              />
            </div>

            {/* Achievements with side-by-side AI suggestions */}
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Key Achievements / Bullets</FieldLabel>
                <div className="space-y-1.5">
                  {exp.achievements.map((ach, achIdx) => (
                    <div key={achIdx} className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-sm flex-shrink-0">–</span>
                      <Input
                        value={ach}
                        onChange={(e) => updateAchievement(exp.id, achIdx, e.target.value)}
                        placeholder="Increased revenue by 30% through..."
                        className="text-sm flex-1"
                      />
                      <button onClick={() => removeAchievement(exp.id, achIdx)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => addAchievement(exp.id)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    + Add bullet
                  </button>
                  <AIButton onClick={() => onEnhanceBullets(exp.id)} loading={!!bulletsLoading[exp.id]}>
                    AI Enhance Bullets
                  </AIButton>
                </div>
              </div>
              {/* AI Suggestions panel */}
              <div className="bg-violet-50/40 rounded-xl p-3 border border-violet-100">
                <SuggestionPanel
                  type="bullets"
                  jobTitle={exp.job_title}
                  onAdd={(text) => {
                    setResumeData((prev) => ({
                      ...prev,
                      work_experience: prev.work_experience.map((e) =>
                        e.id === exp.id
                          ? { ...e, achievements: [...e.achievements.filter(Boolean), text] }
                          : e
                      ),
                    }));
                  }}
                  maxHeight={320}
                  compact
                />
              </div>
            </div>
          </div>
          );
        })}
      </div>
      <AddButton onClick={addExperience} label="Add Experience" />
      <div className="mt-5">
        <ProTipBox>{SECTION_TIPS.experience.proTip}</ProTipBox>
      </div>
    </div>
  );
}

// ----- Education -----
function EducationSection({
  data,
  setResumeData,
}: {
  data: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}) {
  const addEducation = () => {
    const edu: Education = {
      id: generateId(),
      degree: '',
      field_of_study: '',
      institution: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      gpa: '',
    };
    setResumeData((prev) => ({ ...prev, education: [...prev.education, edu] }));
  };

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  };

  const updateEdu = (id: string, field: keyof Education, value: unknown) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  return (
    <div>
      <SectionHeader title="Education" />
      {data.education.length === 0 && (
        <p className="text-sm text-gray-400 mb-3">No education added yet.</p>
      )}
      <div className="space-y-5">
        {data.education.map((edu) => (
          <div key={edu.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Degree</span>
              <button onClick={() => removeEducation(edu.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Degree</FieldLabel>
                <Input value={edu.degree} onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Science" className="text-sm" />
              </div>
              <div>
                <FieldLabel>Field of Study</FieldLabel>
                <Input value={edu.field_of_study} onChange={(e) => updateEdu(edu.id, 'field_of_study', e.target.value)} placeholder="Computer Science" className="text-sm" />
              </div>
            </div>
            <div>
              <FieldLabel>Institution</FieldLabel>
              <Input value={edu.institution} onChange={(e) => updateEdu(edu.id, 'institution', e.target.value)} placeholder="MIT" className="text-sm" />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <Input value={edu.location ?? ''} onChange={(e) => updateEdu(edu.id, 'location', e.target.value)} placeholder="Cambridge, MA" className="text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Start Date</FieldLabel>
                <Input type="month" value={edu.start_date} onChange={(e) => updateEdu(edu.id, 'start_date', e.target.value)} className="text-sm" />
              </div>
              <div>
                <FieldLabel>End Date</FieldLabel>
                <Input type="month" value={edu.end_date ?? ''} disabled={edu.is_current} onChange={(e) => updateEdu(edu.id, 'end_date', e.target.value)} className="text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`edu-current-${edu.id}`}
                checked={edu.is_current}
                onCheckedChange={(checked) => {
                  updateEdu(edu.id, 'is_current', checked);
                  if (checked) updateEdu(edu.id, 'end_date', '');
                }}
              />
              <label htmlFor={`edu-current-${edu.id}`} className="text-sm text-gray-600 cursor-pointer">
                Currently enrolled
              </label>
            </div>
            <div>
              <FieldLabel>GPA (optional)</FieldLabel>
              <Input value={edu.gpa ?? ''} onChange={(e) => updateEdu(edu.id, 'gpa', e.target.value)} placeholder="3.8" className="text-sm" />
            </div>
          </div>
        ))}
      </div>
      <AddButton onClick={addEducation} label="Add Education" />
      <div className="mt-5">
        <ProTipBox>{SECTION_TIPS.education.proTip}</ProTipBox>
      </div>
    </div>
  );
}

// ----- Skills -----
function SkillsSection({
  data,
  setResumeData,
  newSkillName,
  setNewSkillName,
}: {
  data: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  newSkillName: string;
  setNewSkillName: (v: string) => void;
}) {
  const addSkill = () => {
    const name = newSkillName.trim();
    if (!name) return;
    const skill: Skill = { id: generateId(), name };
    setResumeData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    setNewSkillName('');
  };

  const removeSkill = (id: string) => {
    setResumeData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== id) }));
  };

  const updateSkillLevel = (id: string, level: Skill['level']) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, level } : s)),
    }));
  };

  const firstJobTitle = data.work_experience[0]?.job_title || '';

  const addSkillByName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Dedup
    if (data.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    const skill: Skill = { id: generateId(), name: trimmed };
    setResumeData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
  };

  return (
    <div>
      <SectionHeader title="Skills" />
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
        {/* Left: user skills */}
        <div>
          <FieldLabel>Your Skills</FieldLabel>
          <div className="flex gap-2 mb-3">
            <Input
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. React, Python, Leadership..."
              className="text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-3 py-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex-shrink-0"
            >
              Add
            </button>
          </div>

          {data.skills.length === 0 && (
            <p className="text-sm text-gray-400">No skills added yet. Click examples on the right, or type your own above.</p>
          )}

          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-full pl-3 pr-1 py-1"
              >
                <span className="text-sm font-medium">{skill.name}</span>
                <select
                  value={skill.level ?? ''}
                  onChange={(e) => updateSkillLevel(skill.id, e.target.value as Skill['level'] || undefined)}
                  className="text-xs bg-transparent border-none outline-none text-teal-600 cursor-pointer max-w-[80px]"
                >
                  <option value="">Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="text-teal-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI suggestions */}
        <div className="bg-violet-50/40 rounded-xl p-4 border border-violet-100">
          <SuggestionPanel
            type="skills"
            jobTitle={firstJobTitle}
            onAdd={addSkillByName}
            maxHeight={480}
            compact
          />
        </div>
      </div>
      <div className="mt-5">
        <ProTipBox>{SECTION_TIPS.skills.proTip}</ProTipBox>
      </div>
    </div>
  );
}

// ----- Certifications -----
function CertificationsSection({
  data,
  setResumeData,
}: {
  data: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}) {
  const addCert = () => {
    const cert: Certification = { id: generateId(), name: '', issuer: '', date_issued: '' };
    setResumeData((prev) => ({ ...prev, certifications: [...prev.certifications, cert] }));
  };

  const removeCert = (id: string) => {
    setResumeData((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c.id !== id) }));
  };

  const updateCert = (id: string, field: keyof Certification, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  return (
    <div>
      <SectionHeader title="Certifications" />
      {data.certifications.length === 0 && (
        <p className="text-sm text-gray-400 mb-3">No certifications added yet.</p>
      )}
      <div className="space-y-4">
        {data.certifications.map((cert) => (
          <div key={cert.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Certification</span>
              <button onClick={() => removeCert(cert.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <FieldLabel>Certificate Name</FieldLabel>
              <Input value={cert.name} onChange={(e) => updateCert(cert.id, 'name', e.target.value)} placeholder="AWS Solutions Architect" className="text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Issuer</FieldLabel>
                <Input value={cert.issuer} onChange={(e) => updateCert(cert.id, 'issuer', e.target.value)} placeholder="Amazon Web Services" className="text-sm" />
              </div>
              <div>
                <FieldLabel>Date Issued</FieldLabel>
                <Input type="month" value={cert.date_issued} onChange={(e) => updateCert(cert.id, 'date_issued', e.target.value)} className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Credential ID (optional)</FieldLabel>
                <Input value={cert.credential_id ?? ''} onChange={(e) => updateCert(cert.id, 'credential_id', e.target.value)} placeholder="ABC-123" className="text-sm" />
              </div>
              <div>
                <FieldLabel>URL (optional)</FieldLabel>
                <Input value={cert.url ?? ''} onChange={(e) => updateCert(cert.id, 'url', e.target.value)} placeholder="https://..." className="text-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <AddButton onClick={addCert} label="Add Certification" />
    </div>
  );
}

// ----- Languages -----
function LanguagesSection({
  data,
  setResumeData,
}: {
  data: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}) {
  const addLanguage = () => {
    const lang: Language = { id: generateId(), name: '', proficiency: 'Professional Working' };
    setResumeData((prev) => ({ ...prev, languages: [...prev.languages, lang] }));
  };

  const removeLang = (id: string) => {
    setResumeData((prev) => ({ ...prev, languages: prev.languages.filter((l) => l.id !== id) }));
  };

  const updateLang = (id: string, field: keyof Language, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  };

  const proficiencies: Language['proficiency'][] = [
    'Elementary',
    'Limited Working',
    'Professional Working',
    'Full Professional',
    'Native',
  ];

  return (
    <div>
      <SectionHeader title="Languages" />
      {data.languages.length === 0 && (
        <p className="text-sm text-gray-400 mb-3">No languages added yet.</p>
      )}
      <div className="space-y-3">
        {data.languages.map((lang) => (
          <div key={lang.id} className="flex items-center gap-2">
            <Input
              value={lang.name}
              onChange={(e) => updateLang(lang.id, 'name', e.target.value)}
              placeholder="English"
              className="text-sm flex-1"
            />
            <select
              value={lang.proficiency}
              onChange={(e) => updateLang(lang.id, 'proficiency', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 flex-1 outline-none focus:border-teal-400"
            >
              {proficiencies.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button onClick={() => removeLang(lang.id)} className="text-gray-400 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <AddButton onClick={addLanguage} label="Add Language" />
    </div>
  );
}

// ----- Projects -----
function ProjectsSection({
  data,
  setResumeData,
}: {
  data: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}) {
  const addProject = () => {
    const proj: Project = { id: generateId(), name: '', description: '', technologies: [] };
    setResumeData((prev) => ({ ...prev, projects: [...prev.projects, proj] }));
  };

  const removeProject = (id: string) => {
    setResumeData((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
  };

  const updateProject = (id: string, field: keyof Project, value: unknown) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  return (
    <div>
      <SectionHeader title="Projects" />
      {data.projects.length === 0 && (
        <p className="text-sm text-gray-400 mb-3">No projects added yet.</p>
      )}
      <div className="space-y-4">
        {data.projects.map((proj) => (
          <div key={proj.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</span>
              <button onClick={() => removeProject(proj.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <FieldLabel>Project Name</FieldLabel>
              <Input value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} placeholder="HiredTodayApp" className="text-sm" />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                rows={3}
                value={proj.description}
                onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                placeholder="An AI-powered resume builder that..."
                className="text-sm resize-none"
              />
            </div>
            <div>
              <FieldLabel>Technologies (comma-separated)</FieldLabel>
              <Input
                value={proj.technologies.join(', ')}
                onChange={(e) =>
                  updateProject(
                    proj.id,
                    'technologies',
                    e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                  )
                }
                placeholder="React, TypeScript, Tailwind CSS"
                className="text-sm"
              />
            </div>
            <div>
              <FieldLabel>URL (optional)</FieldLabel>
              <Input value={proj.url ?? ''} onChange={(e) => updateProject(proj.id, 'url', e.target.value)} placeholder="https://github.com/you/project" className="text-sm" />
            </div>
          </div>
        ))}
      </div>
      <AddButton onClick={addProject} label="Add Project" />
    </div>
  );
}

// ----- Volunteer -----
function VolunteerSection({
  data,
  setResumeData,
}: {
  data: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}) {
  const addVol = () => {
    const vol: VolunteerWork = {
      id: generateId(),
      role: '',
      organization: '',
      start_date: '',
      is_current: false,
      description: '',
    };
    setResumeData((prev) => ({ ...prev, volunteer_work: [...prev.volunteer_work, vol] }));
  };

  const removeVol = (id: string) => {
    setResumeData((prev) => ({ ...prev, volunteer_work: prev.volunteer_work.filter((v) => v.id !== id) }));
  };

  const updateVol = (id: string, field: keyof VolunteerWork, value: unknown) => {
    setResumeData((prev) => ({
      ...prev,
      volunteer_work: prev.volunteer_work.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    }));
  };

  return (
    <div>
      <SectionHeader title="Volunteer Work" />
      {data.volunteer_work.length === 0 && (
        <p className="text-sm text-gray-400 mb-3">No volunteer work added yet.</p>
      )}
      <div className="space-y-4">
        {data.volunteer_work.map((vol) => (
          <div key={vol.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Volunteer</span>
              <button onClick={() => removeVol(vol.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Role</FieldLabel>
                <Input value={vol.role} onChange={(e) => updateVol(vol.id, 'role', e.target.value)} placeholder="Mentor" className="text-sm" />
              </div>
              <div>
                <FieldLabel>Organization</FieldLabel>
                <Input value={vol.organization} onChange={(e) => updateVol(vol.id, 'organization', e.target.value)} placeholder="Code for Good" className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Start Date</FieldLabel>
                <Input type="month" value={vol.start_date} onChange={(e) => updateVol(vol.id, 'start_date', e.target.value)} className="text-sm" />
              </div>
              <div>
                <FieldLabel>End Date</FieldLabel>
                <Input type="month" value={vol.end_date ?? ''} disabled={vol.is_current} onChange={(e) => updateVol(vol.id, 'end_date', e.target.value)} className="text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`vol-current-${vol.id}`}
                checked={vol.is_current}
                onCheckedChange={(checked) => {
                  updateVol(vol.id, 'is_current', checked);
                  if (checked) updateVol(vol.id, 'end_date', '');
                }}
              />
              <label htmlFor={`vol-current-${vol.id}`} className="text-sm text-gray-600 cursor-pointer">
                Currently volunteering
              </label>
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                rows={3}
                value={vol.description}
                onChange={(e) => updateVol(vol.id, 'description', e.target.value)}
                placeholder="Mentored 10 junior developers..."
                className="text-sm resize-none"
              />
            </div>
          </div>
        ))}
      </div>
      <AddButton onClick={addVol} label="Add Volunteer Work" />
    </div>
  );
}

// ----- Custom Sections -----
function CustomSectionEditor({
  data,
  setResumeData,
}: {
  data: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}) {
  const addSection = () => {
    const section: CustomSection = {
      id: generateId(),
      title: 'Custom Section',
      items: [],
    };
    setResumeData((prev) => ({ ...prev, custom_sections: [...(prev.custom_sections ?? []), section] }));
  };

  const removeSection = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      custom_sections: prev.custom_sections?.filter((s) => s.id !== id) ?? [],
    }));
  };

  const updateSectionTitle = (id: string, title: string) => {
    setResumeData((prev) => ({
      ...prev,
      custom_sections: prev.custom_sections?.map((s) => (s.id === id ? { ...s, title } : s)) ?? [],
    }));
  };

  const addItem = (sectionId: string) => {
    const item = { id: generateId(), title: '', subtitle: '', date: '', description: '' };
    setResumeData((prev) => ({
      ...prev,
      custom_sections: prev.custom_sections?.map((s) =>
        s.id === sectionId ? { ...s, items: [...(s.items ?? []), item] } : s
      ) ?? [],
    }));
  };

  const removeItem = (sectionId: string, itemId: string) => {
    setResumeData((prev) => ({
      ...prev,
      custom_sections: prev.custom_sections?.map((s) =>
        s.id === sectionId ? { ...s, items: (s.items ?? []).filter((it) => it.id !== itemId) } : s
      ) ?? [],
    }));
  };

  const updateItem = (
    sectionId: string,
    itemId: string,
    field: keyof CustomSection['items'][number],
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      custom_sections: prev.custom_sections?.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: (s.items ?? []).map((it) => (it.id === itemId ? { ...it, [field]: value } : it)),
            }
          : s
      ) ?? [],
    }));
  };

  const sections = data.custom_sections ?? [];

  return (
    <div>
      <SectionHeader title="Custom Sections" />
      {sections.length === 0 && (
        <p className="text-sm text-gray-400 mb-3">Add a custom section for awards, publications, etc.</p>
      )}
      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex items-center gap-2">
              <Input
                value={section.title}
                onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                placeholder="Section Title (e.g. Publications)"
                className="text-sm font-semibold"
              />
              <button onClick={() => removeSection(section.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {(section.items ?? []).map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-white">
                  <div className="flex justify-end">
                    <button onClick={() => removeItem(section.id, item.id)} className="text-gray-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <Input value={item.title} onChange={(e) => updateItem(section.id, item.id, 'title', e.target.value)} placeholder="Item Title" className="text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FieldLabel>Subtitle (optional)</FieldLabel>
                      <Input value={item.subtitle ?? ''} onChange={(e) => updateItem(section.id, item.id, 'subtitle', e.target.value)} placeholder="Subtitle" className="text-sm" />
                    </div>
                    <div>
                      <FieldLabel>Date (optional)</FieldLabel>
                      <Input value={item.date ?? ''} onChange={(e) => updateItem(section.id, item.id, 'date', e.target.value)} placeholder="Jan 2024" className="text-sm" />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateItem(section.id, item.id, 'description', e.target.value)}
                      placeholder="Brief description..."
                      className="text-sm resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addItem(section.id)}
              className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        ))}
      </div>
      <AddButton onClick={addSection} label="Add Custom Section" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wizard sidebar — industry-standard numbered steps + completeness
// ---------------------------------------------------------------------------

function computeCompleteness(data: ResumeData): number {
  let score = 0;
  const max = 100;
  // Contact: 20 pts
  if (data.contact.full_name) score += 5;
  if (data.contact.email) score += 5;
  if (data.contact.phone) score += 5;
  if (data.contact.location) score += 5;
  // Summary: 15 pts
  if ((data.summary || '').trim().length > 40) score += 15;
  // Work: 30 pts
  if (data.work_experience.length > 0) score += 10;
  if (data.work_experience.some((e) => e.job_title && e.company)) score += 10;
  if (data.work_experience.some((e) => (e.achievements || []).filter(Boolean).length > 0)) score += 10;
  // Education: 15 pts
  if (data.education.length > 0) score += 10;
  if (data.education.some((e) => e.degree && e.institution)) score += 5;
  // Skills: 15 pts
  if (data.skills.length >= 3) score += 10;
  if (data.skills.length >= 6) score += 5;
  // Finalize (optional nicety): 5 pts
  if (data.certifications.length > 0 || data.projects.length > 0 || data.languages.length > 0) score += 5;
  return Math.min(max, score);
}

interface WizardSidebarProps {
  sections: typeof SECTIONS;
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
  resumeData: ResumeData;
  wizardMode: boolean;
}

function WizardSidebar({ sections, activeSection, setActiveSection, resumeData, wizardMode }: WizardSidebarProps) {
  const completeness = computeCompleteness(resumeData);
  // Which "wizard steps" are considered done based on current data
  const done: Record<string, boolean> = {
    contact: !!(resumeData.contact.full_name && resumeData.contact.email),
    summary: (resumeData.summary || '').trim().length > 40,
    experience: resumeData.work_experience.some((e) => e.job_title && e.company),
    education: resumeData.education.some((e) => e.degree && e.institution),
    skills: resumeData.skills.length >= 3,
    certifications: resumeData.certifications.length > 0,
    languages: resumeData.languages.length > 0,
    projects: resumeData.projects.length > 0,
    volunteer: resumeData.volunteer_work.length > 0,
    custom: resumeData.custom_sections.length > 0,
  };

  if (!wizardMode) {
    // Standard non-wizard sidebar (original)
    return (
      <div className="flex flex-col gap-0.5 py-3 px-2 bg-gray-50 border-r border-gray-100 flex-shrink-0 overflow-y-auto w-[148px]">
        {sections.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full ${
              activeSection === id
                ? 'text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            style={activeSection === id ? { backgroundColor: '#4AB7A6' } : {}}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col py-4 px-3 bg-slate-50 border-r border-slate-100 flex-shrink-0 overflow-y-auto w-[180px]">
      <div className="flex flex-col gap-1 mb-5">
        {sections.map(({ id, label }, idx) => {
          const isActive = activeSection === id;
          const isDone = done[id];
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-left w-full transition-colors ${
                isActive ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-white'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'text-white'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
                style={isActive && !isDone ? { backgroundColor: '#F59E0B', color: 'white' } : undefined}
              >
                {isDone ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-sm truncate ${isActive ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Completeness bar */}
      <div className="mt-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Resume completeness
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completeness}%`,
              background: completeness >= 80 ? '#10b981' : completeness >= 50 ? '#f59e0b' : '#94a3b8',
            }}
          />
        </div>
        <div className="text-right text-xs font-semibold text-slate-600 mt-1">{completeness}%</div>
      </div>
    </div>
  );
}

