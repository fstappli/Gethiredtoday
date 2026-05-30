import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { monthFromNow } from '@/lib/subscription';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

async function assertAdmin() {
  const ssr = await createServerSupabaseClient();
  const { data: { user } } = await ssr.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

// GET /api/admin/users?search=...
export async function GET(req: NextRequest) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const search = req.nextUrl.searchParams.get('search')?.trim() ?? '';
  const admin = createAdminSupabaseClient();

  let query = admin
    .from('profiles')
    .select('id, full_name, email, subscription_status, subscription_ends_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

// POST /api/admin/users — create a user manually
export async function POST(req: NextRequest) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { email, full_name, subscription_status } = await req.json();
  if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 });

  const admin = createAdminSupabaseClient();

  // Create the auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: full_name || '' },
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const userId = authData.user.id;

  // Upsert profile
  const profileData: Record<string, unknown> = {
    id: userId,
    email,
    full_name: full_name || '',
    subscription_status: subscription_status || 'free',
  };
  if (subscription_status && subscription_status !== 'free') {
    profileData.subscription_ends_at = monthFromNow();
  }

  const { error: profileError } = await admin.from('profiles').upsert(profileData);
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({ success: true, userId }, { status: 201 });
}
