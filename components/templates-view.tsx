"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Check, Loader2 } from "lucide-react";
import { MiniResume } from "@/components/mini-resume-cards";

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

const templates: Template[] = [
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


function TemplateThumbnail({ layout, accent }: { layout: string; accent: string }) {
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <MiniResume layout={layout} accent={accent} />
    </div>
  );
}

export default function TemplatesView() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState<number | null>(null);

  // "Use Template" — creates a new resume with starter data already filled in,
  // then routes directly to the full builder at /builder/resume/[id].
  const handleUseTemplate = async (t: Template) => {
    setCreatingTemplate(t.id);
    try {
      // Lazy-load the starter data generator (client-only, keeps bundle small).
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getTemplateStarterData } = require("@/lib/example-to-resume") as typeof import("@/lib/example-to-resume");
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
        router.push(`/login?redirect=/dashboard/templates`);
        return;
      }
      if (res.ok) {
        const { resume } = await res.json();
        router.push(`/builder/resume/${resume.id}?template=${t.templateId}`);
        return;
      }
    } catch {
      // Fall through to /new?template= as a graceful degradation.
    }
    router.push(`/builder/resume/new?template=${t.templateId}`);
    setCreatingTemplate(null);
  };

  const filtered = templates.filter((t) => {
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesFree = !showFreeOnly || !t.pro;
    return matchesCategory && matchesSearch && matchesFree;
  });

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden py-14 border-b border-slate-100 animate-page-enter" style={{
        background: 'linear-gradient(180deg, #f0fdf9 0%, #f8fafc 60%, #ffffff 100%)',
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(74,183,166,0.08) 0%, transparent 70%)',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-badge-pop inline-flex items-center gap-2 bg-white border border-teal-200 rounded-full px-4 py-1.5 text-sm text-teal-700 mb-5 shadow-sm">
            <Check className="w-3.5 h-3.5" style={{ color: '#4AB7A6' }} />
            ATS-Optimized · Recruiter-Approved · Free to Try
          </div>
          <h1 className="animate-fade-up text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight" style={{ '--stagger-delay': '60ms' } as React.CSSProperties}>
            Professional Resume Templates
          </h1>
          <p className="animate-fade-up text-lg text-slate-500 max-w-2xl mx-auto mb-6 leading-relaxed" style={{ '--stagger-delay': '120ms' } as React.CSSProperties}>
            60+ templates designed by professional resume writers and tested with Fortune 500 recruiters.
            Every template passes ATS screening and looks stunning to human eyes.
          </p>
          <div className="animate-fade-up flex items-center justify-center gap-6 text-sm font-medium text-slate-500" style={{ '--stagger-delay': '180ms' } as React.CSSProperties}>
            {['60+ Templates', '127,000+ Downloads', '6 Layout Types', 'Fully Customisable'].map((stat, i) => (
              <>
                {i > 0 && <span key={`dot-${i}`} className="w-1 h-1 rounded-full bg-slate-300" />}
                <span key={stat}>{stat}</span>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-60 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-slate-200 focus:border-[#4AB7A6] focus:outline-none focus:ring-2 focus:ring-[#4AB7A6]/20 text-sm"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={activeCategory === cat ? { backgroundColor: '#4AB7A6' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Free-only toggle */}
          <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <span className="text-sm text-slate-600 select-none">Free only</span>
            <button
              role="switch"
              aria-checked={showFreeOnly}
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              className="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
              style={{ backgroundColor: showFreeOnly ? '#4AB7A6' : '#e2e8f0' }}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  showFreeOnly ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>

          <p className="text-sm text-slate-400 shrink-0">
            {filtered.length} template{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Template grid */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((template, idx) => (
                <div
                  key={template.id}
                  className="group flex flex-col rounded-2xl border border-slate-200 overflow-hidden card-hover bg-white animate-fade-up"
                  style={{
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    '--stagger-delay': `${(idx % 12) * 40}ms`,
                  } as React.CSSProperties}
                >
                  {/* Preview with doc-frame bg */}
                  <div className="relative overflow-hidden doc-frame" style={{ height: "220px" }}>
                    {/* Chrome bar */}
                    <div className="relative z-10 flex items-center gap-1 px-2.5 py-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <div className="flex-1 mx-2 h-3 rounded bg-slate-200/60" />
                    </div>
                    {/* Document */}
                    <div className="absolute inset-0 top-[22px] z-10 p-2">
                      <div
                        className="w-full h-full rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]"
                        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08)" }}
                      >
                        <TemplateThumbnail layout={template.layout} accent={template.accent} />
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}
                        disabled={creatingTemplate === template.id}
                        className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 bg-white font-semibold rounded-full px-5 py-2 text-sm shadow-lg flex items-center gap-1.5 disabled:opacity-70 active:scale-95"
                        style={{ color: '#4AB7A6' }}
                      >
                        {creatingTemplate === template.id ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening…</>
                        ) : (
                          <>✏ Use Template</>
                        )}
                      </button>
                    </div>

                    {/* PRO badge */}
                    {template.pro && (
                      <div className="absolute top-8 left-3 z-30 text-[10px] font-bold bg-amber-400 text-amber-900 rounded-full px-2 py-0.5 shadow-sm animate-badge-pop">
                        PRO
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{template.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{template.description}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 mt-0.5 ${
                        template.pro ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {template.pro ? "PRO" : "Free"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold text-lg mb-1">No templates found</p>
              <p className="text-slate-400 text-sm mb-5">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("All"); setShowFreeOnly(false); }}
                className="text-sm font-semibold rounded-full px-5 py-2 border transition-colors hover:bg-slate-50"
                style={{ color: '#4AB7A6', borderColor: '#4AB7A6' }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Can&apos;t find the right template?</h2>
            <p className="text-slate-500 mb-7 text-sm">New templates added every month. Start building for free with any template.</p>
            <Link
              href="/builder/resume/new"
              className="inline-flex items-center gap-2 text-white font-semibold rounded-full px-7 py-3 text-sm"
              style={{ backgroundColor: '#4AB7A6' }}
            >
              Start Building Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
