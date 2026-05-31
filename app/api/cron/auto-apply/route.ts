import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { runAutoApplyForUser } from '@/lib/jobs/auto-apply-runner';
import { isProActive } from '@/lib/subscription';

/**
 * Daily auto-apply cron.
 * Runs at 9am UTC — iterates every user with auto-apply enabled and not paused,
 * queues matching jobs for their review.
 *
 * Auth: Vercel Cron sends Authorization: Bearer $CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();

  // Get all users with auto-apply enabled and not paused
  const { data: activeSettings, error } = await admin
    .from('auto_apply_settings')
    .select('user_id')
    .eq('enabled', true)
    .is('paused_at', null);

  if (error) {
    console.error('cron/auto-apply: failed to fetch settings', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }

  if (!activeSettings || activeSettings.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No users with auto-apply enabled.' });
  }

  // Filter to only users with active Pro or within the 2-day trial window
  const userIds = activeSettings.map((s) => s.user_id);
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, subscription_status, subscription_ends_at, created_at')
    .in('id', userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const TRIAL_MS = 2 * 24 * 60 * 60 * 1000;
  const eligibleSettings = activeSettings.filter((s) => {
    const p = profileMap.get(s.user_id);
    if (!p) return false;
    if (isProActive(p)) return true;
    return p.created_at
      ? Date.now() - new Date(p.created_at).getTime() < TRIAL_MS
      : false;
  });

  if (eligibleSettings.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No eligible users with active Pro or trial.' });
  }

  // Run for each user — cap concurrency at 3 to avoid rate-limiting job APIs.
  // Add 1s pause between batches so API quotas are not exhausted.
  const results: { userId: string; queued: number; message: string }[] = [];
  const batchSize = 3;

  for (let i = 0; i < eligibleSettings.length; i += batchSize) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1000));
    const batch = eligibleSettings.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((s) => runAutoApplyForUser(s.user_id))
    );
    for (let j = 0; j < batch.length; j++) {
      const r = batchResults[j];
      if (r.status === 'rejected') {
        console.error(`cron/auto-apply: user ${batch[j].user_id} failed`, r.reason);
      }
      results.push({
        userId: batch[j].user_id,
        queued: r.status === 'fulfilled' ? r.value.queued : 0,
        message: r.status === 'fulfilled' ? r.value.message : (r.reason?.message ?? 'error'),
      });
    }
  }

  const totalQueued = results.reduce((sum, r) => sum + r.queued, 0);
  console.log(`cron/auto-apply: processed ${results.length} users, queued ${totalQueued} jobs`);

  return NextResponse.json({
    processed: results.length,
    total_queued: totalQueued,
    results,
  });
}
