"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ResumeThumb from "@/components/resume-thumb";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { Chip } from "@/components/gh-ui";

type Category = "All" | "Professional" | "Modern" | "Creative" | "Simple" | "Executive" | "Academic" | "Tech";
type LayoutType =
  | "classic" | "sidebar" | "executive" | "minimal" | "creative" | "centered"
  | "bold-header" | "split-right" | "timeline" | "mono"
  | "photo-card" | "compact" | "serif" | "split-accent";

const categories: Category[] = ["All","Professional","Modern","Creative","Simple","Executive","Academic","Tech"];

interface Template {
  id: number;
  templateId: string;
  name: string;
  category: Exclude<Category, "All">;
  accent: string;
  bg: string;
  layout: LayoutType;
  pro: boolean;
  description: string;
}

export const templates: Template[] = [
  { id: 1,  templateId: "classic",      name: "Classic Professional", category: "Professional", accent: "#4AB7A6", bg: "#f0fdf9", layout: "classic",      pro: false, description: "Clean, ATS-friendly single-column" },
  { id: 2,  templateId: "modern",       name: "Modern Sidebar",       category: "Modern",       accent: "#1e293b", bg: "#f8fafc", layout: "sidebar",      pro: false, description: "Two-column with dark sidebar" },
  { id: 3,  templateId: "executive",    name: "Executive Bold",       category: "Executive",    accent: "#0f172a", bg: "#f8fafc", layout: "executive",    pro: true,  description: "Authoritative dark header" },
  { id: 4,  templateId: "creative",     name: "Creative Spectrum",    category: "Creative",     accent: "#7c3aed", bg: "#faf5ff", layout: "creative",     pro: true,  description: "Side-column with photo" },
  { id: 5,  templateId: "minimal",      name: "Academic Harvard",     category: "Academic",     accent: "#1d4ed8", bg: "#eff6ff", layout: "minimal",      pro: false, description: "Traditional centered header" },
  { id: 6,  templateId: "classic",      name: "Contemporary Teal",    category: "Professional", accent: "#0d9488", bg: "#f0fdfa", layout: "classic",      pro: false, description: "Fresh teal accent line" },
  { id: 7,  templateId: "modern",       name: "Tech Engineer",        category: "Modern",       accent: "#4338ca", bg: "#eef2ff", layout: "sidebar",      pro: false, description: "Indigo sidebar for tech roles" },
  { id: 8,  templateId: "classic",      name: "Healthcare Pro",       category: "Professional", accent: "#059669", bg: "#ecfdf5", layout: "classic",      pro: false, description: "Clean green accents" },
  { id: 9,  templateId: "executive",    name: "Sales Star",           category: "Professional", accent: "#ea580c", bg: "#fff7ed", layout: "executive",    pro: false, description: "Bold orange impact header" },
  { id: 10, templateId: "simple",       name: "Graduate Fresh",       category: "Simple",       accent: "#0891b2", bg: "#ecfeff", layout: "centered",     pro: false, description: "Simple centered design" },
  { id: 11, templateId: "creative",     name: "Creative Bold",        category: "Creative",     accent: "#e11d48", bg: "#fff1f2", layout: "creative",     pro: true,  description: "Vibrant rose side-column" },
  { id: 12, templateId: "executive",    name: "Corporate Elite",      category: "Executive",    accent: "#1f2937", bg: "#f9fafb", layout: "executive",    pro: true,  description: "Prestige dark header" },

  // ── 8 new pro templates ─────────────────────────────────────────────────
  { id: 25, templateId: "bold-header",  name: "Bold Impact",          category: "Executive",    accent: "#4AB7A6", bg: "#f0fdfa", layout: "bold-header",  pro: true,  description: "Dark hero band with accent bar" },
  { id: 26, templateId: "split-right",  name: "Corporate Right",      category: "Professional", accent: "#1d4ed8", bg: "#eff6ff", layout: "split-right",  pro: true,  description: "Clean right-sidebar layout" },
  { id: 27, templateId: "timeline",     name: "Journey Timeline",     category: "Modern",       accent: "#7c3aed", bg: "#faf5ff", layout: "timeline",     pro: true,  description: "Vertical career timeline" },
  { id: 28, templateId: "mono",         name: "Engineer Console",     category: "Tech",         accent: "#0d9488", bg: "#ecfdf5", layout: "mono",         pro: true,  description: "Monospace, code-inspired" },
  { id: 29, templateId: "photo-card",   name: "Portfolio Card",       category: "Creative",     accent: "#2563eb", bg: "#eff6ff", layout: "photo-card",   pro: true,  description: "Gradient avatar card header" },
  { id: 30, templateId: "compact",      name: "Compact ATS",          category: "Professional", accent: "#475569", bg: "#f8fafc", layout: "compact",      pro: true,  description: "Ultra-dense, ATS-optimized" },
  { id: 31, templateId: "serif",        name: "Elegant Serif",        category: "Academic",     accent: "#9f1239", bg: "#fff1f2", layout: "serif",        pro: true,  description: "Refined serif typography" },
  { id: 32, templateId: "split-accent", name: "Aurora Split",         category: "Creative",     accent: "#7c3aed", bg: "#f5f3ff", layout: "split-accent", pro: true,  description: "Gradient accent with floating card" },

  // Existing remaining free/pro
  { id: 13, templateId: "modern",       name: "Marketing Master",     category: "Professional", accent: "#db2777", bg: "#fdf2f8", layout: "sidebar",      pro: false, description: "Pink sidebar for creatives" },
  { id: 14, templateId: "classic",      name: "Finance Pro",          category: "Executive",    accent: "#1e3a8a", bg: "#eff6ff", layout: "classic",      pro: true,  description: "Navy precision lines" },
  { id: 15, templateId: "minimal",      name: "Teacher Edition",      category: "Simple",       accent: "#d97706", bg: "#fffbeb", layout: "minimal",      pro: false, description: "Warm amber minimal style" },
  { id: 16, templateId: "classic",      name: "Legal Professional",   category: "Executive",    accent: "#334155", bg: "#f8fafc", layout: "classic",      pro: true,  description: "Slate formal structure" },
  { id: 17, templateId: "modern",       name: "Startup Founder",      category: "Modern",       accent: "#7c3aed", bg: "#faf5ff", layout: "sidebar",      pro: true,  description: "Purple modern sidebar" },
  { id: 18, templateId: "modern",       name: "Data Scientist",       category: "Tech",         accent: "#0891b2", bg: "#ecfeff", layout: "sidebar",      pro: false, description: "Cyan analytical layout" },
  { id: 19, templateId: "executive",    name: "Project Manager",      category: "Professional", accent: "#0f766e", bg: "#f0fdfa", layout: "executive",    pro: false, description: "Teal executive presence" },
  { id: 20, templateId: "simple",       name: "HR Specialist",        category: "Simple",       accent: "#ec4899", bg: "#fdf2f8", layout: "centered",     pro: false, description: "Soft pink centered style" },
  { id: 21, templateId: "classic",      name: "Consulting Pro",       category: "Executive",    accent: "#374151", bg: "#f9fafb", layout: "classic",      pro: true,  description: "Grey elite consulting" },
  { id: 22, templateId: "classic",      name: "Nurse Practitioner",   category: "Professional", accent: "#10b981", bg: "#ecfdf5", layout: "classic",      pro: false, description: "Emerald healthcare clean" },
  { id: 23, templateId: "creative",     name: "Designer Portfolio",   category: "Creative",     accent: "#6d28d9", bg: "#f5f3ff", layout: "creative",     pro: true,  description: "Violet creative sidebar" },
  { id: 24, templateId: "modern",       name: "Real Estate Agent",    category: "Professional", accent: "#c2410c", bg: "#fff7ed", layout: "sidebar",      pro: false, description: "Orange warm sidebar" },
];


