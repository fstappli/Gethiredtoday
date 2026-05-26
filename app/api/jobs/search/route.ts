import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { searchJobs, isAdzunaConfigured } from '@/lib/jobs/adzuna';
import type { JobSearchFilters, EmploymentType } from '@/types/jobs';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdzunaConfigured()) {
      return NextResponse.json({
        jobs: [],
        total: 0,
        page: 1,
        page_size: 20,
        unconfigured: true,
      });
    }

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

    const result = await searchJobs(filters, page);

    // Cache matching jobs in DB for later reference (fire-and-forget)
    if (result.jobs.length > 0) {
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

      supabase.from('jobs').upsert(rows, { onConflict: 'id' }).then(() => {});
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/jobs/search error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
