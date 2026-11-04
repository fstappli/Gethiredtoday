import { timingSafeEqual } from 'crypto';

/** Vercel Cron sends "Authorization: Bearer $CRON_SECRET". Fails closed when the secret is not configured. */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get('authorization') ?? '');
  const want = Buffer.from(`Bearer ${secret}`);
  return given.length === want.length && timingSafeEqual(given, want);
}
