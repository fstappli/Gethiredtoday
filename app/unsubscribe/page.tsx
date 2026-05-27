import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ email?: string; uid?: string }>;

async function markUnsubscribed(params: { email?: string; uid?: string }): Promise<'success' | 'error' | 'missing'> {
  const { email, uid } = params;
  if (!email && !uid) return 'missing';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return 'error';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const query = supabase.from('profiles').update({ unsubscribed_at: new Date().toISOString() });
  const { error } = uid
    ? await query.eq('id', uid)
    : await query.eq('email', email ?? '');

  return error ? 'error' : 'success';
}

export default async function UnsubscribePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = await markUnsubscribed(params);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--teal-50)] to-white px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">You&apos;ve been unsubscribed</h1>
            <p className="text-gray-500 mb-6">
              Sorry to see you go. Your account is still active — you just won&apos;t get any more emails from us.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-500 mb-6">
              Please email <a href="mailto:hello@hiredtodayapp.com" className="text-teal underline">hello@hiredtodayapp.com</a> and we&apos;ll remove you manually.
            </p>
          </>
        )}

        {status === 'missing' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Unsubscribe</h1>
            <p className="text-gray-500 mb-6">
              We couldn&apos;t find the email to unsubscribe. Please use the unsubscribe link in the email you received, or email <a href="mailto:hello@hiredtodayapp.com" className="text-teal underline">hello@hiredtodayapp.com</a>.
            </p>
          </>
        )}

        <Link href="/" className="inline-block text-sm text-teal hover:underline font-semibold">
          ← Back to GetHiredToday
        </Link>
      </div>
    </main>
  );
}
