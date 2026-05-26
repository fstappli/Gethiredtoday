import { describe, it, expect } from 'vitest';
import type { JobSearchFilters, EmploymentType } from '../types/jobs';

// Mirror of the URL serialization logic in hooks/use-job-search.ts
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

describe('filter URL serialization', () => {
  it('round-trips simple query+location', () => {
    const filters: JobSearchFilters = {
      query: 'software engineer',
      location: 'San Francisco',
      country: 'us',
    };
    const params = filtersToParams(filters, 1);
    const restored = paramsToFilters(params);
    expect(restored.query).toBe('software engineer');
    expect(restored.location).toBe('San Francisco');
  });

  it('round-trips boolean flags', () => {
    const filters: JobSearchFilters = {
      remote: true,
      hybrid: false,
      on_site: false,
      relocation: true,
    };
    const params = filtersToParams(filters, 1);
    const restored = paramsToFilters(params);
    expect(restored.remote).toBe(true);
    expect(restored.hybrid).toBe(false);
    expect(restored.relocation).toBe(true);
  });

  it('round-trips multi-select employment types', () => {
    const filters: JobSearchFilters = {
      employment_types: ['full_time', 'contract'],
    };
    const params = filtersToParams(filters, 1);
    const restored = paramsToFilters(params);
    expect(restored.employment_types).toContain('full_time');
    expect(restored.employment_types).toContain('contract');
    expect(restored.employment_types).toHaveLength(2);
  });

  it('round-trips multi-select industries', () => {
    const filters: JobSearchFilters = {
      industries: ['it-jobs', 'finance-jobs'],
    };
    const params = filtersToParams(filters, 1);
    const restored = paramsToFilters(params);
    expect(restored.industries).toContain('it-jobs');
    expect(restored.industries).toContain('finance-jobs');
  });

  it('does not include "us" country in params (default)', () => {
    const filters: JobSearchFilters = { country: 'us' };
    const params = filtersToParams(filters, 1);
    expect(params.has('country')).toBe(false);
  });

  it('includes non-default country in params', () => {
    const filters: JobSearchFilters = { country: 'gb' };
    const params = filtersToParams(filters, 1);
    expect(params.get('country')).toBe('gb');
  });

  it('includes page only when > 1', () => {
    const p1 = filtersToParams({}, 1);
    const p2 = filtersToParams({}, 2);
    expect(p1.has('page')).toBe(false);
    expect(p2.get('page')).toBe('2');
  });
});
