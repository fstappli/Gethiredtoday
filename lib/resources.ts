import { BLOG_POSTS, type BlogPost } from "@/lib/blog-posts";

export type TopicId = "all" | "resume" | "interview" | "job-search";

export const TOPICS: { id: TopicId; label: string; tag: string; color: string }[] = [
  { id: "all", label: "All", tag: "", color: "#0B6E5F" },
  { id: "resume", label: "Resume writing", tag: "RESUME", color: "#0B6E5F" },
  { id: "interview", label: "Interview tips", tag: "INTERVIEW", color: "#4B3BA8" },
  { id: "job-search", label: "Job search", tag: "JOB SEARCH", color: "#8A3B12" },
];

/** Old and new ?tab= values all keep working. */
export function normalizeTopic(tab?: string | null): TopicId {
  switch ((tab || "").toLowerCase()) {
    case "resume":
    case "resume-writing":
    case "cover-letters":
      return "resume";
    case "interview":
    case "interview-prep":
      return "interview";
    case "job-search":
      return "job-search";
    default:
      return "all";
  }
}

export function topicOf(post: BlogPost): Exclude<TopicId, "all"> {
  const c = post.category.toLowerCase();
  if (c.includes("interview")) return "interview";
  if (c.includes("job search")) return "job-search";
  return "resume";
}

/** UI copy must not contain em dashes. */
export function clean(s: string): string {
  return s.replace(/\s+—\s+/g, ", ").replace(/—/g, "-");
}

export function minutes(post: BlogPost): number {
  return parseInt(post.readTime, 10) || 5;
}

export function sortedPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(d: string): string {
  const t = new Date(d);
  if (isNaN(t.getTime())) return "";
  return t.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
