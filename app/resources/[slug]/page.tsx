import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { BLOG_POSTS, getPostBySlug } from "@/lib/blog-posts";
import { TOPICS, clean, formatDate, topicOf } from "@/lib/resources";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `https://hiredtodayapp.com/resources/${post.slug}`;
  return {
    title: clean(post.title),
    description: clean(post.description),
    alternates: { canonical: url },
    openGraph: { title: clean(post.title), description: clean(post.description), type: "article", publishedTime: post.date, url },
  };
}

/** Adds ids to <h2> so the "On this page" list can link to them. */
function withAnchors(html: string) {
  const toc: { id: string; text: string }[] = [];
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_m, inner: string) => {
    const id = `s${toc.length + 1}`;
    toc.push({ id, text: inner.replace(/<[^>]+>/g, "") });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { html, toc } = withAnchors(clean(post.content));
  const topic = TOPICS.find((t) => t.id === topicOf(post))!;
  const date = post.date ? formatDate(post.date) : "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: clean(post.title),
    description: clean(post.description),
    datePublished: post.date,
    author: { "@type": "Organization", name: "GetHiredToday" },
    publisher: { "@type": "Organization", name: "GetHiredToday" },
    mainEntityOfPage: `https://hiredtodayapp.com/resources/${post.slug}`,
  };

  return (
    <div className="flex min-h-screen flex-col bg-ground-site text-ink">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="flex-1">
        <header className="mx-auto flex max-w-[820px] flex-col gap-3.5 px-5 pb-6 pt-12">
          <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-text-muted">
            <Link href="/resources" className="font-semibold text-brand">Career advice</Link>
            <span aria-hidden="true">/</span>
            <span>{topic.label}</span>
          </nav>
          <h1 className="font-display m-0 text-4xl font-bold leading-[1.04] tracking-[-1.5px] min-[761px]:text-5xl">{clean(post.title)}</h1>
          <div className="flex items-center gap-3 text-[15px] text-text-muted">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-mint-soft font-extrabold text-brand-dark">GT</span>
            <span>GetHiredToday Editorial · {date} · {post.readTime}</span>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1100px] flex-wrap items-start gap-10 px-5 pb-14 pt-2">
          {toc.length > 0 && (
            <aside className="flex min-w-0 max-w-[260px] flex-[1_1_220px] flex-col gap-1.5 text-[15px]">
              <b className="mb-1">On this page</b>
              {toc.map((t) => (
                <a key={t.id} href={`#${t.id}`} className="py-1.5 font-semibold text-brand no-underline hover:text-brand-dark">{t.text}</a>
              ))}
            </aside>
          )}
          <article
            className="min-w-0 flex-[999_1_520px] text-lg leading-[1.7] [&_a]:font-semibold [&_a]:text-brand [&_blockquote]:m-0 [&_blockquote]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:bg-mint-soft [&_blockquote]:p-4 [&_h2]:font-display [&_h2]:mb-0 [&_h2]:mt-8 [&_h2]:text-[30px] [&_h2]:font-bold [&_h2]:leading-[1.15] [&_h3]:font-display [&_h3]:mt-6 [&_h3]:text-[22px] [&_h3]:font-bold [&_li]:mb-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <section className="px-5 pb-[72px]">
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-5 rounded-[28px] bg-ink p-7 text-white min-[761px]:px-7 min-[761px]:py-11">
            <div className="flex-[1_1_360px]">
              <b className="font-display text-2xl leading-[1.1]">Which keywords are you missing?</b>
              <p className="mb-0 mt-2 text-on-dark-muted">Paste a job ad and see in seconds. Free, no sign-up.</p>
            </div>
            <Link href="/ats-checker" className="rounded-[14px] bg-mint-bright px-6 py-[17px] font-extrabold text-ink no-underline">Check my resume</Link>
          </div>
        </section>
        <section className="px-5 pb-[72px]">
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-5 rounded-[28px] bg-brand p-7 text-white min-[761px]:px-7 min-[761px]:py-11">
            <div className="flex-[1_1_360px]">
              <b className="font-display text-[28px] leading-[1.1] min-[761px]:text-[32px]">Every GetHiredToday template follows these rules.</b>
              <p className="mb-0 mt-2 text-[#CFEDE4]">Build yours free and see your score update as you type.</p>
            </div>
            <Link href="/signup" className="rounded-[14px] bg-sun px-6 py-[17px] font-extrabold text-ink no-underline">Build my resume free</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
