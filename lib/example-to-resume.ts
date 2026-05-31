import type { ResumeData, WorkExperience, Skill, Education } from '@/types';
import type { ResumeExample } from './resume-examples-data';
import type { PreviewContent } from '@/components/template-preview';

/**
 * A generic "starter" resume used when the user picks a template from the
 * Templates page without selecting a specific example. Gives them a polished
 * pre-filled resume they can immediately see in the chosen layout, then edit.
 */
export function getTemplateStarterData(): ResumeData {
  const now = new Date();
  const thisYear = now.getFullYear();
  return {
    contact: {
      full_name: 'Your Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'City, State',
      linkedin: 'linkedin.com/in/yourname',
      website: '',
      github: '',
    },
    summary:
      'Results-oriented professional with a track record of delivering measurable impact across cross-functional teams. Replace this with 2-3 sentences that highlight your unique strengths, experience level, and what you bring to your next role.',
    work_experience: [
      {
        id: `exp-${Date.now()}-1`,
        job_title: 'Your Most Recent Role',
        company: 'Company Name',
        location: 'City, State',
        start_date: `${thisYear - 2}-01`,
        end_date: '',
        is_current: true,
        description: '',
        achievements: [
          'Led initiative that drove X% improvement in key metric (replace with your own win)',
          'Built and shipped feature used by Y+ customers, generating $Z in new revenue',
          'Collaborated across engineering, design, and product to deliver quarterly goals',
        ],
      },
      {
        id: `exp-${Date.now()}-2`,
        job_title: 'Previous Role',
        company: 'Previous Company',
        location: '',
        start_date: `${thisYear - 4}-06`,
        end_date: `${thisYear - 2}-01`,
        is_current: false,
        description: '',
        achievements: [
          'Owned end-to-end delivery of feature/project with measurable outcome',
          'Reduced process time by X% through automation or workflow redesign',
        ],
      },
    ],
    education: [
      {
        id: `edu-${Date.now()}`,
        degree: 'Bachelor of Science',
        field_of_study: 'Your Major',
        institution: 'University Name',
        location: '',
        start_date: `${thisYear - 8}-09`,
        end_date: `${thisYear - 4}-05`,
        is_current: false,
        gpa: '',
        description: '',
      } as Education,
    ],
    skills: ['Leadership', 'Project Management', 'Communication', 'Problem Solving', 'Data Analysis', 'Collaboration'].map(
      (name, i): Skill => ({ id: `skill-${i}`, name, category: 'Core' }),
    ),
    certifications: [],
    languages: [],
    volunteer_work: [],
    projects: [],
    custom_sections: [],
  };
}

/**
 * Convert a ResumeExample (marketing/examples data) into PreviewContent for
 * the thumbnail component. Produces a minimally-populated preview so each
 * example card shows its real title/skills/experience instead of placeholders.
 */
export function exampleToPreviewContent(ex: ResumeExample): PreviewContent {
  const first = ex.sampleExperiences?.[0];
  const title = first?.role || ex.title;
  return {
    name: 'Sample Candidate',
    title,
    summary: ex.sampleSummary,
    experiences: (ex.sampleExperiences ?? []).map((se) => ({
      role: se.role,
      company: se.company,
      dates: se.dates ?? 'Present',
      bullets: se.bullets,
    })),
    skills: ex.skills,
  };
}

/**
 * Convert a ResumeExample into a partial ResumeData that can be used to
 * pre-fill the builder form when a user clicks "Use this template" from an
 * example page. Uses empty contact fields (user fills their own info in).
 */
export function exampleToResumeData(ex: ResumeExample): ResumeData {
  const now = new Date();
  const year = now.getFullYear();

  const experiences: WorkExperience[] = (ex.sampleExperiences ?? []).map((se, idx) => ({
    id: crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}-${idx}`,
    job_title: se.role,
    company: se.company,
    location: '',
    start_date: idx === 0 ? `${year - 3}-01` : idx === 1 ? `${year - 6}-01` : `${year - 9}-01`,
    end_date: idx === 0 ? '' : idx === 1 ? `${year - 3}-12` : `${year - 6}-12`,
    is_current: idx === 0,
    description: '',
    achievements: se.bullets,
  }));

  const skills: Skill[] = ex.skills.map((name, i) => ({
    id: `skill-${i}`,
    name,
    category: 'Technical',
  }));

  return {
    contact: {
      full_name: '',
      email: '',
      phone: '',
      location: '',
    },
    summary: ex.sampleSummary,
    work_experience: experiences,
    education: [],
    skills,
    certifications: [],
    languages: [],
    volunteer_work: [],
    projects: [],
    custom_sections: [],
  };
}
