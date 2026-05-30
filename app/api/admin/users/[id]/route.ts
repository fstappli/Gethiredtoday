import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { monthFromNow } from '@/lib/subscription';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

async function assertAdmin() {
  const ssr = await createServerSupabaseClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

// PATCH /api/admin/users/[id] — change subscription status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { subscription_status } = await req.json();

  const validStatuses = ['free', 'active', 'cancelled', 'trialing', 'past_due'];
  if (!validStatuses.includes(subscription_status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();

  const update: Record<string, unknown> = { subscription_status };

  if (subscription_status === 'active' || subscription_status === 'trialing') {
    update.subscription_ends_at = monthFromNow();
  } else if (subscription_status === 'free') {
    update.subscription_ends_at = null;
    update.subscription_id = null;
  } else if (subscription_status === 'cancelled') {
    // Keep existing subscription_ends_at so grace period still applies
  }

  const { error } = await admin
    .from('profiles')
    .update(update)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
