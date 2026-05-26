'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Clock, Eye, Calendar, XCircle, Award, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Application, ApplicationStatus } from '@/types/jobs';

const STATUS_TABS: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'redirected', label: 'Pending' },
];

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  text: string;
  border: string;
  label: string;
}

const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  matched:    { icon: CheckCircle2, bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', label: 'Matched' },
  redirected: { icon: Clock,        bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'Pending' },
  applied:    { icon: CheckCircle2, bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Applied' },
  viewed:     { icon: Eye,          bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Viewed' },
  interview:  { icon: Calendar,     bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff', label: 'Interview' },
  rejected:   { icon: XCircle,      bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Rejected' },
  offer:      { icon: Award,        bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Offer' },
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-0.5 border"
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AppliedJobsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [counts, setCounts] = useState({ applied: 0, redirected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('all');

  const fetchApplications = useCallback(async (status: ApplicationStatus | 'all') => {
    setLoading(true);
    try {
      const params = status === 'all' ? '' : `?status=${status}`;
      const res = await fetch(`/api/jobs/applications${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setApplications(data.applications ?? []);
      if (status === 'all') setCounts(data.counts ?? { applied: 0, redirected: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications('all');
  }, [fetchApplications]);

  const handleTabChange = (tab: ApplicationStatus | 'all') => {
    setActiveTab(tab);
    fetchApplications(tab);
  };

  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-slate-100 px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: '#4AB7A6' }} />
              Applied Jobs
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {counts.applied} confirmed application{counts.applied !== 1 ? 's' : ''}
              {counts.redirected > 0 && ` · ${counts.redirected} pending confirmation`}
            </p>
          </div>
          <Link href="/dashboard/find-jobs">
            <Button variant="outline" className="rounded-full text-sm">
              Find more jobs
            </Button>
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mt-5 overflow-x-auto pb-1 -mx-1 px-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`shrink-0 text-sm px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-[#4AB7A6] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 mb-2">
              {activeTab === 'all' ? 'No applications yet' : `No ${STATUS_CONFIG[activeTab as ApplicationStatus]?.label ?? activeTab} applications`}
            </h3>
            <p className="text-slate-500 text-sm mb-5">
              {activeTab === 'all'
                ? 'Start applying to jobs to track your progress here.'
                : 'Applications in this status will appear here.'}
            </p>
            <Link href="/dashboard/find-jobs">
              <Button className="bg-[#4AB7A6] hover:bg-[#3da090] text-white rounded-full">
                Find Jobs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const job = app.job as typeof app.job;
              if (!job) return null;
              return (
                <div
                  key={app.id}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">
                          {(job as { title?: string }).title ?? 'Unknown position'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {(job as { company?: string }).company ?? '—'}
                          {(job as { location?: string }).location && ` · ${(job as { location?: string }).location}`}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                      <span>
                        Applied: {formatDate(app.applied_at ?? app.redirected_at)}
                      </span>
                      {(job as { category?: string }).category && (
                        <Badge variant="outline" className="text-xs rounded-full">
                          {(job as { category?: string }).category}
                        </Badge>
                      )}
                      <span className="capitalize">
                        {app.application_type === 'external_redirect' ? 'External' : app.application_type}
                      </span>
                    </div>
                  </div>

                  <a
                    href={(job as { redirect_url?: string }).redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 text-slate-400 hover:text-[#4AB7A6] transition-colors"
                    aria-label="View job posting"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
