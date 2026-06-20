import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { monthFromNow, formatEndsAt } from '@/lib/subscription';
import { subscriptionEndingEmail } from '@/lib/email-templates';

const FROM = process.env.EMAIL_FROM ?? 'HiredTodayApp <hello@hiredtodayapp.com>';

async function gumroadCancelSubscriber(subscriberId: string, accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.gumroad.com/v2/subscribers/${encodeURIComponent(subscriberId)}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const json = (await res.json().catch(() => ({}))) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

async function gumroadFindSubscriberId(email: string, accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.gumroad.com/v2/sales?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      sales?: Array<{ subscription_id?: string | null; cancelled?: boolean; ended_at?: string | null }>;
    };
    // Prefer an active subscription; fall back to any with a subscription_id
    const active = (json.sales ?? []).find((s) => s.subscription_id && !s.cancelled && !s.ended_at);
    if (active?.subscription_id) return active.subscription_id;
    return (json.sales ?? []).find((s) => s.subscription_id)?.subscription_id ?? null;
  } catch {
    return null;
  }
}

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

// POST /api/admin/users/[id] — actions: reset_password | cancel_gumroad
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const admin = createAdminSupabaseClient();

  // ── cancel_gumroad ──────────────────────────────────────────────────────────
  if (body.action === 'cancel_gumroad') {
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('email, full_name, subscription_id, subscription_ends_at')
      .eq('id', id)
      .single();

    if (profileError || !profile?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const email = profile.email as string;
    const firstName: string = profile.full_name
      ? (profile.full_name as string).split(/\s+/)[0]
      : email.split('@')[0];
    const endsAt: string = (profile.subscription_ends_at as string | null) ?? monthFromNow();
    const endsAtDisplay = formatEndsAt(endsAt);

    // 1. Cancel on Gumroad
    let gumroadCancelled = false;
    const accessToken = process.env.GUMROAD_ACCESS_TOKEN;
    if (accessToken) {
      let subId = (profile.subscription_id as string | null) ?? null;
      if (!subId) subId = await gumroadFindSubscriberId(email, accessToken);
      if (subId) gumroadCancelled = await gumroadCancelSubscriber(subId, accessToken);
      if (!gumroadCancelled) {
        console.error(`[admin/cancel_gumroad] Gumroad cancel failed for ${email} (subId: ${subId ?? 'not found'})`);
      }
    }

    // 2. Update DB — always, regardless of Gumroad result
    await admin
      .from('profiles')
      .update({ subscription_status: 'cancelled', subscription_ends_at: endsAt })
      .eq('id', id);

    // 3. Send notification email
    let emailSent = false;
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        const { subject, html } = subscriptionEndingEmail(firstName, endsAtDisplay);
        const { error: sendErr } = await resend.emails.send({ from: FROM, to: email, subject, html });
        if (!sendErr) emailSent = true;
        else console.error(`[admin/cancel_gumroad] Email failed for ${email}:`, sendErr);
      } catch (err) {
        console.error(`[admin/cancel_gumroad] Email threw for ${email}:`, err);
      }
    }

    return NextResponse.json({ success: true, gumroadCancelled, emailSent });
  }

  // ── reset_password ──────────────────────────────────────────────────────────
  if (body.action === 'reset_password') {
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single();

    if (profileError || !profile?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: profile.email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password` },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, email: profile.email, link: data.properties?.action_link });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
