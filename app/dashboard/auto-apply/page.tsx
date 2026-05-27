'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, Pause, Play, AlertTriangle, CheckCircle2, Clock, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ApplyButton } from '@/components/jobs/apply-button';
import type { AutoApplySettings, AutoApplyRun } from '@/types/jobs';

interface QueuedJob {
  id: string;
  status: string;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    company: string | null;
    location: string | null;
    redirect_url: string;
    category: string | null;
    work_type: string | null;
  } | null;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function AutoApplyPage() {
  const [settings, setSettings] = useState<AutoApplySettings | null>(null);
  const [queuedJobs, setQueuedJobs] = useState<QueuedJob[]>([]);
  const [runs, setRuns] = useState<AutoApplyRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local editable state
  const [enabled, setEnabled] = useState(false);
  const [minScore, setMinScore] = useState(75);
  const [dailyCap, setDailyCap] = useState(10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, queueRes] = await Promise.all([
        fetch('/api/jobs/auto-apply/settings'),
        fetch('/api/jobs/auto-apply/queue'),
      ]);
      if (settingsRes.ok) {
        const { settings: s } = await settingsRes.json();
        setSettings(s);
        if (s) {
          setEnabled(s.enabled);
          setMinScore(s.min_match_score ?? 75);
          setDailyCap(s.daily_cap ?? 10);
        }
      }
      if (queueRes.ok) {
        const data = await queueRes.json();
        setQueuedJobs(data.queue ?? []);
        setRuns(data.runs ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/jobs/auto-apply/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, min_match_score: minScore, daily_cap: dailyCap }),
      });
      if (res.ok) {
        const { settings: s } = await res.json();
        setSettings(s);
        showToast('Settings saved.');
      } else {
        showToast('Failed to save settings. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePause = async () => {
    const isPaused = Boolean(settings?.paused_at);
    const res = await fetch('/api/jobs/auto-apply/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paused_at: isPaused ? null : new Date().toISOString() }),
    });
    if (res.ok) {
      await loadData();
      showToast(isPaused ? 'Auto-apply resumed.' : 'Auto-apply paused.');
    } else {
      showToast('Failed to update. Please try again.');
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/jobs/auto-apply/queue', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message ?? `Queued ${data.queued ?? 0} jobs.`);
        await loadData();
      } else {
        showToast('Failed to queue jobs. Please try again.');
      }
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const isPaused = Boolean(settings?.paused_at);

  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-slate-100 px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-6 h-6 shrink-0" style={{ color: '#4AB7A6' }} />
          Auto-Apply
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Automatically queue top matching jobs for your 1-tap review.
        </p>
      </div>

      {/* Important safety notice */}
      <div className="mx-6 lg:mx-8 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900 mb-1">How auto-apply works</p>
          <p className="text-blue-700">
            Because jobs are on employer and ATS sites, auto-apply queues matching jobs for <strong>your review</strong> — it never submits
            on your behalf. You visit each employer site and apply with one tap.
            This means your applications are always deliberate and properly completed.
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 grid lg:grid-cols-2 gap-6">
        {/* Settings card */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Settings</h2>

            <div className="space-y-5">
              {/* Enable toggle */}
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-800">Enable auto-apply</p>
                  <p className="text-xs text-slate-500 mt-0.5">Queue top-matching jobs automatically</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-[#4AB7A6]' : 'bg-slate-200'}`}
                  role="switch"
                  aria-checked={enabled}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </label>

              {/* Min match score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-800">
                    Minimum match score
                  </label>
                  <span className="text-sm font-bold" style={{ color: '#4AB7A6' }}>{minScore}%</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={95}
                  step={5}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full accent-[#4AB7A6]"
                  aria-label="Minimum match score"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>40% (broader)</span>
                  <span>95% (stricter)</span>
                </div>
              </div>

              {/* Daily cap */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-800">Daily queue limit</label>
                  <span className="text-sm font-bold" style={{ color: '#4AB7A6' }}>{dailyCap} jobs</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  step={1}
                  value={dailyCap}
                  onChange={(e) => setDailyCap(Number(e.target.value))}
                  className="w-full accent-[#4AB7A6]"
                  aria-label="Daily queue limit"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 bg-[#4AB7A6] hover:bg-[#3da090] text-white rounded-full"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save settings
                </Button>

                {settings && (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={handlePause}
                    disabled={saving}
                  >
                    {isPaused ? <Play className="w-4 h-4 mr-1.5" /> : <Pause className="w-4 h-4 mr-1.5" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                )}
              </div>

              {settings?.enabled && (
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={handleRunNow}
                  disabled={running}
                >
                  {running ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                  Run now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity log */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Recent runs</h2>
            {runs.length === 0 ? (
              <p className="text-sm text-slate-400">No runs yet. Enable auto-apply and click Run now.</p>
            ) : (
              <div className="space-y-3">
                {runs.map((run) => (
                  <div key={run.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <CheckCircle2 className="w-4 h-4 text-[#4AB7A6] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">
                        <strong>{run.queued}</strong> queued for review · <strong>{run.skipped}</strong> skipped
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatTime(run.run_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Queued jobs */}
      {queuedJobs.length > 0 && (
        <div className="px-6 lg:px-8 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-900">Ready to apply ({queuedJobs.length})</h2>
            <span className="text-xs text-slate-500">— tap Apply to visit each employer site</span>
          </div>

          <div className="space-y-2">
            {queuedJobs.map((app) => {
              const job = app.jobs;
              if (!job) return null;
              return (
                <div key={app.id} className="flex items-center gap-4 p-4 border border-amber-200 bg-amber-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{job.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {job.company ?? '—'}{job.location ? ` · ${job.location}` : ''}
                    </p>
                  </div>
                  <ApplyButton
                    jobId={job.id}
                    redirectUrl={job.redirect_url}
                    existingStatus="redirected"
                    size="sm"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg flex gap-2 text-xs text-slate-500">
            <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
            Auto-apply never submits on external employer sites — you confirm each application yourself.
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
