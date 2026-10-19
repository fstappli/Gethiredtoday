import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WeeklyTipsForm from "@/components/weekly-tips-form";
import { TOPICS, clean, minutes, normalizeTopic, sortedPosts, topicOf } from "@/lib/resources";

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const topic = normalizeTopic(tab);
  const all = sortedPosts();
  const posts = topic === "all" ? all : all.filter((p) => topicOf(p) === topic);
  const featured = posts[0];
  const rest = posts.slice(1);
  const tagOf = (p: (typeof all)[number]) => TOPICS.find((t) => t.id === topicOf(p))!;

  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 pb-5 pt-14">
          <h1 className="font-display m-0 text-[40px] font-bold leading-[1.02] tracking-[-1.8px] min-[761px]:text-[56px]">Career advice that&apos;s actually useful.</h1>
          <p className="m-0 max-w-[620px] text-lg leading-normal text-text-muted">Short, practical guides on resumes, interviews and job search.</p>
          <nav aria-label="Topics" className="flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const sel = t.id === topic;
              return (
                <Link
                  key={t.id}
                  href={t.id === "all" ? "/resources" : `/resources?tab=${t.id}`}
                  aria-current={sel ? "page" : undefined}
                  className={`flex min-h-[44px] items-center rounded-full border-[1.5px] px-[18px] text-[15px] font-bold no-underline ${sel ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink"}`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </section>

        {!featured && (
          <section className="mx-auto max-w-[1240px] px-5 py-10">
            <p className="m-0 rounded-[20px] border border-line bg-white p-8 text-text-muted">No guides in this topic yet. <Link href="/resources" className="font-bold text-brand">See all guides</Link></p>
          </section>
        )}

        {featured && (
          <section className="mx-auto max-w-[1240px] px-5 pb-8 pt-4">
            <Link href={`/resources/${featured.slug}`} className="grid overflow-hidden rounded-3xl border border-line bg-white text-ink no-underline [grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr))]">
              <div className="flex min-h-[260px] items-end bg-brand p-7">
                <span className="font-display text-[88px] font-extrabold leading-[0.9] text-white opacity-90">{tagOf(featured).label === "All" ? "" : tagOf(featured).tag.slice(0, 3)}</span>
              </div>
              <div className="flex flex-col justify-center gap-3 p-8">
                <span className="text-[13px] font-extrabold tracking-[0.8px] text-brand">{tagOf(featured).tag} · {minutes(featured)} MIN READ</span>
                <b className="font-display text-[32px] leading-[1.1]">{clean(featured.title)}</b>
                <span className="leading-[1.55] text-text-muted">{clean(featured.description)}</span>
                <span className="font-extrabold text-brand">Read the guide →</span>
              </div>
            </Link>
          </section>
        )}

        {rest.length > 0 && (
          <section className="mx-auto grid max-w-[1240px] gap-[18px] px-5 pb-14 pt-2 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
            {rest.map((p) => {
              const t = tagOf(p);
              return (
                <Link key={p.slug} href={`/resources/${p.slug}`} className="flex flex-col gap-2.5 rounded-[20px] border border-line bg-white p-[22px] text-ink no-underline">
                  <span className="text-xs font-extrabold tracking-[0.8px]" style={{ color: t.color }}>{t.tag} · {minutes(p)} MIN</span>
                  <b className="font-display text-[21px] leading-[1.2]">{clean(p.title)}</b>
                  <span className="text-[15px] leading-normal text-text-muted">{clean(p.description)}</span>
                </Link>
              );
            })}
          </section>
        )}

        <section className="px-5 pb-[72px]">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-5 rounded-3xl bg-sun-soft p-8">
            <div className="flex-[1_1_320px]">
              <b className="font-display text-[26px]">One helpful email a week</b>
              <p className="mb-0 mt-1.5 text-text-muted">Resume tips, interview prep and new templates. Unsubscribe any time.</p>
            </div>
            <WeeklyTipsForm />
          </div>
        </section>
        <section aria-labelledby="more-heading" className="mx-auto max-w-[1100px] px-5 pb-14">
          <h2 id="more-heading" className="font-display m-0 mb-3 text-[26px] font-bold">More to explore</h2>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/cover-letter-examples" className="flex min-h-[44px] items-center rounded-xl border border-line bg-white px-4 font-bold text-ink no-underline hover:border-ink">Cover letter examples by role</Link>
            <Link href="/resume-examples" className="flex min-h-[44px] items-center rounded-xl border border-line bg-white px-4 font-bold text-ink no-underline hover:border-ink">Resume examples</Link>
            <Link href="/ats-checker" className="flex min-h-[44px] items-center rounded-xl border border-line bg-white px-4 font-bold text-ink no-underline hover:border-ink">Free ATS checker</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
