import { NextRequest, NextResponse } from 'next/server';

/**
 * Contact form submission handler.
 *
 * Sends the message via Resend to the support inbox.
 * Uses the same EMAIL_FROM env var as the welcome route for consistency.
 */

const FROM = process.env.EMAIL_FROM ?? 'HiredTodayApp Contact <hello@hiredtodayapp.com>';
const TO = process.env.CONTACT_INBOX ?? 'kreativecasaentertainment@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

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

    if (!process.env.RESEND_API_KEY) {
      // Don't 500 the form if email is not configured, log and pretend success so
      // user isn't blocked. Real deployments should have RESEND_API_KEY set.
      console.warn('[contact] RESEND_API_KEY not set, skipping email send');
      return NextResponse.json({ success: true, skipped: true });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const safeSubject = (subject && String(subject).trim()) || 'New HiredTodayApp contact form message';

    const html = `
      <h2 style="margin:0 0 16px;font-family:sans-serif;">New contact form message</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">From:</td><td>${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Subject:</td><td>${escapeHtml(safeSubject)}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
      <div style="font-family:sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</div>
    `;

    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      subject: `[HiredTodayApp] ${safeSubject}`,
      replyTo: email,
      html,
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
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
