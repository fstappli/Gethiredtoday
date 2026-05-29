/**
 * Confirm a Stripe Checkout session server-side and mark the user as Pro
 * without waiting on the webhook. Called by the dashboard when the user is
 * redirected back with ?success=true&session_id=…
 *
 * This is the safety-net path. The webhook (app/api/stripe/webhook/route.ts)
 * is still authoritative for subscription lifecycle events. This endpoint just
 * makes sure the user sees their Pro status immediately after paying, even
 * if the webhook delivery is slow or missed.
 */

import { stripe } from '@/lib/stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

let _adminClient: SupabaseClient | null = null;
function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Verify the current user owns this session. We use the SSR client so it
    // can read the auth cookie and identify the logged-in user.
    const ssr = await createServerSupabaseClient();
    const { data: { user } } = await ssr.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Session metadata must identify the same user who's logged in, otherwise
    // a malicious user could paste someone else's session id and upgrade.
    const sessionUserId = session.metadata?.userId;
    if (sessionUserId && sessionUserId !== user.id) {
      return NextResponse.json({ error: 'Session does not belong to this user' }, { status: 403 });
    }

    // Only mark as active if the payment actually succeeded.
    // 'open' means pending payment — never treat it as paid.
    const paid =
      session.payment_status === 'paid' ||
      session.status === 'complete';

    if (!paid) {
      return NextResponse.json({
        ok: false,
        status: session.status,
        paymentStatus: session.payment_status,
        message: 'Payment not yet complete.',
      });
    }

    const customerId = (session.customer as string) || null;
    const subscriptionId = (session.subscription as string) || null;

    // Use the real billing cycle end from Stripe rather than guessing +30 days.
    // The webhook is authoritative but may be slow; this gives an accurate date immediately.
    let subscriptionEndsAt: string | null = null;
    if (subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        // current_period_end is a standard Stripe field present at runtime
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const periodEnd = (sub as any).current_period_end as number | undefined;
        if (periodEnd) subscriptionEndsAt = new Date(periodEnd * 1000).toISOString();
      } catch (e) {
        console.error('confirm-checkout: failed to retrieve subscription for period end', e);
        // Non-fatal — webhook will correct the date when it arrives.
      }
    }

    const { error } = await getAdminClient()
      .from('profiles')
      .update({
        subscription_status: 'active',
        ...(subscriptionEndsAt && { subscription_ends_at: subscriptionEndsAt }),
        ...(customerId && { stripe_customer_id: customerId }),
        ...(subscriptionId && { subscription_id: subscriptionId }),
      })
      .eq('id', user.id);

    if (error) {
      console.error('confirm-checkout: profile update failed:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, subscription_status: 'active' });
  } catch (err) {
    console.error('confirm-checkout error:', err);
    return NextResponse.json({ error: 'Confirmation failed' }, { status: 500 });
  }
}
