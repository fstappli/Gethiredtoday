import type { ReactNode } from 'react';
import DashboardSidebar from './sidebar';
import DashboardHeader from './header';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive } from '@/lib/subscription';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const ssr = await createServerSupabaseClient();
  const { data: { user } } = await ssr.auth.getUser();
  const isAdmin = user?.email === ADMIN_EMAIL;

  let isPro = isAdmin;
  if (!isAdmin && user) {
    const { data: profile } = await ssr
      .from('profiles')
      .select('subscription_status, subscription_ends_at')
      .eq('id', user.id)
      .single();
    isPro = isProActive(profile);
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-white">
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex lg:flex-col lg:shrink-0">
        <DashboardSidebar isAdmin={isAdmin} isPro={isPro} />
      </div>

      {/* Right column: header + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader isPro={isPro} />
        <main className="flex-1 overflow-y-auto bg-white flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
