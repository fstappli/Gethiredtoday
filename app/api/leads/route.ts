import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { leadChecklistEmail } from '@/lib/email-templates';
import { SITE } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

const FROM = process.env.EMAIL_FROM ?? `${SITE.name} <${SITE.email}>`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const clip = (v: unknown, n: number): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success so they do not retry.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const email = clip(body.email, 254)?.toLowerCase() ?? '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: 'Please confirm you want to receive the email.' }, { status: 400 });
  }

  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  if (limited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const attr = (body.attribution && typeof body.attribution === 'object' ? body.attribution : {}) as Record<string, unknown>;
  const row = {
    email,
    source: clip(body.source, 60),
    page: clip(body.page, 300),
    referrer: clip(attr.referrer, 300),
    utm_source: clip(attr.utm_source, 120),
    utm_medium: clip(attr.utm_medium, 120),
    utm_campaign: clip(attr.utm_campaign, 120),
    utm_term: clip(attr.utm_term, 120),
    utm_content: clip(attr.utm_content, 120),
    consent: true,
  };

  let alreadySubscribed = false;
  try {
    const admin = createAdminSupabaseClient();
    const { error } = await admin.from('leads').insert(row);
    if (error) {
      if (error.code === '23505') alreadySubscribed = true;
      else console.error('[api/leads] store failed (is migration 20260620_leads.sql applied?)', error.message);
    }
  } catch (err) {
    console.error('[api/leads] store error', err);
  }

  // Do not re-send to an address that already signed up.
  if (!alreadySubscribed && process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { subject, html } = leadChecklistEmail({ email });
      const { error } = await resend.emails.send({ from: FROM, to: email, subject, html });
      if (error) {
        console.error('[api/leads] email failed', error);
        return NextResponse.json({ error: 'We could not send the email. Please try again.' }, { status: 502 });
      }
    } catch (err) {
      console.error('[api/leads] email error', err);
      return NextResponse.json({ error: 'We could not send the email. Please try again.' }, { status: 502 });
    }
  } else if (!process.env.RESEND_API_KEY) {
    console.error('[api/leads] RESEND_API_KEY missing');
    return NextResponse.json({ error: 'We could not send the email. Please try again.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
