/**
 * ATS scoring, pure functions, importable on both the server (API route) and
 * the client (builder save, dashboard rendering).
 *
 * Single source of truth for:
 *   • `resumeDataToText(data)`, flattens a structured ResumeData object into
 *     the plain-text block the scorer expects. Used by the builder when it
 *     auto-scores on save, by the dashboard when it recomputes scores on-the-
 *     fly, and by the resume-import flow when it seeds the initial score.
 *   • `calculateATSScore(text, jobDescription?)`, runs the 30-point rubric
 *     on a resume text and returns the structured `ATSCheckResult`.
 *   • `scoreResume(data, jobDescription?)`, convenience helper that
 *     combines the two and returns just the overall_score number.
 *
 * Keeping this in one file means we can never drift between "what the builder
 * saves" and "what the public /ats-checker shows" and "what the dashboard
 * displays". Previously the dashboard read a stored `ats_score` column that
 * could be months stale if the user edited without clicking Save.
 */

import type { ResumeData, ATSCheckResult } from '@/types';

/* ─── Placeholder detection ───────────────────────────────────────────────
 * The starter template in lib/example-to-resume.ts fills every field with
 * dummy values ("Your Name", "your.email@example.com", "+1 (555) 123-4567",
 * "Replace this with 2-3 sentences…"). Without filtering, those placeholder
 * values satisfy every section check in the ATS rubric and score 100, even
 * though the resume is obviously not ready to send.
 *
 * The functions below recognise the starter-template strings + obvious
 * placeholder patterns, and let the scorer treat those fields as "empty"
 * so the score reflects actual filled-in content.
 * ──────────────────────────────────────────────────────────────────────── */

const PLACEHOLDER_NAMES = new Set(['your name', 'full name', 'candidate name']);
const PLACEHOLDER_SUMMARY_MARKERS = [
  'replace this with',
  'highlight your unique strengths',
  'results-oriented professional with a track record of delivering measurable impact across cross-functional teams',
];
const PLACEHOLDER_JOB_TITLES = new Set([
  'your most recent role',
  'previous role',
  'job title',
]);
const PLACEHOLDER_COMPANIES = new Set([
  'company name',
  'previous company',
  'employer',
]);
const PLACEHOLDER_FIELDS_OF_STUDY = new Set(['your major', 'field of study']);
const PLACEHOLDER_INSTITUTIONS = new Set(['university name', 'school name']);

function isPlaceholderName(s: string | undefined | null): boolean {
  if (!s) return true;
  return PLACEHOLDER_NAMES.has(s.trim().toLowerCase());
}

function isPlaceholderEmail(s: string | undefined | null): boolean {
  if (!s) return true;
  const e = s.trim().toLowerCase();
  return (
    e.endsWith('@example.com') ||
    e.endsWith('@test.com') ||
    e.endsWith('@domain.com') ||
    e.startsWith('your.email@') ||
    e.startsWith('youremail@') ||
    e === 'name@example.com'
  );
}

function isPlaceholderPhone(s: string | undefined | null): boolean {
  if (!s) return true;
  const digits = s.replace(/\D/g, '');
  // "(555) 123-4567" and variants are Hollywood placeholder phones.
  return digits.includes('5551234567') || digits.endsWith('0000000') || digits === '';
}

function isPlaceholderLocation(s: string | undefined | null): boolean {
  if (!s) return true;
  const v = s.trim().toLowerCase();
  return v === 'city, state' || v === 'city' || v === 'your city';
}

function isPlaceholderLinkedIn(s: string | undefined | null): boolean {
  if (!s) return true;
  const v = s.trim().toLowerCase();
  return v.includes('yourname') || v.endsWith('/in/') || v === 'linkedin.com/in/yourname';
}

function isPlaceholderSummary(s: string | undefined | null): boolean {
  if (!s) return true;
  const v = s.trim().toLowerCase();
  return PLACEHOLDER_SUMMARY_MARKERS.some((marker) => v.includes(marker));
}

