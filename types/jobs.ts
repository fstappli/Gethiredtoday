// ============================================================
// Job / Matching / Application Types
// ============================================================

export interface Job {
  id: string;
  source: string;
  title: string;
  company: string | null;
  location: string | null;
  country: string;
  description: string | null;
  redirect_url: string;
  category: string | null;
  contract_type: string | null;
  work_type: 'remote' | 'hybrid' | 'on_site' | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  posted_at: string | null;
  fetched_at: string;
}

export interface JobMatch {
  id: string;
  user_id: string;
  resume_id: string;
  job_id: string;
  match_score: number;
  matched_reasons: string[];
  created_at: string;
  job: Job;
}

export type ApplicationStatus =
  | 'matched'
  | 'redirected'
  | 'applied'
  | 'viewed'
  | 'interview'
  | 'rejected'
  | 'offer';

export type ApplicationType =
  | 'native'
  | 'external_redirect'
  | 'provider_api';

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  resume_id: string | null;
  status: ApplicationStatus;
  application_type: ApplicationType;
  applied_at: string | null;
  redirected_at: string | null;
  source: string;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface AutoApplySettings {
  user_id: string;
  enabled: boolean;
  min_match_score: number;
  daily_cap: number;
  filters: JobSearchFilters;
  paused_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutoApplyRun {
  id: string;
  user_id: string;
  run_at: string;
  attempted: number;
  queued: number;
  skipped: number;
  skipped_reasons: Record<string, number>;
}

// ─── Search / Filter Types ────────────────────────────────────────────────────

export interface JobSearchFilters {
  query?: string;
  location?: string;
  radius_km?: number;
  remote?: boolean;
  hybrid?: boolean;
  on_site?: boolean;
  employment_types?: EmploymentType[];
  relocation?: boolean;
  industries?: string[];
  country?: string;
}

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'internship';

export interface JobSearchResult {
  jobs: Job[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdzunaCategory {
  label: string;
  tag: string;
}

// ─── Resume Profile (extracted for matching) ──────────────────────────────────

export interface ResumeProfile {
  skills: string[];
  job_titles: string[];
  seniority: SeniorityLevel;
  years_experience: number;
  industries: string[];
  location: string | null;
  open_to_relocation: boolean;
  employment_types: EmploymentType[];
}

export type SeniorityLevel =
  | 'entry'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'manager'
  | 'director'
  | 'executive';
