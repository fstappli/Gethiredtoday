import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appId = process.env.ADZUNA_APP_ID ?? '';
  const appKey = process.env.ADZUNA_APP_KEY ?? '';

  // Reproduce exactly what searchJobs() does with default filters
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '20',
    what: '',
    where: '',
  });

  const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`;

  let fetchResult: Record<string, unknown> = {};
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    const text = await res.text();
    let parsed: unknown = null;
    try { parsed = JSON.parse(text); } catch {}
    fetchResult = {
      url: url.replace(appKey, 'REDACTED'),
      status: res.status,
      ok: res.ok,
      resultsCount: (parsed as { results?: unknown[] })?.results?.length ?? 'parse error',
      total: (parsed as { count?: number })?.count ?? 0,
      bodyPreview: text.slice(0, 300),
    };
  } catch (e) {
    fetchResult = { url: url.replace(appKey, 'REDACTED'), error: String(e) };
  }

  return NextResponse.json({ fetchResult });
}
