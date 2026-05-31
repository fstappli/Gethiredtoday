'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Mail,
  Edit,
  Trash2,
  Copy,
  Plus,
  TrendingUp,
  Target,
  User,
  MoreHorizontal,
  CheckCircle2,
  Loader2,
  Layout,
  BookOpen,
  FileDown,
  Share2,
  Sparkles,
  X,
  Upload,
  Briefcase,
  RefreshCw,
  ExternalLink,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { truncate } from '@/lib/utils';
import { TemplatePreview, previewFromResumeData } from '@/components/template-preview';
import { isProActive, isCancelledWithGrace, formatEndsAt } from '@/lib/subscription';
import { scoreResume } from '@/lib/ats';
import type { TemplateLayout } from '@/components/template-preview';
import { createClient } from '@/lib/supabase';

const TEMPLATE_META: Record<string, { layout: TemplateLayout; accent: string }> = {
  classic:        { layout: 'classic',      accent: '#4AB7A6' },
  modern:         { layout: 'sidebar',      accent: '#1e293b' },
  minimal:        { layout: 'minimal',      accent: '#1d4ed8' },
  executive:      { layout: 'executive',    accent: '#0f172a' },
  creative:       { layout: 'creative',     accent: '#7c3aed' },
  simple:         { layout: 'centered',     accent: '#0891b2' },
  'bold-header':  { layout: 'bold-header',  accent: '#4AB7A6' },
  'split-right':  { layout: 'split-right',  accent: '#1d4ed8' },
  timeline:       { layout: 'timeline',     accent: '#7c3aed' },
  mono:           { layout: 'mono',         accent: '#0d9488' },
  'photo-card':   { layout: 'photo-card',   accent: '#2563eb' },
  compact:        { layout: 'compact',      accent: '#475569' },
  serif:          { layout: 'serif',        accent: '#9f1239' },
  'split-accent': { layout: 'split-accent', accent: '#7c3aed' },
};

interface ResumeRow {
  id: string;
  title: string;
  updated_at: string;
  ats_score: number | null;
  template_id: string;
  finalized_at?: string | null;
  data?: import('@/types').ResumeData;
}

interface CoverLetterRow {
  id: string;
  title: string;
  updated_at: string;
  template_id: string;
}

function atsColor(score: number | null): string {
  if (score == null) return '#9ca3af';
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  return '#dc2626';
}

function atsBgColor(score: number | null): string {
  if (score == null) return '#f3f4f6';
  if (score >= 80) return '#f0fdf4';
  if (score >= 60) return '#fffbeb';
  return '#fef2f2';
}

function atsLabel(score: number | null): string {
  if (score == null) return 'Not checked';
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Needs Work';
}

