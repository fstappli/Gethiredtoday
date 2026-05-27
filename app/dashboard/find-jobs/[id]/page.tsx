'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Building2, MapPin, Clock, Banknote, Briefcase,
  Calendar, Tag, Loader2, AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ApplyButton } from '@/components/jobs/apply-button';
import type { Job } from '@/types/jobs';

function workTypeLabel(type: Job['work_type']): string {
  if (type === 'remote') return 'Remote';
  if (type === 'hybrid') return 'Hybrid';
  if (type === 'on_site') return 'On-site';
  return '';
}

function contractLabel(type: string | null): string {
  if (!type) return '';
  const map: Record<string, string> = {
    full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship',
  };
  return map[type] ?? type;
}

function formatSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return '';
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
  const sym = currency === 'GBP' ? '£' : '$';
  if (min && max) return `${sym}${fmt(min)} – ${sym}${fmt(max)}`;
  if (min) return `From ${sym}${fmt(min)}`;
  if (max) return `Up to ${sym}${fmt(max)}`;
  return '';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function JobDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Try sessionStorage first for instant render
    try {
      const cached = sessionStorage.getItem(`job_${id}`);
      if (cached) {
        setJob(JSON.parse(cached));
        setLoading(false);
      }
    } catch {}

    // Always fetch from API to get fresh data
    fetch(`/api/jobs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((d) => {
        setJob(d.job);
        setLoading(false);
        try { sessionStorage.setItem(`job_${id}`, JSON.stringify(d.job)); } catch {}
      })
      .catch(() => {
        if (!job) setError(true);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="px-6 lg:px-8 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="font-semibold text-slate-700 mb-2">Job not found</h2>
        <p className="text-slate-500 text-sm mb-6">
          This job may have expired or been removed.
        </p>
        <Link
          href="/dashboard/find-jobs"
          className="inline-flex items-center gap-2 text-sm text-[#4AB7A6] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to search
        </Link>
      </div>
    );
  }

  if (!job) return null;

  const wt = workTypeLabel(job.work_type);
  const ct = contractLabel(job.contract_type);
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);
  const posted = formatDate(job.posted_at);

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 lg:px-8 py-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{job.title}</h1>

            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
              {job.company && (
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Building2 className="w-4 h-4 shrink-0" />
                  {job.company}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {job.location}
                </span>
              )}
              {posted && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 shrink-0" />
                  Posted {posted}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {wt && (
                <Badge variant="secondary" className="text-xs rounded-full px-3 py-1 bg-[#f0fdfa] text-[#0f766e] border border-[#99f6e4]">
                  {wt}
                </Badge>
              )}
              {ct && (
                <Badge variant="outline" className="text-xs rounded-full px-3 py-1 text-slate-600">
                  {ct}
                </Badge>
              )}
              {job.category && (
                <Badge variant="outline" className="text-xs rounded-full px-3 py-1 text-slate-500">
                  <Tag className="w-3 h-3 mr-1" />
                  {job.category}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end shrink-0">
            <ApplyButton
              jobId={job.id}
              redirectUrl={job.redirect_url}
              job={job}
              size="default"
            />
            {salary && (
              <span className="flex items-center gap-1 text-sm font-medium text-slate-700">
                <Banknote className="w-4 h-4 text-slate-400" />
                {salary} / yr
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 lg:px-8 py-6 max-w-4xl">
        {job.description ? (
          <div>
            <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Job Description
            </h2>
            <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">No description available.</p>
        )}

        {/* Full description note */}
        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
          <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-800 mb-0.5">View the full job posting</p>
            <p>
              This preview may be truncated. Click Apply to visit the employer&apos;s site for the complete
              job description and to submit your application.
            </p>
          </div>
        </div>

        {/* Bottom apply CTA */}
        <div className="mt-8 flex items-center gap-4">
          <ApplyButton
            jobId={job.id}
            redirectUrl={job.redirect_url}
            job={job}
            size="default"
          />
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to results
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense>
      <JobDetailContent />
    </Suspense>
  );
}
