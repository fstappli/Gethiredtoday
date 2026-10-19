'use client';

/**
 * Small reusable wizard UI pieces: Pro Tip boxes, Section tip intro pages,
 * Missing-info warning pills, and related-titles quick-pick.
 */

import { ReactNode, useState } from 'react';
import { Lightbulb, ChevronDown, ArrowRight, AlertCircle } from 'lucide-react';
import type { TemplateLayout } from '@/components/template-preview';

/* ─── Pro Tip box ───────────────────────────────────────────────────────── */
export function ProTipBox({
  children,
  label = 'Pro Tip',
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lightbulb className="w-3.5 h-3.5 text-emerald-700" />
      </div>
      <div className="text-sm text-slate-700 leading-relaxed">
        <span className="font-semibold text-emerald-700 mr-1">{label}:</span>
        {children}
      </div>
    </div>
  );
}

/* ─── Section tip intro page (shown before sections in wizard mode) ────── */
export interface SectionTipPageProps {
  title: string;
  sectionName: string;
  tips: string[];
  /** Which section to highlight in the mini template preview ("heading" | "experience" | "education" | "skills" | "summary") */
  highlightSection?: 'heading' | 'experience' | 'education' | 'skills' | 'summary';
  templateLayout?: TemplateLayout;
  accent?: string;
  onStart: () => void;
}

