'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Job, JobSearchFilters, EmploymentType } from '@/types/jobs';

interface UseJobSearchReturn {
  jobs: Job[];
  total: number;
  page: number;
  loading: boolean;
  loadingMore: boolean;
  filters: JobSearchFilters;
  unconfigured: boolean;
  setFilter: <K extends keyof JobSearchFilters>(key: K, value: JobSearchFilters[K]) => void;
  clearFilter: (key: keyof JobSearchFilters) => void;
  clearAllFilters: () => void;
  loadMore: () => void;
  activeFilterCount: number;
}

const DEFAULT_FILTERS: JobSearchFilters = {
  query: '',
  location: '',
  country: 'us',
  remote: false,
  hybrid: false,
  on_site: false,
  relocation: false,
  employment_types: [],
  industries: [],
};

function filtersToParams(f: JobSearchFilters, page: number): URLSearchParams {
  const p = new URLSearchParams();
  if (f.query) p.set('query', f.query);
  if (f.location) p.set('location', f.location);
  if (f.country && f.country !== 'us') p.set('country', f.country);
  if (f.remote) p.set('remote', 'true');
  if (f.hybrid) p.set('hybrid', 'true');
  if (f.on_site) p.set('on_site', 'true');
  if (f.relocation) p.set('relocation', 'true');
  if (f.employment_types?.length) p.set('employment_types', f.employment_types.join(','));
  if (f.industries?.length) p.set('industries', f.industries.join(','));
  if (f.radius_km) p.set('radius_km', String(f.radius_km));
  if (page > 1) p.set('page', String(page));
  return p;
}

function paramsToFilters(params: URLSearchParams): JobSearchFilters {
  const types = params.get('employment_types');
  const inds = params.get('industries');
  return {
    query:            params.get('query') ?? '',
    location:         params.get('location') ?? '',
    country:          params.get('country') ?? 'us',
    remote:           params.get('remote') === 'true',
    hybrid:           params.get('hybrid') === 'true',
    on_site:          params.get('on_site') === 'true',
    relocation:       params.get('relocation') === 'true',
    employment_types: types ? (types.split(',') as EmploymentType[]) : [],
    industries:       inds ? inds.split(',') : [],
    radius_km:        params.get('radius_km') ? Number(params.get('radius_km')) : undefined,
  };
}

function countActiveFilters(f: JobSearchFilters): number {
  let count = 0;
  if (f.query) count++;
  if (f.location) count++;
  if (f.remote) count++;
  if (f.hybrid) count++;
  if (f.on_site) count++;
  if (f.relocation) count++;
  if (f.employment_types?.length) count++;
  if (f.industries?.length) count++;
  return count;
}

export function useJobSearch(): UseJobSearchReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<JobSearchFilters>(() => paramsToFilters(searchParams));
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true); // true on mount so skeleton shows immediately
  const [loadingMore, setLoadingMore] = useState(false);
  const [unconfigured, setUnconfigured] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const isMounted = useRef(false);

  const fetchJobs = useCallback(async (f: JobSearchFilters, p: number, append = false) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = filtersToParams(f, p);
      const res = await fetch(`/api/jobs/search?${params}`, { signal: ctrl.signal });
      if (!res.ok) {
        console.error('Job search API error:', res.status);
        return;
      }
      const data = await res.json();
      setUnconfigured(Boolean(data.unconfigured));
      setTotal(data.total ?? 0);
      if (append) {
        setJobs((prev) => [...prev, ...(data.jobs ?? [])]);
      } else {
        setJobs(data.jobs ?? []);
        setPage(1);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // On mount: fetch immediately with no debounce
  useEffect(() => {
    fetchJobs(filters, 1, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only once on mount

  // On subsequent filter changes: debounce + sync URL
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return; // skip first run — already handled by mount effect above
    }
    // Show skeleton immediately — don't wait for the debounce to fire
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = filtersToParams(filters, 1);
      router.replace(`${pathname}?${params}`, { scroll: false });
      fetchJobs(filters, 1, false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [filters, fetchJobs, pathname, router]);

  const setFilter = useCallback(<K extends keyof JobSearchFilters>(key: K, value: JobSearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilter = useCallback((key: keyof JobSearchFilters) => {
    setFilters((prev) => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(filters, nextPage, true);
  }, [page, filters, fetchJobs]);

  return {
    jobs,
    total,
    page,
    loading,
    loadingMore,
    filters,
    unconfigured,
    setFilter,
    clearFilter,
    clearAllFilters,
    loadMore,
    activeFilterCount: countActiveFilters(filters),
  };
}
