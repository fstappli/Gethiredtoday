import type { Job, JobSearchFilters, JobSearchResult } from '@/types/jobs';

const BASE_URL = 'https://jobicy.com/api/v2/remote-jobs';
const PAGE_SIZE = 50; // Jobicy max per request; no pagination support

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  jobIndustry: string[];
  jobType: string[];
  jobGeo: string;
  jobLevel?: string;
  jobDescription: string;
  pubDate: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
}

interface JobicyResponse {
  success: boolean;
  jobCount: number;
  jobs?: JobicyJob[];
  error?: string;
}

// Jobicy geo slugs for supported countries
const GEO_SLUGS: Record<string, string> = {
  ae: 'united-arab-emirates',
};

function normalizeJobType(types: string[]): string | null {
  const raw = types[0]?.toLowerCase() ?? '';
  if (raw.includes('full')) return 'full_time';
  if (raw.includes('part')) return 'part_time';
  if (raw.includes('contract') || raw.includes('freelance')) return 'contract';
  if (raw.includes('intern')) return 'internship';
  return null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function jobicyJobToJob(j: JobicyJob, country: string): Job {
  return {
    id: `jobicy_${j.id}`,
    source: 'jobicy',
    title: j.jobTitle,
    company: j.companyName ?? null,
    location: j.jobGeo ?? 'Remote',
    country,
    description: stripHtml(j.jobDescription ?? ''),
    redirect_url: j.url,
    category: j.jobIndustry?.[0] ?? null,
    contract_type: normalizeJobType(j.jobType ?? []),
    work_type: 'remote', // Jobicy is remote-only
    salary_min: j.salaryMin ?? null,
    salary_max: j.salaryMax ?? null,
    currency: j.salaryCurrency ?? 'USD',
    posted_at: j.pubDate ?? null,
    fetched_at: new Date().toISOString(),
  };
}

export async function searchJobsJobicy(
  filters: JobSearchFilters,
  page = 1
): Promise<JobSearchResult> {
  const country = filters.country ?? 'ae';
  const params = new URLSearchParams({ count: String(PAGE_SIZE) });

  const geoSlug = GEO_SLUGS[country];
  if (geoSlug) params.set('geo', geoSlug);

  if (filters.query) params.set('tag', filters.query);

  if (filters.industries?.length === 1) params.set('industry', filters.industries[0]);

  try {
    const res = await fetch(`${BASE_URL}?${params}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Jobicy API error:', res.status, await res.text());
      return { jobs: [], total: 0, page: 1, page_size: PAGE_SIZE };
    }

    const data: JobicyResponse = await res.json();
    if (!data.success || !data.jobs) {
      return { jobs: [], total: 0, page: 1, page_size: PAGE_SIZE };
    }

    let jobs = data.jobs.map((j) => jobicyJobToJob(j, country));

    // Client-side employment type filter (Jobicy has no server-side filter for this)
    const types = filters.employment_types ?? [];
    if (types.length > 0) {
      jobs = jobs.filter((j) => j.contract_type && types.includes(j.contract_type as never));
    }

    return { jobs, total: jobs.length, page: 1, page_size: PAGE_SIZE };
  } catch (err) {
    console.error('Jobicy fetch error:', err);
    return { jobs: [], total: 0, page: 1, page_size: PAGE_SIZE };
  }
}
