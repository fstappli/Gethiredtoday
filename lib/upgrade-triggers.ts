/** Contextual upgrade moments. Each checkout start is tagged with one of these (`/upgrade?from=<trigger>`). */
export const UPGRADE_TRIGGERS = [
  'word_export',
  'second_resume',
  'locked_matches',
  'auto_apply',
  'cover_letter_download',
  'full_ats_report',
  'ai_limit',
  'templates',
  'nav',
  'billing',
  'pricing',
] as const;

export type UpgradeTrigger = (typeof UPGRADE_TRIGGERS)[number];

export function isUpgradeTrigger(v: unknown): v is UpgradeTrigger {
  return typeof v === 'string' && (UPGRADE_TRIGGERS as readonly string[]).includes(v);
}

export function upgradeHref(trigger: UpgradeTrigger, plan?: 'monthly' | 'quarterly'): string {
  const p = new URLSearchParams({ from: trigger });
  if (plan) p.set('plan', plan);
  return `/upgrade?${p.toString()}`;
}

/** Copy for the contextual prompt shown at each upgrade moment. No hard walls: always dismissible. */
export const UPGRADE_COPY: Record<UpgradeTrigger, { title: string; body: string }> = {
  word_export: { title: 'Word export is a Pro feature', body: 'Your PDF is always free. Upgrade to also download an editable .docx.' },
  second_resume: { title: 'Free includes one resume', body: 'Pro lets you keep a tailored resume for every kind of role you apply to.' },
  locked_matches: { title: 'See every match score', body: 'Free shows your top 3 matches each day. Pro scores every result against your resume.' },
  auto_apply: { title: 'Auto-Apply is a Pro feature', body: 'Apply to up to 50 matching jobs a day. You review each one first by default.' },
  cover_letter_download: { title: 'Download unlimited cover letters', body: 'You can write and preview cover letters for free. Pro unlocks downloads.' },
  full_ats_report: { title: 'Open the full ATS report', body: 'You already have your score and top 3 fixes. Pro adds the full 30-point report and job ad matching.' },
  ai_limit: { title: 'You used your 5 free AI rewrites today', body: 'Pro gives you unlimited AI bullet rewrites.' },
  templates: { title: 'This template is on Pro', body: 'Pro unlocks all 60+ templates.' },
  nav: { title: 'Go Pro', body: 'Unlimited resumes, all templates, Word export and Auto-Apply.' },
  billing: { title: 'Go Pro', body: 'Unlimited resumes, all templates, Word export and Auto-Apply.' },
  pricing: { title: 'Go Pro', body: 'Unlimited resumes, all templates, Word export and Auto-Apply.' },
};
