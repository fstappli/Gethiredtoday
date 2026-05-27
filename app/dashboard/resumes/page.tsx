'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Edit, Trash2, Copy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { truncate } from '@/lib/utils';
import { TemplatePreview, previewFromResumeData } from '@/components/template-preview';
import type { TemplateLayout } from '@/components/template-preview';
import type { ResumeData } from '@/types';

const TEMPLATE_META: Record<string, { layout: TemplateLayout; accent: string }> = {
  classic:        { layout: 'classic',      accent: '#4AB7A6' },
  modern:         { layout: 'sidebar',      accent: '#1e293b' },
  minimal:        { layout: 'minimal',      accent: '#1d4ed8' },
  executive:      { layout: 'executive',    accent: '#0f172a' },
  creative:       { layout: 'creative',     accent: '#7c3aed' },
  simple:         { layout: 'centered',     accent: '#0891b2' },
  // New pro layouts
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
  data?: ResumeData;
}

function formatEdited(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function atsColor(score: number | null): string {
  if (score == null) return '#9ca3af';
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#eab308';
  return '#ef4444';
}

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating] = useState(false);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/resume');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setResumes(data.resumes ?? []);
    } catch {
      setError('Failed to load your resumes. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  const handleNewResume = async () => {
    // Route to the new guided wizard — it handles template picking + creation.
    router.push('/builder/wizard');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    setResumes((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/resume/${id}`, { method: 'DELETE' });
      if (!res.ok) fetchResumes();
    } catch {
      fetchResumes();
    }
  };

  const handleDuplicate = async (r: ResumeRow) => {
    try {
      const res = await fetch(`/api/resume/${r.id}`);
      if (!res.ok) return;
      const { resume: full } = await res.json();
      const createRes = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${r.title} (Copy)`,
          template_id: r.template_id,
          data: full.data ?? {},
        }),
      });
      if (createRes.ok) fetchResumes();
    } catch {}
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Resumes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your AI-powered resumes</p>
        </div>
        <Button onClick={handleNewResume} disabled={creating} className="rounded-full font-medium text-white text-sm" style={{ backgroundColor: '#4AB7A6' }}>
          {creating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
          <span className="hidden sm:inline">New </span>Resume
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <Card className="border-red-100 shadow-none">
          <CardContent className="py-10 text-center text-sm text-red-500">{error}</CardContent>
        </Card>
      ) : resumes.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 shadow-none">
          <CardContent className="py-14 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">No resumes yet</p>
              <p className="text-sm text-gray-400 mt-0.5">Build an ATS-optimized resume in minutes</p>
            </div>
            <Button onClick={handleNewResume} disabled={creating} className="mt-1 rounded-full font-medium text-white" style={{ backgroundColor: '#4AB7A6' }}>
              {creating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
              Build Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {resumes.map((r) => {
            const meta = TEMPLATE_META[r.template_id] ?? TEMPLATE_META.classic;
            return (
              <Card key={r.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="aspect-[8.5/11] w-full border-b border-slate-100 overflow-hidden bg-slate-50">
                  <Link href={`/builder/resume/${r.id}`} className="block h-full">
                    <TemplatePreview
                      layout={meta.layout}
                      accent={meta.accent}
                      content={previewFromResumeData(r.data)}
                    />
                  </Link>
                </div>
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
                        {truncate(r.title, 32)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Edited {formatEdited(r.updated_at)}</p>
                    </div>
                    {r.ats_score != null && (
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">ATS</span>
                        <span className="text-sm font-bold" style={{ color: atsColor(r.ats_score) }}>{r.ats_score}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Link href={`/builder/resume/${r.id}`} className="flex-1">
                      <Button size="sm" className="w-full h-8 text-xs font-medium rounded-lg text-white" style={{ backgroundColor: '#4AB7A6' }}>
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-gray-200" title="Duplicate" onClick={() => handleDuplicate(r)}>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-gray-200 hover:border-red-200 hover:text-red-500" title="Delete" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <button onClick={handleNewResume} disabled={creating} className="rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#4AB7A6] hover:text-[#4AB7A6] transition-colors disabled:opacity-50 min-h-[320px]">
            {creating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
            <span className="text-sm font-medium">New Resume</span>
          </button>
        </div>
      )}
    </div>
  );
}
