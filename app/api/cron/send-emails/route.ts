import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  welcomeEmail,
  atsEducationEmail,
  featureRevealEmail,
  upgradeOfferEmail,
  day10LastChanceEmail,
  day14WinbackEmail,
} from '@/lib/email-templates';

/**
 * Scheduled email worker.
 *
 * Runs on a Vercel cron every 15 minutes. Pulls due rows from
 * public.email_queue, sends them via Resend, and marks status.
 *
 * Auth: Vercel Cron invokes with `Authorization: Bearer $CRON_SECRET`.
 */

const FROM = process.env.EMAIL_FROM ?? 'HiredTodayApp <hello@hiredtodayapp.com>';
const BATCH_SIZE = 50;
const MAX_ATTEMPTS = 3;

type EmailType =
  | 'welcome'
  | 'ats_education'
  | 'feature_reveal'
  | 'upgrade_offer'
  | 'day10_last_chance'
  | 'day14_winback';

const TEMPLATES: Record<
  EmailType,
  { render: (firstName: string) => { subject: string; html: string }; upsell: boolean }
> = {
  welcome:           { render: welcomeEmail,         upsell: false },
  ats_education:     { render: atsEducationEmail,    upsell: false },
  feature_reveal:    { render: featureRevealEmail,   upsell: true },
  upgrade_offer:     { render: upgradeOfferEmail,    upsell: true },
  day10_last_chance: { render: day10LastChanceEmail, upsell: true },
  day14_winback:     { render: day14WinbackEmail,    upsell: true },
};

interface QueueRow {
  id: string;
  user_id: string;
  email_type: EmailType;
  attempts: number;
}

interface ProfileRow {
  email: string | null;
  full_name: string | null;
  subscription_status: string | null;
  unsubscribed_at: string | null;
}

function firstNameFromProfile(row: ProfileRow): string {
  if (row.full_name) return row.full_name.split(/\s+/)[0];
  if (row.email) return row.email.split('@')[0];
  return 'there';
}

export async function GET(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Supabase env vars missing' }, { status: 500 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch due pending emails
  // Note: 'welcome' is skipped here because it's sent directly from the auth
  // callback (/api/email/welcome) at signup time, so queuing it would duplicate.
  const { data: queue, error: fetchErr } = await supabase
    .from('email_queue')
    .select('id, user_id, email_type, attempts')
    .eq('status', 'pending')
    .neq('email_type', 'welcome')
    .lte('scheduled_at', new Date().toISOString())
    .lt('attempts', MAX_ATTEMPTS)
    .limit(BATCH_SIZE);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!queue || queue.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of queue as QueueRow[]) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, subscription_status, unsubscribed_at')
        .eq('id', row.user_id)
        .maybeSingle<ProfileRow>();

      // No profile / no email → skip (fatal)
      if (!profile || !profile.email) {
        await supabase
          .from('email_queue')
          .update({ status: 'skipped', last_error: 'No profile or email' })
          .eq('id', row.id);
        skipped++;
        continue;
      }

      // Unsubscribed → skip
      if (profile.unsubscribed_at) {
        await supabase
          .from('email_queue')
          .update({ status: 'skipped', last_error: 'Unsubscribed' })
          .eq('id', row.id);
        skipped++;
        continue;
      }

      const tmpl = TEMPLATES[row.email_type];
      if (!tmpl) {
        console.error('[cron/send-emails] unknown email_type', { id: row.id, type: row.email_type });
        await supabase
          .from('email_queue')
          .update({ status: 'failed', last_error: `Unknown email_type: ${row.email_type}` })
          .eq('id', row.id);
        failed++;
        continue;
      }

      // Upsell emails are skipped for active/paid users
      if (tmpl.upsell && profile.subscription_status && profile.subscription_status !== 'free') {
        await supabase
          .from('email_queue')
          .update({ status: 'skipped', last_error: 'Already subscribed' })
          .eq('id', row.id);
        skipped++;
        continue;
      }

      const { subject, html } = tmpl.render(firstNameFromProfile(profile));

      const { error: sendErr } = await resend.emails.send({
        from: FROM,
        to: profile.email,
        subject,
        html,
      });

      if (sendErr) {
        throw new Error(sendErr.message ?? 'Resend send error');
      }

      await supabase
        .from('email_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', row.id);
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message.slice(0, 500) : String(err).slice(0, 500);
      const nextAttempts = (row.attempts ?? 0) + 1;
      // Exponential backoff: 30min, 2h, 8h for attempts 1/2/3
      const backoffMinutes = Math.pow(4, nextAttempts - 1) * 30;
      const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
      await supabase
        .from('email_queue')
        .update({
          attempts: nextAttempts,
          last_error: msg,
          status: nextAttempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
          scheduled_at: nextAttempts >= MAX_ATTEMPTS ? undefined : nextRetry,
        })
        .eq('id', row.id);
      failed++;
      console.error('[cron/send-emails] row failed', { id: row.id, attempt: nextAttempts, nextRetry, error: msg });
    }
  }

  return NextResponse.json({ processed: queue.length, sent, skipped, failed });
}
