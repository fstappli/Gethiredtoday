import type { ReactNode } from 'react';
import DashboardSidebar from './sidebar';
import DashboardHeader from './header';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const ssr = await createServerSupabaseClient();
  const { data: { user } } = await ssr.auth.getUser();
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex lg:flex-col lg:shrink-0">
        <DashboardSidebar isAdmin={isAdmin} />
      </div>

      {/* Right column: header + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
