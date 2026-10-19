# GetHiredToday redesign: implementation handoff

This package contains the full redesign of hiredtodayapp.com (public site, sign-up, and the signed-in portal). Implement it in the existing GetHiredToday codebase and ship it to production.

## What's in this folder

| Path | What it is |
|---|---|
| `PROMPT.md` | The prompt to give Claude Code |
| `HANDOFF.md` | This spec: routes, rules, tokens, components, acceptance criteria |
| `design-tokens.json` | Colors, type, radii, spacing as tokens |
| `design/*.dc.html` | One file per screen. Plain HTML with inline styles plus a small `<script type="text/x-dc">` block holding sample data and interactions. Read these as the visual source of truth |
| `design/canvas.json` | Index of every screen, its title and size |

### How to read a `.dc.html` file
- Markup inside `<x-dc>` is the screen. Inline styles are the exact spacing, colors, and sizes. Copy them exactly into the codebase's styling system; don't round them.
- `<helmet>` holds the Google Fonts link and a few media queries.
- `{{name}}` is a value from `renderVals()` in the script block at the bottom. `<sc-for list="{{x}}" as="item">` is a loop. `<sc-if value="{{x}}">` is a conditional. `onClick="{{fn}}"` is an event handler.
- `<dc-import name="SiteHeader">` means "render the SiteHeader component here". The component's file is `design/SiteHeader.dc.html`.
- `href="Pricing.dc.html"` links between screens. Map each one to the real route in the table below.
- Sample data (job listings, names, scores) is for illustration. Wire it to real data.

## Global rules
1. **No em dashes (—) anywhere in UI copy.** Use commas, colons, periods or "·".
2. **Keep every existing URL.** If a route moves, add a 301 redirect. Don't break SEO.
3. **Mobile first.** Every page must work at 360–390 px wide: no horizontal scroll, tap targets at least 44 px, inputs at 16 px or more so iOS doesn't zoom.
4. **Accessibility.** Use real `<button>`, `<a>`, `<label>` and `<input>` elements. Icon-only buttons need `aria-label`. Text contrast must be at least 4.5:1. Keep visible focus states.
5. **Don't invent facts.** Text in `[square brackets]` is a placeholder for the owner to fill in. Keep it visible but easy to find (see Placeholders below). Don't ship it to production untouched without flagging it.
6. **Don't touch** `/dashboard/admin` or any admin functionality, except to keep it working with the new navigation.

## Route map (screen → route)

Use the existing route where one already exists in the codebase. The routes below match the live site today where known.

### Public
| Screen file | Route | Notes |
|---|---|---|
| `Main.dc.html` | `/` | New home. Hero has an inline sign-up card, plus a job search band, a "start your way" section, and a templates grid with real resume thumbnails |
| `FindJobs.dc.html` | `/jobs` (new) | Public job search. Results show a locked "See your match %" badge that leads to sign-up |
| `Templates.dc.html` | `/resume-templates` | Category filter chips. "Use this" goes to sign-up, then the builder with that template preselected |
| `Examples.dc.html` | `/resume-examples` | |
| `ExampleDetail.dc.html` | `/resume-examples/[role]` | SEO page per role |
| `AtsChecker.dc.html` | `/ats-checker` | Logged-out flow: input, then result. Shows the top 3 fixes and gates the rest behind a free account |
| `AutoApplyLanding.dc.html` | `/auto-apply` | Marketing page. Keep `/builder/wizard` working (redirect or reuse) |
| `CoverLetterLanding.dc.html` | `/cover-letter` | Keep `/builder/cover-letter` for the editor |
| `Pricing.dc.html` | `/pricing` | Monthly / 3-month toggle |
| `Resources.dc.html` | `/resources` | Tabs: All, Resume writing, Interview tips, Job search |
| `Article.dc.html` | `/resources/[slug]` (or the existing blog route) | |
| `About.dc.html` | `/about` | |
| `Contact.dc.html` | `/contact` | |
| `Legal.dc.html` | `/privacy`, `/terms`, `/cookies` | One template, three documents. Keep the existing legal text |
| `NotFound.dc.html` | 404 page | |

### Auth
| Screen file | Route | Notes |
|---|---|---|
| `Signup.dc.html` | `/signup` | Google, LinkedIn, Apple, or email magic link. No password at sign-up |
| `Login.dc.html` | `/login` | Magic link first, password as an option, "Forgot password" |
| `CheckEmail.dc.html` | `/check-email` | |
| `Onboarding.dc.html` | `/onboarding` | Three steps: target role, how to start (upload / LinkedIn / scratch), pick a template. Then open the builder |

Use whichever auth providers the codebase already supports. Add Google one-tap and magic link if they're missing. If LinkedIn or Apple aren't feasible right now, hide those buttons rather than shipping dead ones.

