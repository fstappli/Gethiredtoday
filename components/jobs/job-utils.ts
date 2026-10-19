import { createClient } from '@/lib/supabase';
import type { Job } from '@/types/jobs';

/** Pastel tile colors for company initials (from the design). */
const TILES = [
  { bg: '#EDE9FF', fg: '#4B3BA8' },
  { bg: '#FFE9D6', fg: '#8A3B12' },
  { bg: '#E3F4EE', fg: '#08574B' },
  { bg: '#FFF1CC', fg: '#6B4A00' },
  { bg: '#FBE3EC', fg: '#8A1F48' },
];

export function tileFor(name: string | null | undefined) {
  const s = (name || '?').trim();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return { ...TILES[h % TILES.length], initial: s.charAt(0).toUpperCase() || '?' };
}

export function workTypeLabel(t: Job['work_type']): string {
  return t === 'remote' ? 'Remote' : t === 'hybrid' ? 'Hybrid' : t === 'on_site' ? 'On-site' : '';
}

export function contractLabel(t: string | null): string {
  const map: Record<string, string> = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship' };
  return t ? map[t] ?? t : '';
}

export function formatSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return '';
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
  const sym = currency === 'GBP' ? '£' : currency === 'USD' || !currency ? '$' : `${currency} `;
  if (min && max) return `${sym}${fmt(min)} to ${sym}${fmt(max)}`;
  if (min) return `From ${sym}${fmt(min)}`;
  return `Up to ${sym}${fmt(max as number)}`;
}

export function postedLabel(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function postedDays(dateStr: string | null): number {
  if (!dateStr) return 9999;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 9999 : Math.floor((Date.now() - d.getTime()) / 86400000);
}

const STOP = new Set(
  ('about above after again also been being between both bring build could does doing during each every from have having here into more most must need only other over please role roles same should some such team than that their them then there these they this those through under until very want well were what when where which while will with within would your youll youre work working years year experience ability skills strong including across able looking company join using used make makes help helps like new best good great plus etc').split(' ')
);

/** Keywords that appear repeatedly in the job ad but not in the resume text. */
export function keywordGap(jobText: string, resumeText: string, limit = 5): string[] {
  const resume = resumeText.toLowerCase();
  const counts = new Map<string, number>();
  for (const w of jobText.toLowerCase().match(/[a-z][a-z+#.-]{3,}/g) ?? []) {
    if (STOP.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([w, c]) => c >= 2 && !resume.includes(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

// ─── Save / apply tracking (applications table, RLS: own rows) ───────────────

/** "Saved" is an application row with status `matched`. */
export async function saveJob(job: Job): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from('applications').upsert(
    { user_id: user.id, job_id: job.id, status: 'matched', application_type: 'external_redirect', source: 'saved', redirected_at: null },
    { onConflict: 'user_id,job_id', ignoreDuplicates: true }
  );
  return !error;
}

export async function unsaveJob(jobId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from('applications').delete().eq('user_id', user.id).eq('job_id', jobId).eq('status', 'matched');
  return !error;
}

export async function listSavedJobIds(): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase.from('applications').select('job_id').eq('status', 'matched');
  return new Set((data ?? []).map((r: { job_id: string }) => r.job_id));
}

/** Open the company site and record the application. Upgrades a saved row to "redirected". */
export async function applyOnCompanySite(job: Job): Promise<void> {
  if (job.redirect_url) window.open(job.redirect_url, '_blank', 'noopener,noreferrer');
  try {
    const res = await fetch('/api/jobs/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: job.id, redirect_url: job.redirect_url, job_data: job }),
    });
    const data = await res.json().catch(() => ({}));
    if (data?.duplicate && data?.application?.status === 'matched') {
      const supabase = createClient();
      await supabase.from('applications').update({ status: 'redirected', redirected_at: new Date().toISOString() }).eq('id', data.application.id);
    }
  } catch {
    /* tracking is best effort */
  }
}
