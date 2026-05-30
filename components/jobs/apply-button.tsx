'use client';

import { useState } from 'react';
import { ExternalLink, CheckCircle2, Loader2, Clock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ApplicationStatus, Job } from '@/types/jobs';

interface ApplyButtonProps {
  jobId: string;
  redirectUrl: string;
  job?: Job;
  existingStatus?: ApplicationStatus | null;
  onStatusChange?: (status: ApplicationStatus) => void;
  size?: 'sm' | 'default';
  isPro?: boolean;
  accountCreatedAt?: string | null;
}

const TRIAL_MS = 2 * 24 * 60 * 60 * 1000;

function getTrialState(isPro: boolean, accountCreatedAt: string | null | undefined): {
  canApply: boolean;
  inTrial: boolean;
  trialDaysLeft: number;
} {
  if (isPro) return { canApply: true, inTrial: false, trialDaysLeft: 0 };
  if (!accountCreatedAt) return { canApply: false, inTrial: false, trialDaysLeft: 0 };
  const ageMs = Date.now() - new Date(accountCreatedAt).getTime();
  if (ageMs < TRIAL_MS) {
    const msLeft = TRIAL_MS - ageMs;
    const daysLeft = Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
    return { canApply: true, inTrial: true, trialDaysLeft: daysLeft };
  }
  return { canApply: false, inTrial: false, trialDaysLeft: 0 };
}

export function ApplyButton({
  jobId,
  redirectUrl,
  job,
  existingStatus,
  onStatusChange,
  size = 'default',
  isPro = false,
  accountCreatedAt,
}: ApplyButtonProps) {
  const [status, setStatus] = useState<ApplicationStatus | null>(existingStatus ?? null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const { canApply, inTrial, trialDaysLeft } = getTrialState(isPro, accountCreatedAt);

  const handleApply = async () => {
    if (status === 'applied') return;
    if (!redirectUrl) return;

    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    setStatus('redirected');
    onStatusChange?.('redirected');
    setShowConfirm(true);

    setLoading(true);
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, redirect_url: redirectUrl, job_data: job ?? null }),
      });
      const data = await res.json();
      if (res.ok || res.status === 201) {
        setApplicationId(data.application?.id ?? null);
        if (data.duplicate && data.application?.status) {
          setStatus(data.application.status);
          onStatusChange?.(data.application.status);
        }
      }
    } catch {
      // tracking failed silently
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (confirmed: boolean) => {
    setShowConfirm(false);
    if (!applicationId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/jobs/apply/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId, confirmed }),
      });
      if (res.ok) {
        const newStatus: ApplicationStatus = confirmed ? 'applied' : 'redirected';
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 min-w-[200px]">
        <p className="text-xs text-slate-600 font-medium">Did you finish applying?</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-[#4AB7A6] hover:bg-[#3da090] text-white text-xs"
            onClick={() => handleConfirm(true)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
            Yes, applied
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleConfirm(false)} disabled={loading}>
            Not yet
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'applied' || status === 'viewed' || status === 'interview' || status === 'offer') {
    return (
      <Button size={size} variant="outline" disabled className="border-green-200 text-green-700 bg-green-50 cursor-default">
        <CheckCircle2 className="w-4 h-4 mr-1.5" />
        Applied
      </Button>
    );
  }

  if (status === 'redirected') {
    return (
      <Button
        size={size}
        variant="outline"
        className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
        onClick={() => {
          if (redirectUrl) window.open(redirectUrl, '_blank', 'noopener,noreferrer');
          setShowConfirm(true);
        }}
      >
        <Clock className="w-4 h-4 mr-1.5" />
        Finish applying
      </Button>
    );
  }

  // Locked — trial expired and not Pro
  if (!canApply) {
    return (
      <div className="flex flex-col items-end gap-1">
        <a
          href={`/upgrade?from=%2Fdashboard%2Ffind-jobs`}
          className={`inline-flex items-center gap-1.5 font-semibold text-white rounded-full transition-all hover:-translate-y-0.5 ${size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'}`}
          style={{
            background: 'linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)',
            boxShadow: '0 4px 12px -3px rgba(74,183,166,0.4)',
          }}
        >
          <Crown className="w-3.5 h-3.5" />
          Upgrade to Apply
        </a>
        {size !== 'sm' && (
          <p className="text-[11px] text-slate-400">Free trial ended · Pro required</p>
        )}
      </div>
    );
  }

  // Free trial still active — show Apply with trial countdown
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size={size}
        className="bg-[#4AB7A6] hover:bg-[#3da090] text-white"
        onClick={handleApply}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-1.5" />}
        Apply
      </Button>
      {inTrial && (
        <span className="text-[11px] text-amber-600 font-medium">
          {trialDaysLeft === 1 ? 'Last day free' : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} free left`}
        </span>
      )}
    </div>
  );
}
