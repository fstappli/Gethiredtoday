import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive } from '@/lib/subscription';

// GET /api/jobs/auto-apply/settings
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: settings } = await supabase
      .from('auto_apply_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ settings: settings ?? null });
  } catch (err) {
    console.error('GET /api/jobs/auto-apply/settings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/jobs/auto-apply/settings
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_ends_at')
      .eq('id', user.id)
      .single();
    if (!isProActive(profile)) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      enabled,
      min_match_score,
      daily_cap,
      filters,
      paused_at,
    } = body;

    const upsertData: Record<string, unknown> = { user_id: user.id };
    if (enabled !== undefined) upsertData.enabled = Boolean(enabled);
    if (min_match_score !== undefined) upsertData.min_match_score = Math.max(0, Math.min(100, Number(min_match_score)));
    if (daily_cap !== undefined) upsertData.daily_cap = Math.max(1, Math.min(50, Number(daily_cap)));
    if (filters !== undefined) upsertData.filters = filters;
    if (paused_at !== undefined) upsertData.paused_at = paused_at;

    const { data: settings, error } = await supabase
      .from('auto_apply_settings')
      .upsert(upsertData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Failed to save auto-apply settings:', error);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('PUT /api/jobs/auto-apply/settings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
