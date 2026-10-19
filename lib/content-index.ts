import { BLOG_POSTS } from "@/lib/blog-posts";
import { RESUME_EXAMPLES } from "@/lib/resume-examples-data";
import { COVER_LETTER_EXAMPLES } from "@/lib/cover-letter-examples";
import { topicOf } from "@/lib/resources";

export type ContentType = "guide" | "resume-example" | "cover-letter-example" | "hub";

export interface ContentUrl {
  /** Path only, starting with "/". Prefix with SITE_URL via absoluteUrl(). */
  path: string;
  title: string;
  type: ContentType;
  /** One-line summary for llms.txt. */
  summary: string;
  /** ISO date (YYYY-MM-DD) when known. */
  lastModified?: string;
  /** Guide topic, only for guides. */
  topic?: "resume" | "interview" | "job-search";
}

/** Every content URL (guides, resume examples, cover letter examples) for the sitemap and llms.txt. */
export function getContentUrls(): ContentUrl[] {
  const hubs: ContentUrl[] = [
    { path: "/resources", title: "Career advice", type: "hub", summary: "Guides on resumes, cover letters, interviews and job search." },
    { path: "/resume-examples", title: "Resume examples", type: "hub", summary: "Role-specific resume examples you can copy and edit." },
    { path: "/cover-letter-examples", title: "Cover letter examples by role", type: "hub", summary: "Editable cover letter templates for common roles." },
  ];
  const guides: ContentUrl[] = BLOG_POSTS.map((p) => ({
    path: `/resources/${p.slug}`,
    title: p.title,
    type: "guide" as const,
    summary: p.quickAnswer ?? p.description,
    lastModified: p.date,
    topic: topicOf(p),
  }));
  const examples: ContentUrl[] = RESUME_EXAMPLES.map((e) => ({
    path: `/resume-examples/${e.slug}`,
    title: `${e.title} resume example`,
    type: "resume-example" as const,
    summary: e.metaDescription,
  }));
  const letters: ContentUrl[] = COVER_LETTER_EXAMPLES.map((c) => ({
    path: `/cover-letter-examples/${c.slug}`,
    title: `${c.title} cover letter example`,
    type: "cover-letter-example" as const,
    summary: c.quickAnswer,
  }));
  return [...hubs, ...guides, ...examples, ...letters];
}
