import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Fire welcome email for new users (non-blocking)
      const user = data?.session?.user;
      if (user?.email) {
        const isNewUser = user.created_at && (Date.now() - new Date(user.created_at).getTime()) < 60_000;
        if (isNewUser) {
          fetch(`${origin}/api/email/welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              firstName: user.user_metadata?.full_name?.split(' ')[0] ?? user.user_metadata?.name?.split(' ')[0] ?? '',
            }),
          }).catch((err) => {
            console.error('auth/callback: welcome email failed for', user.email, err);
          });
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
