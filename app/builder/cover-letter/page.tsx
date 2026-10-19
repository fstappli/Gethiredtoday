import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isProActive } from "@/lib/subscription";
import { upgradeHref } from "@/lib/upgrade-triggers";

const TEMPLATES = [
  { id: "professional", name: "Professional", description: "Clean, traditional format for corporate roles and established industries.", tags: ["Corporate", "Finance", "Legal"], pro: false },
  { id: "modern", name: "Modern", description: "Contemporary layout suited to tech and creative fields.", tags: ["Tech", "Startups", "Design"], pro: true },
  { id: "executive", name: "Executive", description: "Polished template for senior and leadership positions.", tags: ["Director", "VP", "C-suite"], pro: true },
  { id: "creative", name: "Creative", description: "Expressive format for marketing, media and the arts.", tags: ["Marketing", "Media", "Arts"], pro: true },
  { id: "simple", name: "Simple", description: "Minimal and clean, so your content does the talking.", tags: ["Any industry", "Entry level"], pro: true },
  { id: "academic", name: "Academic", description: "Structured format for research, academic roles and grants.", tags: ["Research", "Academia", "PhD"], pro: true },
];

export default async function CoverLetterStartPage() {
  let isPro = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_ends_at")
        .eq("id", user.id)
        .single();
      isPro = isProActive(profile);
    }
  } catch { /* treat as free */ }

  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-5 pb-20 pt-12">
        <h1 className="font-display m-0 text-4xl font-extrabold tracking-[-1px] min-[761px]:text-[52px]">Write a cover letter that gets read</h1>
        <p className="mt-3 max-w-[620px] text-lg leading-relaxed text-text-muted">
          Pick a template and let AI draft a letter for the job you are targeting. Writing and previewing are free.
        </p>
        <Link href="/builder/cover-letter/new?template=professional" className="mt-6 inline-flex min-h-[48px] items-center rounded-xl bg-brand px-5 font-extrabold text-white no-underline hover:bg-brand-dark">
          Start from scratch
        </Link>

        <h2 className="font-display mb-4 mt-12 text-[28px]">Choose a template</h2>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]">
          {TEMPLATES.map((t) => {
            const locked = t.pro && !isPro;
            return (
              <Link
                key={t.id}
                href={locked ? upgradeHref("templates") : `/builder/cover-letter/new?template=${t.id}`}
                className="relative flex flex-col gap-3 rounded-[20px] border border-line bg-white p-6 text-ink no-underline hover:border-brand"
              >
                <span className={`absolute right-4 top-4 rounded-full px-2.5 py-1 text-xs font-extrabold ${t.pro ? "bg-sun-soft text-warning-ink" : "bg-mint-soft text-brand-dark"}`}>
                  {t.pro ? "PRO" : "Free"}
                </span>
                <b className="font-display text-xl">{t.name}</b>
                <span className="leading-normal text-text-muted">{t.description}</span>
                <span className="flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-ground-portal px-2.5 py-1 text-xs text-text-muted">{tag}</span>
                  ))}
                </span>
                <span className="mt-auto font-bold text-brand">{locked ? "Unlock with Pro" : "Use this template"}</span>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
