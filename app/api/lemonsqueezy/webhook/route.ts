import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { monthFromNow } from '@/lib/subscription';

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
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set — rejecting webhook');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Gumroad sends form-encoded data
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // Gumroad verifies webhooks via a 'ping' field in the POST body (not a header).
  // The ping value must match the secret configured in Gumroad product settings.
  const ping = params.get('ping');
  if (!ping || ping !== secret) {
    console.error('Webhook ping verification failed');
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
      await getSupabaseAdmin()
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_ends_at: monthFromNow(),
          ...(subscriberId && { subscription_id: subscriberId }),
        })
        .eq('email', email);
    } else if (resourceName === 'refund' || refunded) {
      await getSupabaseAdmin()
        .from('profiles')
        .update({
          subscription_status: 'free',
          subscription_ends_at: null,
        })
        .eq('email', email);
    } else if (resourceName === 'cancellation') {
      const { data: existing } = await getSupabaseAdmin()
        .from('profiles')
        .select('subscription_ends_at')
        .eq('email', email)
        .single();
      const endsAt = (existing?.subscription_ends_at as string | null) || monthFromNow();
      await getSupabaseAdmin()
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_ends_at: endsAt,
        })
        .eq('email', email);
    } else if (resourceName === 'subscription_ended' || resourceName === 'subscription_cancelled') {
      await getSupabaseAdmin()
        .from('profiles')
        .update({
          subscription_status: 'free',
          subscription_ends_at: null,
        })
        .eq('email', email);
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
