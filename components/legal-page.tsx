import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const DOCS = [
  { id: "privacy", label: "Privacy policy", href: "/privacy" },
  { id: "terms", label: "Terms of service", href: "/terms" },
  { id: "cookies", label: "Cookie policy", href: "/cookies" },
] as const;

export type LegalDoc = (typeof DOCS)[number]["id"];

/** One template for /privacy, /terms and /cookies. Pass the legal copy as children. */
export default function LegalPage({
  doc,
  title,
  updated,
  summary,
  children,
}: {
  doc: LegalDoc;
  title: string;
  updated: string;
  summary?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-start gap-10 px-5 pb-[72px] pt-12">
          <nav aria-label="Legal" className="flex max-w-[240px] flex-[1_1_200px] flex-col gap-1">
            {DOCS.map((d) => {
              const cur = d.id === doc;
              return (
                <Link
                  key={d.id}
                  href={d.href}
                  aria-current={cur ? "page" : undefined}
                  className={`flex min-h-[44px] items-center rounded-[10px] px-3.5 font-bold no-underline ${cur ? "bg-mint-soft text-brand-dark" : "text-text-muted hover:bg-white"}`}
                >
                  {d.label}
                </Link>
              );
            })}
          </nav>
          <article className="flex min-w-0 flex-[999_1_520px] flex-col gap-3.5 rounded-3xl border border-line bg-white p-6 text-[17px] leading-[1.7] min-[761px]:p-9">
            <h1 className="font-display m-0 text-4xl font-bold leading-[1.05] tracking-[-1.2px] min-[761px]:text-[42px]">{title}</h1>
            <span className="text-[15px] text-text-muted">Last updated {updated}</span>
            {summary && (
              <div className="rounded-[14px] bg-mint-soft px-[18px] py-4">
                <b>The short version</b>
                <p className="mb-0 mt-1">{summary}</p>
              </div>
            )}
            <div className="flex flex-col gap-3.5 text-text-muted [&_a]:font-semibold [&_a]:text-brand [&_h2]:font-display [&_h2]:mb-0 [&_h2]:mt-2.5 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:mb-1 [&_p]:m-0 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5">
              {children}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
