-- =============================================================
-- Job Matching Feature — Additive Migration
-- Reversible: all new tables/columns only, no existing data altered
-- =============================================================

-- ─── Finalized resume flag ────────────────────────────────────────────────────
-- NULL = not finalized. Timestamp = when user marked this as their active
-- job-search resume. Only one per user should be non-NULL at a time
-- (enforced at the application layer via a clear-then-set pattern).
ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;

-- ─── Jobs cache ───────────────────────────────────────────────────────────────
-- Caches Adzuna results so we can score against them without re-fetching
-- on every match refresh. TTL managed at the application layer.
CREATE TABLE IF NOT EXISTS public.jobs (
  id            TEXT PRIMARY KEY,               -- Adzuna job id (string)
  source        TEXT NOT NULL DEFAULT 'adzuna',
  title         TEXT NOT NULL,
  company       TEXT,
  location      TEXT,
  country       TEXT NOT NULL DEFAULT 'us',
  description   TEXT,
  redirect_url  TEXT NOT NULL,
  category      TEXT,
  contract_type TEXT,                           -- 'full_time' | 'part_time' | 'contract' etc.
  work_type     TEXT,                           -- 'remote' | 'hybrid' | 'on_site' — derived
  salary_min    NUMERIC,
  salary_max    NUMERIC,
  currency      TEXT DEFAULT 'USD',
  posted_at     TIMESTAMPTZ,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw           JSONB NOT NULL DEFAULT '{}'    -- full Adzuna response object
);

CREATE INDEX IF NOT EXISTS idx_jobs_category     ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_country      ON public.jobs(country);
CREATE INDEX IF NOT EXISTS idx_jobs_fetched_at   ON public.jobs(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_contract_type ON public.jobs(contract_type);

-- ─── Job matches ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_matches (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id       UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  job_id          TEXT REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  match_score     INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  matched_reasons JSONB NOT NULL DEFAULT '[]', -- array of reason strings
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, resume_id, job_id)           -- no duplicates per user+resume+job
);

CREATE INDEX IF NOT EXISTS idx_job_matches_user_score
  ON public.job_matches(user_id, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_matches_resume
  ON public.job_matches(resume_id);

-- ─── Applications ─────────────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS public.application_status AS ENUM (
  'matched',        -- in match list, not yet applied
  'redirected',     -- user clicked Apply, tab opened, awaiting their confirmation
  'applied',        -- user confirmed they completed the external application
  'viewed',         -- employer viewed (future: via provider API)
  'interview',      -- interview scheduled
  'rejected',       -- rejected
  'offer'           -- offer received
);

CREATE TYPE IF NOT EXISTS public.application_type AS ENUM (
  'native',          -- submitted through a native internal flow (not used currently)
  'external_redirect', -- redirect to employer/ATS URL
  'provider_api'     -- submitted via provider API (not used currently)
);

CREATE TABLE IF NOT EXISTS public.applications (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id            TEXT REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  resume_id         UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  status            public.application_status NOT NULL DEFAULT 'redirected',
  application_type  public.application_type NOT NULL DEFAULT 'external_redirect',
  applied_at        TIMESTAMPTZ,               -- set when status transitions to 'applied'
  redirected_at     TIMESTAMPTZ DEFAULT NOW(),
  source            TEXT DEFAULT 'manual',      -- 'manual' | 'auto_apply'
  meta              JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, job_id)                      -- prevent duplicate applications
);

CREATE INDEX IF NOT EXISTS idx_applications_user_status
  ON public.applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_user_applied_at
  ON public.applications(user_id, applied_at DESC NULLS LAST);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Auto-apply settings ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auto_apply_settings (
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  min_match_score INTEGER NOT NULL DEFAULT 75 CHECK (min_match_score >= 0 AND min_match_score <= 100),
  daily_cap       INTEGER NOT NULL DEFAULT 10 CHECK (daily_cap >= 1 AND daily_cap <= 50),
  filters         JSONB NOT NULL DEFAULT '{}', -- mirrors job search filters
  paused_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER auto_apply_settings_updated_at
  BEFORE UPDATE ON public.auto_apply_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Auto-apply run log ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auto_apply_runs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  run_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempted       INTEGER NOT NULL DEFAULT 0,
  queued          INTEGER NOT NULL DEFAULT 0,   -- queued for 1-tap (external_redirect)
  skipped         INTEGER NOT NULL DEFAULT 0,
  skipped_reasons JSONB NOT NULL DEFAULT '{}'   -- {"already_applied": 3, "below_threshold": 2}
);

CREATE INDEX IF NOT EXISTS idx_auto_apply_runs_user
  ON public.auto_apply_runs(user_id, run_at DESC);

-- ─── Row-Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.jobs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_apply_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_apply_runs     ENABLE ROW LEVEL SECURITY;

-- Jobs: readable by all authenticated users (shared cache)
CREATE POLICY "Authenticated users can read jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (true);

-- Job matches: own data only
CREATE POLICY "Users can read own job matches"
  ON public.job_matches FOR ALL
  USING (auth.uid() = user_id);

-- Applications: own data only
CREATE POLICY "Users can CRUD own applications"
  ON public.applications FOR ALL
  USING (auth.uid() = user_id);

-- Auto-apply settings: own data only
CREATE POLICY "Users can CRUD own auto-apply settings"
  ON public.auto_apply_settings FOR ALL
  USING (auth.uid() = user_id);

-- Auto-apply run log: own data only
CREATE POLICY "Users can read own auto-apply runs"
  ON public.auto_apply_runs FOR SELECT
  USING (auth.uid() = user_id);
