import { NextResponse } from 'next/server';
import { searchJobs, isAdzunaConfigured } from '@/lib/jobs/adzuna';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  const envStatus = {
    ADZUNA_APP_ID: appId ? `set (${appId.slice(0, 4)}...)` : 'MISSING',
    ADZUNA_APP_KEY: appKey ? `set (${appKey.slice(0, 4)}...)` : 'MISSING',
    isAdzunaConfigured: isAdzunaConfigured(),
  };

  // Test 1: direct fetch to Adzuna
  let directFetch: Record<string, unknown> = {};
  try {
    const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=3&what=&where=`;
    const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    const text = await res.text();
    directFetch = { status: res.status, ok: res.ok, bodyPreview: text.slice(0, 200) };
  } catch (e) {
    directFetch = { error: String(e) };
  }

  // Test 2: via searchJobs()
  let searchJobsResult: Record<string, unknown> = {};
  try {
    const result = await searchJobs({ country: 'us' }, 1);
    searchJobsResult = {
      jobCount: result.jobs.length,
      total: result.total,
      firstJob: result.jobs[0]?.title ?? null,
    };
  } catch (e) {
    searchJobsResult = { error: String(e) };
  }

  return NextResponse.json({ envStatus, directFetch, searchJobsResult });
}
