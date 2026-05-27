"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
  Sparkles,
  Download,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  ArrowLeft,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import type { ResumeData, WorkExperience, Education, Skill } from "@/types";

// ─── Default empty resume ─────────────────────────────────────────────────────

const DEFAULT_RESUME: ResumeData = {
  contact: {
    full_name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    github: "",
  },
  summary: "",
  work_experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
  volunteer_work: [],
  projects: [],
  custom_sections: [],
};

// ─── Section collapse helper ──────────────────────────────────────────────────

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-gray-100">{children}</div>}
    </div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent";
const textareaCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent resize-none";

// ─── Preview renderer (minimal) ───────────────────────────────────────────────

function ResumePreview({ data, template }: { data: ResumeData; template: string }) {
  const accentColor =
    template === "modern"
      ? "#2563eb"
      : template === "minimal"
      ? "#111827"
      : "#0d9488";

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-8 text-[11px] leading-snug shadow-sm overflow-auto"
      style={{ minHeight: 600, fontFamily: "Georgia, serif" }}
    >
      {/* Header */}
      <div className="mb-4" style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: 12 }}>
        <div className="text-2xl font-bold" style={{ color: accentColor }}>
          {data.contact.full_name || "Your Name"}
        </div>
        <div className="text-gray-500 mt-1 flex flex-wrap gap-x-3">
          {data.contact.email && <span>{data.contact.email}</span>}
          {data.contact.phone && <span>{data.contact.phone}</span>}
          {data.contact.location && <span>{data.contact.location}</span>}
          {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Summary</div>
          <p className="text-gray-700">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.work_experience.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Experience</div>
          {data.work_experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">{exp.job_title || "Job Title"}</span>
                <span className="text-gray-400">
                  {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                </span>
              </div>
              <div className="text-gray-500">{exp.company}{exp.location ? `, ${exp.location}` : ""}</div>
              {exp.achievements.filter(Boolean).map((ach, i) => (
                <div key={i} className="text-gray-700 mt-1 pl-3">• {ach}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Education</div>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ""}</span>
                <span className="text-gray-400">{edu.start_date} – {edu.is_current ? "Present" : edu.end_date}</span>
              </div>
              <div className="text-gray-500">{edu.institution}</div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-2 py-0.5 rounded text-[10px] font-medium"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

function ResumeEditorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const template = searchParams.get("template") || "classic";
  const exampleSlug = searchParams.get("example");

  // Pre-fill from the example when ?example=slug is passed,
  // OR with a generic starter when only ?template= is passed,
  // OR with an empty resume if neither is present.
  const initialResume: ResumeData = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { RESUME_EXAMPLES } = require("@/lib/resume-examples-data") as typeof import("@/lib/resume-examples-data");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { exampleToResumeData, getTemplateStarterData } = require("@/lib/example-to-resume") as typeof import("@/lib/example-to-resume");
      if (exampleSlug) {
        const found = RESUME_EXAMPLES.find((e) => e.slug === exampleSlug);
        if (found) return exampleToResumeData(found);
      }
      // Template was selected without an example — give a polished starter.
      if (searchParams.get("template")) return getTemplateStarterData();
    } catch {}
    return DEFAULT_RESUME;
  })();

  const initialTitle = (() => {
    if (!exampleSlug) return "My Resume";
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { RESUME_EXAMPLES } = require("@/lib/resume-examples-data") as typeof import("@/lib/resume-examples-data");
      const found = RESUME_EXAMPLES.find((e) => e.slug === exampleSlug);
      return found ? `${found.title} Resume` : "My Resume";
    } catch {
      return "My Resume";
    }
  })();

  const [resume, setResume] = useState<ResumeData>(initialResume);
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const update = useCallback(<K extends keyof ResumeData>(key: K, val: ResumeData[K]) => {
    setResume((r) => ({ ...r, [key]: val }));
  }, []);

  const updateContact = (field: keyof ResumeData["contact"], val: string) => {
    setResume((r) => ({ ...r, contact: { ...r.contact, [field]: val } }));
  };

  // ── Work experience handlers ──────────────────────────────────────────────

  const addExp = () => {
    const exp: WorkExperience = {
      id: uuidv4(),
      job_title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      achievements: [""],
    };
    update("work_experience", [...resume.work_experience, exp]);
  };

  const updateExp = (id: string, field: keyof WorkExperience, val: unknown) => {
    update(
      "work_experience",
      resume.work_experience.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    );
  };

  const removeExp = (id: string) => {
    update("work_experience", resume.work_experience.filter((e) => e.id !== id));
  };

  const addAchievement = (expId: string) => {
    update(
      "work_experience",
      resume.work_experience.map((e) =>
        e.id === expId ? { ...e, achievements: [...e.achievements, ""] } : e
      )
    );
  };

  const updateAchievement = (expId: string, idx: number, val: string) => {
    update(
      "work_experience",
      resume.work_experience.map((e) => {
        if (e.id !== expId) return e;
        const achievements = [...e.achievements];
        achievements[idx] = val;
        return { ...e, achievements };
      })
    );
  };

  const removeAchievement = (expId: string, idx: number) => {
    update(
      "work_experience",
      resume.work_experience.map((e) => {
        if (e.id !== expId) return e;
        const achievements = e.achievements.filter((_, i) => i !== idx);
        return { ...e, achievements };
      })
    );
  };

  // ── AI helpers ────────────────────────────────────────────────────────────

  const generateSummary = async () => {
    if (!resume.contact.full_name && resume.work_experience.length === 0) return;
    setAiLoading("summary");
    try {
      const jobTitle =
        resume.work_experience[0]?.job_title || resume.contact.full_name || "Professional";
      const experience = resume.work_experience.map((e) => `${e.job_title} at ${e.company}`);
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, experience }),
      });
      if (!res.ok) throw new Error("AI summary failed");
      const data = await res.json();
      if (data.summary) update("summary", data.summary);
    } catch {
      setSaveMsg("AI generation failed. Please try again.");
      setTimeout(() => setSaveMsg(null), 3000);
    }
    setAiLoading(null);
  };

  const generateBullets = async (expId: string) => {
    const exp = resume.work_experience.find((e) => e.id === expId);
    if (!exp || !exp.job_title || !exp.company) return;
    setAiLoading(`bullets-${expId}`);
    try {
      const res = await fetch("/api/ai/bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: exp.job_title,
          company: exp.company,
          responsibilities: exp.description || exp.job_title,
        }),
      });
      if (!res.ok) throw new Error("AI bullets failed");
      const data = await res.json();
      if (Array.isArray(data.bullets)) {
        updateExp(expId, "achievements", data.bullets);
      }
    } catch {
      setSaveMsg("AI generation failed. Please try again.");
      setTimeout(() => setSaveMsg(null), 3000);
    }
    setAiLoading(null);
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, template_id: template, data: resume }),
      });
      if (res.ok) {
        const { resume: saved } = await res.json();
        setSaveMsg("Saved!");
        // Redirect to the edit page so future saves use PATCH
        setTimeout(() => {
          router.replace(`/builder/resume/${saved.id}`);
        }, 800);
      } else if (res.status === 401) {
        router.push("/login?next=/builder/resume/new?template=" + template);
      }
    } catch {}
    setSaving(false);
  };

  // ── Education helpers ─────────────────────────────────────────────────────

  const addEdu = () => {
    const edu: Education = {
      id: uuidv4(),
      degree: "",
      field_of_study: "",
      institution: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      gpa: "",
      description: "",
    };
    update("education", [...resume.education, edu]);
  };

  const updateEdu = (id: string, field: keyof Education, val: unknown) => {
    update(
      "education",
      resume.education.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    );
  };

  const removeEdu = (id: string) => {
    update("education", resume.education.filter((e) => e.id !== id));
  };

  // ── Skill helpers ─────────────────────────────────────────────────────────

  const addSkill = () => {
    const skill: Skill = { id: uuidv4(), name: "", level: "Intermediate" };
    update("skills", [...resume.skills, skill]);
  };

  const updateSkill = (id: string, field: keyof Skill, val: string) => {
    update(
      "skills",
      resume.skills.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const removeSkill = (id: string) => {
    update("skills", resume.skills.filter((s) => s.id !== id));
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-semibold text-gray-900 border-none outline-none bg-transparent w-48 truncate"
              placeholder="Resume Title"
            />
          </div>

          {/* Mobile tab switcher */}
          <div className="flex lg:hidden rounded-full border border-gray-200 p-0.5">
            <button
              onClick={() => setActiveTab("edit")}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${activeTab === "edit" ? "bg-[var(--teal)] text-white" : "text-gray-600"}`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${activeTab === "preview" ? "bg-[var(--teal)] text-white" : "text-gray-600"}`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            {saveMsg && <span className="text-xs text-green-600 font-medium">{saveMsg}</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
            <button className="btn-teal text-sm flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main split layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left: Form */}
          <div
            className={`flex-1 space-y-4 min-w-0 ${activeTab === "preview" ? "hidden lg:block" : ""}`}
          >
            {/* Contact */}
            <Section title="Contact Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Field label="Full Name" required>
                  <input
                    className={inputCls}
                    value={resume.contact.full_name}
                    onChange={(e) => updateContact("full_name", e.target.value)}
                    placeholder="Jane Smith"
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    className={inputCls}
                    type="email"
                    value={resume.contact.email}
                    onChange={(e) => updateContact("email", e.target.value)}
                    placeholder="jane@example.com"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    className={inputCls}
                    value={resume.contact.phone}
                    onChange={(e) => updateContact("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </Field>
                <Field label="Location">
                  <input
                    className={inputCls}
                    value={resume.contact.location}
                    onChange={(e) => updateContact("location", e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </Field>
                <Field label="LinkedIn URL">
                  <input
                    className={inputCls}
                    value={resume.contact.linkedin}
                    onChange={(e) => updateContact("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/janesmith"
                  />
                </Field>
                <Field label="Website / Portfolio">
                  <input
                    className={inputCls}
                    value={resume.contact.website}
                    onChange={(e) => updateContact("website", e.target.value)}
                    placeholder="janesmith.com"
                  />
                </Field>
              </div>
            </Section>

            {/* Summary */}
            <Section title="Professional Summary">
              <div className="mt-4 space-y-2">
                <textarea
                  className={textareaCls}
                  rows={4}
                  value={resume.summary}
                  onChange={(e) => update("summary", e.target.value)}
                  placeholder="A compelling 2-3 sentence summary of your career and key strengths..."
                />
                <button
                  type="button"
                  onClick={generateSummary}
                  disabled={aiLoading === "summary"}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-teal bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-full px-3 py-1.5 hover:bg-[var(--teal-100)] transition-colors disabled:opacity-50"
                >
                  {aiLoading === "summary" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Generate with AI
                </button>
              </div>
            </Section>

            {/* Work Experience */}
            <Section title="Work Experience">
              <div className="mt-4 space-y-6">
                {resume.work_experience.map((exp) => (
                  <div key={exp.id} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Position</span>
                      <button
                        type="button"
                        onClick={() => removeExp(exp.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Job Title" required>
                        <input
                          className={inputCls}
                          value={exp.job_title}
                          onChange={(e) => updateExp(exp.id, "job_title", e.target.value)}
                          placeholder="Software Engineer"
                        />
                      </Field>
                      <Field label="Company" required>
                        <input
                          className={inputCls}
                          value={exp.company}
                          onChange={(e) => updateExp(exp.id, "company", e.target.value)}
                          placeholder="Acme Corp"
                        />
                      </Field>
                      <Field label="Location">
                        <input
                          className={inputCls}
                          value={exp.location || ""}
                          onChange={(e) => updateExp(exp.id, "location", e.target.value)}
                          placeholder="Remote"
                        />
                      </Field>
                      <div className="flex gap-2">
                        <Field label="Start Date">
                          <input
                            className={inputCls}
                            value={exp.start_date}
                            onChange={(e) => updateExp(exp.id, "start_date", e.target.value)}
                            placeholder="Jan 2022"
                          />
                        </Field>
                        <Field label="End Date">
                          <input
                            className={inputCls}
                            value={exp.end_date || ""}
                            onChange={(e) => updateExp(exp.id, "end_date", e.target.value)}
                            placeholder="Present"
                            disabled={exp.is_current}
                          />
                        </Field>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.is_current}
                        onChange={(e) => updateExp(exp.id, "is_current", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Currently working here
                    </label>

                    {/* Bullet points */}
                    <Field label="Achievements / Responsibilities">
                      <div className="space-y-2 mt-1">
                        {exp.achievements.map((ach, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <span className="text-gray-400 text-sm mt-2">•</span>
                            <input
                              className={`${inputCls} flex-1`}
                              value={ach}
                              onChange={(e) => updateAchievement(exp.id, i, e.target.value)}
                              placeholder="Describe your achievement with impact..."
                            />
                            {exp.achievements.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAchievement(exp.id, i)}
                                className="text-gray-300 hover:text-red-400 mt-2 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => addAchievement(exp.id)}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-2 py-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add bullet
                          </button>
                          <button
                            type="button"
                            onClick={() => generateBullets(exp.id)}
                            disabled={aiLoading === `bullets-${exp.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-teal bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-full px-3 py-1.5 hover:bg-[var(--teal-100)] transition-colors disabled:opacity-50"
                          >
                            {aiLoading === `bullets-${exp.id}` ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            AI Bullets
                          </button>
                        </div>
                      </div>
                    </Field>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addExp}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[var(--teal)] hover:text-teal transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Work Experience
                </button>
              </div>
            </Section>

            {/* Education */}
            <Section title="Education" defaultOpen={false}>
              <div className="mt-4 space-y-4">
                {resume.education.map((edu) => (
                  <div key={edu.id} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Degree</span>
                      <button type="button" onClick={() => removeEdu(edu.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Degree">
                        <input className={inputCls} value={edu.degree} onChange={(e) => updateEdu(edu.id, "degree", e.target.value)} placeholder="Bachelor of Science" />
                      </Field>
                      <Field label="Field of Study">
                        <input className={inputCls} value={edu.field_of_study} onChange={(e) => updateEdu(edu.id, "field_of_study", e.target.value)} placeholder="Computer Science" />
                      </Field>
                      <Field label="Institution">
                        <input className={inputCls} value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} placeholder="University of California" />
                      </Field>
                      <Field label="GPA (optional)">
                        <input className={inputCls} value={edu.gpa || ""} onChange={(e) => updateEdu(edu.id, "gpa", e.target.value)} placeholder="3.8/4.0" />
                      </Field>
                      <Field label="Start Date">
                        <input className={inputCls} value={edu.start_date} onChange={(e) => updateEdu(edu.id, "start_date", e.target.value)} placeholder="Sep 2018" />
                      </Field>
                      <Field label="End Date">
                        <input className={inputCls} value={edu.end_date || ""} onChange={(e) => updateEdu(edu.id, "end_date", e.target.value)} placeholder="May 2022" disabled={edu.is_current} />
                      </Field>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={edu.is_current} onChange={(e) => updateEdu(edu.id, "is_current", e.target.checked)} className="rounded border-gray-300" />
                      Currently enrolled
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEdu}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[var(--teal)] hover:text-teal transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Education
                </button>
              </div>
            </Section>

            {/* Skills */}
            <Section title="Skills" defaultOpen={false}>
              <div className="mt-4 space-y-2">
                {resume.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-2">
                    <input
                      className={`${inputCls} flex-1`}
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                      placeholder="e.g. React, Python, Project Management"
                    />
                    <select
                      className="h-9 px-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
                      value={skill.level || "Intermediate"}
                      onChange={(e) => updateSkill(skill.id, "level", e.target.value)}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                    <button type="button" onClick={() => removeSkill(skill.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSkill}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[var(--teal)] hover:text-teal transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>
            </Section>
          </div>

          {/* Right: Preview (hidden on mobile unless preview tab) */}
          <div
            className={`w-[420px] shrink-0 sticky top-20 h-fit ${activeTab === "edit" ? "hidden lg:block" : ""}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Preview</span>
              <span className="text-xs text-gray-400 capitalize">{template} template</span>
            </div>
            <ResumePreview data={resume} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResumeEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-teal" /></div>}>
      <ResumeEditorInner />
    </Suspense>
  );
}
