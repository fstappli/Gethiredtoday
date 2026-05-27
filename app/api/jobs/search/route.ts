import { NextRequest, NextResponse } from 'next/server';
import { searchJobs, isAdzunaConfigured } from '@/lib/jobs/adzuna';
import type { JobSearchFilters, EmploymentType } from '@/types/jobs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
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
    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/jobs/search error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
