import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { activatePro } from '@/lib/pro-activation';
import { proWelcomeEmail } from '@/lib/email-templates';

type Row = { id: string; email: string; full_name: string | null; subscription_status: string | null; subscription_ends_at: string | null; subscription_id?: string | null };

/** Minimal in-memory stand-in for the supabase-js query chain activatePro uses. */
function fakeClient(rows: Row[]) {
  const client = {
    from: () => ({
      update(patch: Partial<Row>) {
        let cond: 'transition' | 'in' = 'in';
        let list: string[] = [];
        const filters: Array<(r: Row) => boolean> = [];
        const q = {
          or: () => { cond = 'transition'; return q; },
          in: (_c: string, vals: string[]) => { cond = 'in'; list = vals; return q; },
          eq: (_c: string, v: string) => { filters.push((r) => r.id === v); return q; },
          ilike: (_c: string, v: string) => {
            const want = v.replace(/\\(.)/g, '$1').toLowerCase();
            filters.push((r) => r.email.toLowerCase() === want);
            return q;
          },
          select: async () => {
            const hit = rows.filter((r) => {
              const s = r.subscription_status;
              const ok = cond === 'transition' ? s == null || !['active', 'trialing', 'pro'].includes(s) : list.includes(s ?? '');
              return ok && filters.every((f) => f(r));
            });
            hit.forEach((r) => Object.assign(r, patch));
            return { data: hit.map((r) => ({ id: r.id, email: r.email, full_name: r.full_name })), error: null };
          },
        };
        return q;
      },
    }),
  };
  return client as unknown as SupabaseClient;
}

const row = (over: Partial<Row> = {}): Row => ({ id: 'u1', email: 'jane@x.com', full_name: 'Jane Doe', subscription_status: 'free', subscription_ends_at: null, ...over });

describe('activatePro', () => {
  it('upgrades a free user and sends exactly one welcome email', async () => {
    const rows = [row()];
    const send = vi.fn(async () => true);
    const res = await activatePro({ email: 'jane@x.com' }, { subscriptionId: 'sub9' }, { client: fakeClient(rows), send });
    expect(res).toEqual({ matched: 1, newlyPro: 1 });
    expect(rows[0].subscription_status).toBe('active');
    expect(rows[0].subscription_id).toBe('sub9');
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ userId: 'u1', email: 'jane@x.com', fullName: 'Jane Doe' });
  });

  it.each([[null], ['cancelled'], ['past_due']])('also upgrades a user whose status is %s', async (status) => {
    const send = vi.fn(async () => true);
    const res = await activatePro({ userId: 'u1' }, {}, { client: fakeClient([row({ subscription_status: status })]), send });
    expect(res.newlyPro).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('does not email again on a renewal or repeated webhook', async () => {
    const rows = [row({ subscription_status: 'active' })];
    const send = vi.fn(async () => true);
    const res = await activatePro({ email: 'jane@x.com' }, {}, { client: fakeClient(rows), send });
    expect(res).toEqual({ matched: 1, newlyPro: 0 });
    expect(send).not.toHaveBeenCalled();
    expect(rows[0].subscription_ends_at).not.toBeNull();
  });

  it('sends one email when the webhook, return route and reconcile race', async () => {
    const rows = [row()];
    const send = vi.fn(async () => true);
    const client = fakeClient(rows);
    await Promise.all([
      activatePro({ email: 'jane@x.com' }, {}, { client, send }),
      activatePro({ userId: 'u1' }, {}, { client, send }),
      activatePro({ userId: 'u1' }, {}, { client, send }),
    ]);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('matches the email case-insensitively', async () => {
    const send = vi.fn(async () => true);
    const res = await activatePro({ email: 'JANE@X.com' }, {}, { client: fakeClient([row()]), send });
    expect(res.matched).toBe(1);
  });

  it('reports no match for an unknown email and sends nothing', async () => {
    const send = vi.fn(async () => true);
    const res = await activatePro({ email: 'nobody@x.com' }, {}, { client: fakeClient([row()]), send });
    expect(res).toEqual({ matched: 0, newlyPro: 0 });
    expect(send).not.toHaveBeenCalled();
  });

  it('keeps the upgrade when the email fails or throws', async () => {
    for (const send of [vi.fn(async () => false), vi.fn(async () => { throw new Error('resend down'); })]) {
      const rows = [row()];
      const res = await activatePro({ userId: 'u1' }, {}, { client: fakeClient(rows), send });
      expect(res.newlyPro).toBe(1);
      expect(rows[0].subscription_status).toBe('active');
    }
  });
});

describe('proWelcomeEmail', () => {
  it('greets by name, lists Pro features and links to the dashboard and help', () => {
    const { subject, html } = proWelcomeEmail('Jane', { userId: 'u1', email: 'jane@x.com' });
    expect(subject).toMatch(/Pro/);
    expect(html).toContain('You are Pro, Jane!');
    expect(html).toContain('Unlimited resumes');
    expect(html).toContain('/dashboard?');
    expect(html).toContain('/dashboard/help');
    expect(html).not.toMatch(/UAE|Dubai/i);
  });
});
