import type { Job, JobSearchFilters, JobSearchResult } from '@/types/jobs';

const BASE_URL = 'https://remotive.com/api/remote-jobs';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  job_type: string; // full_time, contract, part_time, internship
  candidate_required_location: string;
  salary: string;
  description: string;
  publication_date: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
  'job-count': number;
}

function normalizeJobType(raw: string): string | null {
  const map: Record<string, string> = {
    full_time: 'full_time',
    contract: 'contract',
    part_time: 'part_time',
    internship: 'internship',
  };
  return map[raw] ?? null;
}

function remotiveJobToJob(j: RemotiveJob): Job {
  return {
    id: `remotive_${j.id}`,
    source: 'remotive',
    title: j.title,
    company: j.company_name ?? null,
    location: j.candidate_required_location || 'Worldwide',
    country: 'ae',
    description: j.description?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 800) ?? null,
    redirect_url: j.url,
    category: j.category ?? null,
    contract_type: normalizeJobType(j.job_type),
    work_type: 'remote',
    salary_min: null,
    salary_max: null,
    currency: 'USD',
    posted_at: j.publication_date ?? null,
    fetched_at: new Date().toISOString(),
  };
}

export async function searchJobsRemotive(
  filters: JobSearchFilters
): Promise<JobSearchResult> {
  const params = new URLSearchParams({ limit: '50' });

  if (filters.query) params.set('search', filters.query);

  const types = filters.employment_types ?? [];
  if (types.length === 1) params.set('job_type', types[0]);

  try {
    const res = await fetch(`${BASE_URL}?${params}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Remotive API error:', res.status);
      return { jobs: [], total: 0, page: 1, page_size: 50 };
    }

    const data: RemotiveResponse = await res.json();
    const jobs = (data.jobs ?? []).map(remotiveJobToJob);
    return { jobs, total: jobs.length, page: 1, page_size: 50 };
  } catch (err) {
    console.error('Remotive fetch error:', err);
    return { jobs: [], total: 0, page: 1, page_size: 50 };
  }
}
