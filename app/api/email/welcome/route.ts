import { NextRequest, NextResponse } from 'next/server';
import { welcomeEmail } from '@/lib/email-templates';

const FROM = process.env.EMAIL_FROM ?? 'HiredTodayApp <hello@hiredtodayapp.com>';

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.INTERNAL_API_SECRET;
    if (secret && request.headers.get('x-internal-secret') !== secret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, firstName } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('[email] RESEND_API_KEY not set — skipping welcome email');
      return NextResponse.json({ success: true, skipped: true });
    }

    // Lazy-import to avoid build-time instantiation errors
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { subject, html } = welcomeEmail(firstName ?? email.split('@')[0]);

    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error('[email] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[email] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
