import type { Job, JobSearchFilters, JobSearchResult } from '@/types/jobs';

const BASE_URL = 'https://jsearch.p.rapidapi.com/search';
const PAGE_SIZE = 10;

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_description?: string;
  job_apply_link: string;
  job_employment_type?: string;
  job_is_remote?: boolean;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_posted_at_datetime_utc?: string;
  job_publisher?: string;
}

interface JSearchResponse {
  status: string;
  data?: JSearchJob[];
}

function normalizeEmploymentType(raw: string | undefined): string | null {
  if (!raw) return null;
  const map: Record<string, string> = {
    FULLTIME: 'full_time',
    PARTTIME: 'part_time',
    CONTRACTOR: 'contract',
    INTERN: 'internship',
  };
  return map[raw.toUpperCase()] ?? raw.toLowerCase();
}

function normalizeSource(publisher: string | undefined): string {
  const p = (publisher ?? '').toLowerCase();
  if (p.includes('linkedin')) return 'linkedin';
  if (p.includes('indeed')) return 'indeed';
  if (p.includes('glassdoor')) return 'glassdoor';
  if (p.includes('ziprecruiter')) return 'ziprecruiter';
  return 'jsearch';
}

function buildLocation(j: JSearchJob): string | null {
  const parts = [j.job_city, j.job_state, j.job_country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

function jsearchJobToJob(j: JSearchJob, country: string): Job {
  return {
    id: `jsearch_${j.job_id}`,
    source: normalizeSource(j.job_publisher),
    title: j.job_title,
    company: j.employer_name ?? null,
    location: buildLocation(j),
    country,
    description: j.job_description ? j.job_description.slice(0, 800) : null,
    redirect_url: j.job_apply_link,
    category: null,
    contract_type: normalizeEmploymentType(j.job_employment_type),
    work_type: j.job_is_remote ? 'remote' : null,
    salary_min: j.job_min_salary ?? null,
    salary_max: j.job_max_salary ?? null,
    currency: j.job_salary_currency ?? 'USD',
    posted_at: j.job_posted_at_datetime_utc ?? null,
    fetched_at: new Date().toISOString(),
  };
}

export function isJSearchConfigured(): boolean {
  return !!process.env.RAPIDAPI_KEY?.trim();
}

export async function searchJobsJSearch(
  filters: JobSearchFilters,
  page = 1
): Promise<JobSearchResult> {
  const apiKey = process.env.RAPIDAPI_KEY?.trim();
  if (!apiKey) return { jobs: [], total: 0, page, page_size: PAGE_SIZE };

  const country = filters.country ?? 'us';

  // JSearch requires a non-empty query
  let query = filters.query?.trim() ?? '';
  if (filters.location) query += ` in ${filters.location}`;
  if (!query) query = 'jobs';

  const params = new URLSearchParams({
    query,
    page: String(page),
    num_pages: '1',
    country: country.toUpperCase(),
  });

  if (filters.remote) params.set('remote_jobs_only', 'true');

  const typeMap: Record<string, string> = {
    full_time: 'FULLTIME',
    part_time: 'PARTTIME',
    contract: 'CONTRACTOR',
    internship: 'INTERN',
  };
  const types = (filters.employment_types ?? []).map((t) => typeMap[t]).filter(Boolean);
  if (types.length > 0) params.set('employment_types', types.join(','));

  try {
    const res = await fetch(`${BASE_URL}?${params}`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('JSearch API error:', res.status, await res.text());
      return { jobs: [], total: 0, page, page_size: PAGE_SIZE };
    }

    const data: JSearchResponse = await res.json();
    if (data.status !== 'OK' || !data.data) {
      return { jobs: [], total: 0, page, page_size: PAGE_SIZE };
    }

    const jobs = data.data.map((j) => jsearchJobToJob(j, country));
    // JSearch doesn't expose a total count — estimate based on pages
    return { jobs, total: jobs.length > 0 ? jobs.length * 10 : 0, page, page_size: PAGE_SIZE };
  } catch (err) {
    console.error('JSearch fetch error:', err);
    return { jobs: [], total: 0, page, page_size: PAGE_SIZE };
  }
}