function formatEdited(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Edited just now';
  if (diffMins < 60) return `Edited ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `Edited ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Edited yesterday';
  if (diffDays < 7) return `Edited ${diffDays} days ago`;
  return `Edited ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

/** Returns a fake "strength" percentage derived from ATS score (60-95 range). */
function calcStrength(atsScore: number | null): number {
  if (atsScore == null) return 60;
  // Map ATS score → strength in 60–95 range
  return Math.min(95, Math.max(60, Math.round(atsScore * 0.85 + 12)));
}

// Mock data for demo sections
const MOCK_RESUMES = [
  { id: 'mock-1', title: 'Software Engineer Resume', updated_at: new Date(Date.now() - 2 * 3600000).toISOString(), ats_score: 87, template_id: 'classic' },
  { id: 'mock-2', title: 'Marketing Manager CV', updated_at: new Date(Date.now() - 86400000).toISOString(), ats_score: 72, template_id: 'modern' },
  { id: 'mock-3', title: 'Product Manager Resume', updated_at: new Date(Date.now() - 3 * 86400000).toISOString(), ats_score: 91, template_id: 'executive' },
];

const MOCK_COVER_LETTERS = [
  { id: 'mock-cl-1', title: 'Stripe Application Letter', company: 'Stripe', updated_at: new Date(Date.now() - 86400000).toISOString(), template_id: 'professional' },
  { id: 'mock-cl-2', title: 'Google PM Letter', company: 'Google', updated_at: new Date(Date.now() - 4 * 86400000).toISOString(), template_id: 'modern' },
];

const QUICK_ACTIONS = [
  {
    label: 'Check ATS Score',
    description: 'See how well your resume performs against ATS filters',
    href: '/dashboard/ats-checker',
    icon: Target,
    color: '#4AB7A6',
    bg: '#f0fdfa',
  },
  {
    label: 'Browse Templates',
    description: '60+ professional templates designed by resume experts',
    href: '/resume-templates',
    icon: Layout,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    label: 'Get Resume Tips',
    description: 'Expert guides and career advice to land more interviews',
    href: '/resources',
    icon: BookOpen,
    color: '#2563eb',
    bg: '#eff6ff',
  },
];

// ── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({ id, type, onClose }: { id: string; type: 'resume' | 'cover-letter'; onClose: () => void }) {
  const link = `https://hiredtodayapp.com/${type === 'resume' ? 'resume' : 'cover-letter'}/public/${id}`;
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'enabling' | 'ready' | 'error'>('enabling');
  const [retryCount, setRetryCount] = useState(0);

  // Flip is_public=true when the dialog opens so the link actually works.
  useEffect(() => {
    let cancelled = false;
    setStatus('enabling');
    (async () => {
      try {
        const res = await fetch(`/api/${type === 'resume' ? 'resume' : 'cover-letter'}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_public: true }),
        });
        if (cancelled) return;
        setStatus(res.ok ? 'ready' : 'error');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [id, type, retryCount]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — select the input
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-page-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Share {type === 'resume' ? 'Resume' : 'Cover Letter'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {status === 'enabling' && (
          <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enabling public link…
          </p>
        )}
        {status === 'ready' && (
          <p className="text-sm text-slate-500 mb-3">Anyone with this link can view your {type === 'resume' ? 'resume' : 'cover letter'}.</p>
        )}
        {status === 'error' && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-red-500">Could not enable the public link.</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="text-sm font-medium text-[#4AB7A6] hover:underline ml-3"
            >
              Retry
            </button>
          </div>
        )}
        <div className="flex gap-2 items-stretch">
          <input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none truncate"
            title={link}
          />
          <button
            onClick={handleCopy}
            disabled={status !== 'ready'}
            className="shrink-0 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#4AB7A6' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-slate-400 break-all">{link}</p>
      </div>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exit = setTimeout(() => setExiting(true), 2600);
    const done = setTimeout(onDone, 3000);
    return () => { clearTimeout(exit); clearTimeout(done); };
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg pointer-events-none ${exiting ? 'animate-toast-exit' : 'animate-toast-enter'}`}
    >
      {message}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [isPro, setIsPro] = useState(false);
  const [subEndsAt, setSubEndsAt] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
  // Load profile + handle post-Gumroad-checkout return
  useEffect(() => {
    const supabase = createClient();

    const readProfile = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_ends_at, full_name, email, created_at')
        .eq('id', userId)
        .single();
      setIsPro(isProActive(profile));
      setIsCancelled(isCancelledWithGrace(profile));
      setSubEndsAt((profile?.subscription_ends_at as string | null) ?? null);
      setAccountCreatedAt((profile?.created_at as string | null) ?? null);
      const name =
        profile?.full_name?.trim().split(/\s+/)[0] ||
        profile?.email?.split('@')[0] ||
        'there';
      setFirstName(name);
    };

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Handle return from Gumroad checkout (?upgraded=1 or ?upgraded=pending).
      // /api/purchase/return already updated the profile before redirecting here;
      // we just need to clean the URL and show the right toast.
      const url = new URL(window.location.href);
      const upgraded = url.searchParams.get('upgraded');

      if (upgraded) {
        url.searchParams.delete('upgraded');
        window.history.replaceState(null, '', url.toString());
        if (upgraded === 'pending') {
          setToastMessage('Your payment is processing — Pro access will activate within a minute.');
        }
      }

      await readProfile(user.id);

      if (upgraded === '1') {
        // Only show the Pro welcome toast if the DB actually shows Pro status.
        // This prevents showing the toast to anyone who manually pastes ?upgraded=1.
        const { data: freshProfile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_ends_at')
          .eq('id', user.id)
          .single();
        if (isProActive(freshProfile)) {
          setToastMessage('🎉 Welcome to Pro! All features are now unlocked.');
        }
      }

      // Resume Gumroad checkout if user signed up for Pro but needed email confirmation first
      try {
        const pendingPlan = sessionStorage.getItem('pending_plan');
        if (pendingPlan === 'pro') {
          sessionStorage.removeItem('pending_plan');
          window.location.href = '/upgrade?from=%2Fdashboard';
          return;
        }
      } catch {}
    })();
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const [coverLetters, setCoverLetters] = useState<CoverLetterRow[]>([]);
  const [loadingCoverLetters, setLoadingCoverLetters] = useState(true);

  const [creatingResume, setCreatingResume] = useState(false);
  const [creatingCoverLetter, setCreatingCoverLetter] = useState(false);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [appliedCount, setAppliedCount] = useState<number>(0);
  const [jobMatches, setJobMatches] = useState<{
    id: string;
    match_score: number;
    matched_reasons: string[];
    application_status: string | null;
    jobs: { id: string; title: string; company: string | null; location: string | null; redirect_url: string; work_type: string | null; contract_type: string | null; category: string | null } | null;
  }[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [hasFinalizedResume, setHasFinalizedResume] = useState<boolean | null>(null); // null = not yet loaded
  const [refreshingMatches, setRefreshingMatches] = useState(false);
  const [showResumePicker, setShowResumePicker] = useState(false);
  const [settingActiveId, setSettingActiveId] = useState<string | null>(null);

  // Pick up any cross-page toast (e.g. "Login successful!" set by /login).
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem('dashboard_toast');
      if (pending) {
        setToastMessage(pending);
        sessionStorage.removeItem('dashboard_toast');
      }
    } catch {}
  }, []);
  const [shareTarget, setShareTarget] = useState<{ id: string; type: 'resume' | 'cover-letter' } | null>(null);

  const showToast = (msg: string) => setToastMessage(msg);

  const handleNewResume = async () => {
    setCreatingResume(true);
    router.push('/builder/wizard');
  };

  const handleNewCoverLetter = async () => {
    setCreatingCoverLetter(true);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Cover Letter',
          template_id: 'professional',
          data: {},
          contact: {},
        }),
      });
      if (res.ok) {
        const { coverLetter } = await res.json();
        router.push(`/builder/cover-letter/${coverLetter.id}`);
      }
    } catch {
      setCreatingCoverLetter(false);
    }
  };

  const fetchResumes = useCallback(async () => {
    setLoadingResumes(true);
    setResumeError(null);
    try {
      const res = await fetch('/api/resume');
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setResumes(data.resumes ?? []);
    } catch {
      setResumeError('Failed to load your resumes. Please refresh.');
    } finally {
      setLoadingResumes(false);
    }
  }, [router]);

  const fetchCoverLetters = useCallback(async () => {
    setLoadingCoverLetters(true);
    try {
      const res = await fetch('/api/cover-letter');
      if (!res.ok) return;
      const data = await res.json();
      setCoverLetters(data.coverLetters ?? []);
    } catch {
      // non-fatal
    } finally {
      setLoadingCoverLetters(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
    fetchCoverLetters();
  }, [fetchResumes, fetchCoverLetters]);

  useEffect(() => {
    // Fetch applied count for KPI
    fetch('/api/jobs/applications?status=applied,viewed,interview,offer,rejected')
      .then((r) => r.json())
      .then((d) => setAppliedCount(d.counts?.applied ?? 0))
      .catch(() => {});

    // Fetch job matches
    setLoadingMatches(true);
    fetch('/api/jobs/matches')
      .then((r) => r.json())
      .then((d) => {
        setHasFinalizedResume(Boolean(d.has_finalized_resume));
        setJobMatches(d.matches ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingMatches(false));
  }, []);

  const handleRefreshMatches = async () => {
    setRefreshingMatches(true);
    setLoadingMatches(true);
    setJobMatches([]);
    try {
      const res = await fetch('/api/jobs/matches/refresh', { method: 'POST' });
      const data = await res.json();
      showToast(data.message ?? 'Matches refreshed.');
      if (!data.unconfigured) {
        const matchRes = await fetch('/api/jobs/matches');
        const matchData = await matchRes.json();
        setJobMatches(matchData.matches ?? []);
      }
    } catch {
      showToast('Failed to refresh matches.');
    } finally {
      setRefreshingMatches(false);
      setLoadingMatches(false);
    }
  };

  const handleRemoveActiveResume = async () => {
    try {
      await fetch('/api/resume/finalize', { method: 'DELETE' });
      setResumes((prev) => prev.map((r) => ({ ...r, finalized_at: null })));
      setHasFinalizedResume(false);
      setJobMatches([]);
      setShowResumePicker(false);
      showToast('Resume removed from job matching.');
    } catch {
      showToast('Failed to remove resume.');
    }
  };

  const handleSetActiveResume = async (resume: ResumeRow) => {
    setSettingActiveId(resume.id);
    try {
      await fetch('/api/resume/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_id: resume.id }),
      });
      // Optimistically mark finalized_at
      setResumes((prev) =>
        prev.map((r) => ({ ...r, finalized_at: r.id === resume.id ? new Date().toISOString() : null }))
      );
      setHasFinalizedResume(true);
      setShowResumePicker(false);
      showToast(`"${resume.title}" set as your active resume.`);
      handleRefreshMatches();
    } finally {
      setSettingActiveId(null);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    setResumes((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`/api/resume/${id}`, { method: 'DELETE' });
    } catch {
      fetchResumes();
    }
  };

  const handleDuplicateResume = async (resume: ResumeRow) => {
    try {
      const res = await fetch(`/api/resume/${resume.id}`);
      if (!res.ok) return;
      const { resume: full } = await res.json();
      const createRes = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${resume.title} (Copy)`,
          template_id: resume.template_id,
          data: full.data ?? {},
        }),
      });
      if (createRes.ok) fetchResumes();
    } catch {}
  };

  const handleDeleteCoverLetter = async (id: string) => {
    if (!confirm('Delete this cover letter?')) return;
    setCoverLetters((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/cover-letter/${id}`, { method: 'DELETE' });
    } catch {
      fetchCoverLetters();
    }
  };

  const handleDuplicateCoverLetter = async (cl: CoverLetterRow) => {
    try {
      const res = await fetch(`/api/cover-letter/${cl.id}`);
      if (!res.ok) return;
      const { coverLetter: full } = await res.json();
      const createRes = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${cl.title} (Copy)`,
          template_id: cl.template_id,
          data: full.data ?? {},
          contact: full.contact ?? {},
        }),
      });
      if (createRes.ok) fetchCoverLetters();
    } catch {}
  };

  const handleDownloadPdf = (id: string) => {
    setDownloadingId(id);
    showToast('Opening your resume to download PDF...');
    // The builder watches for `?download=1` and triggers the PDF export once
    // the data has hydrated. Use that canonical param — earlier we were
    // passing `?action=download-pdf` which the builder does not read, so
    // clicking Download PDF opened the builder without actually downloading.
    setTimeout(() => {
      setDownloadingId(null);
      router.push(`/builder/resume/${id}?download=1`);
    }, 600);
  };

  // Accept either a string id or an onClick event — discriminate by type so
  // this can be used directly as both an action callback and an onClick handler.
  const handleDownloadWord = async (arg?: string | React.MouseEvent) => {
    const id = typeof arg === 'string' ? arg : undefined;
    const targetId = id || displayResumes[0]?.id;
    if (!targetId) {
      showToast('Create a resume first to download Word.');
      return;
    }
    if (!isPro) {
      showToast('Word download is a Pro feature — taking you to upgrade…');
      setTimeout(() => {
        window.location.href = '/upgrade?from=%2Fdashboard';
      }, 1000);
      return;
    }
    setDownloadingId(targetId);
    try {
      const res = await fetch(`/api/resume/${targetId}/word`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Word download failed.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      a.download = match ? match[1] : 'resume.doc';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Word download started.');
    } catch {
      showToast('Word download failed. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShare = (id: string, type: 'resume' | 'cover-letter') => {
    setShareTarget({ id, type });
  };

  // Always show real data from the API. Overlay a FRESH ATS score computed
  // from each resume's current `data` — the stored `ats_score` column is only
  // updated when the user clicks Save in the builder, so it can drift stale
  // if they edit without saving, or be absent for newly-imported resumes.
  // Computing here keeps every card and the Best-ATS stat honest no matter
  // how many resumes the user has.
  const displayResumes = resumes.map((r) => ({
    ...r,
    ats_score: r.data ? scoreResume(r.data) : r.ats_score,
  }));
  const activeResume = displayResumes.find((r) => r.finalized_at) ?? null;
  const displayCoverLetters = coverLetters;

  const stats = [
    {
      label: 'Total Resumes',
      value: displayResumes.length,
      icon: FileText,
      iconBg: '#f0fdfa',
      iconColor: '#4AB7A6',
      href: undefined as string | undefined,
    },
    {
      label: 'Jobs Applied',
      value: appliedCount,
      icon: Briefcase,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      href: '/dashboard/applied-jobs',
    },
    {
      label: 'Cover Letters',
      value: displayCoverLetters.length,
      icon: Mail,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      href: undefined as string | undefined,
    },
    {
      label: 'Best ATS Score',
      value: displayResumes.length > 0
        ? `${Math.max(...displayResumes.map((r) => r.ats_score ?? 0))}%`
        : '—',
      icon: User,
      iconBg: '#faf5ff',
      iconColor: '#7c3aed',
      href: '/dashboard/ats-checker' as string | undefined,
    },
  ];

  return (
    <div className="min-h-full bg-white animate-page-enter">
      {/* Top area */}
      <div className="border-b border-slate-100 px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 shrink-0 animate-sparkle" style={{ color: '#4AB7A6' }} />
              {greeting}{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              You have {displayResumes.length} resume{displayResumes.length !== 1 ? 's' : ''}. Keep improving your ATS score!
            </p>
          </div>
          {/* The dashboard header already renders a "New Resume" CTA, so we
              don't duplicate it here. We still expose the upload shortcut
              and cover-letter CTA which the header doesn't have. */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <Button
              onClick={() => router.push('/builder/wizard?upload=1')}
              variant="outline"
              className="rounded-full text-sm font-medium px-5 h-9 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Upload Resume
            </Button>
            <Button
              onClick={handleNewCoverLetter}
              disabled={creatingCoverLetter}
              variant="outline"
              className="rounded-full text-sm font-medium px-5 h-9 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {creatingCoverLetter ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
              New Cover Letter
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const inner = (
              <>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: stat.iconBg }}
                >
                  <Icon size={20} style={{ color: stat.iconColor }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </>
            );
            return stat.href ? (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-[#4AB7A6] card-hover animate-fade-up"
                style={{ '--stagger-delay': `${stats.indexOf(stat) * 60}ms` } as React.CSSProperties}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={stat.label}
                className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm animate-fade-up"
                style={{ '--stagger-delay': `${stats.indexOf(stat) * 60}ms` } as React.CSSProperties}
              >
                {inner}
              </div>
            );
          })}
        </div>

      </div>

      {/* Main content + right sidebar */}
      <div className="flex gap-6 px-6 lg:px-8 py-8">
        {/* Main scrollable content */}
        <div className="flex-1 min-w-0 space-y-10">

          {/* Trial status banner — shown to all non-Pro users */}
          {!isPro && accountCreatedAt && (() => {
            const TRIAL_MS = 2 * 24 * 60 * 60 * 1000;
            const elapsed = Date.now() - new Date(accountCreatedAt).getTime();
            const inTrial = elapsed < TRIAL_MS;
            const hoursLeft = Math.max(1, Math.ceil((TRIAL_MS - elapsed) / (60 * 60 * 1000)));
            return inTrial ? (
              <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">⏱</span>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-teal-700">{hoursLeft} hour{hoursLeft !== 1 ? 's' : ''} left</span> in your free trial — all features are unlocked right now
                  </p>
                </div>
                <Link
                  href="/upgrade?from=%2Fdashboard"
                  className="shrink-0 text-xs font-bold text-white rounded-full px-3 py-1.5 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#4AB7A6' }}
                >
                  Upgrade
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">🔒</span>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-amber-700">Your 2-day free trial has ended.</span> Upgrade to Pro to unlock AI tools, Word downloads &amp; more.
                  </p>
                </div>
                <Link
                  href="/upgrade?from=%2Fdashboard"
                  className="shrink-0 text-xs font-bold text-white rounded-full px-3 py-1.5 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#f59e0b' }}
                >
                  Upgrade
                </Link>
              </div>
            );
          })()}

          {/* Mobile upgrade banner — visible below xl where sidebar is hidden */}
          {!isPro && (
            <div className="xl:hidden flex items-center justify-between gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 shrink-0" style={{ color: '#4AB7A6' }} />
                <p className="text-sm text-slate-700 truncate">
                  <span className="font-semibold">Go Pro</span> — unlock Word downloads, AI tailoring &amp; more
                </p>
              </div>
              <Link
                href="/upgrade?from=%2Fdashboard"
                className="shrink-0 text-xs font-bold text-white rounded-full px-3 py-1.5 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#4AB7A6' }}
              >
                Upgrade
              </Link>
            </div>
          )}

          {/* Jobs matched to your resume */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 shrink-0" style={{ color: '#4AB7A6' }} />
                Jobs matched to your resume
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshMatches}
                  disabled={refreshingMatches}
                  className="flex items-center gap-1.5 text-sm text-[#4AB7A6] hover:text-[#3da090] font-medium disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingMatches ? 'animate-spin' : ''}`} />
                  {refreshingMatches ? 'Refreshing…' : 'Refresh'}
                </button>
                <Link href="/dashboard/find-jobs" className="text-sm text-slate-500 hover:text-slate-700">
                  Find more →
                </Link>
              </div>
            </div>

            {/* Active resume chip */}
            {activeResume && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-sm">
                  <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: '#4AB7A6' }} />
                  <span className="font-medium text-slate-800 max-w-[180px] truncate">{activeResume.title}</span>
                </div>
                <button
                  onClick={() => setShowResumePicker((v) => !v)}
                  className="text-xs font-medium text-slate-500 hover:text-[#4AB7A6] transition-colors"
                >
                  {showResumePicker ? 'Cancel' : 'Change'}
                </button>
                <button
                  onClick={handleRemoveActiveResume}
                  className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Inline resume picker */}
            {showResumePicker && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select a resume for job matching</p>
                <div className="flex flex-wrap gap-2">
                  {displayResumes.map((r) => (
                    <button
                      key={r.id}
                      disabled={settingActiveId === r.id}
                      onClick={() => handleSetActiveResume(r)}
                      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                        r.finalized_at
                          ? 'border-[#4AB7A6] bg-teal-50 text-teal-700 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:border-[#4AB7A6] hover:text-[#4AB7A6]'
                      }`}
                    >
                      {settingActiveId === r.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : r.finalized_at
                        ? <CheckCircle2 className="w-3 h-3" />
                        : null}
                      {r.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(loadingMatches || hasFinalizedResume === null) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl overflow-hidden skeleton-shimmer" />
                ))}
              </div>
            ) : !hasFinalizedResume ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-700 mb-2">No resume selected for matching</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Choose a resume to use for job matching. We&apos;ll find jobs that fit your skills and experience.
                </p>
                {displayResumes.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {displayResumes.slice(0, 3).map((r) => (
                      <button
                        key={r.id}
                        disabled={settingActiveId === r.id}
                        onClick={() => handleSetActiveResume(r)}
                        className="flex items-center gap-1.5 text-sm px-4 py-2 border border-slate-200 rounded-full hover:border-[#4AB7A6] hover:text-[#4AB7A6] transition-colors disabled:opacity-60"
                      >
                        {settingActiveId === r.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Use &ldquo;{r.title}&rdquo;
                      </button>
                    ))}
                  </div>
                ) : (
                  <Button onClick={handleNewResume} className="bg-[#4AB7A6] hover:bg-[#3da090] text-white rounded-full">
                    Build your resume
                  </Button>
                )}
              </div>
            ) : jobMatches.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-700 mb-2">No matches yet</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Click &ldquo;Refresh matches&rdquo; to find jobs that fit your resume, or{' '}
                  <Link href="/dashboard/find-jobs" className="text-[#4AB7A6] hover:underline">browse all jobs</Link>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobMatches.slice(0, 6).map((match) => {
                  const job = match.jobs;
                  if (!job) return null;
                  const appStatus = match.application_status as string | null;
                  return (
                    <div key={match.id} className="border border-slate-200 rounded-xl p-4 card-hover bg-white">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-slate-900 text-sm line-clamp-1">{job.title}</h3>
                        <span
                          className="shrink-0 text-xs font-bold rounded-full px-2 py-0.5 border"
                          style={
                            match.match_score >= 80
                              ? { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }
                              : match.match_score >= 60
                              ? { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }
                              : { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' }
                          }
                        >
                          {match.match_score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        {job.company ?? '—'}{job.location ? ` · ${job.location}` : ''}
                      </p>
                      {match.matched_reasons && match.matched_reasons.length > 0 && (
                        <p className="text-xs text-slate-400 mb-3 line-clamp-1">{match.matched_reasons[0]}</p>
                      )}
                      <div className="flex items-center justify-between">
                        {appStatus && (appStatus === 'applied' || appStatus === 'interview' || appStatus === 'offer') ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Applied
                          </span>
                        ) : (() => {
                          const trialMs = 2 * 24 * 60 * 60 * 1000;
                          const canApply = isPro || (accountCreatedAt ? Date.now() - new Date(accountCreatedAt).getTime() < trialMs : false);
                          return canApply ? (
                            <button
                              onClick={async () => {
                                const res = await fetch('/api/jobs/apply', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ job_id: job.id }),
                                });
                                const data = await res.json();
                                window.open(data.redirect_url ?? job.redirect_url, '_blank', 'noopener,noreferrer');
                                showToast('Opening job — did you finish applying?');
                              }}
                              className="flex items-center gap-1 text-xs text-[#4AB7A6] hover:text-[#3da090] font-medium"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Apply
                            </button>
                          ) : (
                            <a
                              href="/upgrade?from=%2Fdashboard"
                              className="flex items-center gap-1 text-xs font-semibold text-white rounded-full px-2.5 py-1 transition-opacity hover:opacity-90"
                              style={{ backgroundColor: '#4AB7A6' }}
                            >
                              <Crown className="w-3 h-3" />
                              Pro
                            </a>
                          );
                        })()}
                        <a
                          href={job.redirect_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          View job →
                        </a>
                      </div>
                    </div>
                  );
                })}
                {jobMatches.length > 6 && (
                  <Link
                    href="/dashboard/find-jobs"
                    className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center text-sm text-slate-400 hover:border-[#4AB7A6] hover:text-[#4AB7A6] transition-colors"
                  >
                    +{jobMatches.length - 6} more matches →
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* My Resumes — the "Create New" button was removed from this header
              because we already have a primary "Build New Resume" CTA at the
              top of the page plus the dashed "+ New Resume" card at the end
              of the grid. Three entry points was noisy. */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-900">My Resumes</h2>
            </div>

            {loadingResumes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="min-h-[220px] rounded-2xl overflow-hidden skeleton-shimmer" />
                ))}
              </div>
            ) : resumeError ? (
              <Card className="border-red-100 shadow-none">
                <CardContent className="py-10 text-center text-sm text-red-500">{resumeError}</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayResumes.map((resume) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    downloadingId={downloadingId}
                    onDelete={handleDeleteResume}
                    onDuplicate={handleDuplicateResume}
                    onDownloadPdf={handleDownloadPdf}
                    onDownloadWord={handleDownloadWord}
                    onShare={(id) => handleShare(id, 'resume')}
                  />
                ))}
                <button
                  onClick={handleNewResume}
                  disabled={creatingResume}
                  className="min-h-[220px] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-[#4AB7A6] hover:text-[#4AB7A6] card-hover transition-colors active:scale-[0.98]"
                >
                  {creatingResume ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                  <span className="text-sm font-medium">New Resume</span>
                </button>
              </div>
            )}
          </section>

          {/* My Cover Letters */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-900">My Cover Letters</h2>
              <Button
                onClick={handleNewCoverLetter}
                disabled={creatingCoverLetter}
                variant="outline"
                className="rounded-full text-sm font-medium border-slate-200 text-slate-700 hover:bg-slate-50 h-8 px-4"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Create New
              </Button>
            </div>

            {loadingCoverLetters ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="min-h-[140px] rounded-2xl overflow-hidden skeleton-shimmer" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayCoverLetters.map((cl) => (
                  <CoverLetterCard
                    key={cl.id}
                    coverLetter={cl}
                    downloadingId={downloadingId}
                    onDelete={handleDeleteCoverLetter}
                    onDuplicate={handleDuplicateCoverLetter}
                    onDownloadPdf={(id) => {
                      setDownloadingId(id);
                      showToast('Opening cover letter to download PDF...');
                      setTimeout(() => {
                        setDownloadingId(null);
                        router.push(`/builder/cover-letter/${id}?download=1`);
                      }, 600);
                    }}
                    onShare={(id) => handleShare(id, 'cover-letter')}
                  />
                ))}
                <button
                  onClick={handleNewCoverLetter}
                  disabled={creatingCoverLetter}
                  className="min-h-[140px] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-[#4AB7A6] hover:text-[#4AB7A6] transition-colors"
                >
                  {creatingCoverLetter ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                  <span className="text-sm font-medium">New Cover Letter</span>
                </button>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#4AB7A6] card-hover group"
                    style={{ '--stagger-delay': `${QUICK_ACTIONS.indexOf(action) * 60}ms` } as React.CSSProperties}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: action.bg }}
                    >
                      <Icon size={20} style={{ color: action.color }} />
                    </div>
                    <p className="font-semibold text-slate-900 text-sm group-hover:text-[#4AB7A6] transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ATS Tips */}
          <section>
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#4AB7A6' }}>
                  <TrendingUp size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Improve Your ATS Score</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {displayResumes.length > 0
                      ? `Your average ATS score is ${Math.round(displayResumes.reduce((sum, r) => sum + (r.ats_score ?? 0), 0) / displayResumes.length)}/100. Here's how to improve:`
                      : "Boost your resume's ATS score. Here's how:"}
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Add more industry-specific keywords from job descriptions',
                      'Include measurable achievements in each bullet point',
                      'Ensure your contact section includes a LinkedIn URL',
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: '#4AB7A6' }} />
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/dashboard/ats-checker"
                    className="inline-flex items-center gap-1 mt-4 text-sm font-semibold"
                    style={{ color: '#4AB7A6' }}
                  >
                    Run Full ATS Check →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Quick Actions Sidebar — desktop only (xl+) */}
        <aside className="hidden xl:block w-60 flex-shrink-0">
          <div className="sticky top-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Quick Actions</p>
              </div>
              <div className="p-3 space-y-1">
                <button
                  onClick={handleNewResume}
                  disabled={creatingResume}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all duration-150 active:scale-[0.97] text-left"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-teal-50 transition-transform duration-150 group-hover:scale-110">
                    <Plus className="w-4 h-4" style={{ color: '#4AB7A6' }} />
                  </div>
                  New Resume
                </button>
                <button
                  onClick={handleNewCoverLetter}
                  disabled={creatingCoverLetter}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 active:scale-[0.97] text-left"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  New Cover Letter
                </button>
                <Link
                  href="/dashboard/ats-checker"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-700 transition-all duration-150 active:scale-[0.97]"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-50">
                    <Target className="w-4 h-4 text-green-600" />
                  </div>
                  ATS Check
                </Link>
              </div>

              {/* Upgrade nudge — only for free users */}
              {!isPro && (() => {
                const TRIAL_MS = 2 * 24 * 60 * 60 * 1000;
                const inTrial = accountCreatedAt ? Date.now() - new Date(accountCreatedAt).getTime() < TRIAL_MS : false;
                return (
                  <div className={`mx-3 mb-3 mt-1 border rounded-xl p-3 ${inTrial ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: inTrial ? '#4AB7A6' : '#f59e0b' }} />
                      <span className="text-xs font-bold text-slate-900">{inTrial ? 'Free Trial Active' : 'Trial Ended'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug mb-2">
                      {inTrial
                        ? 'You have full access for 2 days. Upgrade to keep it.'
                        : 'Your 2-day trial is up. Upgrade to Pro to continue.'}
                    </p>
                    <Link
                      href="/upgrade?from=%2Fdashboard"
                      className="block text-center text-[11px] font-bold text-white rounded-lg py-1.5 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: inTrial ? '#4AB7A6' : '#f59e0b' }}
                    >
                      Upgrade Now
                    </Link>
                  </div>
                );
              })()}
            </div>
          </div>
        </aside>
      </div>

      {/* Share Modal */}
      {shareTarget && (
        <ShareModal
          id={shareTarget.id}
          type={shareTarget.type}
          onClose={() => setShareTarget(null)}
        />
      )}

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onDone={() => setToastMessage(null)} />
      )}
    </div>
  );
}

// ── Resume card ──────────────────────────────────────────────────────────────
function ResumeCard({
  resume,
  downloadingId,
  onDelete,
  onDuplicate,
  onDownloadPdf,
  onDownloadWord,
  onShare,
}: {
  resume: ResumeRow;
  downloadingId: string | null;
  onDelete: (id: string) => void;
  onDuplicate: (r: ResumeRow) => void;
  onDownloadPdf: (id: string) => void;
  onDownloadWord: (id: string) => void;
  onShare: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const strength = calcStrength(resume.ats_score);
  const isDownloading = downloadingId === resume.id;

  // Segmented strength bar: 3 segments
  const filledSegments = strength >= 85 ? 3 : strength >= 72 ? 2 : 1;
  const segmentColors = ['#f97316', '#f59e0b', '#16a34a'];

  const meta = TEMPLATE_META[resume.template_id] ?? TEMPLATE_META['classic'];

  return (
    <div className="group/card bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden card-hover">
      {/* Resume preview thumbnail */}
      <div className="relative overflow-hidden doc-frame" style={{ height: '172px' }}>
        {/* Subtle top chrome bar */}
        <div className="relative z-10 flex items-center gap-1.5 px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#febc2e' }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#28c840' }} />
          <div className="flex-1" />
          <div className="text-[8px] font-mono text-slate-400 truncate max-w-[80px]">{resume.title.slice(0,16)}.pdf</div>
        </div>
        {/* Document */}
        <div className="relative z-10 absolute inset-0 top-[28px] flex items-stretch justify-stretch px-3 pb-2">
          <div
            className="flex-1 rounded-lg overflow-hidden transition-transform duration-300 group-hover/card:scale-[1.02]"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)' }}
          >
            <TemplatePreview layout={meta.layout} accent={meta.accent} content={previewFromResumeData(resume.data)} />
          </div>
        </div>
        {/* Edit overlay */}
        <Link
          href={`/builder/resume/${resume.id}`}
          className="group/thumb absolute inset-0 z-20 flex items-center justify-center bg-black/0 hover:bg-black/25 transition-colors"
        >
          <span className="opacity-0 group-hover/thumb:opacity-100 transition-all duration-200 scale-95 group-hover/thumb:scale-100 bg-white text-xs font-semibold rounded-full px-4 py-2 shadow-lg" style={{ color: '#4AB7A6' }}>
            ✏ Edit Resume
          </span>
        </Link>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-slate-900 text-sm leading-tight truncate">
            {truncate(resume.title, 32)}
          </p>
          <span
            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: atsColor(resume.ats_score),
              backgroundColor: atsBgColor(resume.ats_score),
            }}
          >
            <TrendingUp className="w-3 h-3" />
            {resume.ats_score != null ? `${resume.ats_score}%` : '—'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">{formatEdited(resume.updated_at)}</p>

        {resume.ats_score != null && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">ATS Score</span>
              <span className="text-xs font-semibold" style={{ color: atsColor(resume.ats_score) }}>
                {atsLabel(resume.ats_score)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full animate-bar-grow"
                style={{
                  width: `${resume.ats_score}%`,
                  backgroundColor: atsColor(resume.ats_score),
                  '--bar-delay': '400ms',
                } as React.CSSProperties}
              />
            </div>
          </div>
        )}

        {/* Resume Strength */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">Strength:</span>
          <div className="flex gap-0.5 flex-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  backgroundColor: i < filledSegments ? segmentColors[i] : '#e2e8f0',
                  transition: `background-color 400ms ease, transform 300ms ease`,
                  transitionDelay: `${i * 80}ms`,
                  transform: i < filledSegments ? 'scaleX(1)' : 'scaleX(0.85)',
                  transformOrigin: 'left',
                }}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-600 shrink-0">{strength}%</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
        <Link href={`/builder/resume/${resume.id}`}>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-medium rounded-full border-[#4AB7A6] text-[#4AB7A6] hover:bg-teal-50"
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
        </Link>

        <div className="flex items-center gap-1.5">
          {/* PDF download */}
          <button
            title="Download PDF"
            onClick={() => onDownloadPdf(resume.id)}
            disabled={isDownloading}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-teal-50 flex items-center justify-center text-slate-400 hover:text-teal-600 transition-all border border-slate-200 hover:border-teal-300 disabled:opacity-60"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Word download */}
          <button
            title="Download Word (.docx)"
            onClick={() => onDownloadWord(resume.id)}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-teal-50 flex items-center justify-center text-slate-400 hover:text-teal-600 transition-all border border-slate-200 hover:border-teal-300"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>

          {/* Share */}
          <button
            title="Share Resume"
            onClick={() => onShare(resume.id)}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-teal-50 flex items-center justify-center text-slate-400 hover:text-teal-600 transition-all border border-slate-200 hover:border-teal-300"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              title="More options"
              onClick={() => setMenuOpen((o) => !o)}
              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all border border-slate-200"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40 z-10 animate-slide-up-fade">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => { onDuplicate(resume); setMenuOpen(false); }}
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  Duplicate
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                  onClick={() => { onDelete(resume.id); setMenuOpen(false); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cover letter card ────────────────────────────────────────────────────────
interface ExtendedCoverLetterRow extends CoverLetterRow {
  company?: string;
}

function CoverLetterCard({
  coverLetter,
  downloadingId,
  onDelete,
  onDuplicate,
  onDownloadPdf,
  onShare,
}: {
  coverLetter: ExtendedCoverLetterRow;
  downloadingId: string | null;
  onDelete: (id: string) => void;
  onDuplicate: (cl: CoverLetterRow) => void;
  onDownloadPdf: (id: string) => void;
  onShare: (id: string) => void;
}) {
  const isDownloading = downloadingId === coverLetter.id;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden card-hover">
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Mail size={18} className="text-blue-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 text-sm leading-tight truncate">
              {truncate(coverLetter.title, 32)}
            </p>
            {coverLetter.company && (
              <p className="text-xs text-slate-500 mt-0.5">{coverLetter.company}</p>
            )}
            <p className="text-xs text-slate-400 mt-0.5">{formatEdited(coverLetter.updated_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <Link href={`/builder/cover-letter/${coverLetter.id}`} className="flex-1">
            <Button
              size="sm"
              className="w-full h-8 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: '#4AB7A6' }}
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
          </Link>

          {/* PDF download */}
          <button
            title="Download PDF"
            onClick={() => onDownloadPdf(coverLetter.id)}
            disabled={isDownloading}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-teal-50 flex items-center justify-center text-slate-400 hover:text-teal-600 transition-all border border-slate-200 hover:border-teal-300 disabled:opacity-60"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Share */}
          <button
            title="Share Cover Letter"
            onClick={() => onShare(coverLetter.id)}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-teal-50 flex items-center justify-center text-slate-400 hover:text-teal-600 transition-all border border-slate-200 hover:border-teal-300"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            title="Duplicate"
            onClick={() => onDuplicate(coverLetter)}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all border border-slate-200"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            title="Delete"
            onClick={() => onDelete(coverLetter.id)}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-slate-200 hover:border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
