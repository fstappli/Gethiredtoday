import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { fetchCategories, isAdzunaConfigured } from '@/lib/jobs/adzuna';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isAdzunaConfigured()) return NextResponse.json({ categories: [] });

    const country = req.nextUrl.searchParams.get('country') ?? 'us';
    const categories = await fetchCategories(country);
    return NextResponse.json({ categories });
  } catch (err) {
    console.error('GET /api/jobs/categories error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
