/**
 * Single source of truth for every public business fact.
 * Schema, llms.txt, meta tags, the footer and FAQs all read from here.
 * Do not hard-code these facts anywhere else.
 */

/** Canonical host. The site is served on www; the apex redirects to it. */
export const SITE_URL = 'https://www.hiredtodayapp.com';

export const SITE = {
  name: 'GetHiredToday',
  alternateNames: ['Get Hired Today', 'HiredTodayApp', 'hiredtodayapp'],
  domain: 'www.hiredtodayapp.com',
  url: SITE_URL,
  email: 'hello@hiredtodayapp.com',
  /** Real social profile URLs only. Leave empty until they exist. */
  sameAs: [] as string[],
  twitterHandle: '@hiredtodayapp',
  logo: `${SITE_URL}/icon-512.png`,
  ogImage: `${SITE_URL}/og?title=Get%20hired%20faster%20with%20a%20resume%20that%20passes%20the%20ATS`,
  language: 'en',
  // foundingDate is intentionally omitted until the owner confirms it.
} as const;

/** One sentence, reused verbatim in schema, llms.txt, About and meta descriptions. */
export const ENTITY_DEFINITION =
  'GetHiredToday is an online resume builder and job search app that helps job seekers build ATS-friendly resumes, check their ATS score, write cover letters and apply to jobs.';

export const ENTITY_LONG_DESCRIPTION =
  'GetHiredToday lets you build a resume from professional templates with AI writing help, check how it scores in applicant tracking systems (ATS), write cover letters, search jobs and apply with a resume tailored to each role. Building one resume and downloading it as a PDF is free. Pro adds unlimited resumes, all templates, Word export, the full ATS report, job match scoring for every result and Auto-Apply.';

/** Prices live here so the site, schema and llms.txt never disagree. */
export const PRICING = {
  currency: 'USD',
  freePrice: 0,
  proMonthly: 9.99,
  /** The 3-month plan is not sold yet. Do not publish a price for it. */
  proQuarterly: null as number | null,
} as const;

export const FREE_FEATURES = [
  '1 resume',
  'Free template set',
  'PDF download (always free)',
  'ATS score and top 3 fixes',
  '5 AI bullet rewrites per day',
  'Job search, save and apply',
  'Top 3 job matches with match % per day',
  'Write and preview cover letters',
] as const;

export const PRO_FEATURES = [
  'Unlimited resumes',
  'All templates',
  'Word (.docx) export',
  'Full 30-point ATS report and job ad matching',
  'Unlimited AI bullet rewrites',
  'Match % on every job result',
  'Unlimited cover letter downloads',
  'Auto-Apply with review mode, up to 50 a day',
] as const;

/** Answer-first FAQs. Each answer must stand alone, because AI engines quote single sentences. */
export const SITE_FAQS: { q: string; a: string }[] = [
  {
    q: 'Is GetHiredToday free?',
    a: `Yes. You can build one resume, check its ATS score and download it as a PDF for free, with no card needed. Pro costs $${PRICING.proMonthly}/month and adds unlimited resumes, all templates, Word export, the full ATS report, match scores on every job and Auto-Apply.`,
  },
  {
    q: 'What is an ATS-friendly resume?',
    a: 'An ATS-friendly resume is formatted so applicant tracking systems can read it correctly: a single clear column, standard section headings, plain fonts and keywords that match the job ad. GetHiredToday scores your resume against these rules and shows the fixes.',
  },
  {
    q: 'Can I download my resume as a PDF for free?',
    a: 'Yes. PDF download is always free on every plan. Word (.docx) export is a Pro feature.',
  },
  {
    q: 'How does the ATS checker work?',
    a: 'You paste or upload your resume text, optionally with a job ad, and the checker scores it and lists what to fix. Free accounts see the score and the top 3 fixes, and Pro unlocks the full 30-point report with job ad matching.',
  },
  {
    q: 'What does Auto-Apply do?',
    a: 'Auto-Apply finds jobs that match your resume and queues applications with a resume tailored to each one. In review mode, which is the default, nothing is sent until you approve it. It is a Pro feature with a limit of 50 per day.',
  },
  {
    q: 'How do I cancel Pro?',
    a: 'Open Plan & billing and choose Cancel. It takes two clicks, you keep Pro until the end of the period you paid for, and your resumes stay in your account.',
  },
];

/** Key pages, used by llms.txt and the sitemap page. */
export const KEY_PAGES: { path: string; title: string; summary: string }[] = [
  { path: '/', title: 'Home', summary: 'Build a resume, check your ATS score and search jobs.' },
  { path: '/resume-templates', title: 'Resume templates', summary: 'ATS-friendly resume templates with live previews.' },
  { path: '/resume-examples', title: 'Resume examples', summary: 'Role-specific resume examples you can copy and edit.' },
  { path: '/ats-checker', title: 'Free ATS resume checker', summary: 'Score your resume and see the top fixes.' },
  { path: '/cover-letter', title: 'Cover letter builder', summary: 'Write a cover letter that matches your resume and the job ad.' },
  { path: '/jobs', title: 'Find jobs', summary: 'Search open roles and see your match before you apply.' },
  { path: '/auto-apply', title: 'Auto-Apply', summary: 'Queue tailored applications and approve each one.' },
  { path: '/pricing', title: 'Pricing', summary: 'Free plan and Pro plan details.' },
  { path: '/resources', title: 'Career advice', summary: 'Guides on resumes, cover letters, interviews and job search.' },
  { path: '/about', title: 'About', summary: 'Who builds GetHiredToday and why.' },
  { path: '/contact', title: 'Contact', summary: 'Get help or send feedback.' },
];

export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}
