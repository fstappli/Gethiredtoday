import Link from "next/link";

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Build",
    links: [
      { label: "Find jobs", href: "/jobs" },
      { label: "Resume templates", href: "/resume-templates" },
      { label: "Cover letters", href: "/cover-letter" },
      { label: "Free ATS checker", href: "/ats-checker" },
      { label: "Auto-Apply", href: "/auto-apply" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Resume examples", href: "/resume-examples" },
      { label: "Career advice", href: "/resources" },
      { label: "Interview tips", href: "/resources?tab=interview" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact & help", href: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create free account", href: "/signup" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="w-full bg-ink text-[#E8F2EE]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-10 px-5 pb-8 pt-14">
        <div className="grid gap-8 text-[15px] [grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr))]">
          <div className="flex flex-col gap-3">
            <span className="font-display text-xl font-bold text-white">
              GetHired<span className="text-mint-bright">Today</span>
            </span>
            <span className="leading-normal text-on-dark-muted">Friendly tools that help you get hired faster.</span>
            <Link href="/signup" className="self-start rounded-xl bg-mint-bright px-4 py-3 font-extrabold text-ink no-underline">
              Start free
            </Link>
          </div>
          {COLS.map((c) => (
            <div key={c.title} className="flex flex-col gap-1">
              <b className="pb-1.5 text-white">{c.title}</b>
              {c.links.map((l) => (
                <Link key={l.href + l.label} href={l.href} className="py-1.5 text-[#C9D8D3] no-underline hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-ink-line pt-5 text-sm text-on-dark-muted">
          <span className="min-w-[200px] flex-1">© 2026 GetHiredToday</span>
          <Link href="/privacy" className="py-1 text-on-dark-muted hover:text-white">Privacy</Link>
          <Link href="/terms" className="py-1 text-on-dark-muted hover:text-white">Terms</Link>
          <Link href="/cookies" className="py-1 text-on-dark-muted hover:text-white">Cookies</Link>
          <Link href="/sitemap" className="py-1 text-on-dark-muted hover:text-white">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
