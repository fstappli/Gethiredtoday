import { NextRequest, NextResponse } from 'next/server';
import sitemap from '@/app/sitemap';
import { INDEXNOW_KEY } from '@/lib/seo/indexnow';
import { SITE, SITE_URL } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * Weekly: submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver).
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const urlList = sitemap().map((e) => e.url);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: SITE.domain,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });

  return NextResponse.json({ submitted: urlList.length, status: res.status });
}
