# HiredToday — Resume-Driven Apply, Auto-Apply, Job Search & Dashboard KPIs

## Phase 0: Audit Results

### Stack Inventory

| Layer | Technology | Key Files |
|-------|-----------|-----------|
| Framework | Next.js (App Router, v16) | `next.config.ts`, `app/` |
| Language | TypeScript 5.x | `tsconfig.json`, `types/index.ts` |
| Styling | Tailwind CSS v4 + shadcn/ui | `components/ui/`, `components.json` |
| State | React hooks only (no Zustand/Redux) | — |
| Database | Supabase PostgreSQL | `supabase/schema.sql`, `supabase/migrations/` |
| DB Client | Supabase JS SDK (`@supabase/supabase-js` v2) | `lib/supabase.ts` |
| Auth | Supabase Auth + `@supabase/ssr` | `lib/supabase.ts`, `app/auth/` |
| Payments | Stripe | `lib/stripe.ts`, `app/api/stripe/` |
| AI | Anthropic Claude Haiku (`@anthropic-ai/sdk`) | `lib/ai.ts` |
| Hosting | Vercel | `vercel.json` |

### Existing Job Data Source

**Finding: None.** The app is a pure resume builder with no job board integration. There is:
- No `jobs` table in the database
- No job API integration (Indeed, LinkedIn, Adzuna, etc.)
- No job search or listing UI

**Decision:** Integrate with the **Adzuna Jobs API** (free tier: 250 calls/day, global coverage). Requires `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` env vars. All jobs sourced from Adzuna have external employer/ATS URLs, so all applications will be `external_redirect` type.

### Current Resume Model

**Table:** `public.resumes` (`supabase/schema.sql` lines 22–34)
- `id UUID`, `user_id UUID`, `title TEXT`, `template_id TEXT`
- `data JSONB` — full `ResumeData` object (skills, work_experience, education, etc.)
- `ats_score INTEGER` — optional cached ATS score
- `is_public BOOLEAN`, timestamps

**"Finalized" Concept:** No finalization status exists today. **Decision:** Add `finalized_at TIMESTAMPTZ` column (NULL = not finalized, timestamp = finalized at that time). The user explicitly clicks "Use for Job Matching" in the builder/dashboard to finalize a specific resume version. Only one resume per user can be "active" for matching at a time (enforced by clearing other `finalized_at` values on finalize).

### Current Dashboard KPIs

**File:** `app/dashboard/page.tsx` lines 550–579

| Stat | Label | Value | Lines |
|------|-------|-------|-------|
| 1 | Total Resumes | `displayResumes.length` | 550–557 |
| **2** | **Best ATS Score** | `bestAts > 0 ? \`${bestAts}%\` : '—'` | **558–564** ← REMOVE |
| 3 | Cover Letters | `displayCoverLetters.length` | 565–571 |
| 4 | Profile Complete | `'78%'` (hardcoded) | 572–578 |

`bestAts` is computed at lines 546–548 from `displayResumes`. All of this code plus the `atsColor`/`atsBgColor`/`atsLabel` helpers (lines 69–88) can be removed once the ATS KPI is gone (those helpers are also used on the resume cards themselves — check before deleting).

**Important:** `atsColor`, `atsBgColor`, and `atsLabel` are used by resume card rendering (not just the KPI) — they stay. Only the `bestAts` variable and the second stats array entry are removed.

### Job/Application Schema

**Today:** None. Phase 1 adds all required tables.

### Application Type Reality Check

Since 100% of jobs come from Adzuna (external job board):
- **All jobs are `external_redirect`** — they have `redirect_url` to the employer/ATS site.
- Native submission is impossible without credentials on each employer site.
- Auto-apply can **never** auto-submit; it can only queue jobs in a "Ready to apply" list.
- One-click apply: records `status = 'redirected'`, opens URL, prompts user to confirm → `status = 'applied'`.

---

## Assumptions

1. **Job API:** Adzuna is used as the real job data source. `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` must be added as Vercel env vars before matching and search work. Until these are set, the app surfaces an honest empty state with instructions to configure the integration.
2. **Finalization:** "Finalized" means the user explicitly marked a resume as their active job-search resume via a new "Use for Job Matching" button. Only one per user at a time.
3. **Matching trigger:** Matching runs on-demand ("Refresh matches" button) and automatically when a resume is finalized. No continuous background re-scoring.
4. **Application counting (KPI):** The "Jobs Applied" KPI counts rows with `status IN ('applied', 'viewed', 'interview', 'offer', 'rejected')`. `redirected` status is shown as a sub-count. `matched` is not counted.
5. **Auto-apply:** Since all jobs are `external_redirect`, auto-apply only queues jobs into a "Ready to apply (1 tap)" list — it never auto-submits. This is made explicit in the settings UI.
6. **Industries filter:** Derived live from Adzuna's category taxonomy (fetched via `GET /api/v1/{country}/categories`), not hardcoded.
7. **Tests:** Vitest is used (already in package.json or added). If not present, Jest is added.
8. **Profile Complete KPI:** The hardcoded `78%` is left in place (it is a separate issue unrelated to this feature set; see HARD RULE 6).

