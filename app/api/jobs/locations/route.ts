import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] });

  try {
    const params = new URLSearchParams({
      q,
      format: 'json',
      limit: '7',
      addressdetails: '1',
    });

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        'User-Agent': 'GetHiredToday/1.0 (hiredtodayapp.com)',
        Accept: 'application/json',
        'Accept-Language': 'en',
      },
      cache: 'no-store',
    });

    if (!res.ok) return NextResponse.json({ suggestions: [] });

    type NominatimResult = {
      type: string;
      display_name: string;
      address: {
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        state?: string;
        country?: string;
        country_code?: string;
      };
    };

    const data: NominatimResult[] = await res.json();
    const seen = new Set<string>();
    const suggestions: string[] = [];

    for (const item of data) {
      const a = item.address;
      const city = a.city ?? a.town ?? a.village ?? a.county ?? '';
      const state = a.state ?? '';
      const country = a.country_code?.toUpperCase() ?? a.country ?? '';

      let label = city;
      if (state && state !== city) label += `, ${state}`;
      if (country && country !== 'US') label += `, ${country}`;
      label = label.trim().replace(/^,\s*/, '');

      if (label && !seen.has(label)) {
        seen.add(label);
        suggestions.push(label);
      }
      if (suggestions.length >= 6) break;
    }

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
