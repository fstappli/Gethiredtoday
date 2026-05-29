import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { searchJobs, isAdzunaConfigured } from '@/lib/jobs/adzuna';
import { searchJobsJSearch, isJSearchConfigured } from '@/lib/jobs/jsearch';
import { extractResumeProfile, batchScoreJobs } from '@/lib/jobs/match';
import type { ResumeData } from '@/types';

function inferCountry(location: string | null): string {
  if (!location) return 'us';
  const l = location.toLowerCase();
  if (l.includes('dubai') || l.includes('uae') || l.includes('abu dhabi')) return 'ae';
  if (l.includes('london') || l.includes('united kingdom') || l.includes(' uk')) return 'gb';
  if (l.includes('canada') || l.includes('toronto') || l.includes('vancouver')) return 'ca';
  if (l.includes('australia') || l.includes('sydney') || l.includes('melbourne')) return 'au';
  if (l.includes('india') || l.includes('mumbai') || l.includes('bangalore')) return 'in';
  if (l.includes('germany') || l.includes('berlin') || l.includes('munich')) return 'de';
  if (l.includes('pakistan') || l.includes('karachi') || l.includes('lahore') || l.includes('islamabad')) return 'pk';
  return 'us';
}

export interface AutoApplyRunResult {
  queued: number;
  skipped: number;
  message: string;
  unconfigured?: boolean;
}

export async function runAutoApplyForUser(userId: string): Promise<AutoApplyRunResult> {
  const admin = createAdminSupabaseClient();

  if (!isAdzunaConfigured() && !isJSearchConfigured()) {
    return { queued: 0, skipped: 0, message: 'Job API not configured.', unconfigured: true };
  }

  // Get auto-apply settings
  const { data: settings } = await admin
    .from('auto_apply_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!settings?.enabled) return { queued: 0, skipped: 0, message: 'Auto-apply not enabled.' };
  if (settings.paused_at) return { queued: 0, skipped: 0, message: 'Auto-apply is paused.' };

  // Check daily cap — use UTC so the boundary is consistent regardless of server timezone
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const { count: todayCount } = await admin
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', 'auto_apply')
    .gte('created_at', todayStart.toISOString());

  const remaining = settings.daily_cap - (todayCount ?? 0);
  if (remaining <= 0) {
    return { queued: 0, skipped: 0, message: `Daily cap of ${settings.daily_cap} reached.` };
  }

  // Get finalized resume
  const { data: resume } = await admin
    .from('resumes')
    .select('id, data')
    .eq('user_id', userId)
    .not('finalized_at', 'is', null)
    .order('finalized_at', { ascending: false })
    .limit(1)
    .single();

  if (!resume?.data) return { queued: 0, skipped: 0, message: 'No finalized resume.' };

  const profile = extractResumeProfile(resume.data as ResumeData);
  const filterSettings = settings.filters ?? {};
  const country = inferCountry(profile.location);

  const baseFilters = {
    query: profile.job_titles[0] ?? '',
    location: profile.location ?? '',
    country,
    ...filterSettings,
  };

  const [adzunaResult, jsearchResult] = await Promise.all([
    isAdzunaConfigured() && country !== 'pk' ? searchJobs(baseFilters, 1) : Promise.resolve({ jobs: [] }),
    isJSearchConfigured() ? searchJobsJSearch(baseFilters, 1) : Promise.resolve({ jobs: [] }),
  ]);

  const seen = new Set<string>();
  const allFetched = [...adzunaResult.jobs, ...jsearchResult.jobs].filter((j) => {
    if (seen.has(j.id)) return false;
    seen.add(j.id);
    return true;
  });

  if (allFetched.length === 0) return { queued: 0, skipped: 0, message: 'No jobs found.' };

  // Cache jobs
  await admin.from('jobs').upsert(
    allFetched.map((j) => ({
      id: j.id, source: j.source, title: j.title, company: j.company, location: j.location,
      country: j.country, description: j.description, redirect_url: j.redirect_url,
      category: j.category, contract_type: j.contract_type, work_type: j.work_type,
      salary_min: j.salary_min, salary_max: j.salary_max, currency: j.currency,
      posted_at: j.posted_at, fetched_at: j.fetched_at, raw: {},
    })),
    { onConflict: 'id' }
  );

  // Score and filter
  const scored = batchScoreJobs(profile, allFetched).filter((r) => r.score >= settings.min_match_score);
  if (scored.length === 0) {
    return { queued: 0, skipped: allFetched.length, message: `No jobs met the minimum score of ${settings.min_match_score}.` };
  }

  // Skip already-applied jobs
  const { data: existing } = await admin
    .from('applications')
    .select('job_id')
    .eq('user_id', userId)
    .in('job_id', scored.map((r) => r.job.id));

  const appliedSet = new Set((existing ?? []).map((a) => a.job_id));
  const toQueue = scored.filter((r) => !appliedSet.has(r.job.id)).slice(0, remaining);

  const skippedReasons = {
    already_applied: appliedSet.size,
    below_threshold: allFetched.length - scored.length,
  };

  if (toQueue.length === 0) {
    await admin.from('auto_apply_runs').insert({
      user_id: userId, attempted: allFetched.length, queued: 0,
      skipped: allFetched.length, skipped_reasons: skippedReasons,
    });
    return { queued: 0, skipped: allFetched.length, message: 'All matching jobs already applied to.' };
  }

  await admin.from('applications').upsert(
    toQueue.map((r) => ({
      user_id: userId,
      job_id: r.job.id,
      resume_id: resume.id,
      status: 'redirected',
      application_type: 'external_redirect',
      redirected_at: new Date().toISOString(),
      source: 'auto_apply',
    })),
    { onConflict: 'user_id,job_id' }
  );

  await admin.from('auto_apply_runs').insert({
    user_id: userId, attempted: allFetched.length, queued: toQueue.length,
    skipped: allFetched.length - toQueue.length, skipped_reasons: skippedReasons,
  });

  return {
    queued: toQueue.length,
    skipped: allFetched.length - toQueue.length,
    message: `Queued ${toQueue.length} job${toQueue.length !== 1 ? 's' : ''} for your review — tap Apply to visit each employer site.`,
  };
}
