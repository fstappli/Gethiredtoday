import Link from 'next/link';
import PortalNav from '@/components/portal/portal-nav';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { isProActive } from '@/lib/subscription';

export const metadata = { title: 'Welcome to Pro' };
export const dynamic = 'force-dynamic';

const STEPS = [
  { href: '/dashboard/find-jobs', title: 'See all your job matches', body: 'Every result scored against your resume.' },
  { href: '/dashboard/auto-apply', title: 'Turn on Auto-Apply', body: 'Takes 2 minutes. Review mode is on by default.' },
  { href: '/dashboard/ats-checker', title: 'Open your full ATS report', body: 'All 30 checks with fixes.' },
];

export default async function UpgradeSuccessPage() {
  const ssr = await createServerSupabaseClient();
  const { data: { user } } = await ssr.auth.getUser();
  let isPro = false;
  let name = '';
  if (user) {
    const { data: p } = await ssr.from('profiles').select('subscription_status, subscription_ends_at, full_name').eq('id', user.id).single();
    isPro = isProActive(p);
    name = ((p?.full_name as string | null) || '').trim().split(/\s+/)[0] ?? '';
  }
  const initial = (name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-ground-portal text-ink">
      <PortalNav isPro={isPro} initial={initial} />
      <main role="status" className="mx-auto flex max-w-[760px] flex-col items-center gap-[22px] px-5 py-14 text-center">
        <span className="grid h-[84px] w-[84px] place-items-center rounded-[26px] bg-sun">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0D1B19" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
        </span>
        <h1 className="font-display m-0 text-[36px] leading-[1.04] tracking-[-1.4px] min-[761px]:text-[46px]">
          {isPro ? `Welcome to Pro${name ? `, ${name}` : ''}!` : 'Thanks! We are confirming your payment'}
        </h1>
        <p className="m-0 text-lg leading-[1.55] text-text-muted">
          {isPro ? 'Everything is unlocked. Here is the fastest way to put it to work.' : 'This usually takes under a minute. Refresh this page if Pro is not showing yet.'}
        </p>
        <ol className="m-0 flex w-full list-none flex-col gap-2.5 p-0 text-left">
          {STEPS.map((s, i) => (
            <li key={s.href}>
              <Link href={s.href} className="flex items-center gap-3.5 rounded-[18px] border border-line bg-white p-[18px] text-ink no-underline">
                <span className="font-display grid h-10 w-10 flex-none place-items-center rounded-xl bg-ink font-extrabold text-white">{i + 1}</span>
                <span className="flex-1"><b>{s.title}</b><br /><span className="text-sm text-text-muted">{s.body}</span></span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
        <span className="text-sm text-text-muted">A receipt is on its way to your inbox.</span>
      </main>
    </div>
  );
}
