import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { searchJobs, isAdzunaConfigured } from '@/lib/jobs/adzuna';
import { searchJobsJSearch, isJSearchConfigured } from '@/lib/jobs/jsearch';
import { searchJobsJobicy } from '@/lib/jobs/jobicy';
import { searchJobsRemotive } from '@/lib/jobs/remotive';
import { extractResumeProfile, batchScoreJobs } from '@/lib/jobs/match';
import type { ResumeData } from '@/types';
import type { Job } from '@/types/jobs';

function inferCountry(location: string | null): string {
  if (!location) return 'us';
  const l = location.toLowerCase();
  if (l.includes('dubai') || l.includes('uae') || l.includes('abu dhabi') || l.includes('sharjah')) return 'ae';
  if (l.includes(' uk') || l.includes('london') || l.includes('manchester') || l.includes('united kingdom')) return 'gb';
  if (l.includes('canada') || l.includes('toronto') || l.includes('vancouver') || l.includes('montreal')) return 'ca';
  if (l.includes('australia') || l.includes('sydney') || l.includes('melbourne') || l.includes('brisbane')) return 'au';
  if (l.includes('india') || l.includes('mumbai') || l.includes('bangalore') || l.includes('delhi')) return 'in';
  if (l.includes('germany') || l.includes('berlin') || l.includes('munich') || l.includes('hamburg')) return 'de';
  return 'us';
}

// POST /api/jobs/matches/refresh — run matching for user's finalized resume
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isAdzunaConfigured() && !isJSearchConfigured()) {
      return NextResponse.json({
        matches_created: 0,
        message: 'Job API not configured.',
        unconfigured: true,
      });
    }

    // Find finalized resume
    const { data: resume } = await supabase
      .from('resumes')
      .select('id, title, data, finalized_at')
      .eq('user_id', user.id)
      .not('finalized_at', 'is', null)
      .order('finalized_at', { ascending: false })
      .limit(1)
      .single();

    if (!resume || !resume.data) {
      return NextResponse.json({ error: 'No finalized resume found. Please finalize a resume first.' }, { status: 400 });
    }

    const resumeData = resume.data as ResumeData;
    const profile = extractResumeProfile(resumeData);
    const country = inferCountry(profile.location);
    const isUAE = country === 'ae';

    // Build 3-4 diverse queries for breadth
    const searchQueries: string[] = [];
    if (profile.job_titles.length > 0) searchQueries.push(profile.job_titles[0]);
    if (profile.job_titles.length > 1) searchQueries.push(profile.job_titles[1]);
    if (profile.skills.length >= 3) searchQueries.push(profile.skills.slice(0, 3).join(' '));
    if (profile.industries.length > 0) searchQueries.push(profile.industries[0]);
    if (searchQueries.length === 0) searchQueries.push('');

    const filters = {
      location: profile.location ?? '',
      country,
    };

    // Fan out searches across all available sources in parallel
    const searchPromises: Promise<Job[]>[] = [];

    for (const query of searchQueries.slice(0, 3)) {
      if (isUAE) {
        // UAE: Jobicy + JSearch + Remotive
        searchPromises.push(
          searchJobsJobicy({ ...filters, query }).then((r) => r.jobs)
        );
        if (isJSearchConfigured()) {
          searchPromises.push(
            searchJobsJSearch({ ...filters, query }, 1).then((r) => r.jobs),
            searchJobsJSearch({ ...filters, query }, 2).then((r) => r.jobs)
          );
        }
        searchPromises.push(
          searchJobsRemotive({ ...filters, query }).then((r) => r.jobs)
        );
      } else {
        // Other countries: Adzuna pages 1+2 + JSearch
        if (isAdzunaConfigured()) {
          searchPromises.push(
            searchJobs({ ...filters, query }, 1).then((r) => r.jobs),
            searchJobs({ ...filters, query }, 2).then((r) => r.jobs)
          );
        }
        if (isJSearchConfigured()) {
          searchPromises.push(
            searchJobsJSearch({ ...filters, query }, 1).then((r) => r.jobs)
          );
        }
      }
    }

    const results = await Promise.allSettled(searchPromises);
    const allJobs = new Map<string, Job>();
    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const job of result.value) {
          if (!allJobs.has(job.id)) allJobs.set(job.id, job);
        }
      }
    }

    const jobs = Array.from(allJobs.values());
    if (jobs.length === 0) {
      return NextResponse.json({ matches_created: 0, message: 'No jobs found for your profile.' });
    }

    // Cache jobs in DB
    const jobRows = jobs.map((j) => ({
      id: j.id,
      source: j.source,
      title: j.title,
      company: j.company,
      location: j.location,
      country: j.country,
      description: j.description,
      redirect_url: j.redirect_url,
      category: j.category,
      contract_type: j.contract_type,
      work_type: j.work_type,
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      currency: j.currency,
      posted_at: j.posted_at,
      fetched_at: j.fetched_at,
      raw: {},
    }));

    await supabase.from('jobs').upsert(jobRows, { onConflict: 'id' });

    // Score and filter — lower threshold to 20 to show more matches
    const scored = batchScoreJobs(profile, jobs).filter((r) => r.score >= 20);

    if (scored.length === 0) {
      return NextResponse.json({ matches_created: 0, message: `Searched ${jobs.length} jobs but none matched your resume. Try adding more skills or job titles.` });
    }

    // Delete old matches for this resume+user
    await supabase
      .from('job_matches')
      .delete()
      .eq('user_id', user.id)
      .eq('resume_id', resume.id);

    // Insert new matches
    const matchRows = scored.map((r) => ({
      user_id: user.id,
      resume_id: resume.id,
      job_id: r.job.id,
      match_score: r.score,
      matched_reasons: r.reasons,
    }));

    const { error: insertError } = await supabase.from('job_matches').insert(matchRows);

    if (insertError) {
      console.error('Failed to insert job_matches:', insertError);
      return NextResponse.json({ error: 'Failed to save matches' }, { status: 500 });
    }

    return NextResponse.json({
      matches_created: matchRows.length,
      message: `Found ${matchRows.length} job matches for your resume.`,
    });
  } catch (err) {
    console.error('POST /api/jobs/matches/refresh error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