function isPlaceholderJobTitle(s: string | undefined | null): boolean {
  if (!s) return true;
  return PLACEHOLDER_JOB_TITLES.has(s.trim().toLowerCase());
}

function isPlaceholderCompany(s: string | undefined | null): boolean {
  if (!s) return true;
  return PLACEHOLDER_COMPANIES.has(s.trim().toLowerCase());
}

function isPlaceholderAchievement(s: string | undefined | null): boolean {
  if (!s) return true;
  const v = s.trim().toLowerCase();
  // The starter has achievements with "(replace with your own win)" etc.
  return (
    v.includes('replace with your own') ||
    v.includes('x%') ||
    v.includes('y+ customers') ||
    v.includes('$z in new revenue') ||
    v.includes('drove x%') ||
    v.includes('measurable outcome')
  );
}

function isPlaceholderInstitution(s: string | undefined | null): boolean {
  if (!s) return true;
  return PLACEHOLDER_INSTITUTIONS.has(s.trim().toLowerCase());
}

function isPlaceholderField(s: string | undefined | null): boolean {
  if (!s) return true;
  return PLACEHOLDER_FIELDS_OF_STUDY.has(s.trim().toLowerCase());
}

/** Return a copy of ResumeData with obvious placeholder values stripped out
 *  so the scoring rubric doesn't credit the resume for starter-template
 *  content. Used by both dashboard live-scoring and the builder save flow. */
function stripPlaceholders(data: ResumeData): ResumeData {
  const c = data.contact ?? ({} as ResumeData['contact']);

  const cleanedWork = (data.work_experience ?? []).filter(
    (j) => !isPlaceholderJobTitle(j.job_title) || !isPlaceholderCompany(j.company)
  ).map((j) => ({
    ...j,
    job_title: isPlaceholderJobTitle(j.job_title) ? '' : j.job_title,
    company: isPlaceholderCompany(j.company) ? '' : j.company,
    description: j.description,
    achievements: (j.achievements ?? []).filter((a) => !isPlaceholderAchievement(a)),
  }));

  const cleanedEdu = (data.education ?? []).filter(
    (e) => !isPlaceholderInstitution(e.institution) || !isPlaceholderField(e.field_of_study)
  );

  return {
    ...data,
    contact: {
      ...c,
      full_name: isPlaceholderName(c.full_name) ? '' : c.full_name,
      email: isPlaceholderEmail(c.email) ? '' : c.email,
      phone: isPlaceholderPhone(c.phone) ? '' : c.phone,
      location: isPlaceholderLocation(c.location) ? '' : c.location,
      linkedin: isPlaceholderLinkedIn(c.linkedin) ? '' : (c.linkedin ?? ''),
    },
    summary: isPlaceholderSummary(data.summary) ? '' : data.summary,
    work_experience: cleanedWork,
    education: cleanedEdu,
  };
}

