import { NextRequest, NextResponse } from 'next/server';
import { searchJobs, isAdzunaConfigured } from '@/lib/jobs/adzuna';
import { searchJobsJobicy } from '@/lib/jobs/jobicy';
import { searchJobsJSearch, isJSearchConfigured } from '@/lib/jobs/jsearch';
import { searchJobsRemotive } from '@/lib/jobs/remotive';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import type { Job, JobSearchFilters, EmploymentType } from '@/types/jobs';

// Countries routed to Jobicy (free, remote-only) instead of Adzuna
const JOBICY_COUNTRIES = new Set(['ae']);

export const dynamic = 'force-dynamic';

function mergeAndDeduplicate(...sources: Job[][]): Job[] {
  const seen = new Set<string>();
  // Interleave across all sources round-robin, deduplicating as we go
  const deduped = sources.map((src) =>
    src.filter((j) => {
      const key = `${j.title?.toLowerCase()}|${j.company?.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
  );
  const merged: Job[] = [];
  const maxLen = Math.max(...deduped.map((s) => s.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const src of deduped) {
      if (i < src.length) merged.push(src[i]);
    }
  }
  return merged;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

    const rawTypes = searchParams.get('employment_types');
    const employment_types = rawTypes
      ? (rawTypes.split(',').filter(Boolean) as EmploymentType[])
      : undefined;

    const rawIndustries = searchParams.get('industries');
    const industries = rawIndustries ? rawIndustries.split(',').filter(Boolean) : undefined;

    const filters: JobSearchFilters = {
      query:            searchParams.get('query') ?? undefined,
      location:         searchParams.get('location') ?? undefined,
      radius_km:        searchParams.get('radius_km') ? Number(searchParams.get('radius_km')) : undefined,
      remote:           searchParams.get('remote') === 'true',
      hybrid:           searchParams.get('hybrid') === 'true',
      on_site:          searchParams.get('on_site') === 'true',
      relocation:       searchParams.get('relocation') === 'true',
      employment_types,
      industries,
      country:          searchParams.get('country') ?? 'us',
    };

    const useJobicy = JOBICY_COUNTRIES.has(filters.country ?? 'us');

    if (!useJobicy && !isAdzunaConfigured()) {
      return NextResponse.json({ jobs: [], total: 0, page: 1, page_size: 20, unconfigured: true });
    }

    const empty = { jobs: [] as Job[], total: 0, page, page_size: 10 };

    // Run all sources in parallel
    const [primaryResult, jsearchResult, remotiveResult] = await Promise.all([
      useJobicy ? searchJobsJobicy(filters, page) : searchJobs(filters, page),
      isJSearchConfigured() ? searchJobsJSearch(filters, page) : Promise.resolve(empty),
      // Remotive: free remote-jobs API, always run for UAE, skip for other countries
      useJobicy ? searchJobsRemotive(filters) : Promise.resolve(empty),
    ]);

    const mergedJobs = mergeAndDeduplicate(primaryResult.jobs, jsearchResult.jobs, remotiveResult.jobs);
    const result = {
      jobs: mergedJobs,
      total: primaryResult.total + jsearchResult.total + remotiveResult.total,
      page,
      page_size: primaryResult.page_size,
    };

    // Cache jobs in DB so the apply flow can look them up (fire-and-forget)
    if (result.jobs.length > 0) {
      const admin = createAdminSupabaseClient();
      const rows = result.jobs.map((j) => ({
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
      admin.from('jobs').upsert(rows, { onConflict: 'id' }).then(() => {});
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/jobs/search error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
