import type { Job, JobSearchFilters, JobSearchResult, AdzunaCategory } from '@/types/jobs';

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
const PAGE_SIZE = 20;

function getCredentials() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  return { appId, appKey, configured: !!(appId && appKey) };
}

interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string; area?: string[] };
  description: string;
  redirect_url: string;
  category: { label: string; tag: string };
  contract_type?: string;
  salary_min?: number;
  salary_max?: number;
  created: string;
  // Adzuna doesn't have a remote field natively; we infer from title/description
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
  __CLASS__?: string;
  mean?: number;
}

function inferWorkType(title: string, description: string): Job['work_type'] {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('remote') && !text.includes('hybrid')) return 'remote';
  if (text.includes('hybrid')) return 'hybrid';
  if (text.includes('on-site') || text.includes('onsite') || text.includes('in-office')) return 'on_site';
  return null;
}

function normalizeContractType(raw: string | undefined): string | null {
  if (!raw) return null;
  const map: Record<string, string> = {
    full_time: 'full_time',
    permanent: 'full_time',
    part_time: 'part_time',
    contract: 'contract',
    temporary: 'contract',
    internship: 'internship',
  };
  return map[raw.toLowerCase()] ?? raw.toLowerCase();
}

function adzunaJobToJob(j: AdzunaJob, country: string): Job {
  return {
    id: j.id,
    source: 'adzuna',
    title: j.title,
    company: j.company?.display_name ?? null,
    location: j.location?.display_name ?? null,
    country,
    description: j.description ?? null,
    redirect_url: j.redirect_url,
    category: j.category?.label ?? null,
    contract_type: normalizeContractType(j.contract_type),
    work_type: inferWorkType(j.title, j.description ?? ''),
    salary_min: j.salary_min ?? null,
    salary_max: j.salary_max ?? null,
    currency: country === 'gb' ? 'GBP' : 'USD',
    posted_at: j.created ?? null,
    fetched_at: new Date().toISOString(),
  };
}

export async function searchJobs(
  filters: JobSearchFilters,
  page = 1
): Promise<JobSearchResult> {
  const { appId, appKey, configured } = getCredentials();

  if (!configured) {
    return { jobs: [], total: 0, page, page_size: PAGE_SIZE };
  }

  const country = filters.country ?? 'us';
  const params = new URLSearchParams({
    app_id: appId!,
    app_key: appKey!,
    results_per_page: String(PAGE_SIZE),
    what: filters.query || '',
    where: filters.location || '',
    content_type: 'application/json',
  });

  if (filters.radius_km) params.set('distance', String(Math.round(filters.radius_km)));

  // Contract type filter
  const types = filters.employment_types ?? [];
  if (types.length === 1) {
    const map: Record<string, string> = {
      full_time: 'permanent',
      part_time: 'part_time',
      contract: 'contract',
      internship: 'internship',
    };
    if (map[types[0]]) params.set('contract_type', map[types[0]]);
  }

  // Category / industry filter
  if (filters.industries && filters.industries.length === 1) {
    params.set('category', filters.industries[0]);
  }

  // Remote filter: Adzuna doesn't support a dedicated remote param; prepend to query
  if (filters.remote && !filters.query?.toLowerCase().includes('remote')) {
    params.set('what', `remote ${params.get('what') ?? ''}`);
  }

  try {
    const url = `${BASE_URL}/${country}/search/${page}?${params}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // 5-min cache

    if (!res.ok) {
      console.error('Adzuna API error:', res.status, await res.text());
      return { jobs: [], total: 0, page, page_size: PAGE_SIZE };
    }

    const data: AdzunaResponse = await res.json();
    const jobs = (data.results ?? []).map((j) => adzunaJobToJob(j, country));

    return {
      jobs,
      total: data.count ?? jobs.length,
      page,
      page_size: PAGE_SIZE,
    };
  } catch (err) {
    console.error('Adzuna fetch error:', err);
    return { jobs: [], total: 0, page, page_size: PAGE_SIZE };
  }
}

export async function fetchCategories(country = 'us'): Promise<AdzunaCategory[]> {
  const { appId, appKey, configured } = getCredentials();
  if (!configured) return [];

  try {
    const params = new URLSearchParams({ app_id: appId!, app_key: appKey! });
    const res = await fetch(`${BASE_URL}/${country}/categories?${params}`, {
      next: { revalidate: 3600 }, // 1-hour cache
    });

    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []) as AdzunaCategory[];
  } catch {
    return [];
  }
}

export function isAdzunaConfigured(): boolean {
  return getCredentials().configured;
}
