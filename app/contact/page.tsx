"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactForm from "@/components/contact-form";

const HELP = [
  { t: "Billing or cancelling", d: "Manage your plan yourself in two clicks", href: "/dashboard/billing" },
  { t: "What's free and what's Pro", d: "Compare plans", href: "/pricing" },
  { t: "How Auto-Apply works", d: "Review mode, limits and safety", href: "/auto-apply" },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto flex max-w-[1240px] flex-wrap items-start gap-10 px-5 pb-[72px] pt-14">
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-[18px]">
            <h1 className="font-display m-0 text-[40px] font-bold leading-[1.02] tracking-[-1.7px] min-[761px]:text-[54px]">Hi there. How can we help?</h1>
            <p className="m-0 text-lg leading-[1.55] text-text-muted">A real person reads every message.</p>
            <div className="flex flex-col gap-2.5">
              {HELP.map((h) => (
                <Link key={h.href} href={h.href} className="flex items-center justify-between rounded-2xl border border-line bg-white px-[18px] py-4 text-ink no-underline">
                  <span><b>{h.t}</b><br /><span className="text-sm text-text-muted">{h.d}</span></span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>

          <ContactForm source="public" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