---

## Phase-by-Phase Implementation Checklist

### Phase 1 — Database Migrations
- [ ] `supabase/migrations/20260526_job_matching.sql`
  - `ALTER TABLE resumes ADD COLUMN finalized_at TIMESTAMPTZ`
  - `CREATE TABLE jobs` (cache of Adzuna results)
  - `CREATE TABLE job_matches`
  - `CREATE TABLE applications`
  - `CREATE TABLE auto_apply_settings`
  - `CREATE TABLE auto_apply_runs`
  - Indexes + RLS policies

### Phase 2 — Jobs API & Matching Engine
- [ ] `lib/jobs/adzuna.ts` — Adzuna API client (search, categories)
- [ ] `lib/jobs/match.ts` — Resume profile extraction + job scoring
- [ ] `app/api/jobs/search/route.ts` — Proxied job search endpoint
- [ ] `app/api/jobs/categories/route.ts` — Fetch industry taxonomy
- [ ] `app/api/jobs/matches/route.ts` — GET user's current matches
- [ ] `app/api/jobs/matches/refresh/route.ts` — POST trigger re-match
- [ ] `app/api/resume/[id]/finalize/route.ts` — POST finalize a resume

### Phase 3 — Find Jobs View
- [ ] `app/dashboard/find-jobs/page.tsx` — Full search UI
- [ ] `components/jobs/job-card.tsx` — Shared job card component
- [ ] `components/jobs/job-filters.tsx` — Filter rail component
- [ ] `components/jobs/filter-chips.tsx` — Active filter chips
- [ ] `hooks/use-job-search.ts` — Search state + URL sync

### Phase 4 — Apply Flow
- [ ] `app/api/jobs/apply/route.ts` — POST create application (redirected)
- [ ] `app/api/jobs/apply/[applicationId]/confirm/route.ts` — POST confirm applied
- [ ] `components/jobs/apply-button.tsx` — Apply + confirm flow
- [ ] `app/dashboard/auto-apply/page.tsx` — Auto-apply settings
- [ ] `app/api/jobs/auto-apply/settings/route.ts` — GET/PUT settings
- [ ] `app/api/jobs/auto-apply/queue/route.ts` — GET queued jobs

### Phase 5 — Dashboard KPIs
- [ ] Edit `app/dashboard/page.tsx` — remove ATS KPI (lines 558–564 + `bestAts` vars)
- [ ] Add "Jobs Applied" KPI with click-through
- [ ] `app/dashboard/applied-jobs/page.tsx` — Applied jobs view
- [ ] `app/api/jobs/applications/route.ts` — GET user's applications

### Phase 6 — UI Polish (throughout phases 2–5)
- [ ] Skeleton loaders on job cards
- [ ] Optimistic apply states
- [ ] Responsive filter drawer (mobile)
- [ ] Score badges with tooltips
- [ ] Toast notifications

### Phase 7 — Tests
- [ ] `__tests__/match-scoring.test.ts`
- [ ] `__tests__/filter-query.test.ts`
- [ ] `__tests__/kpi-counts.test.ts`
- [ ] `__tests__/apply-state-machine.test.ts`

### Phase 8 — Staging Deploy
- [ ] Add env vars to Vercel staging
- [ ] Run migrations on staging DB
- [ ] Deploy & verify

---

## Manual QA Checklist (Phase 7)

- [ ] Finalize a resume → "Jobs matched" section populates with real Adzuna jobs
- [ ] "Refresh matches" button triggers re-score
- [ ] Empty state shown when no resume is finalized
- [ ] Empty state shown when zero matches found
- [ ] Find Jobs filters are URL-synced (shareable)
- [ ] Apply button opens external URL in new tab + shows confirm prompt
- [ ] Confirming apply updates status to `applied`
- [ ] Duplicate apply prevented (button shows "Applied" after first apply)
- [ ] "Jobs Applied" KPI increments after confirm
- [ ] Clicking KPI opens Applied Jobs view
- [ ] Applied Jobs view filters by status tabs
- [ ] Auto-apply settings: enable toggle, min score, daily cap save
- [ ] Auto-apply queue shows external-redirect jobs (never auto-submits)
- [ ] ATS KPI is gone — no dead imports, no console errors
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
