/**
 * Resume → job matching engine.
 * Pure functions — no IO. Importable on server and client.
 */
import type { ResumeData } from '@/types';
import type { Job, ResumeProfile, SeniorityLevel } from '@/types/jobs';

// ─── Resume profile extraction ─────────────────────────────────────────────────

const SENIORITY_KEYWORDS: Record<SeniorityLevel, string[]> = {
  entry:     ['entry', 'junior', 'associate', 'trainee', 'graduate', 'intern', '0-1', '1 year', '< 2'],
  junior:    ['junior', 'jr.', 'jr ', 'entry level', '1-2', '2 years'],
  mid:       ['mid', 'intermediate', 'ii', '2-4', '3-5', '2+ years', '3+ years'],
  senior:    ['senior', 'sr.', 'sr ', '5+', '6+', '7+', '5 years', '6 years', '7 years'],
  lead:      ['lead', 'tech lead', 'principal', 'staff'],
  manager:   ['manager', 'mgr', 'head of', 'engineering manager'],
  director:  ['director', 'vp', 'vice president', 'head of department'],
  executive: ['cto', 'ceo', 'coo', 'chief', 'founder', 'co-founder', 'president'],
};

function inferSeniority(titles: string[], yearsExp: number): SeniorityLevel {
  const joined = titles.join(' ').toLowerCase();
  for (const [level, keywords] of Object.entries(SENIORITY_KEYWORDS) as [SeniorityLevel, string[]][]) {
    if (keywords.some((kw) => joined.includes(kw))) return level;
  }
  // Fallback to experience-based
  if (yearsExp < 2) return 'entry';
  if (yearsExp < 4) return 'junior';
  if (yearsExp < 7) return 'mid';
  if (yearsExp < 12) return 'senior';
  return 'lead';
}

function yearsFromDate(dateStr: string | undefined | null): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  technology:   ['software', 'tech', 'engineering', 'developer', 'data', 'ai', 'cloud', 'devops', 'saas'],
  finance:      ['finance', 'banking', 'investment', 'accounting', 'fintech', 'insurance', 'trading'],
  healthcare:   ['healthcare', 'medical', 'hospital', 'clinical', 'pharma', 'biotech', 'nursing', 'health'],
  marketing:    ['marketing', 'growth', 'seo', 'social media', 'brand', 'content', 'digital marketing', 'advertising'],
  sales:        ['sales', 'account executive', 'business development', 'revenue', 'bdr', 'sdr'],
  design:       ['design', 'ux', 'ui', 'product design', 'graphic', 'creative'],
  education:    ['education', 'teaching', 'teacher', 'learning', 'curriculum', 'school'],
  legal:        ['legal', 'law', 'attorney', 'paralegal', 'compliance', 'counsel'],
  operations:   ['operations', 'supply chain', 'logistics', 'project management', 'pm', 'program manager'],
  hr:           ['hr', 'human resources', 'recruiting', 'talent', 'people ops'],
};

function inferIndustries(data: ResumeData): string[] {
  const text = [
    data.summary ?? '',
    ...(data.work_experience ?? []).map((j) => `${j.job_title} ${j.company} ${j.description}`),
    ...(data.skills ?? []).map((s) => s.name),
  ].join(' ').toLowerCase();

  return Object.entries(INDUSTRY_KEYWORDS)
    .filter(([, kws]) => kws.some((kw) => text.includes(kw)))
    .map(([industry]) => industry);
}

export function extractResumeProfile(data: ResumeData): ResumeProfile {
  const skills = (data.skills ?? []).map((s) => normalizeSkill(s.name)).filter(Boolean);

  const jobs = (data.work_experience ?? []).filter((j) => j.job_title && j.company);
  const job_titles = jobs.map((j) => j.job_title.toLowerCase().trim());

  // Calculate total years of experience
  const totalYears = jobs.reduce((sum, j) => {
    const start = yearsFromDate(j.start_date);
    const end = j.is_current ? 0 : yearsFromDate(j.end_date);
    return sum + Math.max(0, start - end);
  }, 0);
  const years_experience = Math.round(totalYears * 10) / 10;

  const seniority = inferSeniority(job_titles, years_experience);
  const industries = inferIndustries(data);

  const location = data.contact?.location ?? null;
  const open_to_relocation = false; // No relocation field in current schema

  return {
    skills,
    job_titles,
    seniority,
    years_experience,
    industries,
    location,
    open_to_relocation,
    employment_types: ['full_time'],
  };
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

const SKILL_WEIGHT      = 50;
const TITLE_WEIGHT      = 25;
const SENIORITY_WEIGHT  = 15;
const INDUSTRY_WEIGHT   = 10;

const SENIOR_MAP: Record<SeniorityLevel, number> = {
  entry: 1, junior: 2, mid: 3, senior: 4, lead: 5, manager: 5, director: 6, executive: 7,
};

// Common skill aliases: normalize .js suffixes, abbreviations, etc.
const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ['js', 'node', 'nodejs', 'node.js', 'es6', 'es2015', 'ecmascript'],
  typescript: ['ts'],
  react: ['react.js', 'reactjs', 'react native'],
  vue: ['vue.js', 'vuejs'],
  angular: ['angularjs', 'angular.js'],
  python: ['py', 'django', 'flask', 'fastapi'],
  java: ['spring', 'springboot', 'spring boot'],
  css: ['scss', 'sass', 'tailwind', 'bootstrap'],
  sql: ['mysql', 'postgresql', 'postgres', 'sqlite', 'mssql'],
  aws: ['amazon web services', 'ec2', 's3', 'lambda'],
  kubernetes: ['k8s'],
  docker: ['containers', 'containerization'],
  'machine learning': ['ml', 'deep learning', 'neural network', 'tensorflow', 'pytorch'],
  'artificial intelligence': ['ai', 'nlp', 'computer vision'],
  'project management': ['agile', 'scrum', 'kanban', 'jira'],
};

