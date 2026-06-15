'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Plus, Edit, Trash2, Copy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { truncate } from '@/lib/utils';
import { ProFeatureGate } from '@/components/pro-feature-gate';

interface CoverLetterRow {
  id: string;
  title: string;
  updated_at: string;
  template_id: string;
}

function formatEdited(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CoverLettersPage() {
  const router = useRouter();
  const [coverLetters, setCoverLetters] = useState<CoverLetterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/user/subscription-status')
      .then((r) => r.json())
      .then((d) => setIsPro(d.isPro ?? false))
      .catch(() => setIsPro(false));
  }, []);

  const handleNewCoverLetter = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Cover Letter', template_id: 'professional', data: {}, contact: {} }),
      });
      if (res.ok) {
        const { coverLetter } = await res.json();
        router.push(`/builder/cover-letter/${coverLetter.id}`);
      }
    } catch {
      setCreating(false);
    }
  };

  const fetchCoverLetters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cover-letter');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCoverLetters(data.coverLetters ?? []);
    } catch {
      setError('Failed to load your cover letters. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCoverLetters();
  }, [fetchCoverLetters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cover letter?')) return;
    setCoverLetters((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/cover-letter/${id}`, { method: 'DELETE' });
    } catch {
      fetchCoverLetters();
    }
  };

  const handleDuplicate = async (cl: CoverLetterRow) => {
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
        }),
      });
      if (createRes.ok) fetchCoverLetters();
    } catch {}
  };

  if (isPro === null) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <ProFeatureGate
        title="AI Cover Letter Builder"
        description="Generate tailored cover letters in seconds. Match your cover letter to your resume template automatically."
        features={[
          'AI-powered cover letters in seconds',
          'Auto-matches your resume template & colors',
          'Customise tone, length, and style',
          'Export as PDF or Word',
        ]}
        from="/dashboard/cover-letters"
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cover Letters</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your AI-generated cover letters</p>
        </div>
        <Button onClick={handleNewCoverLetter} disabled={creating} className="rounded-full font-medium text-white text-sm" style={{ backgroundColor: '#4AB7A6' }}>
          {creating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
          <span className="hidden sm:inline">New </span>Cover Letter
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
      ) : coverLetters.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 shadow-none">
          <CardContent className="py-14 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">No cover letters yet</p>
              <p className="text-sm text-gray-400 mt-0.5">Generate AI-powered cover letters tailored to each job</p>
            </div>
            <Button onClick={handleNewCoverLetter} disabled={creating} className="mt-1 rounded-full font-medium text-white" style={{ backgroundColor: '#4AB7A6' }}>
              {creating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
              Create Cover Letter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {coverLetters.map((cl) => (
            <Card key={cl.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
                      {truncate(cl.title, 32)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{cl.template_id} template</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Edited {formatEdited(cl.updated_at)}</p>
                <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                  <Link href={`/builder/cover-letter/${cl.id}`} className="flex-1">
                    <Button size="sm" className="w-full h-8 text-xs font-medium rounded-lg text-white" style={{ backgroundColor: '#4AB7A6' }}>
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-gray-200" title="Duplicate" onClick={() => handleDuplicate(cl)}>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-gray-200 hover:border-red-200 hover:text-red-500" title="Delete" onClick={() => handleDelete(cl.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <button onClick={handleNewCoverLetter} disabled={creating} className="h-full min-h-[160px] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#4AB7A6] hover:text-[#4AB7A6] transition-colors disabled:opacity-50">
            {creating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
            <span className="text-sm font-medium">New Cover Letter</span>
          </button>
        </div>
      )}
    </div>
  );
}
