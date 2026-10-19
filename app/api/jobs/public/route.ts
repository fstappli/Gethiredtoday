import { NextRequest, NextResponse } from 'next/server';
import { searchJobs, isAdzunaConfigured } from '@/lib/jobs/adzuna';
import { searchJobsJobicy } from '@/lib/jobs/jobicy';
import { searchJobsJSearch, isJSearchConfigured } from '@/lib/jobs/jsearch';
import { searchJobsRemotive } from '@/lib/jobs/remotive';
import type { Job, JobSearchFilters } from '@/types/jobs';

/**
 * Public (logged-out) job search. Returns jobs WITHOUT any match score.
 * Rate limited per IP and cached in memory (best effort, per instance).
 */
export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const CACHE_TTL_MS = 5 * 60_000;
const hits = new Map<string, number[]>();
const cache = new Map<string, { at: number; body: unknown }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function snippet(d: string | null): string {
  if (!d) return '';
  const t = d.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  return t.length > 180 ? t.slice(0, 177) + '...' : t;
}

function dedupe(...sources: Job[][]): Job[] {
  const seen = new Set<string>();
  const lists = sources.map((src) =>
    src.filter((j) => {
      const key = `${j.title?.toLowerCase()}|${j.company?.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  );
  const out: Job[] = [];
  const max = Math.max(...lists.map((l) => l.length), 0);
  for (let i = 0; i < max; i++) for (const l of lists) if (i < l.length) out.push(l[i]);
  return out;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  if (limited(ip)) {
    return NextResponse.json({ error: 'Too many searches. Try again in a minute.' }, { status: 429 });
  }

  const sp = req.nextUrl.searchParams;
  const query = (sp.get('query') ?? '').slice(0, 100);
  const location = (sp.get('location') ?? '').slice(0, 100);
  const country = (sp.get('country') ?? 'us').toLowerCase().slice(0, 2);
  const remote = sp.get('remote') === 'true';
  const page = Math.max(1, Math.min(10, parseInt(sp.get('page') ?? '1', 10) || 1));

  const key = JSON.stringify([query, location, country, remote, page]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return NextResponse.json(hit.body);

  const filters: JobSearchFilters = { query: query || undefined, location: location || undefined, remote, country };
  const empty = { jobs: [] as Job[], total: 0, page, page_size: 10 };
  const isUAE = country === 'ae';
  const isPK = country === 'pk';

  try {
    const [primary, jsearch, remotive] = await Promise.all([
      isUAE ? searchJobsJobicy(filters, page).catch(() => empty)
        : isPK || !isAdzunaConfigured() ? Promise.resolve(empty)
        : searchJobs(filters, page).catch(() => empty),
      isJSearchConfigured() ? searchJobsJSearch(filters, page).catch(() => empty) : Promise.resolve(empty),
      // Remotive needs no API key, so the page still has real results with no provider configured.
      searchJobsRemotive(filters).catch(() => empty),
    ]);
    const jobs = dedupe(primary.jobs, jsearch.jobs, remotive.jobs).slice(0, 20).map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      work_type: j.work_type,
      contract_type: j.contract_type,
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      currency: j.currency,
      posted_at: j.posted_at,
      snippet: snippet(j.description),
    }));
    const body = {
      jobs,
      total: primary.total + jsearch.total + remotive.total,
      page,
      unconfigured: jobs.length === 0 && !isAdzunaConfigured() && !isJSearchConfigured(),
    };
    cache.set(key, { at: Date.now(), body });
    if (cache.size > 500) cache.clear();
    return NextResponse.json(body);
  } catch (err) {
    console.error('GET /api/jobs/public error:', err);
    return NextResponse.json({ error: 'Search is unavailable right now.' }, { status: 502 });
  }
}
