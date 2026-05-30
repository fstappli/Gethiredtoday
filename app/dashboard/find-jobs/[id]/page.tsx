'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Building2, MapPin, Clock, Banknote, Briefcase,
  Calendar, Tag, Loader2, AlertCircle,
} from 'lucide-react';
import { ApplyButton } from '@/components/jobs/apply-button';
import type { Job } from '@/types/jobs';

// ── Pure helper functions — unchanged ───────────────────────────────────────

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

// ── Component ────────────────────────────────────────────────────────────────

function JobDetailContent() {
  // ── State & effects — UNCHANGED ────────────────────────────────────────────
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/subscription-status')
      .then((r) => r.json())
      .then((d) => {
        setIsPro(d.isPro ?? false);
        setAccountCreatedAt(d.accountCreatedAt ?? null);
      })
      .catch(() => {});
  }, []);

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

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading && !job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="px-6 lg:px-8 pt-5 pb-3">
          <div className="h-4 w-28 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="mx-4 lg:mx-8 rounded-2xl overflow-hidden animate-pulse"
          style={{ background: 'linear-gradient(135deg, #0f766e 0%, #4AB7A6 100%)' }}>
          <div className="px-6 lg:px-10 py-10">
            <div className="h-8 bg-white/20 rounded-xl w-2/3 mb-4" />
            <div className="h-4 bg-white/15 rounded-lg w-1/3 mb-2" />
            <div className="h-4 bg-white/10 rounded-lg w-1/4 mb-5" />
            <div className="flex gap-2">
              <div className="h-7 w-20 bg-white/15 rounded-full" />
              <div className="h-7 w-24 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
        <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3 animate-pulse">
            <div className="h-5 bg-slate-100 rounded-lg w-1/4 mb-4" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-4 bg-slate-100 rounded ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error && !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Job not found</h2>
          <p className="text-slate-500 text-sm mb-6">
            This job may have expired or been removed.
          </p>
          <Link
            href="/dashboard/find-jobs"
            className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#4AB7A6' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  if (!job) return null;

  // ── Derived display values — UNCHANGED ────────────────────────────────────
  const wt = workTypeLabel(job.work_type);
  const ct = contractLabel(job.contract_type);
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);
  const posted = formatDate(job.posted_at);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Back nav ── */}
      <div className="px-6 lg:px-8 pt-5 pb-0">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#4AB7A6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </button>
      </div>

      {/* ── Hero banner ── */}
      <div
        className="mx-4 lg:mx-8 mt-4 rounded-2xl overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0d6b61 0%, #0d9488 55%, #4AB7A6 100%)' }}
      >
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative px-6 lg:px-10 py-8 lg:py-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">

            {/* Left: title + company + location + date */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight mb-3">
                {job.title}
              </h1>

              <div className="flex items-center gap-x-5 gap-y-1.5 flex-wrap">
                {job.company && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-white/95">
                    <Building2 className="w-4 h-4 shrink-0 text-white/70" />
                    {job.company}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-1.5 text-sm text-white/80">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-white/60" />
                    {job.location}
                  </span>
                )}
                {posted && (
                  <span className="flex items-center gap-1.5 text-xs text-white/60">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    Posted {posted}
                  </span>
                )}
              </div>

              {/* Meta chips */}
              {(wt || ct || job.category || salary) && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {wt && (
                    <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/10">
                      {wt}
                    </span>
                  )}
                  {ct && (
                    <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 text-white border border-white/10">
                      {ct}
                    </span>
                  )}
                  {job.category && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                      <Tag className="w-3 h-3" />
                      {job.category}
                    </span>
                  )}
                  {salary && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/10">
                      <Banknote className="w-3.5 h-3.5 text-white/80" />
                      {salary} / yr
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Apply button */}
            <div className="shrink-0 flex flex-col items-end gap-2 mt-1">
              <ApplyButton
                jobId={job.id}
                redirectUrl={job.redirect_url}
                job={job}
                size="default"
                isPro={isPro}
                accountCreatedAt={accountCreatedAt}
              />
            </div>

          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 lg:px-8 py-6 max-w-4xl mx-auto space-y-4">

        {/* Description card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F7F5' }}>
              <Briefcase className="w-3.5 h-3.5" style={{ color: '#4AB7A6' }} />
            </div>
            <h2 className="font-semibold text-slate-900 text-sm">Job Description</h2>
          </div>
          <div className="px-6 py-6">
            {job.description ? (
              <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic">No description available.</p>
            )}
          </div>
        </div>

        {/* Full posting note */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#E8F7F5' }}>
            <Clock className="w-4 h-4" style={{ color: '#4AB7A6' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-0.5">View the full job posting</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              This preview may be truncated. Click Apply to visit the employer&apos;s site for the complete
              job description and to submit your application.
            </p>
          </div>
        </div>

        {/* Bottom CTA row */}
        <div className="flex items-center gap-4 pt-2 pb-10">
          <ApplyButton
            jobId={job.id}
            redirectUrl={job.redirect_url}
            job={job}
            size="default"
            isPro={isPro}
            accountCreatedAt={accountCreatedAt}
          />
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-500 hover:text-[#4AB7A6] transition-colors"
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
