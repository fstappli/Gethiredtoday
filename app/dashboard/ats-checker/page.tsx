import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive } from '@/lib/subscription';
import { ProFeatureGate } from '@/components/pro-feature-gate';
import AtsCheckerView from '@/components/ats-checker-view';

const ADMIN_EMAIL = 'kreativecasaentertainment@gmail.com';

export default async function DashboardAtsCheckerPage() {
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

  if (!isPro) {
    return (
      <div className="min-h-full bg-white">
        <ProFeatureGate
          title="Full ATS Checker"
          description="Get a 30-point analysis of your resume and see exactly what to fix to pass ATS filters and get more interviews."
          features={[
            '30-point ATS compatibility score',
            'Keyword gap detection against job descriptions',
            'Formatting & structure recommendations',
            'Instant actionable fixes',
          ]}
          from="/dashboard/ats-checker"
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      <AtsCheckerView />
    </div>
  );
}