export function SectionTipPage({
  title,
  sectionName,
  tips,
  accent = '#4AB7A6',
  onStart,
}: SectionTipPageProps) {
  return (
    <div className="min-h-full flex items-center justify-center py-12">
      <div className="max-w-xl w-full text-center">
        {/* Decorative icon */}
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: accent + '18' }}
        >
          <Lightbulb className="w-7 h-7" style={{ color: accent }} />
        </div>

        <h2
          className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 leading-tight"
          style={{ letterSpacing: '-0.02em' }}
        >
          {title}
        </h2>
        <div className="text-lg font-bold text-slate-900 mb-6">{sectionName}</div>

        <div className="text-left max-w-md mx-auto mb-8 bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <div className="font-semibold text-slate-900 mb-3 text-center text-sm uppercase tracking-wider text-slate-500">
            Here&apos;s what you need to know
          </div>
          <ul className="space-y-2.5">
            {tips.map((tip, i) => (
              <li key={i} className="text-slate-700 text-sm leading-relaxed flex items-start gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: accent }}
                >
                  {i + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-10 py-3.5 rounded-full font-semibold text-white text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
          style={{ backgroundColor: accent }}
        >
          Let&apos;s go <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Missing-info warning pill ─────────────────────────────────────────── */
export function WarningPill({ text, onFix }: { text: string; onFix?: () => void }) {
  return (
    <button
      type="button"
      onClick={onFix}
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 hover:bg-amber-100 transition-colors"
    >
      <AlertCircle className="w-3 h-3" />
      {text}
    </button>
  );
}

/* ─── Related Job Titles quick-pick ─────────────────────────────────────── */
export function RelatedTitles({
  jobTitle,
  onPick,
}: {
  jobTitle: string;
  onPick: (title: string) => void;
}) {
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!jobTitle.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'related-titles', jobTitle: jobTitle.trim() }),
      });
      if (res.ok) {
        const { suggestions } = await res.json();
        setTitles(Array.isArray(suggestions) ? suggestions.slice(0, 6) : []);
      }
    } catch {}
    setLoading(false);
  };

  if (!jobTitle.trim()) return null;

  return (
    <div className="mt-2">
      {titles.length === 0 ? (
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="text-[11px] text-blue-600 hover:underline font-medium disabled:opacity-50"
        >
          {loading ? 'Finding related titles…' : '+ See related job titles'}
        </button>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mr-1">
            Related:
          </span>
          {titles.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPick(t)}
              className="text-[11px] font-medium text-blue-700 hover:text-blue-900 hover:underline"
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Expandable section (used for "Additional coursework" etc) ─────────── */
export function ExpandableSection({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-slate-100">{children}</div>}
    </div>
  );
}

/* ─── Section tip content catalog ───────────────────────────────────────── */
export const SECTION_TIPS: Record<string, { title: string; sectionName: string; tips: string[]; proTip: string }> = {
  contact: {
    title: "Let's get in touch",
    sectionName: 'Contact Information',
    tips: [
      'Employers need to reach you fast, include a professional email and phone number.',
      'Adding a LinkedIn URL signals you\u2019re active and easy to verify.',
      'City and region are enough for location, no need for your full street address.',
    ],
    proTip: 'Use a professional email format (firstname.lastname@…). Skip old nicknames or numbers.',
  },
  summary: {
    title: 'Tell them why you stand out',
    sectionName: 'Professional Summary',
    tips: [
      'Write a 2-4 sentence elevator pitch focused on value, not responsibilities.',
      'Lead with your role, years of experience, and one signature achievement.',
      'Close with what you bring to your next role, quantify when you can.',
    ],
    proTip: 'Hiring managers read the summary first. Front-load your strongest, most relevant headline.',
  },
  experience: {
    title: "Now, let's fill out your",
    sectionName: 'Work history',
    tips: [
      'Employers scan your resume to see if you\u2019re a match.',
      'Lead each bullet with a strong action verb, Built, Led, Reduced, Delivered.',
      'Quantify impact: %, $, users, time saved, specifics win interviews.',
      'We\u2019ll suggest expert-written bullets tailored to your title.',
    ],
    proTip: 'Reverse-chronological order is the ATS-friendly standard. Start with your most recent role and work backward.',
  },
  education: {
    title: "Great, let's work on your",
    sectionName: 'Education',
    tips: [
      'Employers quickly scan the education section for the degree and school.',
      'If you graduated more than 10 years ago, the degree line is enough, skip dates.',
      'Adding a GPA above 3.5 is a plus; otherwise leave it off.',
    ],
    proTip: 'If your degree is still in progress, list the expected graduation year, employers expect it.',
  },
  skills: {
    title: "Next, let's take care of your",
    sectionName: 'Skills',
    tips: [
      'ATS systems scan for skill keywords, match the ones in the job description.',
      'Mix hard skills (tools, software, methodologies) with 2-3 soft skills.',
      'We\u2019ll suggest the top skills recruiters look for in your role.',
    ],
    proTip: 'Aim for 8-12 skills. More than that looks padded and less trustworthy.',
  },
  certifications: {
    title: 'Certifications & credentials',
    sectionName: 'Certifications',
    tips: [
      'Industry certs signal real expertise, especially in regulated fields.',
      'Include the issuer and year. If it\u2019s still active, mention the expiry.',
      'List the most relevant first, then the rest in reverse-chronological order.',
    ],
    proTip: 'Role-specific certs (AWS, PMP, SHRM, ACLS) can move you past ATS screens. Feature them prominently.',
  },
  languages: {
    title: 'Languages',
    sectionName: 'Languages',
    tips: [
      'List languages you can hold a conversation in or read professionally.',
      'Include your proficiency level (Native, Fluent, Professional, Intermediate).',
      'If the role is global, languages can be a strong differentiator.',
    ],
    proTip: 'Be accurate with proficiency, recruiters may test. "Professional" means business-meeting level.',
  },
  projects: {
    title: 'Projects',
    sectionName: 'Projects',
    tips: [
      'Perfect for entry-level or career changers, show work you\u2019ve done even without a job title.',
      'Lead with the problem and outcome; keep it tight.',
      'Link to a GitHub repo, portfolio, or case study if possible.',
    ],
    proTip: 'Quantify project impact the same way you would a job bullet, users, growth, time saved.',
  },
  volunteer: {
    title: 'Volunteer work',
    sectionName: 'Volunteer',
    tips: [
      'Great signal for leadership and community involvement, especially at non-profits.',
      'Treat it like a job entry, use action verbs and quantify impact.',
      'Recent or multi-year commitments read stronger than one-off events.',
    ],
    proTip: 'Volunteer roles can also demonstrate transferable skills if your career is shifting industries.',
  },
  custom: {
    title: 'Custom sections',
    sectionName: 'Custom',
    tips: [
      'Use this for Publications, Awards, Speaking, Patents, or industry-specific sections.',
      'Keep the format consistent with the rest of your resume.',
      'If a category isn\u2019t helping your case, cut it, less is more.',
    ],
    proTip: 'Only add a custom section if it meaningfully differentiates you. Otherwise, strengthen existing sections.',
  },
};
