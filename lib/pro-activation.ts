import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { proWelcomeEmail } from '@/lib/email-templates';
import { monthFromNow } from '@/lib/subscription';

const FROM = process.env.EMAIL_FROM ?? 'HiredTodayApp <hello@hiredtodayapp.com>';

/** Escape LIKE wildcards so an email can be matched with ilike (case-insensitive equality). */
export function ilikeExact(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export interface ProRecipient {
  userId: string;
  email: string;
  fullName?: string | null;
}

/** Sends the "you are Pro" email. Never throws: a mail problem must not undo an upgrade. */
export async function sendProWelcomeEmail(to: ProRecipient): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[pro-welcome] RESEND_API_KEY not set, skipping');
      return false;
    }
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const firstName = (to.fullName ?? '').trim().split(/\s+/)[0] || to.email.split('@')[0];
    const { subject, html } = proWelcomeEmail(firstName, { userId: to.userId, email: to.email });
    const send = resend.emails.send({ from: FROM, to: to.email, subject, html });
    const timeout = new Promise<{ error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ error: { message: 'timed out after 6s' } }), 6000)
    );
    const { error } = await Promise.race([send, timeout]);
    if (error) {
      console.error(`[pro-welcome] email to ${to.email} failed:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[pro-welcome] unexpected error:', err);
    return false;
  }
}

export type ActivationTarget = { userId: string } | { email: string };

export interface ActivationDeps {
  client?: SupabaseClient;
  send?: (to: ProRecipient) => Promise<boolean>;
}

/**
 * Marks a profile as Pro. The free-to-Pro change is one atomic UPDATE, and only the
 * request that actually makes that change sends the welcome email, so the webhook,
 * the return redirect and the login reconcile can all race without double-sending.
 * Monthly renewals just refresh the period and do not email.
 */
export async function activatePro(
  target: ActivationTarget,
  fields: { subscriptionId?: string | null } = {},
  deps: ActivationDeps = {}
): Promise<{ matched: number; newlyPro: number }> {
  const client = deps.client ?? createAdminSupabaseClient();
  const send = deps.send ?? sendProWelcomeEmail;
  const patch = {
    subscription_status: 'active',
    subscription_ends_at: monthFromNow(),
    ...(fields.subscriptionId ? { subscription_id: fields.subscriptionId } : {}),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scope = (q: any) => ('userId' in target ? q.eq('id', target.userId) : q.ilike('email', ilikeExact(target.email)));

  const { data: moved, error } = await scope(
    client.from('profiles').update(patch).or('subscription_status.is.null,subscription_status.not.in.(active,trialing,pro)')
  ).select('id, email, full_name');
  if (error) throw new Error(`activatePro failed: ${error.message}`);

  const rows = (moved ?? []) as Array<{ id: string; email: string | null; full_name: string | null }>;
  for (const r of rows) {
    if (!r.email) continue;
    try {
      await send({ userId: r.id, email: r.email, fullName: r.full_name });
    } catch (err) {
      console.error('[pro-activation] welcome email threw:', err); // the upgrade already happened
    }
  }
  if (rows.length) return { matched: rows.length, newlyPro: rows.length };

  // Already Pro (a renewal or a repeat webhook): refresh the period, no email.
  const { data: refreshed, error: refreshErr } = await scope(
    client.from('profiles').update(patch).in('subscription_status', ['active', 'trialing', 'pro'])
  ).select('id');
  if (refreshErr) throw new Error(`activatePro refresh failed: ${refreshErr.message}`);
  return { matched: refreshed?.length ?? 0, newlyPro: 0 };
}
