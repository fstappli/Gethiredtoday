import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { searchJobs, isAdzunaConfigured } from '@/lib/jobs/adzuna';
import { searchJobsJSearch, isJSearchConfigured } from '@/lib/jobs/jsearch';
import { extractResumeProfile, batchScoreJobs } from '@/lib/jobs/match';
import type { ResumeData } from '@/types';

// POST /api/jobs/auto-apply/queue
// Finds jobs meeting auto-apply criteria, queues them as 'redirected' for 1-tap apply.
// Never auto-submits to external sites.
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isAdzunaConfigured() && !isJSearchConfigured()) {
      return NextResponse.json({
        queued: 0,
        skipped: 0,
        message: 'Job API not configured.',
        unconfigured: true,
      });
    }

    // Get auto-apply settings
    const { data: settings } = await supabase
      .from('auto_apply_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!settings?.enabled) {
      return NextResponse.json({ queued: 0, skipped: 0, message: 'Auto-apply is not enabled.' });
    }

    if (settings.paused_at) {
      return NextResponse.json({ queued: 0, skipped: 0, message: 'Auto-apply is paused.' });
    }

    // Check daily cap — count applications created today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('source', 'auto_apply')
      .gte('created_at', todayStart.toISOString());

    const remaining = settings.daily_cap - (todayCount ?? 0);
    if (remaining <= 0) {
      return NextResponse.json({
        queued: 0,
        skipped: 0,
        message: `Daily cap of ${settings.daily_cap} reached.`,
      });
    }

    // Get finalized resume
    const { data: resume } = await supabase
      .from('resumes')
      .select('id, data')
      .eq('user_id', user.id)
      .not('finalized_at', 'is', null)
      .order('finalized_at', { ascending: false })
      .limit(1)
      .single();

    if (!resume?.data) {
      return NextResponse.json({ queued: 0, skipped: 0, message: 'No finalized resume.' });
    }

    const profile = extractResumeProfile(resume.data as ResumeData);
    const filterSettings = settings.filters ?? {};

    // Fetch jobs from all sources in parallel for a bigger pool
    const baseFilters = {
      query: profile.job_titles[0] ?? '',
      location: profile.location ?? '',
      country: 'us',
      ...filterSettings,
    };
    const [adzunaResult, jsearchResult] = await Promise.all([
      isAdzunaConfigured() ? searchJobs(baseFilters, 1) : Promise.resolve({ jobs: [] }),
      isJSearchConfigured() ? searchJobsJSearch(baseFilters, 1) : Promise.resolve({ jobs: [] }),
    ]);
    const seen = new Set<string>();
    const allFetched = [...adzunaResult.jobs, ...jsearchResult.jobs].filter((j) => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });
    const result = { jobs: allFetched };

    if (result.jobs.length === 0) {
      return NextResponse.json({ queued: 0, skipped: 0, message: 'No jobs found.' });
    }

    // Cache jobs
    await supabase.from('jobs').upsert(
      result.jobs.map((j) => ({
        id: j.id, source: j.source, title: j.title, company: j.company, location: j.location,
        country: j.country, description: j.description, redirect_url: j.redirect_url,
        category: j.category, contract_type: j.contract_type, work_type: j.work_type,
        salary_min: j.salary_min, salary_max: j.salary_max, currency: j.currency,
        posted_at: j.posted_at, fetched_at: j.fetched_at, raw: {},
      })),
      { onConflict: 'id' }
    );

    // Score
    const scored = batchScoreJobs(profile, result.jobs)
      .filter((r) => r.score >= settings.min_match_score);

    if (scored.length === 0) {
      return NextResponse.json({
        queued: 0,
        skipped: result.jobs.length,
        message: `No jobs met the minimum score of ${settings.min_match_score}.`,
      });
    }

    // Get already-applied job IDs
    const candidateIds = scored.map((r) => r.job.id);
    const { data: existing } = await supabase
      .from('applications')
      .select('job_id')
      .eq('user_id', user.id)
      .in('job_id', candidateIds);

    const appliedSet = new Set((existing ?? []).map((a) => a.job_id));

    const toQueue = scored
      .filter((r) => !appliedSet.has(r.job.id))
      .slice(0, remaining);

    const skippedReasons: Record<string, number> = {
      already_applied: appliedSet.size,
      below_threshold: result.jobs.length - scored.length,
    };

    if (toQueue.length === 0) {
      await supabase.from('auto_apply_runs').insert({
        user_id: user.id,
        attempted: result.jobs.length,
        queued: 0,
        skipped: result.jobs.length,
        skipped_reasons: skippedReasons,
      });
      return NextResponse.json({ queued: 0, skipped: result.jobs.length, message: 'All matching jobs already applied to.' });
    }

    // Queue as 'redirected' — never auto-submit to external sites
    const appRows = toQueue.map((r) => ({
      user_id: user.id,
      job_id: r.job.id,
      resume_id: resume.id,
      status: 'redirected',
      application_type: 'external_redirect',
      redirected_at: new Date().toISOString(),
      source: 'auto_apply',
    }));

    await supabase.from('applications').upsert(appRows, { onConflict: 'user_id,job_id' });

    // Log the run
    await supabase.from('auto_apply_runs').insert({
      user_id: user.id,
      attempted: result.jobs.length,
      queued: toQueue.length,
      skipped: result.jobs.length - toQueue.length,
      skipped_reasons: skippedReasons,
    });

    return NextResponse.json({
      queued: toQueue.length,
      skipped: result.jobs.length - toQueue.length,
      jobs: toQueue.map((r) => ({ id: r.job.id, title: r.job.title, company: r.job.company, score: r.score })),
      message: `Queued ${toQueue.length} job${toQueue.length !== 1 ? 's' : ''} for your review — tap Apply to visit each employer site.`,
    });
  } catch (err) {
    console.error('POST /api/jobs/auto-apply/queue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/jobs/auto-apply/queue — get queued (redirected from auto-apply) jobs
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: apps } = await supabase
      .from('applications')
      .select(`
        id, status, created_at,
        jobs (id, title, company, location, redirect_url, category, work_type)
      `)
      .eq('user_id', user.id)
      .eq('source', 'auto_apply')
      .eq('status', 'redirected')
      .order('created_at', { ascending: false });

    const { data: recentRuns } = await supabase
      .from('auto_apply_runs')
      .select('*')
      .eq('user_id', user.id)
      .order('run_at', { ascending: false })
      .limit(5);

    return NextResponse.json({ queue: apps ?? [], runs: recentRuns ?? [] });
  } catch (err) {
    console.error('GET /api/jobs/auto-apply/queue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
