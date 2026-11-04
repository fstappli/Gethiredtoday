/**
 * Landing endpoint the user hits right after Gumroad confirms their payment.
 *
 * Responsibilities:
 *   1. Verify the authenticated user actually has an active Gumroad
 *      subscriber (doesn't blindly trust the redirect, someone could paste
 *      the URL).
 *   2. If verified, flip profiles.subscription_status = 'active'
 *      synchronously so the user doesn't have to wait on the webhook.
 *   3. Redirect the user back to the in-app page they were on before
 *      upgrading (the `to` query param), with `?upgraded=1` so the
 *      destination page can show a "Welcome to Pro" toast.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { reconcileGumroadPurchase } from '@/lib/gumroad-reconcile';
import { safeInternalPath } from '@/lib/safe-path';

export const runtime = 'nodejs';

// Only allow returning the user to safe in-app paths.
function safeReturnPath(raw: string | null): string {
  return safeInternalPath(raw, '/dashboard');
}

export async function GET(req: NextRequest) {
  const to = safeReturnPath(req.nextUrl.searchParams.get('to'));
  const destination = new URL(to, req.nextUrl.origin);

  const ssr = await createServerSupabaseClient();
  const { data: { user } } = await ssr.auth.getUser();

  // If the user isn't logged in for some reason, just send them to the
  // destination. The destination will run its own auth check.
  if (!user || !user.email) {
    destination.searchParams.set('upgraded', 'pending');
    return NextResponse.redirect(destination);
  }

  // Verify with Gumroad that this email has a valid paid purchase.
  if (await reconcileGumroadPurchase(user.id, user.email, { force: true })) {
    destination.searchParams.set('upgraded', '1');
    return NextResponse.redirect(destination);
  }

  // Webhook will reconcile shortly. Mark pending so the destination page can
  // show a "processing your upgrade" state rather than a confusing "still
  // Free" view.
  destination.searchParams.set('upgraded', 'pending');
  return NextResponse.redirect(destination);
}
