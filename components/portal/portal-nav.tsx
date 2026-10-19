"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "home", label: "Home", href: "/dashboard", exact: true },
  { id: "resumes", label: "Resumes", href: "/dashboard/resumes" },
  { id: "letters", label: "Cover letters", href: "/dashboard/cover-letters" },
  { id: "jobs", label: "Find jobs", href: "/dashboard/find-jobs" },
  { id: "apps", label: "Applications", href: "/dashboard/applied-jobs" },
  { id: "auto", label: "Auto-Apply", href: "/dashboard/auto-apply" },
  { id: "ats", label: "ATS check", href: "/dashboard/ats-checker" },
];

const ICON_PROPS = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, "aria-hidden": true };

const BOTTOM = [
  { label: "Home", href: "/dashboard", exact: true, icon: <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" /> },
  { label: "Resumes", href: "/dashboard/resumes", icon: (<><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>) },
  { label: "Jobs", href: "/dashboard/find-jobs", icon: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></>) },
  { label: "Auto-Apply", href: "/dashboard/auto-apply", icon: <path d="M13 2L4 14h7l-1 8 9-12h-7z" /> },
  { label: "Account", href: "/dashboard/account", icon: (<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>) },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function PortalNav({
  isPro = false,
  isAdmin = false,
  initial = "U",
}: {
  isPro?: boolean;
  isAdmin?: boolean;
  initial?: string;
}) {
  const pathname = usePathname();
  const tabs = isAdmin ? [...TABS, { id: "admin", label: "Admin", href: "/dashboard/admin" }] : TABS;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-line bg-white text-ink">
        <nav aria-label="Portal" className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5">
          <Link href="/dashboard" className="flex items-center gap-2 no-underline" aria-label="GetHiredToday dashboard">
            <span className="font-display grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-brand text-[19px] font-extrabold text-white">G</span>
            <span className="font-display hidden text-[19px] font-bold min-[901px]:inline">
              GetHired<span className="text-brand">Today</span>
            </span>
          </Link>
          <div className="order-3 flex min-w-0 basis-full justify-start gap-0.5 overflow-x-auto min-[901px]:order-none min-[901px]:flex-1 min-[901px]:basis-0 min-[901px]:justify-center">
            {tabs.map((t) => {
              const cur = isActive(pathname, t.href, (t as { exact?: boolean }).exact);
              return (
                <Link
                  key={t.id}
                  href={t.href}
                  aria-current={cur ? "page" : undefined}
                  className={`flex-none rounded-[10px] px-3 py-2.5 text-sm font-bold no-underline ${cur ? "bg-[#DDF3EC] text-brand-dark" : "text-text-muted hover:bg-ground-portal"}`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isPro ? (
              <span className="rounded-full bg-mint-soft px-3.5 py-2.5 text-sm font-extrabold text-brand-dark">Pro</span>
            ) : (
              <Link href="/upgrade?from=nav" className="flex items-center gap-1.5 rounded-full bg-sun px-3.5 py-2.5 text-sm font-extrabold text-ink no-underline">
                Go Pro
              </Link>
            )}
            <Link href="/dashboard/account" aria-label="Account" className="grid h-[42px] w-[42px] place-items-center rounded-full bg-ink font-bold text-white no-underline">
              {initial}
            </Link>
          </div>
        </nav>
      </header>

      {/* Bottom tab bar (phones only) */}
      <nav aria-label="Portal quick links" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white px-1 pb-[max(env(safe-area-inset-bottom),10px)] pt-1.5 min-[761px]:hidden">
        {BOTTOM.map((b) => {
          const cur = isActive(pathname, b.href, b.exact);
          return (
            <Link
              key={b.href}
              href={b.href}
              aria-current={cur ? "page" : undefined}
              className={`flex min-h-[44px] flex-col items-center gap-1 py-2 text-xs no-underline ${cur ? "font-bold text-brand" : "font-semibold text-text-muted"}`}
            >
              <svg {...ICON_PROPS}>{b.icon}</svg>
              {b.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