### Portal (signed in)
| Screen file | Route | Notes |
|---|---|---|
| `Dashboard.dc.html` | `/dashboard` | Next-best-action card (ATS score), setup checklist, job matches (soft paywall), resume cards with thumbnails, stats |
| `Resumes.dc.html` | `/dashboard/resumes` | |
| `Builder.dc.html` + `BuilderMobile.dc.html` | `/builder/resume/[id]` | Guided steps with a completeness bar, inline AI suggestions, live preview, autosave indicator. On mobile: an Edit / Preview toggle |
| `CoverLetters.dc.html` | `/dashboard/cover-letters` | |
| `CoverLetterEditor.dc.html` | `/builder/cover-letter/[id]` | |
| `Jobs.dc.html` | `/dashboard/find-jobs` | Search bar (keyword + location), tabs: Matched / All / Saved, filters, job alerts |
| `JobDetail.dc.html` | `/dashboard/find-jobs/[id]` | Match breakdown: what you have vs what's missing. "Tailor my resume", "Apply on company site" |
| `Applications.dc.html` | `/dashboard/applied-jobs` | Kanban columns: Saved, Applied, Interview, Offer |
| `AutoApply.dc.html` | `/dashboard/auto-apply` | Settings tab and Queue tab. Review mode is the default |
| `PortalAts.dc.html` | `/dashboard/ats-checker` | Pre-select the user's saved resume. No "No Sign-Up Required" copy inside the app |
| `Account.dc.html` | `/dashboard/account` | |
| `Billing.dc.html` | `/dashboard/billing` | Free view and Pro view |
| `Checkout.dc.html` | `/upgrade` | Focused page with one CTA that hands off to the existing payment provider (Gumroad) |
| `UpgradeSuccess.dc.html` | `/upgrade/success` | |
| `CancelFlow.dc.html` | `/dashboard/billing/cancel` | Optional reason, offer to pause, then cancel. Two clicks maximum |

The `*Mobile.dc.html` files show the phone layouts of key screens. Use them to check the responsive versions. Note the bottom tab bar in the portal on mobile.

### Shared components
| File | Build as |
|---|---|
| `SiteHeader.dc.html` | Public header. On mobile the nav links hide, and the logo, "Log in" and "Start free" stay visible |
| `SiteFooter.dc.html` | Public footer |
| `PortalNav.dc.html` | Portal top nav with an `active` prop. On mobile the tabs scroll horizontally; optionally add the bottom tab bar from `DashboardMobile.dc.html` |
| `ResumeThumb.dc.html` | Template thumbnail. Ideally render the **real** template component with sample data at 0.28–0.42 scale instead of a static image |

## Business rules (Free vs Pro). These are confirmed by the owner.

| Feature | Free | Pro ($9.99/mo, plus optional 3-month plan) |
|---|---|---|
| Resumes | 1 | Unlimited |
| Templates | Free set | All 60+ |
| PDF download | **Yes, always free** | Yes |
| Word (.docx) export | No | Yes |
| AI bullet rewrites | 5 per day | Unlimited |
| ATS report | Score + top 3 fixes | Full 30-point report + job ad matching |
| Cover letters | Write and preview | Unlimited downloads |
| Job search | Search, save, apply | Same |
| Job matches with match % | Top 3 per day | All results scored |
| Auto-Apply | No | Up to 50 per day, review mode by default |

### Upgrade moments
Show a contextual upgrade prompt, never a hard wall, when a user hits one of these:
- Word export
- Creating a 2nd resume
- Viewing locked job matches
- Starting Auto-Apply
- Downloading a cover letter
- Opening the full ATS report

Tag every checkout start with its trigger (for example `?from=word_export`) so conversions can be measured.

### Lazy registration
The public ATS checker and the first builder step should work while logged out. Saving progress asks for sign-up (one tap), then carries the user's work into the account.

## Bugs found on the live site (fix these)
1. The dashboard shows "0 Total Resumes" while My Resumes lists 3. Fix the count.
2. Opening a resume in the builder with no edits triggers a "Leave site?" warning. Only warn when there are real unsaved changes, and show an autosave status ("Saved").
3. The portal ATS checker shows marketing copy ("No Sign-Up Required") to signed-in users.
4. The upgrade page shows "Cancel Anytime" styled as a button that competes with the checkout CTA. Make it reassurance text.
5. Public pages have no Log in / Sign up link. Add one to the header.
6. The home hero CTA leads with the price ("Get Started, $9.99/mo"). Replace it with the free CTA.

## Visual system
See `design-tokens.json`. In short:
- **Fonts:** Bricolage Grotesque (display, 600–800) and Figtree (body, 400–800), from Google Fonts.
- **Colors:**

  | Token | Hex |
  |---|---|
  | Ink | #0D1B19 |
  | Muted text | #3F4D49 |
  | Brand teal | #0B6E5F |
  | Teal dark | #08574B |
  | Mint | #5FD3B3 / #E3F4EE |
  | Sun accent | #FFD166 |
  | Site ground | #FBFAF6 |
  | Portal ground | #F6F5F0 |
  | Line | #E6E3DA |

- **Radii:** 10–14 px for controls, 16–24 px for cards, 999 px for pills.
- **Icons:** inline stroke SVGs, 2 px stroke. No emoji.

## Placeholders the owner must fill in
- 3-month plan price and the saving percentage: `[X]%`, `[$]`, `[$ total]`
- Payment methods text (confirm what Gumroad supports)
- Testimonial quotes for Marcus T., Linda K. and Priya S.
- About page founding story and `[Year]`
- Support email and response time on Contact
- Legal page text (reuse the existing legal copy)
- Article publish date
- Salary range on job detail (comes from the job data source)
- Stats "50K+ resumes" and "4.8/5" come from the current site. Keep them only if they can be sourced.

## Acceptance criteria
- Every screen in `design/` exists at its route, matches the design at 1440 px and 390 px, and every link and button goes somewhere real.
- Lighthouse on `/`, `/pricing`, `/jobs` and `/dashboard`: Accessibility 95+, Performance 85+ on mobile.
- No em dashes in UI copy (`grep -r "—"` over UI source and content returns nothing user-facing).
- All existing URLs still resolve (200 or 301).
- The free-vs-pro rules above are enforced server-side, not just hidden in the UI.
- Build, lint, type-check and tests all pass.
- Deployed to production, with the live site verified by visiting it.
