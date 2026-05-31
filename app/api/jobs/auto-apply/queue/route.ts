import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { runAutoApplyForUser } from '@/lib/jobs/auto-apply-runner';
import { isProActive } from '@/lib/subscription';

// POST /api/jobs/auto-apply/queue — queue matching jobs for the authenticated user
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_ends_at, created_at')
      .eq('id', user.id)
      .single();
    const TRIAL_MS = 2 * 24 * 60 * 60 * 1000;
    const inTrial = profile?.created_at
      ? Date.now() - new Date(profile.created_at).getTime() < TRIAL_MS
      : false;
    if (!isProActive(profile) && !inTrial) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    const result = await runAutoApplyForUser(user.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error('POST /api/jobs/auto-apply/queue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/jobs/auto-apply/queue — get queued (redirected from auto-apply) jobs
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();

    const { data: apps } = await admin
      .from('applications')
      .select(`
        id, status, created_at,
        job:jobs (id, title, company, location, redirect_url, category, work_type)
      `)
      .eq('user_id', user.id)
      .eq('source', 'auto_apply')
      .eq('status', 'redirected')
      .order('created_at', { ascending: false });

    const { data: recentRuns } = await supabase
      .from('auto_apply_runs')
      .select('*')
      .eq('user_id', user.id)
      .order('run_at', { ascending: false })
      .limit(5);

    return NextResponse.json({ queue: apps ?? [], runs: recentRuns ?? [] });
  } catch (err) {
    console.error('GET /api/jobs/auto-apply/queue error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