function normalizeSkill(skill: string): string {
  return skill.toLowerCase().replace(/\.js$/i, '').replace(/[-_]/g, ' ').trim();
}

function skillMatchesText(skill: string, text: string): boolean {
  const normalized = normalizeSkill(skill);
  if (text.includes(normalized)) return true;
  // Check aliases
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (normalized === canonical || aliases.includes(normalized)) {
      if (text.includes(canonical)) return true;
      if (aliases.some((a) => text.includes(a))) return true;
    }
  }
  return false;
}

function scoreSkillMatch(profileSkills: string[], jobText: string): { score: number; matched: string[] } {
  if (!profileSkills.length) return { score: 50, matched: [] }; // neutral when no skills listed
  const text = jobText.toLowerCase();
  const matched = profileSkills.filter((s) => skillMatchesText(s, text));
  const ratio = matched.length / profileSkills.length;
  // Non-linear — 30% skill match = meaningful, 60%+ = excellent
  const score = Math.min(100, Math.round(Math.pow(ratio, 0.6) * 100));
  return { score, matched };
}

function scoreTitleMatch(profileTitles: string[], jobTitle: string): number {
  const jt = jobTitle.toLowerCase();
  // Exact/substring match
  const exactMatch = profileTitles.some((t) => jt.includes(t) || t.includes(jt));
  if (exactMatch) return 100;
  // Token overlap
  const jtTokens = new Set(jt.split(/\s+/));
  const maxOverlap = Math.max(
    ...profileTitles.map((t) => {
      const tTokens = t.split(/\s+/);
      const overlap = tTokens.filter((tok) => jtTokens.has(tok)).length;
      return overlap / Math.max(tTokens.length, jtTokens.size);
    })
  );
  return Math.round(maxOverlap * 100);
}

function scoreSeniorityMatch(profileSeniority: SeniorityLevel, jobText: string): number {
  const text = jobText.toLowerCase();
  const profileLevel = SENIOR_MAP[profileSeniority];

  for (const [level, keywords] of Object.entries(SENIORITY_KEYWORDS) as [SeniorityLevel, string[]][]) {
    if (keywords.some((kw) => text.includes(kw))) {
      const jobLevel = SENIOR_MAP[level];
      const diff = Math.abs(profileLevel - jobLevel);
      if (diff === 0) return 100;
      if (diff === 1) return 70;
      if (diff === 2) return 30;
      return 0;
    }
  }
  return 60; // No seniority mentioned → neutral
}

function scoreIndustryMatch(profileIndustries: string[], jobText: string): number {
  if (!profileIndustries.length) return 50;
  const text = jobText.toLowerCase();
  const hit = profileIndustries.some((ind) => {
    const kws = INDUSTRY_KEYWORDS[ind] ?? [];
    return kws.some((kw) => text.includes(kw));
  });
  return hit ? 100 : 0;
}

export interface ScoreResult {
  score: number;
  reasons: string[];
}

export function scoreJobMatch(profile: ResumeProfile, job: Job): ScoreResult {
  const jobText = `${job.title} ${job.description ?? ''} ${job.category ?? ''}`;

  const { score: skillScore, matched: matchedSkills } = scoreSkillMatch(profile.skills, jobText);
  const titleScore    = scoreTitleMatch(profile.job_titles, job.title);
  const seniorScore   = scoreSeniorityMatch(profile.seniority, jobText);
  const industryScore = scoreIndustryMatch(profile.industries, jobText);

  const total = Math.round(
    (skillScore * SKILL_WEIGHT +
     titleScore * TITLE_WEIGHT +
     seniorScore * SENIORITY_WEIGHT +
     industryScore * INDUSTRY_WEIGHT) / 100
  );

  const reasons: string[] = [];

  if (matchedSkills.length > 0) {
    const display = matchedSkills.slice(0, 5).map((s) =>
      s.charAt(0).toUpperCase() + s.slice(1)
    ).join(', ');
    reasons.push(`Matches ${matchedSkills.length} of your skills (${display})`);
  }

  if (titleScore >= 70) reasons.push('Job title aligns with your experience');
  if (seniorScore >= 80) reasons.push('Seniority level is a good fit');
  if (industryScore === 100) reasons.push('Industry matches your background');

  return {
    score: Math.max(0, Math.min(100, total)),
    reasons,
  };
}

export function batchScoreJobs(
  profile: ResumeProfile,
  jobs: Job[]
): Array<{ job: Job; score: number; reasons: string[] }> {
  return jobs
    .map((job) => {
      const { score, reasons } = scoreJobMatch(profile, job);
      return { job, score, reasons };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
