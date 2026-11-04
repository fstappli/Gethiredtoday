import { createHmac, timingSafeEqual } from 'crypto';

function secret(): string {
  return process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

/** Token that proves an unsubscribe link was issued by us (so nobody can unsubscribe someone else by guessing an email). */
export function unsubscribeToken(subject: { uid?: string; email?: string }): string {
  const key = subject.uid ? `uid:${subject.uid}` : `email:${(subject.email ?? '').toLowerCase()}`;
  return createHmac('sha256', secret()).update(key).digest('hex').slice(0, 32);
}

export function verifyUnsubscribeToken(subject: { uid?: string; email?: string }, token: string | undefined): boolean {
  if (!token || !secret() || (!subject.uid && !subject.email)) return false;
  const a = Buffer.from(unsubscribeToken(subject));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
