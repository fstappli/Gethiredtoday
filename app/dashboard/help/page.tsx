import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/contact-form';

export const metadata: Metadata = { title: 'Help', robots: { index: false } };

const HELP = [
  { t: 'Billing or cancelling', d: 'Manage your plan in two clicks', href: '/dashboard/billing' },
  { t: "Paid but still on Free?", d: 'Open the dashboard again, or message us below and we will fix it fast', href: '/dashboard' },
  { t: 'How Auto-Apply works', d: 'Review mode, limits and safety', href: '/auto-apply' },
];

export default function HelpPage() {
  return (
    <section className="mx-auto flex w-full max-w-[1100px] flex-wrap items-start gap-10 px-5 py-10">
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-[18px]">
        <h1 className="font-display m-0 text-[34px] font-bold leading-[1.05] tracking-[-1px]">Help and contact</h1>
        <p className="m-0 text-base leading-[1.55] text-text-muted">Something not working, or a payment that did not go through? Tell us and a real person will reply.</p>
        <div className="flex flex-col gap-2.5">
          {HELP.map((h) => (
            <Link key={h.t} href={h.href} className="flex items-center justify-between rounded-2xl border border-line bg-white px-[18px] py-4 text-ink no-underline">
              <span><b>{h.t}</b><br /><span className="text-sm text-text-muted">{h.d}</span></span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
      <ContactForm source="dashboard" />
    </section>
  );
}
