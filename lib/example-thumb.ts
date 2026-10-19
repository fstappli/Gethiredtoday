import type { PreviewContent, TemplateLayout } from '@/components/template-preview';
import type { ResumeExample } from '@/lib/resume-examples-data';

export function layoutForIndustry(industry: string): TemplateLayout {
  const i = industry.toLowerCase();
  if (i.includes('technology')) return 'sidebar';
  if (i.includes('creative') || i.includes('design')) return 'creative';
  if (i.includes('executive') || i.includes('finance')) return 'executive';
  if (i.includes('academic') || i.includes('education')) return 'minimal';
  return 'classic';
}

/** Thumbnail content built from a real example (sample candidate, no personal data). */
export function previewForExample(ex: ResumeExample): PreviewContent {
  return {
    name: 'Sample Candidate',
    title: ex.title,
    email: 'candidate@example.com',
    summary: ex.sampleSummary,
    experiences: ex.sampleExperiences.slice(0, 2).map((e) => ({
      role: e.role,
      company: e.company,
      dates: e.dates,
      bullets: e.bullets.slice(0, 2),
    })),
    skills: ex.skills,
  };
}
