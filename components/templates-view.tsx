"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Check, Loader2 } from "lucide-react";
import ClassicTemplate from "@/components/resume-templates/classic";
import ModernTemplate from "@/components/resume-templates/modern";
import ExecutiveTemplate from "@/components/resume-templates/executive";
import CreativeTemplate from "@/components/resume-templates/creative";
import MinimalTemplate from "@/components/resume-templates/minimal";
import SimpleTemplate from "@/components/resume-templates/simple";

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

const TEMPLATE_SAMPLE_DATA = {
  contact: {
    full_name: 'Alex Morgan',
    email: 'alex.morgan@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexmorgan',
    website: 'alexmorgan.design',
    github: '',
    photo_url: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  summary: 'Senior product designer with 8+ years shipping consumer and SaaS products. Led design for high-growth teams from Series A through IPO. Expert in Figma, design systems, and mixed-methods research.',
  work_experience: [
    {
      id: 'exp-1',
      job_title: 'Senior Product Designer',
      company: 'Linear',
      location: 'San Francisco, CA',
      start_date: '2022-01',
      end_date: '',
      is_current: true,
      description: '',
      achievements: [
        'Led redesign of core issue tracker used by 300K+ teams, improving task completion 28%',
        'Built and shipped design system adopted by 6 product squads across web and mobile',
        'Shipped new onboarding that lifted activation rate from 38% to 61%',
      ],
    },
    {
      id: 'exp-2',
      job_title: 'Product Designer',
      company: 'Notion',
      location: 'San Francisco, CA',
      start_date: '2019-03',
      end_date: '2021-12',
      is_current: false,
      description: '',
      achievements: [
        'Owned design for mobile app across 10 releases reaching 4M+ users',
        'Ran 20+ usability studies per year, reducing user friction in core workflows by 35%',
        'Collaborated with 3 PM and 8 engineering partners in agile sprints',
      ],
    },
    {
      id: 'exp-3',
      job_title: 'UX Designer',
      company: 'Dropbox',
      location: 'San Francisco, CA',
      start_date: '2016-06',
      end_date: '2019-02',
      is_current: false,
      description: '',
      achievements: [
        'Redesigned file sharing flow, increasing sharing rate by 22%',
        'Contributed to cross-platform design language used by 200M+ users',
      ],
    },
  ],
  education: [{ id: 'edu-1', degree: 'B.A. Design', field_of_study: 'Interaction Design', institution: 'Stanford University', location: '', start_date: '2012-09', end_date: '2016-05', is_current: false, gpa: '', description: '' }],
  skills: [
    { id: 'sk-1', name: 'Figma', category: 'Design' },
    { id: 'sk-2', name: 'Prototyping', category: 'Design' },
    { id: 'sk-3', name: 'Design Systems', category: 'Design' },
    { id: 'sk-4', name: 'User Research', category: 'Research' },
    { id: 'sk-5', name: 'A/B Testing', category: 'Analytics' },
    { id: 'sk-6', name: 'Motion Design', category: 'Design' },
  ],
  certifications: [],
  languages: [],
  volunteer_work: [],
  projects: [],
  custom_sections: [],
};

function renderActualTemplate(templateId: string, accent: string) {
  const colorMap: Record<string, string> = {
    '#4AB7A6': 'teal', '#0d9488': 'teal', '#4338ca': 'purple', '#7c3aed': 'purple',
    '#1d4ed8': 'blue', '#1e293b': 'slate', '#0f172a': 'slate', '#334155': 'slate',
    '#374151': 'slate', '#111827': 'slate', '#1e3a8a': 'blue', '#0f766e': 'teal',
    '#db2777': 'rose', '#e11d48': 'rose', '#ea580c': 'rose', '#c2410c': 'rose',
    '#be123c': 'rose', '#9f1239': 'rose', '#ec4899': 'rose', '#059669': 'teal',
    '#10b981': 'teal', '#0891b2': 'teal', '#2dd4bf': 'teal', '#6d28d9': 'purple',
  };
  const color = colorMap[accent] ?? 'teal';
  const props = { data: TEMPLATE_SAMPLE_DATA, colorScheme: color, fontSize: 'medium' as const };
  switch (templateId) {
    case 'modern':    return <ModernTemplate {...props} />;
    case 'creative':  return <CreativeTemplate {...props} />;
    case 'executive': return <ExecutiveTemplate {...props} />;
    case 'minimal':   return <MinimalTemplate {...props} />;
    case 'simple':    return <SimpleTemplate {...props} />;
    default:          return <ClassicTemplate {...props} />;
  }
}

function TemplateThumbnail({ templateId, accent }: { templateId: string; accent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.34);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / 793.7);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        width: '210mm',
        pointerEvents: 'none',
      }}>
        {renderActualTemplate(templateId, accent)}
      </div>
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
      <section className="bg-slate-50 py-14 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm text-slate-600 mb-5 shadow-sm">
            <Check className="w-3.5 h-3.5" style={{ color: '#4AB7A6' }} />
            ATS-Optimized · Recruiter-Approved · Free to Try
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Professional Resume Templates
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-6 leading-relaxed">
            60+ templates designed by professional resume writers and tested with Fortune 500 recruiters.
            Every template passes ATS screening and looks stunning to human eyes.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-500">
            <span>60+ Templates</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>127,000+ Downloads</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>6 Layout Types</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Fully Customisable</span>
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
              {filtered.map((template) => (
                <div
                  key={template.id}
                  className="group flex flex-col rounded-2xl border border-slate-200 overflow-hidden hover:border-[#4AB7A6] hover:shadow-xl transition-all duration-200 bg-white"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                >
                  {/* Preview */}
                  <div className="relative overflow-hidden bg-slate-100" style={{ height: "220px" }}>
                    <div className="absolute inset-0 p-2">
                      <div
                        className="w-full h-full rounded-lg overflow-hidden"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.08)" }}
                      >
                        <TemplateThumbnail templateId={template.templateId} accent={template.accent} />
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}
                        disabled={creatingTemplate === template.id}
                        className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 bg-white font-semibold rounded-full px-5 py-2 text-sm shadow-lg flex items-center gap-1.5 disabled:opacity-70"
                        style={{ color: '#4AB7A6' }}
                      >
                        {creatingTemplate === template.id ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening…</>
                        ) : (
                          <>Use Template →</>
                        )}
                      </button>
                    </div>

                    {/* PRO badge */}
                    {template.pro && (
                      <div className="absolute top-3 left-3 text-[10px] font-bold bg-amber-400 text-amber-900 rounded-full px-2 py-0.5 shadow-sm">
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
