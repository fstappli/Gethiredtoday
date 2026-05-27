'use client';

import Link from 'next/link';
import { Building2, MapPin, Clock, Banknote, Bookmark, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApplyButton } from './apply-button';
import { ScoreBadge } from './score-badge';
import type { Job, ApplicationStatus } from '@/types/jobs';

interface JobCardProps {
  job: Job;
  matchScore?: number;
  matchReasons?: string[];
  applicationStatus?: ApplicationStatus | null;
  onStatusChange?: (status: ApplicationStatus) => void;
  onSave?: (jobId: string) => void;
}

function workTypeLabel(type: Job['work_type']): string {
  if (type === 'remote') return 'Remote';
  if (type === 'hybrid') return 'Hybrid';
  if (type === 'on_site') return 'On-site';
  return '';
}

function contractLabel(type: string | null): string {
  if (!type) return '';
  const map: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
  };
  return map[type] ?? type;
}

function formatSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return '';
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
  const sym = currency === 'GBP' ? '£' : '$';
  if (min && max) return `${sym}${fmt(min)}–${sym}${fmt(max)}`;
  if (min) return `From ${sym}${fmt(min)}`;
  if (max) return `Up to ${sym}${fmt(max)}`;
  return '';
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCardSkeleton() {
  return (
    <Card className="border-slate-200 shadow-sm animate-pulse">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="flex gap-2 mt-2">
              <div className="h-5 bg-slate-100 rounded-full w-16" />
              <div className="h-5 bg-slate-100 rounded-full w-20" />
            </div>
          </div>
          <div className="h-8 bg-slate-200 rounded-full w-20 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

export function JobCard({
  job,
  matchScore,
  matchReasons,
  applicationStatus,
  onStatusChange,
  onSave,
}: JobCardProps) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);
  const wt = workTypeLabel(job.work_type);
  const ct = contractLabel(job.contract_type);
  const posted = timeAgo(job.posted_at);

  const storeJob = () => {
    try { sessionStorage.setItem(`job_${job.id}`, JSON.stringify(job)); } catch {}
  };

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            {/* Title — links to detail page */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <Link
                href={`/dashboard/find-jobs/${job.id}`}
                onClick={storeJob}
                className="font-semibold text-slate-900 text-base leading-tight line-clamp-2 hover:text-[#4AB7A6] transition-colors"
              >
                {job.title}
              </Link>
              {matchScore != null && (
                <ScoreBadge score={matchScore} reasons={matchReasons} size="sm" />
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 flex-wrap">
              {job.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  {job.company}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {job.location}
                </span>
              )}
              {posted && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {posted}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {wt && (
                <Badge variant="secondary" className="text-xs rounded-full px-2.5 py-0.5 bg-[#f0fdfa] text-[#0f766e] border-[#99f6e4]">
                  {wt}
                </Badge>
              )}
              {ct && (
                <Badge variant="outline" className="text-xs rounded-full px-2.5 py-0.5 text-slate-600">
                  {ct}
                </Badge>
              )}
              {job.category && (
                <Badge variant="outline" className="text-xs rounded-full px-2.5 py-0.5 text-slate-500">
                  {job.category}
                </Badge>
              )}
              {salary && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Banknote className="w-3.5 h-3.5" />
                  {salary}
                </span>
              )}
            </div>

            {job.description && (
              <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                {job.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSave?.(job.id)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#4AB7A6] transition-colors"
              aria-label="Save job"
            >
              <Bookmark className="w-4 h-4" />
              Save
            </button>
            <Link
              href={`/dashboard/find-jobs/${job.id}`}
              onClick={storeJob}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#4AB7A6] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Details
            </Link>
          </div>
          <ApplyButton
            jobId={job.id}
            redirectUrl={job.redirect_url}
            job={job}
            existingStatus={applicationStatus}
            onStatusChange={onStatusChange}
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
