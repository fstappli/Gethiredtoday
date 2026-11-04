import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { monthFromNow } from '@/lib/subscription';
import { activatePro, ilikeExact } from '@/lib/pro-activation';
import { verifyGumroadSale } from '@/lib/gumroad-reconcile';
import { timingSafeEqual } from 'crypto';

function sameSecret(given: string | null, secret: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const runtime = 'nodejs';

let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set, rejecting webhook');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Gumroad sends form-encoded data
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // The shared secret may arrive as a 'ping' field in the POST body, or as ?ping= / ?secret= on the
  // webhook URL (Gumroad pings carry no signature of their own, so putting the secret in the URL
  // configured in Gumroad is the reliable way). Every sale is additionally confirmed with Gumroad below.
  const url = new URL(req.url);
  const given = params.get('ping') ?? url.searchParams.get('ping') ?? url.searchParams.get('secret');
  if (!sameSecret(given, secret)) {
    console.error(
      `Webhook ping verification failed (body ping: ${params.has('ping')}, url secret: ${url.searchParams.has('ping') || url.searchParams.has('secret')})`
    );
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const resourceName = params.get('resource_name');
  const email = params.get('email');
  const refunded = params.get('refunded') === 'true';
  const disputed = params.get('disputed') === 'true';
  const productPermalink = params.get('product_permalink') ?? '';

  // Only process webhooks for the HiredTodayApp product
  const PRODUCT_PERMALINK = process.env.GUMROAD_PRODUCT_PERMALINK ?? 'kxtcbs';
  if (productPermalink && productPermalink !== PRODUCT_PERMALINK) {
    console.log(`Ignoring webhook for unrelated product: ${productPermalink}`);
    return NextResponse.json({ received: true });
  }

  if (!email) {
    return NextResponse.json({ received: true });
  }

  // Capture the subscriber id so we can cancel from inside the app later.
  const subscriberId =
    params.get('subscription_id') ||
    params.get('subscriber_id') ||
    params.get('id') ||
    null;

  try {
    if (resourceName === 'sale' && !refunded && !disputed) {
      // Check if this user previously cancelled inside the app. If so, the
      // Gumroad-side cancel must have failed, they were charged again.
      // Log it so it can be investigated and refunded if needed.
      const { data: existing } = await getSupabaseAdmin()
        .from('profiles')
        .select('subscription_status')
        .ilike('email', ilikeExact(email))
        .limit(1)
        .maybeSingle();
      if (existing?.subscription_status === 'cancelled') {
        console.error(
          `[webhook] Re-charge detected for cancelled user: ${email}. ` +
          `Gumroad subscription was not cancelled successfully. ` +
          `subscription_id in payload: ${subscriberId ?? 'none'}`
        );
      }

      // Confirm with Gumroad that this sale is real, paid and for this email before granting Pro.
      const saleId = params.get('sale_id') || params.get('order_number') || '';
      if ((await verifyGumroadSale(saleId, email)) === 'invalid') {
        console.error(`[webhook] Gumroad does not confirm sale ${saleId || '(none)'} for ${email}; ignoring`);
        return NextResponse.json({ received: true });
      }

      const { matched } = await activatePro({ email }, { subscriptionId: subscriberId });
      if (!matched) {
        // Paid before a profile existed (or under another email). The login-time
        // reconcile in the dashboard layout will pick this up.
        console.error(`[webhook] Sale for ${email} matched no profile; will reconcile at login`);
      }
    } else if (resourceName === 'refund' || refunded) {
      await getSupabaseAdmin()
        .from('profiles')
        .update({
          subscription_status: 'free',
          subscription_ends_at: null,
        })
        .ilike('email', ilikeExact(email));
    } else if (resourceName === 'cancellation') {
      const { data: existing } = await getSupabaseAdmin()
        .from('profiles')
        .select('subscription_ends_at')
        .ilike('email', ilikeExact(email))
        .limit(1)
        .maybeSingle();
      const endsAt = (existing?.subscription_ends_at as string | null) || monthFromNow();
      await getSupabaseAdmin()
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_ends_at: endsAt,
        })
        .ilike('email', ilikeExact(email));
    } else if (resourceName === 'subscription_ended' || resourceName === 'subscription_cancelled') {
      await getSupabaseAdmin()
        .from('profiles')
        .update({
          subscription_status: 'free',
          subscription_ends_at: null,
        })
        .ilike('email', ilikeExact(email));
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