export default function TemplatesView() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [creatingTemplate, setCreatingTemplate] = useState<number | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setAuthed(false); return; }
    createClient().auth.getUser().then(({ data: { user } }) => setAuthed(!!user));
  }, []);

  // Logged in: create a resume with this template and open the builder.
  // Logged out: go to sign-up, which continues to the builder with the template preselected.
  const handleUseTemplate = async (t: Template) => {
    if (!authed) {
      router.push(`/signup?template=${encodeURIComponent(t.templateId)}`);
      return;
    }
    setCreatingTemplate(t.id);
    try {
      const { getTemplateStarterData } = await import("@/lib/example-to-resume");
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${t.name} Resume`,
          template_id: t.templateId,
          data: getTemplateStarterData(),
        }),
      });
      if (res.status === 401) {
        router.push(`/login?redirect=/resume-templates`);
        return;
      }
      if (res.ok) {
        const { resume } = await res.json();
        track("resume_created", { source: "templates", template: t.templateId });
        router.push(`/builder/resume/${resume.id}?template=${t.templateId}`);
        return;
      }
      if (res.status === 402 || res.status === 403) {
        router.push(`/upgrade?from=${t.pro ? "templates" : "second_resume"}`);
        return;
      }
    } catch {
      // fall through to the builder's own creation flow
    }
    router.push(`/builder/resume/new?template=${t.templateId}`);
    setCreatingTemplate(null);
  };

  const filtered = templates.filter((t) => activeCategory === "All" || t.category === activeCategory);

  return (
    <>
      <section className="mx-auto flex max-w-[1240px] flex-col items-center gap-[18px] px-5 pb-6 pt-14 text-center">
        <span className="rounded-full bg-mint-soft px-3 py-1.5 text-[13px] font-extrabold text-brand-dark">Every template passes ATS checks</span>
        <h1 className="font-display m-0 max-w-[760px] text-[40px] font-bold leading-[1.02] tracking-[-1.8px] min-[761px]:text-[56px]">
          Pick a template you love. Switch any time.
        </h1>
        <p className="m-0 max-w-[600px] text-lg leading-normal text-text-muted">
          Your words stay put when you change designs, so there is no wrong choice.
        </p>
        <div role="group" aria-label="Filter templates" className="mt-2 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <Chip key={c} active={c === activeCategory} onClick={() => setActiveCategory(c)}>{c}</Chip>
          ))}
        </div>
        <p className="m-0 text-sm text-text-subtle" aria-live="polite">{filtered.length} template{filtered.length === 1 ? "" : "s"}</p>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-[22px] px-5 pb-[72px] pt-6 [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))]">
        {filtered.map((t) => (
          <div key={t.id} className="flex flex-col gap-3">
            <div className="relative flex justify-center rounded-[18px] bg-[#F2EFE7] py-[22px]">
              <ResumeThumb layout={t.layout} accent={t.accent} width={252} className="rounded-md shadow-[0_12px_28px_rgba(13,27,25,.14)]" />
              <span className={`absolute right-3.5 top-3.5 rounded-full px-[11px] py-[5px] text-xs font-extrabold ${t.pro ? "bg-sun text-ink" : "bg-mint-soft text-brand-dark"}`}>
                {t.pro ? "Pro" : "Free"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>
                <b className="text-[17px]">{t.name}</b>
                <br />
                <span className="text-sm text-text-muted">{t.description}</span>
              </span>
              <button
                type="button"
                onClick={() => handleUseTemplate(t)}
                disabled={creatingTemplate === t.id}
                aria-label={`Use the ${t.name} template`}
                className="min-h-[44px] flex-none rounded-[10px] bg-ink px-4 text-sm font-bold text-white hover:bg-ink-soft disabled:opacity-70"
              >
                {creatingTemplate === t.id ? "Opening..." : "Use this"}
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="px-5 pb-[72px]">
        <div className="mx-auto box-border flex max-w-[1200px] flex-wrap items-center gap-5 rounded-3xl border border-line bg-white p-8">
          <div className="min-w-[280px] flex-[1_1_320px]">
            <h2 className="font-display m-0 text-[28px] font-bold">Can&apos;t decide? Start with Classic Professional.</h2>
            <p className="mb-0 mt-1.5 text-text-muted">It reads cleanly for every industry and every applicant tracking system.</p>
          </div>
          <Link
            href={authed ? "/builder/resume/new?template=classic" : "/signup?template=classic"}
            className="rounded-[14px] bg-brand px-[22px] py-4 font-extrabold text-white no-underline hover:bg-brand-dark"
          >
            Start with Classic, free
          </Link>
        </div>
      </section>
    </>
  );
}