/** Flatten structured resume data into a plain-text block the scorer can read. */
export function resumeDataToText(data: ResumeData): string {
  const parts: string[] = [];
  const c = data.contact ?? ({} as ResumeData['contact']);

  if (c.full_name) parts.push(c.full_name);
  if (c.email) parts.push(c.email);
  if (c.phone) parts.push(c.phone);
  if (c.location) parts.push(c.location);
  if (c.linkedin) parts.push(c.linkedin);
  if (c.website) parts.push(c.website);
  if (c.github) parts.push(c.github);

  if (data.summary) parts.push('Summary\n' + data.summary);

  if (data.work_experience?.length) {
    parts.push('Work Experience');
    for (const j of data.work_experience) {
      parts.push(`${j.job_title || ''} at ${j.company || ''}`);
      if (j.location) parts.push(j.location);
      if (j.description) parts.push(j.description);
      j.achievements?.forEach((a) => a && parts.push(a));
    }
  }

  if (data.education?.length) {
    parts.push('Education');
    for (const e of data.education) {
      parts.push(`${e.degree || ''} ${e.field_of_study || ''} ${e.institution || ''}`);
      if (e.location) parts.push(e.location);
      if (e.description) parts.push(e.description);
    }
  }

  if (Array.isArray(data.skills) && data.skills.length) {
    parts.push('Skills');
    parts.push(data.skills.map((s) => s?.name).filter(Boolean).join(', '));
  }

  if (data.certifications?.length) {
    parts.push('Certifications');
    for (const cert of data.certifications) {
      parts.push(`${cert.name || ''} ${cert.issuer || ''}`);
    }
  }

  if (data.languages?.length) {
    parts.push('Languages');
    parts.push(data.languages.map((l) => l?.name).filter(Boolean).join(', '));
  }

  if (data.projects?.length) {
    parts.push('Projects');
    for (const p of data.projects) {
      parts.push(p.name || '');
      if (p.description) parts.push(p.description);
      if (p.technologies?.length) parts.push(p.technologies.join(', '));
    }
  }

  if (data.volunteer_work?.length) {
    parts.push('Volunteer Work');
    for (const v of data.volunteer_work) {
      parts.push(`${v.role || ''} at ${v.organization || ''}`);
      if (v.description) parts.push(v.description);
    }
  }

  if (Array.isArray(data.custom_sections)) {
    for (const sec of data.custom_sections) {
      if (!sec) continue;
      if (sec.title) parts.push(sec.title);
      for (const it of sec.items ?? []) {
        if (!it) continue;
        parts.push([it.title, it.subtitle, it.date].filter(Boolean).join(' '));
        if (it.description) parts.push(it.description);
      }
    }
  }

  return parts.filter(Boolean).join('\n');
}

/* ─── Scoring helpers (all linear-time; safe on hostile input) ──────────── */

/** Hard cap so a huge paste can never stall a request. Callers should reject earlier with a 413. */
export const MAX_ATS_TEXT_CHARS = 60_000;
export const MAX_ATS_JD_CHARS = 20_000;

const EMAIL_TOKEN = /^[\w.+-]{1,64}@[\w-]{1,63}(?:\.[\w-]{1,63})*\.[a-z]{2,}$/i;

