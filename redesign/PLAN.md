# Redesign implementation plan

Stack: Next.js 16 (App Router) + Tailwind v4 + Supabase (auth/db) + LemonSqueezy (payments; HANDOFF says Gumroad, the code uses `/api/lemonsqueezy/*`). Admin (`/dashboard/admin`, `/api/admin/*`) is untouched except for nav.

## Foundation (done first)
- `app/globals.css`: tokens as Tailwind theme colors (`ink`, `brand`, `brand-dark`, `mint-bright`, `mint-soft`, `sun`, `ground-site`, `ground-portal`, `line`, `line-strong`, `text-muted`...), `font-display`.
- `app/layout.tsx`: Bricolage Grotesque + Figtree via next/font.
- `components/logo.tsx` restyled. `components/site-header.tsx` (also exported as `components/navbar.tsx`), `components/site-footer.tsx` (also `components/footer.tsx`), `components/portal/portal-nav.tsx` (+ phone bottom tab bar), `components/gh-ui.tsx` (Btn, ButtonLink, Field, Card, Chip, Pill), `components/resume-thumb.tsx` (real `TemplatePreview` scaled).
- `app/dashboard/layout.tsx`: sidebar replaced with PortalNav.

## Screen -> route map
| Screen | Route / file |
|---|---|
| Main | `app/page.tsx` |
| FindJobs (public) | `app/jobs/page.tsx` (new) |
| Templates | `app/resume-templates/page.tsx`, `components/templates-view.tsx` |
| Examples / ExampleDetail | `app/resume-examples/page.tsx`, `[slug]/page.tsx` |
| AtsChecker | `app/ats-checker/page.tsx`, `components/ats-checker-view.tsx` |
| AutoApplyLanding | `app/auto-apply/page.tsx` (new); `/builder/wizard` kept |
| CoverLetterLanding | `app/cover-letter/page.tsx` (new); `/builder/cover-letter` kept |
| Pricing | `app/pricing/page.tsx` |
| Resources / Article | `app/resources/page.tsx`, `app/resources/[slug]/page.tsx` (new; `/blog/[slug]` redirects) |
| About / Contact | `app/about`, `app/contact` |
| Legal | `app/privacy`, `app/terms`, `app/cookies` (new), shared `components/legal-page.tsx` |
| NotFound | `app/not-found.tsx` |
| Signup / Login / CheckEmail | `app/(auth)/signup`, `login`, `app/(auth)/check-email` (new) |
| Onboarding | `app/onboarding/page.tsx` (new) |
| Dashboard | `app/dashboard/page.tsx` |
| Resumes | `app/dashboard/resumes/page.tsx` |
| Builder (+mobile) | `app/builder/resume/[id]/page.tsx` |
| CoverLetters / Editor | `app/dashboard/cover-letters`, `app/builder/cover-letter/[id]` |
| Jobs / JobDetail | `app/dashboard/find-jobs`, `[id]` |
| Applications | `app/dashboard/applied-jobs` |
| AutoApply | `app/dashboard/auto-apply` |
| PortalAts | `app/dashboard/ats-checker` |
| Account / Billing | `app/dashboard/account`, `billing` |
| Checkout / Success | `app/upgrade`, `app/upgrade/success` (new) |
| CancelFlow | `app/dashboard/billing/cancel` (new) |

## Data / API work
- Free vs Pro limits centralised in `lib/subscription.ts` (`PLAN_LIMITS`) and enforced in API routes: resume count (`/api/resume`), AI bullet daily cap (`/api/ai/*`), full ATS report (`/api/ats/check`), Word export, cover letter download, job match scoring top 3/day (`/api/jobs/matches`), Auto-Apply (`/api/jobs/auto-apply`).
- Upgrade moments link to `/upgrade?from=<trigger>`; trigger recorded on checkout start.
- Lazy registration: logged-out ATS result / first builder step stored in localStorage and claimed after sign-up.
- Public `/jobs` search uses the existing job providers via a public search route; match % is locked until sign-up.
- Bugs: dashboard resume count, builder "Leave site?" only on real changes, portal ATS copy, upgrade "Cancel anytime" as text, header Log in/Sign up, hero CTA.
