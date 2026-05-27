import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  const envStatus = {
    ADZUNA_APP_ID: appId ? `set (${appId.slice(0, 4)}...)` : 'MISSING',
    ADZUNA_APP_KEY: appKey ? `set (${appKey.slice(0, 4)}...)` : 'MISSING',
  };

  if (!appId || !appKey) {
    return NextResponse.json({ envStatus, error: 'env vars missing' });
  }

  const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=3&what=&where=`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    const text = await res.text();

    return NextResponse.json({
      envStatus,
      adzunaStatus: res.status,
      adzunaOk: res.ok,
      adzunaHeaders: Object.fromEntries(res.headers.entries()),
      adzunaBody: text.slice(0, 500),
    });
  } catch (err) {
    return NextResponse.json({
      envStatus,
      fetchError: String(err),
    });
  }
}
