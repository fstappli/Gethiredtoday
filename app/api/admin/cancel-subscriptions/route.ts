/**
 * POST /api/admin/cancel-subscriptions
 *
 * Admin-only. Cancels every active Gumroad subscription so no user is
 * auto-charged again, then emails each affected user to let them know
 * their Pro access ends at the current subscription_ends_at date and
 * inviting them to resubscribe manually.
 *
 * Returns a per-user result log so the admin can see exactly what happened.
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { subscriptionEndingEmail } from '@/lib/email-templates';
import { monthFromNow, formatEndsAt } from '@/lib/subscription';

export const runtime = 'nodejs';
export const maxDuration = 300; // up to 5 min for large user bases

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';
const FROM = process.env.EMAIL_FROM ?? 'HiredTodayApp <hello@hiredtodayapp.com>';

async function assertAdmin() {
  const ssr = await createServerSupabaseClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return false;
  return true;
}

async function gumroadCancel(
  subscriberId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.gumroad.com/v2/subscribers/${encodeURIComponent(subscriberId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const json = (await res.json().catch(() => ({}))) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

// Find a subscriber_id for an email via the Gumroad sales API.
async function findSubscriberId(email: string, accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.gumroad.com/v2/sales?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      sales?: Array<{ subscription_id?: string | null; cancelled?: boolean; ended_at?: string | null }>;
    };
    const active = (json.sales ?? []).find(
      (s) => s.subscription_id && !s.cancelled && !s.ended_at
    );
    if (active?.subscription_id) return active.subscription_id;
    const any = (json.sales ?? []).find((s) => s.subscription_id);
    return any?.subscription_id ?? null;
  } catch {
    return null;
  }
}

export async function POST() {
  if (!await assertAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminSupabaseClient();
  const accessToken = process.env.GUMROAD_ACCESS_TOKEN ?? null;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  // Fetch all active Pro subscribers
  const { data: users, error } = await admin
    .from('profiles')
    .select('id, email, full_name, subscription_id, subscription_ends_at, subscription_status')
    .eq('subscription_status', 'active');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!users || users.length === 0) {
    return NextResponse.json({ message: 'No active subscribers found.', results: [] });
  }

  const { Resend } = await import('resend');
  const resend = new Resend(resendKey);

  const results: Array<{
    email: string;
    gumroadCancelled: boolean;
    dbUpdated: boolean;
    emailSent: boolean;
    note?: string;
  }> = [];

  for (const user of users) {
    const email = (user.email as string | null) ?? null;
    if (!email) {
      results.push({ email: '(no email)', gumroadCancelled: false, dbUpdated: false, emailSent: false, note: 'No email on profile' });
      continue;
    }

    const firstName: string = user.full_name
      ? (user.full_name as string).split(/\s+/)[0]
      : email.split('@')[0];

    // Keep existing ends_at or default to 30 days from now
    const endsAt: string = (user.subscription_ends_at as string | null) ?? monthFromNow();
    const endsAtDisplay = formatEndsAt(endsAt);

    // 1. Cancel on Gumroad
    let gumroadCancelled = false;
    if (accessToken) {
      let subId = (user.subscription_id as string | null) ?? null;
      if (!subId) subId = await findSubscriberId(email, accessToken);
      if (subId) gumroadCancelled = await gumroadCancel(subId, accessToken);
    }

    // 2. Update DB — mark cancelled, keep subscription_ends_at so they retain
    //    access until the end of the period they already paid for.
    const { error: dbErr } = await admin
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_ends_at: endsAt,
      })
      .eq('id', user.id as string);

    const dbUpdated = !dbErr;
    if (dbErr) console.error('[cancel-subscriptions] DB update failed for', email, dbErr);

    // 3. Send notification email
    let emailSent = false;
    try {
      const { subject, html } = subscriptionEndingEmail(firstName, endsAtDisplay);
      const { error: sendErr } = await resend.emails.send({
        from: FROM,
        to: email,
        subject,
        html,
      });
      if (sendErr) throw new Error(sendErr.message);
      emailSent = true;
    } catch (err) {
      console.error('[cancel-subscriptions] Email failed for', email, err);
    }

    results.push({
      email,
      gumroadCancelled,
      dbUpdated,
      emailSent,
      ...(!gumroadCancelled && accessToken ? { note: 'Gumroad cancel failed — user may need to cancel manually via gumroad.com/library' } : undefined),
      ...(!accessToken ? { note: 'GUMROAD_ACCESS_TOKEN not set — Gumroad not called' } : undefined),
    });
  }

  const summary = {
    total: results.length,
    gumroadCancelled: results.filter((r) => r.gumroadCancelled).length,
    dbUpdated: results.filter((r) => r.dbUpdated).length,
    emailsSent: results.filter((r) => r.emailSent).length,
  };

  console.log('[cancel-subscriptions] completed', summary);
  return NextResponse.json({ summary, results });
}