/** Token scan instead of one big regex: a regex like [\w.-]+@... goes quadratic on a long token without "@". */
function hasEmailAddress(text: string): boolean {
  for (const raw of text.split(/\s+/)) {
    if (raw.length < 6 || raw.length > 320 || !raw.includes('@')) continue;
    const tok = raw.replace(/^[<([{"'`:;,|]+|[>)\]}"'`:;,.|]+$/g, '');
    if (EMAIL_TOKEN.test(tok)) return true;
  }
  return false;
}

// US-style numbers need separators or brackets; international numbers need a leading +; or a "phone/tel/mobile" label.
const PHONE_US = /\(\d{3}\)\s?\d{3}[\s.-]?\d{4}|\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/;
const PHONE_INTL = /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?(?:[\s.-]?\d{2,5}){2,4}/;
const PHONE_LABELLED = /(?:phone|tel|mobile|cell|whatsapp)[^\d\n]{0,12}\+?\d[\d\s().-]{6,16}\d/;

function hasPhoneNumber(text: string): boolean {
  return PHONE_US.test(text) || PHONE_INTL.test(text) || PHONE_LABELLED.test(text);
}

/** True when a short line looks like a section heading ("Work Experience", "SKILLS:") or starts "Skills: ...". */
function hasHeading(lines: string[], words: string): boolean {
  const inHeading = new RegExp(`\\b(?:${words})\\b`);
  const labelled = new RegExp(`^(?:${words})\\s*[:\\-\u2013\\u2014]`);
  return lines.some((l) => (l.length <= 40 && inHeading.test(l)) || labelled.test(l));
}

function hasTableLikeText(text: string): boolean {
  if (text.includes('colspan') || text.includes('rowspan') || text.includes('<table')) return true;
  const lines = text.split('\n');
  let pipes = 0;
  let tabs = 0;
  for (const l of lines) {
    if ((l.match(/\|/g) ?? []).length >= 2) pipes++;
    if ((l.match(/\t/g) ?? []).length >= 2) tabs++;
  }
  return pipes >= 2 || tabs >= 3;
}

const JD_STOPWORDS = new Set([
  'about', 'above', 'after', 'again', 'ability', 'across', 'being', 'candidate', 'company', 'could', 'every', 'first', 'great',
  'having', 'including', 'looking', 'might', 'other', 'others', 'people', 'please', 'preferred', 'required', 'requirements',
  'responsibilities', 'should', 'since', 'strong', 'their', 'there', 'these', 'those', 'through', 'under', 'until', 'using',
  'where', 'which', 'while', 'whose', 'within', 'without', 'would', 'years', 'year', 'experience', 'skills', 'working', 'team',
  'role', 'position', 'applicants', 'applicant', 'benefits', 'opportunity', 'excellent', 'must', 'will',
]);
// Short but meaningful tokens that the length filter would otherwise drop.
const SHORT_KEYWORDS = new Set([
  'aws', 'sql', 'php', 'css', 'html', 'api', 'apis', 'ux', 'ui', 'sap', 'crm', 'seo', 'sem', 'erp', 'qa', 'ml', 'ai', 'ios', 'gcp',
  'git', 'nlp', 'bi', 'etl', 'c++', 'c#', '.net', 'go', 'r', 'sas', 'vba', 'ci/cd', 'b2b', 'b2c', 'saas', 'java', 'ruby', 'rust',
  'node', 'react', 'excel', 'agile', 'scrum', 'jira',
]);

function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9][a-z0-9+#./-]*[a-z0-9+#]|[a-z0-9]/g) ?? [];
}
const stem = (w: string) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w);

/** Text of a saved resume exactly as the card, builder and dashboard score it (starter-template placeholders removed). */
export function resumeDataToScoreText(data: ResumeData): string {
  return resumeDataToText(stripPlaceholders(data));
}

/** The core 30-point ATS rubric. Pure function, no IO, no state. */
export function calculateATSScore(
  resumeText: string,
  jobDescription?: string
): ATSCheckResult {
  const text = (resumeText ?? '').slice(0, MAX_ATS_TEXT_CHARS).toLowerCase();
  const jd = jobDescription ? jobDescription.slice(0, MAX_ATS_JD_CHARS) : undefined;
  const lines = text.split('\n').map((l) => l.trim().replace(/^[\s\u2022*#>_=-]+|[\s*_=-]+$/g, '')).filter(Boolean);
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Contact info checks
  const hasEmail = hasEmailAddress(text);
  const hasPhone = hasPhoneNumber(text);
  const hasLinkedIn = /linkedin\.com\/(?:in|pub|company)\//.test(text);

  // Section checks (headings, not words that merely appear in prose)
  const hasSummary = hasHeading(lines, 'summary|objective|profile|about me|professional profile');
  const hasExperience = hasHeading(lines, 'experience|employment|work history|career history');
  const hasEducation =
    hasHeading(lines, 'education|academic background|qualifications') ||
    /\b(?:university|college|bachelor|master of|b\.?sc|m\.?sc|ph\.?d|mba)\b/.test(text);
  const hasSkills = hasHeading(lines, 'skills|technologies|proficiencies|competencies|tools');

  // Formatting red flags
  const hasTableKeywords = hasTableLikeText(text);
  const hasGraphicKeywords = text.includes('<svg') || text.includes('<img');

  // Score calculation
  if (hasEmail) score += 10; else issues.push('Missing email address');
  if (hasPhone) score += 8; else issues.push('Missing phone number');
  if (hasLinkedIn) score += 5; else suggestions.push('Add your LinkedIn profile URL');
  if (hasSummary) score += 12; else { score -= 5; issues.push('No professional summary detected'); }
  if (hasExperience) score += 20; else issues.push('Work experience section missing or not clearly labeled');
  if (hasEducation) score += 10; else suggestions.push('Add education section');
  if (hasSkills) score += 12; else { issues.push('Skills section missing'); suggestions.push('Add a dedicated Skills section'); }
  if (!hasTableKeywords) score += 8;
  if (!hasGraphicKeywords) score += 5;

  // Length check (CJK text has no spaces: count roughly two characters per word)
  const cjkChars = (text.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) ?? []).length;
  const wordCount = text.split(/\s+/).filter(Boolean).length + Math.round(cjkChars / 2);
  if (wordCount >= 300 && wordCount <= 800) score += 10;
  else if (wordCount < 300) {
    issues.push('Resume appears too short (under 300 words)');
    suggestions.push('Expand work experience bullet points with quantified achievements');
  } else {
    suggestions.push('Resume may be too long for ATS, aim for 1-2 pages');
  }

  // Keyword matching: distinct meaningful words from the job ad, matched as whole words
  let keywordScore = 0;
  let jobWords: string[] = [];
  if (jd) {
    const seen = new Set<string>();
    for (const w of tokenize(jd)) {
      const k = stem(w);
      if (JD_STOPWORDS.has(w) || JD_STOPWORDS.has(k)) continue;
      if (w.length > 4 || SHORT_KEYWORDS.has(w)) seen.add(k);
    }
    jobWords = [...seen];
  }
  if (jobWords.length) {
    const resumeTokens = new Set(tokenize(text).map(stem));
    const matches = jobWords.filter((w) => resumeTokens.has(w));
    keywordScore = Math.min(20, Math.round((matches.length / jobWords.length) * 20));
    score += keywordScore;
    if (keywordScore < 10) suggestions.push('Add more keywords from the job description');
  } else {
    score += 10; // neutral if no usable job description
  }

  // Weights add up to 110 without a job ad (the neutral 10 stands in for keywords) and 120 with one.
  // Scale to 100 so a missing section always costs points instead of hiding under a cap.
  const maxPoints = jobWords.length ? 120 : 110;
  score = Math.max(0, Math.min(100, Math.round((score / maxPoints) * 100)));

  return {
    overall_score: score,
    sections: {
      keywords: {
        score: jobWords.length ? keywordScore * 5 : 70,
        issues: [],
        suggestions: jobWords.length ? [] : ['Paste a job description for targeted keyword analysis'],
      },
      formatting: {
        score: !hasTableKeywords && !hasGraphicKeywords ? 90 : 50,
        issues: hasTableKeywords ? ['Tables detected, ATS may fail to parse'] : [],
        suggestions: ['Use simple formatting with no tables or graphics'],
      },
      structure: {
        score: hasSummary && hasExperience && hasEducation && hasSkills ? 95 : 60,
        issues: [],
        suggestions: [],
      },
      contact: {
        score: hasEmail && hasPhone ? 95 : hasEmail ? 70 : 40,
        issues: !hasEmail ? ['No email found'] : [],
        suggestions: !hasPhone ? ['Add phone number'] : [],
      },
      experience: {
        score: hasExperience ? 85 : 30,
        issues: !hasExperience ? ['Work experience section not found'] : [],
        suggestions: ['Use bullet points with quantified achievements (e.g., "Increased sales by 30%")'],
      },
    },
    top_issues: issues.slice(0, 5),
    top_suggestions: suggestions.slice(0, 5),
  };
}

/** Convenience helper, score a structured resume and return just the number.
 *  Placeholder values from the starter template (Your Name, your.email@
 *  example.com, "Replace this with…") are stripped before scoring so a
 *  brand-new resume that hasn't been edited reads as near-zero instead of 100. */
export function scoreResume(data: ResumeData, jobDescription?: string): number {
  const cleaned = stripPlaceholders(data);
  const text = resumeDataToText(cleaned);
  if (!text.trim()) return 0;
  return calculateATSScore(text, jobDescription).overall_score;
}
