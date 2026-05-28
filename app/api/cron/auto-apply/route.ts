import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { runAutoApplyForUser } from '@/lib/jobs/auto-apply-runner';

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

  // Run for each user — cap concurrency at 5 to avoid overwhelming job APIs
  const results: { userId: string; queued: number; message: string }[] = [];
  const batchSize = 5;

  for (let i = 0; i < activeSettings.length; i += batchSize) {
    const batch = activeSettings.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((s) => runAutoApplyForUser(s.user_id))
    );
    for (let j = 0; j < batch.length; j++) {
      const r = batchResults[j];
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
