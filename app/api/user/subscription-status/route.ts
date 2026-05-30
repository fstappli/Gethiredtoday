import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive } from '@/lib/subscription';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ isPro: false, accountCreatedAt: null }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_ends_at, created_at')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      isPro: isProActive(profile),
      accountCreatedAt: profile?.created_at ?? null,
    });
  } catch {
    return NextResponse.json({ isPro: false, accountCreatedAt: null }, { status: 500 });
  }
}
