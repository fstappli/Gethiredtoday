import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { searchJobs, isAdzunaConfigured } from '@/lib/jobs/adzuna';
import { extractResumeProfile, batchScoreJobs } from '@/lib/jobs/match';
import type { ResumeData } from '@/types';
import type { Job } from '@/types/jobs';

// POST /api/jobs/matches/refresh — run matching for user's finalized resume
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isAdzunaConfigured()) {
      return NextResponse.json({
        matches_created: 0,
        message: 'Job API not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables.',
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

    // Build search queries from profile
    const queries: string[] = [];
    if (profile.job_titles.length > 0) queries.push(profile.job_titles[0]);
    if (profile.skills.length > 0) queries.push(profile.skills.slice(0, 3).join(' '));
    if (queries.length === 0) queries.push('');

    // Fetch multiple pages for breadth
    const allJobs = new Map<string, Job>();

    for (const query of queries.slice(0, 2)) {
      const result = await searchJobs({
        query,
        location: profile.location ?? '',
        country: 'us',
      }, 1);

      for (const job of result.jobs) {
        if (!allJobs.has(job.id)) allJobs.set(job.id, job);
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

    // Score and filter
    const scored = batchScoreJobs(profile, jobs).filter((r) => r.score >= 30);

    if (scored.length === 0) {
      return NextResponse.json({ matches_created: 0, message: 'No strong matches found. Try broadening your resume.' });
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
