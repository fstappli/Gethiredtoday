import { describe, it, expect } from 'vitest';
import { extractResumeProfile, scoreJobMatch, batchScoreJobs } from '../lib/jobs/match';
import type { ResumeData } from '../types';
import type { Job } from '../types/jobs';

const baseContact = {
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '555-0100',
  location: 'San Francisco, CA',
};

const softwareEngineerResume: ResumeData = {
  contact: baseContact,
  summary: 'Senior software engineer with 7 years building cloud-native SaaS products.',
  work_experience: [
    {
      id: '1',
      job_title: 'Senior Software Engineer',
      company: 'Acme Corp',
      start_date: '2019-01-01',
      end_date: undefined,
      is_current: true,
      description: 'Led backend development using TypeScript and Node.js',
      achievements: ['Reduced API latency by 40%'],
    },
    {
      id: '2',
      job_title: 'Software Engineer',
      company: 'StartupCo',
      start_date: '2017-06-01',
      end_date: '2018-12-31',
      is_current: false,
      description: 'Built React frontend and Python microservices',
      achievements: [],
    },
  ],
  education: [
    {
      id: '1',
      degree: 'BS',
      field_of_study: 'Computer Science',
      institution: 'State University',
      start_date: '2013-09-01',
      end_date: '2017-05-01',
      is_current: false,
    },
  ],
  skills: [
    { id: '1', name: 'TypeScript' },
    { id: '2', name: 'Node.js' },
    { id: '3', name: 'React' },
    { id: '4', name: 'Python' },
    { id: '5', name: 'AWS' },
    { id: '6', name: 'PostgreSQL' },
  ],
  certifications: [],
  languages: [],
  volunteer_work: [],
  projects: [],
  custom_sections: [],
};

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: 'job-1',
  source: 'adzuna',
  title: 'Senior Software Engineer',
  company: 'TechCorp',
  location: 'San Francisco, CA',
  country: 'us',
  description: 'We need a senior software engineer with TypeScript, Node.js, React, and AWS experience.',
  redirect_url: 'https://example.com/apply',
  category: 'IT Jobs',
  contract_type: 'full_time',
  work_type: 'remote',
  salary_min: 150000,
  salary_max: 200000,
  currency: 'USD',
  posted_at: new Date().toISOString(),
  fetched_at: new Date().toISOString(),
  ...overrides,
});

describe('extractResumeProfile', () => {
  it('extracts skills from resume data', () => {
    const profile = extractResumeProfile(softwareEngineerResume);
    expect(profile.skills).toContain('typescript');
    expect(profile.skills).toContain('node.js');
    expect(profile.skills).toContain('react');
  });

  it('extracts job titles from work experience', () => {
    const profile = extractResumeProfile(softwareEngineerResume);
    expect(profile.job_titles).toContain('senior software engineer');
    expect(profile.job_titles).toContain('software engineer');
  });

  it('infers senior seniority from title and experience', () => {
    const profile = extractResumeProfile(softwareEngineerResume);
    expect(['senior', 'lead', 'mid']).toContain(profile.seniority);
  });

  it('returns empty skills for empty resume', () => {
    const emptyResume: ResumeData = {
      contact: baseContact,
      summary: '',
      work_experience: [],
      education: [],
      skills: [],
      certifications: [],
      languages: [],
      volunteer_work: [],
      projects: [],
      custom_sections: [],
    };
    const profile = extractResumeProfile(emptyResume);
    expect(profile.skills).toHaveLength(0);
    expect(profile.job_titles).toHaveLength(0);
  });
});

describe('scoreJobMatch', () => {
  it('scores a highly relevant job high', () => {
    const profile = extractResumeProfile(softwareEngineerResume);
    const job = makeJob();
    const { score } = scoreJobMatch(profile, job);
    expect(score).toBeGreaterThan(60);
  });

  it('scores an unrelated job low', () => {
    const profile = extractResumeProfile(softwareEngineerResume);
    const job = makeJob({
      title: 'Dental Hygienist',
      description: 'Provide dental care to patients. Experience with oral health required.',
    });
    const { score } = scoreJobMatch(profile, job);
    expect(score).toBeLessThan(40);
  });

  it('returns reasons for a good match', () => {
    const profile = extractResumeProfile(softwareEngineerResume);
    const job = makeJob();
    const { reasons } = scoreJobMatch(profile, job);
    expect(reasons.length).toBeGreaterThan(0);
  });

  it('score is always between 0 and 100', () => {
    const profile = extractResumeProfile(softwareEngineerResume);
    const jobs = [
      makeJob({ id: 'a', title: 'CEO', description: 'Lead the company.' }),
      makeJob({ id: 'b', title: 'Senior TypeScript Engineer', description: 'Build TypeScript Node.js AWS systems.' }),
      makeJob({ id: 'c', title: 'Junior React Developer', description: 'Build React apps.' }),
    ];
    for (const job of jobs) {
      const { score } = scoreJobMatch(profile, job);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

describe('batchScoreJobs', () => {
  it('returns jobs sorted by score descending', () => {
    const profile = extractResumeProfile(softwareEngineerResume);
    const jobs = [
      makeJob({ id: '1', title: 'Dentist', description: 'Dental care.' }),
      makeJob({ id: '2', title: 'Senior TypeScript Node.js Engineer', description: 'TypeScript Node.js AWS React expert.' }),
      makeJob({ id: '3', title: 'Junior React Dev', description: 'React developer needed.' }),
    ];
    const scored = batchScoreJobs(profile, jobs);
    const scores = scored.map((r) => r.score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  });

  it('filters out zero-score jobs', () => {
    const profile = extractResumeProfile(softwareEngineerResume);
    const jobs = [
      makeJob({ id: '1', description: '' }),
    ];
    const scored = batchScoreJobs(profile, jobs);
    expect(scored.every((r) => r.score > 0)).toBe(true);
  });
});
