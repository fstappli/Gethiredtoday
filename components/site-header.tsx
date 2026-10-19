"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";

const LINKS = [
  { label: "Find jobs", href: "/jobs" },
  { label: "Templates", href: "/resume-templates" },
  { label: "Examples", href: "/resume-examples" },
  { label: "ATS checker", href: "/ats-checker" },
  { label: "Cover letters", href: "/cover-letter" },
  { label: "Auto-Apply", href: "/auto-apply" },
  { label: "Pricing", href: "/pricing" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setAuthed(!!user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="w-full border-b border-line bg-ground-site text-ink">
      <nav aria-label="Main" className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2 px-4 py-3">
        <Logo size="md" />
        <div className="hidden min-w-0 flex-1 justify-center gap-0.5 overflow-x-auto min-[821px]:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex-none px-[11px] py-2.5 text-[15px] font-semibold no-underline hover:text-brand ${active ? "text-brand" : "text-text-muted"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-1">
          {authed ? (
            <Link href="/dashboard" className="rounded-xl bg-brand px-[18px] py-3 text-[15px] font-bold text-white no-underline hover:bg-brand-dark">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-2 py-3 text-[15px] font-bold text-ink no-underline min-[821px]:px-3.5">
                Log in
              </Link>
              <Link href="/signup" className="rounded-xl bg-brand px-3 py-3 text-[15px] font-bold text-white no-underline hover:bg-brand-dark min-[821px]:px-[18px]">
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
