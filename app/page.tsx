import Link from "next/link";
import {
  Sparkles,
  Check,
  Star,
  ArrowRight,
  Download,
  FileText,
  Layout,
  ChevronRight,
  Zap,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { TemplatePreview } from "@/components/template-preview";
import type { TemplateLayout } from "@/components/template-preview";
import EmailCapture from "@/components/email-capture";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import FeatureVisualTemplates from "@/components/feature-visual-templates";

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */

const stats = [
  { value: "94%", label: "ATS Pass Rate" },
  { value: "3 min", label: "Average Build Time" },
  { value: "4.8 / 5", label: "User Rating" },
  { value: "50K+", label: "Resumes Created" },
];

const industries = [
  { title: "Software Engineer", badge: "Technology", count: "12 examples" },
  { title: "Marketing Manager", badge: "Marketing", count: "8 examples" },
  { title: "Registered Nurse", badge: "Healthcare", count: "10 examples" },
  { title: "Data Analyst", badge: "Analytics", count: "7 examples" },
  { title: "Teacher", badge: "Education", count: "6 examples" },
  { title: "Project Manager", badge: "Operations", count: "9 examples" },
  { title: "Graphic Designer", badge: "Creative", count: "5 examples" },
  { title: "Sales Executive", badge: "Sales", count: "8 examples" },
];

const templates: { name: string; category: string; isPro: boolean; accent: string; layout: TemplateLayout }[] = [
  { name: "Classic Professional", category: "General",   isPro: true, accent: "#4AB7A6", layout: "classic"   },
  { name: "Modern Sidebar",       category: "Tech",      isPro: true, accent: "#334155", layout: "sidebar"   },
  { name: "Executive Bold",       category: "Executive", isPro: true, accent: "#1d4ed8", layout: "executive" },
  { name: "Creative Side-Column", category: "Creative",  isPro: true, accent: "#7c3aed", layout: "creative"  },
  { name: "Academic Clean",       category: "Academic",  isPro: true, accent: "#be123c", layout: "minimal"   },
  { name: "Contemporary Teal",    category: "Modern",    isPro: true, accent: "#d97706", layout: "centered"  },
];

const testimonials = [
  {
    initials: "MT",
    avatarColor: "#4AB7A6",
    name: "Marcus T.",
    role: "Software Engineer",
    hiredAt: "Stripe",
    quote:
      "I had been applying for 2 months with zero responses. After rebuilding my resume with GetHiredToday's AI, I got 5 interview calls in my first week. The ATS checker showed me I was missing keywords that every recruiter looks for.",
  },
  {
    initials: "LK",
    avatarColor: "#0891b2",
    name: "Linda K.",
    role: "Nurse Coordinator",
    hiredAt: "Mass General Hospital",
    quote:
      "The AI bullet points are genuinely impressive. It understood my background as a nurse and wrote achievements I wouldn't have thought to include myself. I updated my resume in 20 minutes and had a job offer within 3 weeks.",
  },
  {
    initials: "PS",
    avatarColor: "#7c3aed",
    name: "Priya S.",
    role: "Product Manager",
    hiredAt: "Shopify",
    quote:
      "As a recent graduate, I had no idea how to write a resume. GetHiredToday walked me through every section and the AI filled in what I was missing. For $9.99 a month, it's the best money I've ever spent on my career.",
  },
];

const proFeatures = [
  { label: "Unlimited resumes", included: true },
  { label: "All 60+ templates", included: true },
  { label: "PDF + Word download", included: true },
  { label: "Full AI suggestions", included: true },
  { label: "AI bullet writer", included: true },
  { label: "ATS checker & score", included: true },
  { label: "Cover letter builder", included: true },
  { label: "Auto-apply to 50 jobs/day", included: true },
  { label: "Priority support", included: true },
  { label: "New templates monthly", included: true },
];

const blogPosts = [
  {
    category: "Resume Tips",
    readTime: "5 min read",
    title: "How to Write an ATS-Friendly Resume in 2025",
    excerpt:
      "Most resumes are rejected before a human ever reads them. Here's exactly how to format, keyword-optimize, and structure your resume so it passes every ATS filter.",
  },
  {
    category: "Career Advice",
    readTime: "7 min read",
    title: "10 Resume Mistakes That Are Costing You Interviews",
    excerpt:
      "From weak objective statements to missing metrics, these common errors are silently killing your chances. Fix them in under 30 minutes with our step-by-step guide.",
  },
  {
    category: "Resume Tips",
    readTime: "4 min read",
    title: "The Perfect Resume Summary: Examples That Work",
    excerpt:
      "A strong summary gives recruiters a reason to keep reading. We analyzed 10,000 successful resumes to find the exact formula that gets results — with real examples.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK VISUALS
───────────────────────────────────────────────────────────────────────────── */

/** Lightweight CSS-only resume card — replaces TemplatePreview in the hero to avoid a 54 KB render-blocking component above the fold. */
/** Hero product illustration — resume card with floating UI widgets */
function HeroProductIllustration() {
  const teal = "#4AB7A6";
  /* Note: animation classes (hero-float, hero-widget-*) are defined in the
     <style> block inside HomePage and applied via className below. */
  return (
    <div className="relative select-none" aria-hidden="true" style={{ minHeight: 480 }}>

      {/* ── Background glow ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 70% 30%, rgba(74,183,166,0.10) 0%, transparent 70%)",
      }} />

      {/* ── Main resume card ────────────────────────────────────────────── */}
      <div className="hero-float bg-white rounded-2xl overflow-hidden" style={{
        border: "1px solid #e8edf3",
        boxShadow: "0 20px 60px -10px rgba(15,23,42,0.12), 0 6px 20px -4px rgba(15,23,42,0.07)",
        marginRight: "3rem",
        marginBottom: "2.5rem",
      }}>
        {/* Resume header */}
        <div className="px-7 pt-6 pb-5" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-bold mb-0.5" style={{ color: "#0f172a" }}>Jordan Rivera</div>
              <div className="text-sm font-medium" style={{ color: teal }}>Senior Product Manager</div>
              <div className="flex gap-3 mt-2">
                {["jordan@email.com", "San Francisco, CA", "(415) 555-0182"].map((t, i) => (
                  <span key={i} className="text-[10px]" style={{ color: "#94a3b8" }}>{t}</span>
                ))}
              </div>
            </div>
            {/* Avatar circle */}
            <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-white text-lg font-bold" style={{
              background: `linear-gradient(135deg, ${teal} 0%, #2d9e8e 100%)`,
            }}>JR</div>
          </div>
        </div>

        {/* Resume body */}
        <div className="px-7 py-5 space-y-5">
          {/* Summary */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: teal }}>Professional Summary</div>
            <div className="space-y-1">
              {[100, 94, 88, 72].map((w, i) => (
                <div key={i} className="h-[5px] rounded-full bg-slate-100" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: teal }}>Experience</div>
            {[
              { title: "Senior Product Manager", co: "Acme Cloud", period: "2021 – Present", lines: [96, 80, 68] },
              { title: "Product Manager", co: "Bright Labs", period: "2018 – 2021", lines: [90, 74] },
            ].map((job) => (
              <div key={job.co} className="mb-4">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-[11px] font-semibold" style={{ color: "#1e293b" }}>{job.title}</span>
                  <span className="text-[9px]" style={{ color: "#94a3b8" }}>{job.period}</span>
                </div>
                <div className="text-[10px] mb-1.5" style={{ color: teal }}>{job.co}</div>
                <div className="space-y-1 pl-2.5" style={{ borderLeft: `1.5px solid ${teal}22` }}>
                  {job.lines.map((w, i) => (
                    <div key={i} className="h-[5px] rounded-full bg-slate-100" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Floating widget 1: ATS Score ────────────────────────────────── */}
      <div className="hero-widget-1 absolute bg-white rounded-2xl px-4 py-3 flex items-center gap-3" style={{
        top: "1.25rem",
        left: "-1rem",
        border: "1px solid #e8edf3",
        boxShadow: "0 8px 24px -4px rgba(15,23,42,0.12)",
        minWidth: 172,
      }}>
        {/* Score ring */}
        <div className="relative w-11 h-11 flex-shrink-0">
          <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#f1f5f9" strokeWidth="4" />
            <circle cx="20" cy="20" r="16" fill="none" stroke={teal} strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 16 * 0.94} ${2 * Math.PI * 16 * 0.06}`}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-bold" style={{ color: teal }}>94</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold" style={{ color: "#0f172a" }}>ATS Score</div>
          <div className="text-[10px]" style={{ color: "#22c55e" }}>Excellent match</div>
        </div>
      </div>

      {/* ── Floating widget 2: Skills panel ─────────────────────────────── */}
      <div className="hero-widget-2 absolute bg-white rounded-2xl p-4" style={{
        bottom: "3.5rem",
        right: 0,
        border: "1px solid #e8edf3",
        boxShadow: "0 8px 24px -4px rgba(15,23,42,0.12)",
        minWidth: 168,
      }}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold" style={{ color: "#0f172a" }}>Skills</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${teal}15`, color: teal }}>AI</span>
        </div>
        {["Product Strategy", "Data Analysis", "Roadmapping"].map((skill) => (
          <div key={skill} className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #f8fafc" }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: teal }} />
            <span className="text-[11px]" style={{ color: "#334155" }}>{skill}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: teal }}>+</div>
          <span className="text-[10px] font-semibold" style={{ color: teal }}>Add skill</span>
        </div>
      </div>

      {/* ── Floating widget 3: AI suggestion ────────────────────────────── */}
      <div className="hero-widget-3 absolute bg-white rounded-2xl px-4 py-3 flex items-center gap-3" style={{
        bottom: "0.25rem",
        left: "1rem",
        border: "1px solid #e8edf3",
        boxShadow: "0 8px 24px -4px rgba(15,23,42,0.12)",
        maxWidth: 240,
      }}>
        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${teal}18` }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: teal }} />
        </div>
        <span className="text-[11px]" style={{ color: "#64748b" }}>Improve this bullet with AI…</span>
      </div>

      {/* ── Floating badge: ATS Perfect pill ────────────────────────────── */}
      <div className="hero-widget-4 absolute flex items-center gap-2 px-3.5 py-2 rounded-full" style={{
        top: "5.5rem",
        right: "-0.5rem",
        backgroundColor: teal,
        boxShadow: "0 4px 14px -2px rgba(74,183,166,0.45)",
      }}>
        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        <span className="text-[11px] font-bold text-white">ATS Optimised</span>
      </div>

    </div>
  );
}

function FeatureVisualAIWriter() {
  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{ backgroundColor: "#ffffff", border: "1.5px solid #4AB7A6" }}
    >
      <div
        className="text-xs font-bold uppercase tracking-widest mb-4"
        style={{ color: "#4AB7A6" }}
      >
        AI Bullet Generator
      </div>

      {/* Input */}
      <div
        className="rounded-xl p-3 mb-3 text-sm text-slate-600"
        style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
      >
        <div className="text-xs font-medium text-slate-400 mb-1">Your experience</div>
        Managed a team at Shopify and helped with product launches...
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center my-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#4AB7A6" }}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Output bullets */}
      <div className="space-y-2.5">
        {[
          "Led 12-person cross-functional team, shipping 3 major product features to 1.4M+ users",
          "Drove 28% increase in activation rate through data-informed onboarding redesign",
          "Reduced time-to-launch by 40% by implementing agile sprint cadence across 4 teams",
        ].map((bullet, i) => (
          <div key={i} className="flex items-start gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: "#4AB7A6" }}
            />
            <p className="text-xs text-slate-700 leading-relaxed">{bullet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureVisualATSScore() {
  return (
    <div
      className="rounded-2xl p-6 h-full flex flex-col items-center justify-center gap-5"
      style={{ backgroundColor: "#f0fdf9", border: "1px solid #ccfbef" }}
    >
      <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4AB7A6" }}>
        ATS Analysis
      </div>

      {/* Score ring */}
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#4AB7A6"
            strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 50 * 0.94} ${2 * Math.PI * 50 * 0.06}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color: "#4AB7A6" }}>
            94
          </span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="w-full space-y-2.5">
        {[
          { label: "Keywords", val: 97 },
          { label: "Formatting", val: 100 },
          { label: "Readability", val: 91 },
          { label: "Contact Info", val: 100 },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-24">{item.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-200">
              <div
                className="h-1.5 rounded-full"
                style={{ backgroundColor: "#4AB7A6", width: `${item.val}%` }}
              />
            </div>
            <span className="text-xs font-semibold w-6 text-right" style={{ color: "#4AB7A6" }}>
              {item.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureVisualAutoApply() {
  const jobs = [
    { company: "Stripe",   title: "Product Manager",         match: 96, applied: true  },
    { company: "Airbnb",   title: "Senior Product Manager",  match: 91, applied: true  },
    { company: "Shopify",  title: "Growth PM",               match: 88, applied: true  },
    { company: "Linear",   title: "PM — Developer Tools",    match: 85, applied: false },
    { company: "Vercel",   title: "Product Manager",         match: 82, applied: false },
  ];
  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: "#ffffff", border: "1.5px solid #4AB7A6" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: "#4AB7A6" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4AB7A6" }}>
            Auto-Apply — Active
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }} />
          <span className="text-xs font-semibold text-green-600">Running</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Applied Today", value: "12" },
          { label: "This Week",     value: "47" },
          { label: "Match Rate",    value: "94%" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#f0fdf9" }}>
            <div className="text-lg font-bold" style={{ color: "#4AB7A6" }}>{stat.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {jobs.map((job) => (
          <div key={job.company} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ backgroundColor: "#4AB7A6" }}>
              {job.company[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "#0f172a" }}>{job.title}</p>
              <p className="text-[10px] text-slate-400">{job.company} · {job.match}% match</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{
              backgroundColor: job.applied ? "#f0fdf9" : "#f1f5f9",
              color: job.applied ? "#4AB7A6" : "#64748b",
            }}>
              {job.applied ? "✓ Applied" : "Queued"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────────────────
   FAQ
───────────────────────────────────────────────────────────────────────────── */

const faqs = [
  {
    q: "How does Auto-Apply work?",
    a: "After building your resume, go to the Auto-Apply section in your dashboard. Set your target job title, preferred location, and minimum match score. GetHiredToday will automatically find matching openings every day and submit applications on your behalf — up to 50 jobs per day. You get full visibility into every application and can pause or stop anytime.",
  },
  {
    q: "How does pricing work?",
    a: "GetHiredToday is $9.99/month — one plan with everything included. Unlimited resumes, all 60+ templates, PDF/Word download, full AI writing, ATS checking, and Auto-Apply. Cancel anytime.",
  },
  {
    q: "Is GetHiredToday ATS compatible?",
    a: "Absolutely. Every template is built with ATS requirements in mind — clean formatting, proper section headings, and machine-readable structure. Our built-in ATS Checker also scans your content for keyword gaps before you apply.",
  },
  {
    q: "How is this different from using a general AI chatbot?",
    a: "A general-purpose AI chatbot gives you raw text — you still have to format it, organize sections, check ATS compliance, and design the layout yourself. GetHiredToday does all of that automatically: AI writing + professional formatting + ATS checking + PDF export, in one place.",
  },
  {
    q: "Does it work for any industry?",
    a: "Yes. We have resume examples and AI writing tailored to 50+ industries including tech, healthcare, education, finance, sales, design, and more. The AI adjusts its suggestions based on your job title and field.",
  },
  {
    q: "Can I import my existing resume?",
    a: "You can manually enter your existing experience into the builder sections. Our AI will then help you rewrite and optimize each bullet point for maximum impact.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, absolutely. Cancel your Pro subscription any time — no questions asked, no cancellation fees. You keep access until the end of your billing period.",
  },
];

function HomeFAQ() {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "#4AB7A6" }}>FAQ</div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#0f172a" }}>
            Frequently Asked <span className="section-heading" style={{ color: "#4AB7A6" }}>Questions</span>
          </h2>
          <p style={{ color: "#64748b" }}>
            Still have questions?{" "}
            <a href="/contact" className="font-semibold hover:underline" style={{ color: "#4AB7A6" }}>
              Contact us
            </a>
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <ScrollReveal key={faq.q} delay={idx * 40}>
            <div
              className="bg-white rounded-2xl px-6 py-5 page-card-hover"
              style={{ border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}
            >
              <p className="font-semibold text-base mb-2" style={{ color: "#0f172a" }}>{faq.q}</p>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{faq.a}</p>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      {/* ─── Global page animations & polish ───────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

        /* ── Keyframes ── */
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroSlideRight {
          from { opacity: 0; transform: translateX(36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroPop {
          from { opacity: 0; transform: scale(0.80); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes accentPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }

        /* ── Hero entry animations ── */
        .hero-badge  { animation: heroFadeUp   0.55s ease both; animation-delay:   0ms; }
        .hero-h1     { animation: heroFadeUp   0.65s ease both; animation-delay:  80ms; }
        .hero-sub    { animation: heroFadeUp   0.65s ease both; animation-delay: 190ms; }
        .hero-ctas   { animation: heroFadeUp   0.60s ease both; animation-delay: 310ms; }
        .hero-trust  { animation: heroFadeUp   0.50s ease both; animation-delay: 430ms; }
        .hero-avatars{ animation: heroFadeIn   0.50s ease both; animation-delay: 560ms; }
        .hero-visual { animation: heroSlideRight 0.75s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 120ms; }

        /* ── Illustration widget pop-ins (staggered) ── */
        .hero-widget-1 { animation: heroPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 700ms; }
        .hero-widget-2 { animation: heroPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 900ms; }
        .hero-widget-3 { animation: heroPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 1050ms; }
        .hero-widget-4 { animation: heroPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; animation-delay: 820ms; }

        /* ── Gentle float on resume card ── */
        .hero-float { animation: heroFloat 5s ease-in-out infinite; animation-delay: 1.2s; }

        /* ── Teal accent on h1 ── */
        .hero-accent { color: #4AB7A6; }

        /* ── Button hover states ── */
        .page-btn-primary {
          box-shadow: 0 4px 14px -2px rgba(74,183,166,0.35);
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, opacity 0.18s ease;
        }
        .page-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -4px rgba(74,183,166,0.50);
        }
        .page-btn-primary:active {
          transform: scale(0.97) translateY(0);
          box-shadow: 0 2px 8px -2px rgba(74,183,166,0.30);
        }
        .page-btn-outline {
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .page-btn-outline:hover {
          transform: translateY(-2px);
          border-color: #94a3b8;
          box-shadow: 0 4px 12px rgba(15,23,42,0.06);
        }
        .page-btn-outline:active {
          transform: scale(0.97) translateY(0);
        }

        /* ── Section card hover lift ── */
        .page-card-hover {
          transition: transform 0.24s cubic-bezier(0.22,1,0.36,1), box-shadow 0.24s cubic-bezier(0.22,1,0.36,1), border-color 0.20s ease;
        }
        .page-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px -10px rgba(15,23,42,0.13) !important;
        }
        .page-card-hover:active {
          transform: translateY(-1px) scale(0.99);
        }

        /* ── Section heading serif accent ── */
        .section-heading {
          font-family: 'Instrument Serif', Georgia, serif;
          font-style: italic;
        }

        /* ── How it works connector dots ── */
        .step-number {
          font-family: 'Instrument Serif', Georgia, serif;
          font-style: italic;
        }
      `}</style>

      <Navbar />

      <main className="flex-1">

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1 — HERO + HIRED-AT LOGOS
        ════════════════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden pt-16 pb-14 lg:pt-28 lg:pb-24"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Subtle background mesh */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(74,183,166,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(74,183,166,0.04) 0%, transparent 40%)",
          }} />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

              {/* Left copy */}
              <div>
                {/* Subtle badge */}
                <div className="hero-badge inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(74,183,166,0.08)", border: "1px solid rgba(74,183,166,0.2)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#4AB7A6" }} />
                  <span className="text-xs font-medium" style={{ color: "#2d9e8e" }}>
                    Auto-apply to 50 jobs/day — included with Pro
                  </span>
                </div>

                <h1 className="hero-h1 text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.1] tracking-tight mb-5" style={{ color: "#0f172a" }}>
                  Your Resume Is<br />
                  Costing You<br />
                  <span className="hero-accent">Interviews.</span>
                </h1>

                <p className="hero-sub text-lg leading-relaxed mb-9" style={{ color: "#64748b", maxWidth: "420px" }}>
                  Build an ATS-optimised resume in minutes, then let AI automatically apply to matching jobs every day — while you focus on interviews.
                </p>

                {/* CTAs */}
                <div className="hero-ctas flex flex-col sm:flex-row gap-3 mb-8">
                  <Link
                    href="/upgrade?from=%2F"
                    className="page-btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-full"
                    style={{ backgroundColor: "#4AB7A6" }}
                  >
                    Get Started — $9.99/mo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/resume-templates"
                    className="page-btn-outline inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-full border"
                    style={{ color: "#334155", borderColor: "#e2e8f0", backgroundColor: "#ffffff" }}
                  >
                    View Templates
                  </Link>
                </div>

                {/* Trust strip */}
                <div className="hero-trust flex flex-wrap gap-x-5 gap-y-1.5 mb-8">
                  {["ATS-optimized templates", "Auto-apply 50 jobs/day", "Cancel anytime"].map((item) => (
                    <span key={item} className="flex items-center gap-1.5 text-xs" style={{ color: "#94a3b8" }}>
                      <Check className="w-3 h-3 flex-shrink-0" style={{ color: "#4AB7A6" }} strokeWidth={3} />
                      {item}
                    </span>
                  ))}
                </div>

                {/* Avatar strip */}
                <div className="hero-avatars flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {[
                      { initials: "M", bg: "#4AB7A6" },
                      { initials: "P", bg: "#a78bfa" },
                      { initials: "L", bg: "#38bdf8" },
                      { initials: "A", bg: "#fbbf24" },
                    ].map(({ initials, bg }) => (
                      <div
                        key={initials}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white"
                        style={{ backgroundColor: bg }}
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>Professionals landing jobs with AI</p>
                </div>
              </div>

              {/* Right — Product illustration */}
              <div className="hero-visual flex justify-center lg:justify-end">
                <div className="w-full max-w-sm lg:max-w-[420px] px-4 lg:px-0">
                  <HeroProductIllustration />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2 — TRUST BAR (STATS)
        ════════════════════════════════════════════════════════════════ */}
        <section
          className="py-12"
          style={{ backgroundColor: "#f8fafc", borderTop: "1px solid #e8edf3", borderBottom: "1px solid #e8edf3" }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] mb-10" style={{ color: "#b0bec5" }}>
              Trusted by professionals worldwide
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={stat.label} className={`text-center py-2 ${i < stats.length - 1 ? "md:border-r md:border-slate-200" : ""}`}>
                  <div className="text-[2.5rem] font-bold leading-none mb-2" style={{ color: "#4AB7A6", fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium" style={{ color: "#64748b" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3 — HOW IT WORKS
        ════════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-20 lg:py-28" style={{ backgroundColor: "#ffffff" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-14">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "#4AB7A6" }}>
                HOW IT WORKS
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#0f172a" }}>
                From Zero to Hired<br />
                <span className="section-heading" style={{ color: "#4AB7A6" }}>in 4 Simple Steps</span>
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: "#64748b" }}>
                Build your resume, pass ATS, then let AI apply to jobs for you — automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Step 1 */}
              <ScrollReveal delay={0}>
              <div
                className="page-card-hover bg-white rounded-2xl p-7 flex flex-col gap-5 h-full"
                style={{ border: "1px solid #e8edf3", boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}
              >
                <div className="flex items-start gap-3">
                  <span className="step-number text-5xl font-bold leading-none select-none" style={{ color: "#4AB7A6", opacity: 0.18 }}>
                    1
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#f0fdf9" }}
                  >
                    <Layout className="w-6 h-6" style={{ color: "#4AB7A6" }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#0f172a" }}>
                    Choose Your Template
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                    Browse 60+ professionally designed templates crafted for every industry. Pick
                    one that matches your style and career level.
                  </p>
                </div>
                {/* Mini template row */}
                <div className="flex gap-2 mt-auto pt-2">
                  {["#4AB7A6", "#334155", "#7c3aed"].map((color) => (
                    <div
                      key={color}
                      className="flex-1 rounded-lg overflow-hidden"
                      style={{ border: "1px solid #e2e8f0" }}
                    >
                      <div className="h-4" style={{ backgroundColor: color }} />
                      <div className="bg-white p-1.5 space-y-1">
                        <div className="h-1 rounded-full bg-slate-300" />
                        <div className="h-1 rounded-full bg-slate-200 w-4/5" />
                        <div className="h-1 rounded-full bg-slate-200 w-3/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </ScrollReveal>

              {/* Step 2 */}
              <ScrollReveal delay={80}>
              <div
                className="page-card-hover bg-white rounded-2xl p-7 flex flex-col gap-5 h-full"
                style={{ border: "1px solid #e8edf3", boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}
              >
                <div className="flex items-start gap-3">
                  <span className="step-number text-5xl font-bold leading-none select-none" style={{ color: "#4AB7A6", opacity: 0.18 }}>
                    2
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#f0fdf9" }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: "#4AB7A6" }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#0f172a" }}>
                    Let AI Write Your Content
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                    Enter your job title and experience. Our AI generates powerful bullet points,
                    professional summaries, and keyword-optimized content tailored to your role.
                  </p>
                </div>
                {/* AI writing mini mock */}
                <div
                  className="rounded-xl p-3 mt-auto"
                  style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                >
                  <div className="text-xs text-slate-400 mb-2">AI writing...</div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 mb-1.5" />
                  <div className="h-1.5 w-5/6 rounded-full bg-slate-200 mb-1.5" />
                  <div className="flex items-center gap-1">
                    <div
                      className="w-1.5 h-4 rounded-sm"
                      style={{ backgroundColor: "#4AB7A6", animation: "pulse 1s infinite" }}
                    />
                    <div className="h-1.5 w-12 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
              </ScrollReveal>

              {/* Step 3 */}
              <ScrollReveal delay={160}>
              <div
                className="page-card-hover bg-white rounded-2xl p-7 flex flex-col gap-5 h-full"
                style={{ border: "1px solid #e8edf3", boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}
              >
                <div className="flex items-start gap-3">
                  <span className="step-number text-5xl font-bold leading-none select-none" style={{ color: "#4AB7A6", opacity: 0.18 }}>
                    3
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#f0fdf9" }}
                  >
                    <Download className="w-6 h-6" style={{ color: "#4AB7A6" }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#0f172a" }}>
                    Download &amp; Pass ATS
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                    Export a pixel-perfect PDF scored for ATS compliance. Our checker flags every issue before you apply.
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-auto p-3 rounded-xl" style={{ backgroundColor: "#f0fdf9", border: "1px solid #ccfbef" }}>
                  <div className="w-10 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#ffffff", border: "1px solid #ccfbef" }}>
                    <FileText className="w-5 h-5" style={{ color: "#4AB7A6" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold" style={{ color: "#0f172a" }}>resume_final.pdf</div>
                    <div className="text-xs" style={{ color: "#4AB7A6" }}>ATS Score: 97/100</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-500" />
                        <div className="h-1 w-8 rounded-full bg-green-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </ScrollReveal>

              {/* Step 4 */}
              <ScrollReveal delay={240}>
              <div
                className="page-card-hover bg-white rounded-2xl p-7 flex flex-col gap-5 relative overflow-hidden h-full"
                style={{ border: "1.5px solid #4AB7A6", boxShadow: "0 4px 24px rgba(74,183,166,0.12)" }}
              >
                <div className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full text-white animate-badge-pop" style={{ backgroundColor: "#4AB7A6" }}>
                  NEW
                </div>
                <div className="flex items-start gap-3">
                  <span className="step-number text-5xl font-bold leading-none select-none" style={{ color: "#4AB7A6", opacity: 0.18 }}>
                    4
                  </span>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#f0fdf9" }}>
                    <Zap className="w-6 h-6" style={{ color: "#4AB7A6" }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#0f172a" }}>
                    Auto-Apply to Jobs
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                    Turn on Auto-Apply and GetHiredToday submits applications to matching jobs for you — every day, automatically, while you sleep.
                  </p>
                </div>
                <div className="mt-auto space-y-1.5">
                  {[
                    { co: "Stripe",  role: "Product Manager",  pct: 96 },
                    { co: "Airbnb",  role: "Senior PM",         pct: 91 },
                    { co: "Shopify", role: "Growth PM",         pct: 88 },
                  ].map((j) => (
                    <div key={j.co} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ backgroundColor: "#4AB7A6" }}>
                        {j.co[0]}
                      </div>
                      <p className="text-[11px] font-medium flex-1 truncate" style={{ color: "#0f172a" }}>{j.role}</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#f0fdf9", color: "#4AB7A6" }}>✓ {j.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 4 — FEATURE DEEP DIVES
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "#f8fafc" }} className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-16">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "#4AB7A6" }}>FEATURES</div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#0f172a" }}>
                Everything You Need to<br />
                <span className="section-heading" style={{ color: "#4AB7A6" }}>Beat the Competition</span>
              </h2>
            </div>

            <div className="space-y-28">

              {/* Feature A — text left, visual right */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#4AB7A6" }}>
                    AI CONTENT GENERATION
                  </div>
                  <h3 className="text-3xl font-bold mb-4" style={{ color: "#0f172a" }}>
                    Stop Guessing. Let AI Write Your Resume.
                  </h3>
                  <p className="leading-relaxed mb-6" style={{ color: "#64748b" }}>
                    Our AI analyzes your job title and experience level, then generates tailored
                    bullet points that showcase your impact. No more staring at a blank page. Every
                    bullet starts with a strong action verb and includes quantified achievements
                    wherever possible. The result is a resume that reads like it was written by a
                    professional career coach.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {[
                      "Role-specific bullet points",
                      "Quantified achievement statements",
                      "Action-verb powered",
                      "Industry-tailored language",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm font-medium" style={{ color: "#0f172a" }}>
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#4AB7A6" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/builder/resume"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all"
                    style={{ color: "#4AB7A6" }}
                  >
                    Try AI Writer
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div>
                  <FeatureVisualAIWriter />
                </div>
              </div>

              {/* Feature B — visual left, text right */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="order-2 lg:order-1">
                  <FeatureVisualATSScore />
                </div>
                <div className="order-1 lg:order-2">
                  <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#4AB7A6" }}>
                    ATS OPTIMIZATION
                  </div>
                  <h3 className="text-3xl font-bold mb-4" style={{ color: "#0f172a" }}>
                    Get Past Automated Screeners Every Time
                  </h3>
                  <p className="leading-relaxed mb-6" style={{ color: "#64748b" }}>
                    Over 90% of large companies use Applicant Tracking Systems to filter resumes
                    before a human ever reads them. Our ATS Checker scans your resume against 30+
                    criteria — keywords, formatting, section structure, contact info completeness
                    — and gives you an exact score with actionable fixes. Most users improve their
                    score by 30+ points in under 5 minutes.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {[
                      "30+ ATS criteria checked",
                      "Keyword gap analysis",
                      "Formatting compliance",
                      "Instant fixes suggested",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm font-medium" style={{ color: "#0f172a" }}>
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#4AB7A6" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/ats-checker"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all"
                    style={{ color: "#4AB7A6" }}
                  >
                    Check My Resume
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Feature D — Auto-Apply — visual right, text left */}
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4AB7A6" }}>
                      AUTO-APPLY
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#4AB7A6" }}>
                      NEW
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4" style={{ color: "#0f172a" }}>
                    Your Resume, Working 24/7
                  </h3>
                  <p className="leading-relaxed mb-6" style={{ color: "#64748b" }}>
                    Stop spending hours manually applying to jobs. With Auto-Apply, your resume works around the clock.
                    Set your job title, preferred location, and minimum match score — GetHiredToday finds relevant openings
                    and applies on your behalf, every single day. Wake up to new applications already submitted.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {[
                      "Apply to up to 50 jobs per day automatically",
                      "Only applies to jobs that match your criteria",
                      "Set a minimum match-score threshold",
                      "Full visibility into every application",
                      "Pause or stop anytime",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm font-medium" style={{ color: "#0f172a" }}>
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#4AB7A6" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/builder/wizard"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all"
                    style={{ color: "#4AB7A6" }}
                  >
                    Enable Auto-Apply
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div>
                  <FeatureVisualAutoApply />
                </div>
              </div>

              {/* Feature C — text left, visual right */}
              <ScrollReveal>
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full" style={{ color: "#4AB7A6", backgroundColor: "rgba(74,183,166,0.08)", border: "1px solid rgba(74,183,166,0.2)" }}>
                    <Layout className="w-3 h-3" />
                    Professional Templates
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight" style={{ color: "#0f172a" }}>
                    60+ Templates Designed<br />
                    <span className="section-heading" style={{ color: "#4AB7A6" }}>to Get Interviews</span>
                  </h3>
                  <p className="leading-relaxed mb-7 text-base" style={{ color: "#64748b", maxWidth: 440 }}>
                    Every template was designed with input from professional recruiters and tested
                    against major ATS systems. Choose from modern, classic, creative, executive, and
                    academic styles — all fully customizable with one click.
                  </p>

                  {/* Feature pills */}
                  <ul className="space-y-3 mb-9">
                    {[
                      { label: "ATS-tested formats", sub: "Passes all major applicant tracking systems" },
                      { label: "Recruiter-approved designs", sub: "Vetted by Fortune 500 hiring teams" },
                      { label: "One-click customization", sub: "Colors, fonts, and layout in seconds" },
                      { label: "New templates monthly", sub: "Always fresh, always relevant" },
                    ].map((item) => (
                      <li key={item.label} className="flex items-start gap-3 group">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: "rgba(74,183,166,0.12)" }}>
                          <Check className="w-3 h-3" style={{ color: "#4AB7A6" }} strokeWidth={3} />
                        </div>
                        <div>
                          <span className="text-sm font-semibold block" style={{ color: "#0f172a" }}>{item.label}</span>
                          <span className="text-xs" style={{ color: "#94a3b8" }}>{item.sub}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* CTA row */}
                  <div className="flex items-center gap-4">
                    <Link
                      href="/resume-templates"
                      className="page-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full"
                      style={{ backgroundColor: "#4AB7A6" }}
                    >
                      Browse All Templates
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <span className="text-xs text-slate-400">All 60+ templates included with Pro</span>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <FeatureVisualTemplates />
                </div>
              </div>
              </ScrollReveal>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 5 — RESUME EXAMPLES
        ════════════════════════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: "#f8fafc" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-12">
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#4AB7A6" }}>
                RESUME EXAMPLES BY INDUSTRY
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#0f172a" }}>
                See What a Great Resume Looks Like in Your Field
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: "#64748b" }}>
                Browse 500+ real resume examples across every industry and experience level.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
              {industries.map((item) => (
                <Link
                  key={item.title}
                  href="/resume-examples"
                  className="group bg-white rounded-xl p-5 flex flex-col gap-3 page-card-hover"
                  style={{
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-snug" style={{ color: "#0f172a" }}>
                      {item.title}
                    </h3>
                    <ArrowRight
                      className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                      style={{ color: "#4AB7A6" }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: "#f0fdf9", color: "#4AB7A6" }}
                    >
                      {item.badge}
                    </span>
                    <span className="text-xs" style={{ color: "#94a3b8" }}>{item.count}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/resume-examples"
                className="inline-flex items-center gap-1.5 font-semibold text-sm hover:gap-2.5 transition-all"
                style={{ color: "#4AB7A6" }}
              >
                Browse All 500+ Examples
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 6 — TEMPLATES SHOWCASE
        ════════════════════════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: "#ffffff" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#0f172a" }}>
                Professional Templates for Every Career
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl, idx) => (
                <ScrollReveal key={tpl.name} delay={idx * 70}>
                <div
                  className="group relative rounded-2xl overflow-hidden page-card-hover"
                  style={{ border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}
                >
                  {/* Rich resume preview */}
                  <div className="relative overflow-hidden bg-slate-100" style={{ height: "240px" }}>
                    <div className="absolute inset-0 flex items-stretch justify-stretch p-2">
                      <div
                        className="flex-1 rounded-lg overflow-hidden"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.08)" }}
                      >
                        <TemplatePreview layout={tpl.layout} accent={tpl.accent} />
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "rgba(15,23,42,0.45)" }}
                    >
                      <Link
                        href="/builder/resume"
                        className="px-6 py-2.5 rounded-full text-sm font-semibold bg-white hover:bg-slate-50 transition-colors shadow-lg"
                        style={{ color: "#4AB7A6" }}
                      >
                        Use Template →
                      </Link>
                    </div>

                    {/* PRO badge */}
                    {tpl.isPro && (
                      <div className="absolute top-3 left-3 text-[10px] font-bold bg-amber-400 text-amber-900 rounded-full px-2 py-0.5 shadow-sm animate-badge-pop">
                        PRO
                      </div>
                    )}
                  </div>

                  {/* Card info */}
                  <div className="px-4 py-3 flex items-center justify-between bg-white" style={{ borderTop: "1px solid #f1f5f9" }}>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "#0f172a" }}>{tpl.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{tpl.category}</div>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                    >
                      PRO
                    </span>
                  </div>
                </div>
                </ScrollReveal>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/resume-templates"
                className="inline-flex items-center gap-1.5 font-semibold text-sm hover:gap-2.5 transition-all"
                style={{ color: "#4AB7A6" }}
              >
                Browse All 60+ Templates
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 7 — TESTIMONIALS
        ════════════════════════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: "#f8fafc" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-12">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "#4AB7A6" }}>TESTIMONIALS</div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#0f172a" }}>
                Real People. Real Jobs.<br />
                <span className="section-heading" style={{ color: "#4AB7A6" }}>Real Results.</span>
              </h2>
              <p className="text-lg" style={{ color: "#64748b" }}>
                Here&apos;s what job seekers are saying after using GetHiredToday.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <ScrollReveal key={t.name} delay={idx * 100}>
                <div
                  className="page-card-hover bg-white rounded-2xl p-8 flex flex-col gap-4 h-full"
                  style={{
                    border: "1px solid #e8edf3",
                    boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
                  }}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="flex-1">
                    <div className="text-5xl leading-none select-none mb-1" style={{ color: "#4AB7A6", opacity: 0.2, fontFamily: "Georgia, serif" }}>&ldquo;</div>
                    <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                      {t.quote}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid #f1f5f9" }}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: t.avatarColor }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: "#0f172a" }}>{t.name}</div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>{t.role}</div>
                    </div>
                  </div>

                  {/* Hired badge */}
                  <div
                    className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#f0fdf9", color: "#4AB7A6" }}
                  >
                    <Check className="w-3 h-3" />
                    Hired at {t.hiredAt}
                  </div>
                </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 8 — PRICING TEASER
        ════════════════════════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: "#f0fdf9" }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-12">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "#4AB7A6" }}>PRICING</div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#0f172a" }}>
                One Plan.<br />
                <span className="section-heading" style={{ color: "#4AB7A6" }}>Everything Included.</span>
              </h2>
              <p className="text-lg" style={{ color: "#64748b" }}>
                Unlimited resumes, cover letters, AI writing, ATS scoring, and Auto-Apply — $9.99/month.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              {/* Single Pro card */}
              <div
                className="bg-white rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden"
                style={{
                  border: "2px solid #4AB7A6",
                  boxShadow: "0 12px 40px rgba(74,183,166,0.18)",
                }}
              >
                {/* All Inclusive badge */}
                <div
                  className="absolute top-0 right-0 px-4 py-1.5 text-xs font-bold text-white rounded-bl-2xl"
                  style={{ backgroundColor: "#4AB7A6" }}
                >
                  ALL INCLUSIVE
                </div>

                <div>
                  <span
                    className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                    style={{ backgroundColor: "#f0fdf9", color: "#4AB7A6" }}
                  >
                    Pro
                  </span>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold" style={{ color: "#4AB7A6" }}>$9.99</span>
                    <span className="text-sm mb-1.5" style={{ color: "#94a3b8" }}>/month</span>
                  </div>
                  <p className="text-sm mt-2 italic" style={{ color: "#64748b" }}>
                    Cancel anytime
                  </p>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                  {proFeatures.map((f) => (
                    <li key={f.label} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#4AB7A6" }} />
                      <span style={{ color: "#0f172a" }}>{f.label}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/upgrade?from=%2F"
                  className="block text-center py-3.5 px-6 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #4AB7A6 0%, #3aa492 100%)", boxShadow: "0 8px 24px -6px rgba(74,183,166,0.45)" }}
                >
                  Get Pro Access →
                </Link>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all"
                style={{ color: "#4AB7A6" }}
              >
                See Full Feature List
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 9 — BLOG PREVIEW
        ════════════════════════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28" style={{ backgroundColor: "#ffffff" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#0f172a" }}>
                Career Advice &amp; Resume Tips
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article
                  key={post.title}
                  className="bg-white rounded-xl flex flex-col gap-4 overflow-hidden transition-all hover:-translate-y-0.5"
                  style={{
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                  }}
                >
                  {/* Colored top accent */}
                  <div className="h-1.5" style={{ backgroundColor: "#4AB7A6" }} />

                  <div className="px-6 pb-6 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: "#f0fdf9", color: "#4AB7A6" }}
                      >
                        {post.category}
                      </span>
                      <span className="text-xs" style={{ color: "#94a3b8" }}>{post.readTime}</span>
                    </div>

                    <h3 className="text-base font-bold leading-snug" style={{ color: "#0f172a" }}>
                      {post.title}
                    </h3>

                    <p className="text-sm leading-relaxed flex-1" style={{ color: "#64748b" }}>
                      {post.excerpt}
                    </p>

                    <Link
                      href="/resources"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold mt-auto hover:gap-2.5 transition-all"
                      style={{ color: "#4AB7A6" }}
                    >
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 10 — PROBLEM SECTION
        ════════════════════════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28 relative overflow-hidden" style={{ backgroundColor: "#0c1220" }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, rgba(74,183,166,0.07) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(74,183,166,0.04) 0%, transparent 40%)",
          }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-5" style={{ color: "#4AB7A6" }}>
              THE PROBLEM
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              75% of Resumes Never Reach<br />
              <span className="section-heading" style={{ color: "#4AB7A6" }}>a Human Recruiter.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Applicant Tracking Systems automatically reject resumes that use the wrong keywords,
              formatting, or structure — before any human reads them. If you&apos;re not getting
              callbacks, your resume is failing ATS, not the recruiter.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {[
                { stat: "75%", label: "Resumes rejected by ATS before a human sees them" },
                { stat: "6 sec", label: "Average time a recruiter spends on a resume" },
                { stat: "3 min", label: "Time to build an ATS-ready resume with GetHiredToday" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl p-6" style={{ backgroundColor: "#1e293b" }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: "#4AB7A6" }}>{item.stat}</div>
                  <p className="text-sm text-slate-400 leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
            <Link
              href="/upgrade?from=%2F"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#4AB7A6" }}
            >
              Fix My Resume Now — Get Pro →
            </Link>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 11 — FAQ
        ════════════════════════════════════════════════════════════════ */}
        <HomeFAQ />

        {/* ════════════════════════════════════════════════════════════════
            SECTION 12 — FINAL CTA
        ════════════════════════════════════════════════════════════════ */}
        <section className="py-20 lg:py-28 relative overflow-hidden" style={{ backgroundColor: "#4AB7A6" }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle at 15% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)",
          }} />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff" }}>
              <Zap className="w-3.5 h-3.5" />
              Auto-Apply to 50 jobs/day — included with Pro
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Build Once.<br />
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", opacity: 0.9 }}>Apply Everywhere. Automatically.</span>
            </h2>
            <p className="text-lg text-white mb-10 max-w-xl mx-auto" style={{ opacity: 0.85 }}>
              Create your ATS-optimized resume in minutes, then turn on Auto-Apply and let
              GetHiredToday submit applications to matching jobs for you — every single day.
            </p>
            <Link
              href="/upgrade?from=%2F"
              className="page-btn-outline inline-flex items-center gap-2 px-10 py-4 rounded-full text-sm font-bold"
              style={{ backgroundColor: "#ffffff", color: "#4AB7A6", borderColor: "transparent" }}
            >
              Get Pro — Enable Auto-Apply →
            </Link>
            <p className="text-xs mt-6 text-white" style={{ opacity: 0.65 }}>
              $9.99/month · Cancel anytime · Powered by Gumroad
            </p>
          </div>
        </section>

      </main>

      <EmailCapture />
      <Footer />
    </div>
  );
}
