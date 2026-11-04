import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

/**
 * Contact form submission handler (public site and logged-in dashboard).
 *
 * Every message is stored in `contact_messages` first so nothing is lost,
 * then emailed to the support inbox via Resend. The request only fails if the
 * message could be neither stored nor emailed.
 */

const FROM = process.env.EMAIL_FROM ?? 'HiredTodayApp Contact <hello@hiredtodayapp.com>';
// Works before the hiredtodayapp.com domain is verified in Resend (delivers to the Resend account owner only).
const FALLBACK_FROM = 'HiredTodayApp Contact <onboarding@resend.dev>';
const TO = process.env.CONTACT_INBOX ?? 'kreativecasaentertainment@gmail.com';

// Max messages one email address can send per hour.
const HOURLY_LIMIT = 5;

let _admin: SupabaseClient | null = null;
function getAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _admin;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, source, website } = await request.json();

    // Honeypot: real users never see this field. Pretend success so bots move on.
    if (website) return NextResponse.json({ success: true });

    // Basic validation
    if (!name || typeof name !== 'string' || name.length < 1) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'valid email is required' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.length < 5) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Length caps to reject pathological submissions
    if (name.length > 200 || email.length > 200 || (subject?.length ?? 0) > 300 || message.length > 5000) {
      return NextResponse.json({ error: 'field too long' }, { status: 400 });
    }

    const safeSubject = (subject && String(subject).trim()) || 'New HiredTodayApp contact form message';
    const safeSource = source === 'dashboard' ? 'dashboard' : 'public';

    // Attach the account when the sender is logged in.
    let userId: string | null = null;
    try {
      const ssr = await createServerSupabaseClient();
      const { data: { user } } = await ssr.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // Anonymous submission.
    }

    // 1. Store the message (best effort: the table may not exist yet).
    let storedId: string | null = null;
    try {
      const admin = getAdmin();
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .ilike('email', email.replace(/[\\%_]/g, (c: string) => `\\${c}`))
        .gte('created_at', since);
      if ((count ?? 0) >= HOURLY_LIMIT) {
        return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
      }
      const { data, error } = await admin
        .from('contact_messages')
        .insert({ user_id: userId, name, email, topic: safeSubject, message, source: safeSource })
        .select('id')
        .single();
      if (error) console.error('[contact] store failed:', error.message);
      else storedId = data?.id ?? null;
    } catch (err) {
      console.error('[contact] store failed:', err);
    }

    // 2. Email the support inbox.
    let emailed = false;
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const html = `
      <h2 style="margin:0 0 16px;font-family:sans-serif;">New contact form message</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">From:</td><td>${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Subject:</td><td>${escapeHtml(safeSubject)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Sent from:</td><td>${safeSource === 'dashboard' ? `Logged-in dashboard (user ${escapeHtml(userId ?? 'unknown')})` : 'Public site'}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
      <div style="font-family:sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</div>
    `;

      const payload = { to: TO, subject: `[HiredTodayApp] ${safeSubject}`, replyTo: email, html };
      let { error } = await resend.emails.send({ from: FROM, ...payload });
      if (error) {
        console.error('[contact] Resend error:', error);
        // Sender domain not verified yet: Resend's shared sender can still reach the account owner's inbox.
        ({ error } = await resend.emails.send({ from: FALLBACK_FROM, ...payload }));
        if (error) console.error('[contact] Resend fallback error:', error);
      }
      if (!error) emailed = true;
    } else {
      console.warn('[contact] RESEND_API_KEY not set, skipping email send');
    }

    if (!storedId && !emailed) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    if (storedId && emailed) {
      try {
        await getAdmin().from('contact_messages').update({ emailed: true }).eq('id', storedId);
      } catch {
        // Non-critical flag.
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
