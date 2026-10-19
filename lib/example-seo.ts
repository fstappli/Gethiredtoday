import type { ResumeExample } from "@/lib/resume-examples-data";

const strip = (s: string) => s.replace(/\s*—\s*/g, ", ").replace(/\(e\.g\.,?[^)]*\)/gi, "").replace(/\s+/g, " ").trim();

/** Lower-case the first letter only for ordinary words, never for acronyms or camel-case names (RN, GitHub). */
function lowerFirst(s: string): string {
  return /^[A-Z][a-z]/.test(s) && !/^[A-Z][a-z]+[A-Z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** One liftable sentence or two, built from the example's own data so each page is unique. */
export function exampleQuickAnswer(ex: ResumeExample): string {
  const skills = list(ex.skills.slice(0, 4));
  const lead = strip(ex.tips[0] ?? "");
  return `A strong ${ex.title.toLowerCase()} resume opens with a short summary naming your specialty and one result, backs every role with measurable achievements and lists the skills employers look for, such as ${skills}. ${lead ? "Key tip: " + lead.replace(/\.$/, "") + "." : ""}`.trim();
}

export function exampleFaqs(ex: ResumeExample): { q: string; a: string }[] {
  const title = ex.title.toLowerCase();
  const must = ex.mustHave.slice(0, 3).map((m) => strip(m).replace(/\.$/, ""));
  const early = /entry|junior|graduate|intern/i.test(ex.level);
  return [
    {
      q: `What should a ${title} resume include?`,
      a: `A ${title} resume should include: ${must.map(lowerFirst).join("; ")}. Lead with a short summary and keep every bullet focused on results.`,
    },
    {
      q: `How long should a ${title} resume be?`,
      a: early
        ? `One page. For an early-career ${title} resume, a single focused page is more effective than padding to fill a second one.`
        : `One page if you have under about five years of relevant experience, and up to two pages for more senior ${title} roles. Cut anything that does not support the job you want.`,
    },
    {
      q: `Which skills should I put on a ${title} resume?`,
      a: `Common skills for a ${title} resume include ${list(ex.skills)}. List only the ones you genuinely have, and match the wording of the job description where it honestly applies.`,
    },
  ];
}
