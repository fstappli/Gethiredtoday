import type { ReactNode } from 'react';
import PortalNav from '@/components/portal/portal-nav';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive } from '@/lib/subscription';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const ssr = await createServerSupabaseClient();
  const { data: { user } } = await ssr.auth.getUser();
  const isAdmin = user?.email === ADMIN_EMAIL;

  let isPro = isAdmin;
  let name = '';
  if (user) {
    const { data: profile } = await ssr
      .from('profiles')
      .select('subscription_status, subscription_ends_at, full_name')
      .eq('id', user.id)
      .single();
    if (!isAdmin) isPro = isProActive(profile);
    name = (profile as { full_name?: string } | null)?.full_name || '';
  }
  const initial = (name || user?.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-ground-portal text-ink">
      <PortalNav isPro={isPro} isAdmin={isAdmin} initial={initial} />
      <main className="flex flex-1 flex-col pb-20 min-[761px]:pb-0">{children}</main>
    </div>
  );
}
