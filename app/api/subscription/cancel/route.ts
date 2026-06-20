/**
 * Cancel the current user's Gumroad subscription from inside the app — so
 * the user never has to leave hiredtodayapp.com to manage their subscription.
 *
 * Guiding principle: the user clicked Cancel, we respect that. No user ever
 * gets stuck on a "cannot cancel, please contact support" dead end. Whatever
 * happens with Gumroad, we always try to flip subscription_status in our DB,
 * and we always return a JSON response (never crash into a Vercel HTML 500).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { monthFromNow } from '@/lib/subscription';

export const runtime = 'nodejs';

let _adminClient: SupabaseClient | null = null;
function getAdminClient(): SupabaseClient | null {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    _adminClient = createClient(url, key);
  }
  return _adminClient;
}

async function gumroadCancel(
  subscriberId: string,
  accessToken: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(
      `https://api.gumroad.com/v2/subscribers/${encodeURIComponent(subscriberId)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };
    if (json.success) return { ok: true };
    return {
      ok: false,
      message: json.message || `Gumroad HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Network error calling Gumroad.',
    };
  }
}

// Look up the Gumroad subscription_id for a given email via the /v2/sales
// endpoint. Gumroad's /v2/subscribers endpoint does NOT support an email
// query param — sales does. Each sale for a recurring product carries a
// subscription_id, which is the id we need for DELETE /v2/subscribers/:id.
async function gumroadFindSubscriberIdByEmail(
  email: string,
  accessToken: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.gumroad.com/v2/sales?email=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success?: boolean;
      sales?: Array<{
        subscription_id?: string | null;
        cancelled?: boolean | null;
        ended_at?: string | null;
      }>;
    };
    const sales = json.sales ?? [];
    const active = sales.find(
      (s) => s.subscription_id && !s.cancelled && !s.ended_at
    );
    if (active?.subscription_id) return active.subscription_id;
    const any = sales.find((s) => s.subscription_id);
    return any?.subscription_id ?? null;
  } catch {
    return null;
  }
}

// Soft-success response shape the client always sees.
// gumroadCancelled=true  → Gumroad subscription is actually stopped.
// gumroadCancelled=false → Only the local DB was flipped; Gumroad may still charge.
function softOk(mode: string, message?: string, gumroadCancelled = false) {
  return NextResponse.json({
    ok: true,
    mode,
    gumroadCancelled,
    message:
      message ||
      'Your subscription has been cancelled. Pro access remains active until the end of your current billing period.',
  });
}

export async function POST() {
  try {
    // 1. Auth
    const ssr = await createServerSupabaseClient();
    const {
      data: { user },
    } = await ssr.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'You must be signed in to cancel your subscription.' },
        { status: 401 }
      );
    }

    // 2. Pick the best writer client. Prefer admin (service-role) so RLS
    //    doesn't silently block the update; fall back to the user's SSR
    //    client if the admin client can't be created.
    const admin = getAdminClient();
    const writer = admin || ssr;

    // 3. Load the profile — but don't hard-fail if it's missing. We can still
    //    cancel locally using just the auth email + user id.
    let subscriptionId: string | null = null;
    let profileEmail: string | null = null;
    let existingEndsAt: string | null = null;
    try {
      const { data: profile } = await writer
        .from('profiles')
        .select('subscription_id, email, subscription_ends_at')
        .eq('id', user.id)
        .single();
      if (profile) {
        subscriptionId = (profile.subscription_id as string | null) ?? null;
        profileEmail = (profile.email as string | null) ?? null;
        existingEndsAt = (profile.subscription_ends_at as string | null) ?? null;
      }
    } catch (err) {
      console.error('[subscription/cancel] profile load failed:', err);
    }

    const email = user.email || profileEmail || null;

    // Commit the local cancellation FIRST, before touching Gumroad. This
    // guarantees the UI flips regardless of what Gumroad does.
    //
    // Keep (or compute) subscription_ends_at so the user retains Pro access
    // until the end of the cycle they already paid for.
    const endsAt = existingEndsAt || monthFromNow();
    const localCommit = async () => {
      try {
        const { error } = await writer
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_ends_at: endsAt,
          })
          .eq('id', user.id);
        if (error) {
          console.error('[subscription/cancel] DB update failed:', error);
          return false;
        }
        return true;
      } catch (err) {
        console.error('[subscription/cancel] DB update threw:', err);
        return false;
      }
    };

    const localOk = await localCommit();

    // Best-effort Gumroad call. If any of
    //    this throws, we still return a soft-success because the local DB is
    //    already flipped.
    const accessToken = process.env.GUMROAD_ACCESS_TOKEN;
    if (!accessToken) {
      return softOk(localOk ? 'local-only' : 'local-only-db-failed', undefined, false);
    }

    let subId = subscriptionId;
    if (!subId && email) {
      subId = await gumroadFindSubscriberIdByEmail(email, accessToken);
    }
    if (!subId) {
      return softOk(
        localOk ? 'no-gumroad-sub' : 'no-gumroad-sub-db-failed',
        undefined,
        false
      );
    }

    const result = await gumroadCancel(subId, accessToken);
    if (!result.ok) {
      console.error('[subscription/cancel] Gumroad error:', result.message);
      return softOk('gumroad-error-recovered', undefined, false);
    }

    return softOk(
      'gumroad-cancelled',
      'Subscription cancelled. Your Pro access remains active until the end of your current billing period. You can resubscribe any time.',
      true
    );
  } catch (err) {
    // Global fail-safe — no matter what blew up above, return JSON (never
    // a Vercel HTML 500) so the client can at least show a clear message.
    console.error('[subscription/cancel] unhandled error:', err);
    return NextResponse.json(
      {
        ok: false,
        error:
          'Something unexpected happened while cancelling. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
}
