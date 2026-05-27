"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Sparkles,
  FileText,
  AlertTriangle,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ATSCheckResult, ResumeData } from "@/types";
import { resumeDataToText } from "@/lib/ats";

interface SavedResume {
  id: string;
  title: string;
  data: ResumeData;
  ats_score: number | null;
}

// ─── Score Circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={color} strokeWidth={stroke} fill="none"
            strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold leading-none" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-bold px-4 py-1.5 rounded-full" style={{ color, backgroundColor: `${color}18` }}>
        {label}
      </span>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── Section Bar (expandable) ─────────────────────────────────────────────────

function SectionBar({ label, score, issues, suggestions }: { label: string; score: number; issues: string[]; suggestions: string[] }) {
  const [open, setOpen] = useState(false);
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors" onClick={() => setOpen((o) => !o)}>
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="text-sm font-medium text-slate-800">{label}</span>
            <span className="text-sm font-bold" style={{ color }}>{score}/100</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (issues.length > 0 || suggestions.length > 0) && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          {issues.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">Issues</p>
              <ul className="space-y-1.5">
                {issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">Suggestions</p>
              <ul className="space-y-1.5">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "What is an ATS (Applicant Tracking System)?", a: "An ATS is software used by employers to collect, sort, and rank resumes. It scans for keywords, formatting, and structure before a human recruiter ever reads your application. Over 90% of Fortune 500 companies use ATS software." },
  { q: "Why do resumes get rejected by ATS?", a: "Common reasons include using tables, graphics, or unusual fonts, missing keywords from the job description, non-standard section headings, and PDF formats that aren't text-selectable. Our checker identifies all these issues." },
  { q: "How do I make my resume ATS-friendly?", a: "Use a clean, simple layout with standard section headings (Experience, Education, Skills). Mirror keywords directly from the job description. Avoid headers/footers, tables, images, and decorative elements that confuse parsers." },
  { q: "Is my resume data stored or shared?", a: "No. Your resume text is sent to our analysis engine over an encrypted connection and is never stored on our servers. We do not sell or share your data with third parties." },
  { q: "How is the ATS score calculated?", a: "We analyze 30+ factors across 5 categories: keyword match (against common job descriptions), formatting compliance, document structure, contact information completeness, and work experience presentation. Each category is weighted and combined into the overall score." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-slate-50 transition-colors" onClick={() => setOpen((o) => !o)}>
        <span className="text-sm font-semibold text-slate-900">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Demo result ──────────────────────────────────────────────────────────────

const DEMO_RESULT: ATSCheckResult = {
  overall_score: 67,
  sections: {
    keywords:   { score: 55, issues: ["Missing industry-specific keywords", "Job description keywords not reflected"], suggestions: ["Add keywords from the job posting to each relevant section", "Include tools, technologies, and methodologies mentioned in the JD"] },
    formatting: { score: 70, issues: ["Special characters detected in bullet points", "Inconsistent date format"], suggestions: ["Use plain dash (-) for bullet points instead of symbols", "Standardize dates to Month YYYY format (e.g., January 2023)"] },
    structure:  { score: 65, issues: ["No professional summary detected", "Skills section is missing"], suggestions: ["Add a 2-3 sentence professional summary at the top", "Include a dedicated Skills section with relevant competencies"] },
    contact:    { score: 80, issues: ["LinkedIn URL not found"], suggestions: ["Add your LinkedIn profile URL to the contact section"] },
    experience: { score: 60, issues: ["Bullet points lack quantifiable achievements", "Job descriptions are too brief"], suggestions: ["Add metrics to bullets (e.g., 'Increased sales by 23%')", "Expand each role to 3-5 achievement-focused bullets"] },
  },
  top_issues: ["No professional summary detected", "Missing industry keywords", "Bullet points lack quantifiable achievements", "LinkedIn URL not found", "Inconsistent date formats"],
  top_suggestions: ["Add a professional summary with 2-3 targeted sentences", "Mirror keywords from the job description throughout your resume", "Quantify achievements in every work experience bullet", "Use consistent Month YYYY date formatting", "Add a Skills section with relevant technical competencies"],
};

// ─── Main View ────────────────────────────────────────────────────────────────

export default function AtsCheckerView() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ATSCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resume" | "job">("resume");

  // Authenticated users: list of their saved resumes and which one (if any)
  // they've selected to analyze. When a resume is picked we auto-fill the
  // text field with its content and save the score back on Analyze.
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  // Try to load the user's saved resumes. Returns 401 for anonymous visitors
  // on the public /ats-checker page — we silently ignore and fall back to
  // the paste-your-text flow.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/resume', { cache: 'no-store' });
        if (!res.ok) return;
        const { resumes } = await res.json();
        if (cancelled) return;
        const list: SavedResume[] = Array.isArray(resumes)
          ? resumes.map((r: { id: string; title: string; data: ResumeData; ats_score: number | null }) => ({
              id: r.id,
              title: r.title,
              data: r.data,
              ats_score: r.ats_score,
            }))
          : [];
        setSavedResumes(list);
      } catch {
        /* not signed in, or network blip — paste-your-text still works */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectResume = (id: string) => {
    setSelectedResumeId(id);
    const picked = savedResumes.find((r) => r.id === id);
    if (picked?.data) {
      setResumeText(resumeDataToText(picked.data));
    }
  };

  const handleAnalyze = async () => {
    const trimmed = resumeText.trim();
    if (!trimmed) {
      setError("Please paste your resume text before analyzing.");
      return;
    }
    if (trimmed.length < 50) {
      setError(`Your resume text is too short (${trimmed.length} characters). Please paste at least 50 characters — ideally the full plain-text content of your resume.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ats/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: trimmed,
          jobDescription: jobDescription.trim() || undefined,
        }),
      });

      // Surface the server's actual error message when the request fails,
      // instead of masking it behind a generic "Failed to analyze resume".
      if (!res.ok) {
        let serverMessage = `Analysis failed (HTTP ${res.status}).`;
        try {
          const body = await res.json();
          if (body && typeof body.error === "string" && body.error.trim()) {
            serverMessage = body.error;
          }
        } catch {
          /* response wasn't JSON — keep the HTTP-status fallback */
        }
        setError(serverMessage);
        return;
      }

      const data = await res.json();
      if (!data || typeof data.overall_score !== "number" || !data.sections) {
        setError("The analyzer returned an unexpected response. Please try again.");
        return;
      }
      setResult(data);

      // If the user analyzed a saved resume, write the fresh score back so
      // the dashboard card stays in sync with what we just showed here.
      if (selectedResumeId) {
        fetch(`/api/resume/${selectedResumeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ats_score: data.overall_score }),
        }).catch(() => { /* non-critical — score is still shown in this view */ });
      }
    } catch (err) {
      // Network / fetch-level failure (offline, CORS, DNS, etc.)
      setError(
        err instanceof Error && err.message
          ? `Network error: ${err.message}. Please check your connection and try again.`
          : "Network error. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setResumeText("John Smith\njohn@email.com | (555) 123-4567\n\nEXPERIENCE\nSoftware Developer at Acme Corp\n- Worked on web applications\n- Helped with projects\n- Fixed bugs\n\nEDUCATION\nBS Computer Science, State University, 2019\n\nSKILLS\nJavaScript, React, Node.js");
    setResult(DEMO_RESULT);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-slate-50 py-14 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-teal-50 text-[#4AB7A6] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5 border border-teal-100">FREE TOOL</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">ATS Resume Checker</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-5 leading-relaxed">
            Find out if your resume will pass automated screening. Over 90% of Fortune 500 companies use ATS to filter candidates. Our checker analyzes 30+ criteria and shows you exactly what to fix.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            {["Free", "Instant Results", "No Sign-Up Required"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 size={15} style={{ color: '#4AB7A6' }} />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Checker */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Input */}
            <div className="lg:col-span-3 space-y-5">
              {/* Resume picker — visible only for signed-in users with saved
                  resumes. Lets them pick which resume to score instead of
                  pasting raw text. The score saves back to that resume. */}
              {savedResumes.length > 0 && (
                <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
                  <Label htmlFor="resume-picker" className="text-sm font-semibold text-slate-800 mb-2 block">
                    Analyze a saved resume
                  </Label>
                  <div className="relative">
                    <select
                      id="resume-picker"
                      value={selectedResumeId ?? ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSelectResume(e.target.value);
                        } else {
                          setSelectedResumeId(null);
                          setResumeText('');
                        }
                      }}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 focus:border-[#4AB7A6] focus:outline-none focus:ring-2 focus:ring-[#4AB7A6]/20"
                    >
                      <option value="">— Pick a resume —</option>
                      {savedResumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                          {r.ats_score != null ? `  (last score: ${r.ats_score}%)` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    The resume text will auto-fill below. Your saved score updates after you analyze.
                  </p>
                </div>
              )}

              <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                {(["resume", "job"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {tab === "resume"
                      ? <span className="flex items-center justify-center gap-1.5"><FileText size={14} />{savedResumes.length > 0 ? 'Resume Text' : 'Paste Resume Text'}</span>
                      : <span className="flex items-center justify-center gap-1.5"><Target size={14} />Paste Job Description</span>}
                  </button>
                ))}
              </div>

              {activeTab === "resume" ? (
                <div>
                  <Label htmlFor="resume-text" className="text-sm font-semibold text-slate-700 mb-2 block">Resume Text <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="resume-text"
                    placeholder="Copy and paste the plain text content of your resume here..."
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      // User is typing their own text now — don't save the
                      // score back to whichever resume was previously picked.
                      if (selectedResumeId) setSelectedResumeId(null);
                    }}
                    rows={14}
                    className="font-mono text-sm resize-none rounded-xl border-slate-200 focus:border-[#4AB7A6] focus:ring-[#4AB7A6]"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">{resumeText.length} characters · {resumeText.trim().split(/\s+/).filter(Boolean).length} words</p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="job-desc" className="text-sm font-semibold text-slate-700 mb-2 block">Job Description <span className="text-slate-400 font-normal">(optional — for targeted keyword analysis)</span></Label>
                  <Textarea id="job-desc" placeholder="Paste the full job description here to get a keyword gap analysis..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={14} className="text-sm resize-none rounded-xl border-slate-200 focus:border-[#4AB7A6] focus:ring-[#4AB7A6]" />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-100">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{error}
                </div>
              )}

              <Button onClick={handleAnalyze} disabled={loading} className="w-full h-12 rounded-full text-base font-semibold text-white gap-2" style={{ backgroundColor: '#4AB7A6' }}>
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing Your Resume...</> : <><Target className="w-5 h-5" />Analyze My Resume</>}
              </Button>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 flex items-center gap-1.5"><ShieldCheck size={13} />We don&apos;t store your resume text. Analysis runs instantly.</p>
                <button onClick={handleDemo} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: '#4AB7A6' }}>
                  <Sparkles size={12} />Try Demo Resume
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2">
              {!result ? (
                <div className="h-full min-h-[400px] rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                    <Target size={28} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium mb-1">Your ATS score will appear here</p>
                  <p className="text-sm text-slate-400">Enter your resume text and click Analyze to see your score, breakdown, and personalized tips.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">ATS Score</p>
                    <ScoreCircle score={result.overall_score} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Score Breakdown</p>
                    <ScoreBar label="Keywords Match" score={result.sections.keywords.score} />
                    <ScoreBar label="Formatting" score={result.sections.formatting.score} />
                    <ScoreBar label="Structure" score={result.sections.structure.score} />
                    <ScoreBar label="Contact Info" score={result.sections.contact.score} />
                    <ScoreBar label="Work Experience" score={result.sections.experience.score} />
                  </div>
                  <Link href="/builder/resume/new">
                    <Button className="w-full h-11 rounded-full text-white font-semibold text-sm gap-2" style={{ backgroundColor: '#4AB7A6' }}>
                      Fix These Issues <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Detailed results */}
          {result && (
            <div className="mt-10 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Breakdown</h2>
                <div className="space-y-3">
                  <SectionBar label="Keywords Match" score={result.sections.keywords.score} issues={result.sections.keywords.issues} suggestions={result.sections.keywords.suggestions} />
                  <SectionBar label="Formatting" score={result.sections.formatting.score} issues={result.sections.formatting.issues} suggestions={result.sections.formatting.suggestions} />
                  <SectionBar label="Structure" score={result.sections.structure.score} issues={result.sections.structure.issues} suggestions={result.sections.structure.suggestions} />
                  <SectionBar label="Contact Info" score={result.sections.contact.score} issues={result.sections.contact.issues} suggestions={result.sections.contact.suggestions} />
                  <SectionBar label="Work Experience" score={result.sections.experience.score} issues={result.sections.experience.issues} suggestions={result.sections.experience.suggestions} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500" />Issues Found</h3>
                  <ul className="space-y-2.5">
                    {result.top_issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><span className="text-slate-700">{issue}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" />How to Improve</h3>
                  <ul className="space-y-2.5">
                    {result.top_suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span className="text-slate-700">{s}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl p-8 text-white text-center" style={{ backgroundColor: '#4AB7A6' }}>
                <h3 className="text-xl font-bold mb-2">Fix These Issues in Minutes</h3>
                <p className="text-white/80 mb-6 text-sm max-w-md mx-auto">Our AI resume builder helps you resolve every issue found above — automatically.</p>
                <Link href="/builder/resume/new" className="inline-flex items-center gap-2 bg-white font-semibold rounded-full px-7 py-3 hover:bg-slate-50 transition-colors" style={{ color: '#4AB7A6' }}>
                  Fix My Resume <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why ATS Matters */}
      <section className="bg-slate-50 border-t border-slate-100 py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Why ATS Matters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { stat: "75%", label: "of resumes are rejected by ATS before a human sees them" },
              { stat: "90%", label: "of Fortune 500 companies use ATS to screen candidates" },
              { stat: "43%", label: "increase in interview callbacks with an ATS-optimized resume" },
            ].map(({ stat, label }) => (
              <div key={stat} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold mb-2" style={{ color: '#4AB7A6' }}>{stat}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>
    </>
  );
}
