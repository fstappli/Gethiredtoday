You are working in the GetHiredToday codebase (the app behind https://www.hiredtodayapp.com). I've attached a redesign package: `gethiredtoday-redesign.zip`. Unzip it into `/redesign` at the repo root.

Your goal: implement the full redesign across the public site, sign-up, and the signed-in portal, then ship it to production so the live site changes.

## Read first
1. Read `redesign/HANDOFF.md` fully. It contains the route map, Free vs Pro rules, bugs to fix, placeholders and acceptance criteria.
2. Read `redesign/design-tokens.json`.
3. Open the screens in `redesign/design/*.dc.html`. Each file is one screen. Treat the markup and inline styles as the visual source of truth. Match spacing, sizes, colors and copy exactly.
4. Explore this repo: framework, routing, styling approach, auth, payments (Gumroad), database, existing components, how it's deployed. Don't add a new framework or styling system; build with what's here.

## Plan, then build in phases
Before coding, write a short plan to `redesign/PLAN.md`. It should map every screen to a file or route in this repo, list the components you'll create, and list any data or API work.

Then build in this order. Commit after each phase with a clear message.

1. **Foundation.**
   - Add the design tokens and fonts to the existing theme or CSS setup.
   - Build the shared components: SiteHeader, SiteFooter, PortalNav, ResumeThumb, buttons, inputs, cards and chips.
   - ResumeThumb should render the real resume template components scaled down with sample data, not static images.
2. **Public site.** Home, Find jobs (`/jobs`), Templates, Examples and the example detail page, ATS checker (logged-out flow with the sign-up gate), Auto-Apply, Cover letter landing, Pricing, Resources and Article, About, Contact, Legal, 404.
3. **Auth and onboarding.**
   - Sign up, Log in, Check email (magic link), and the 3-step Onboarding.
   - Lazy registration: the logged-out ATS check and the first builder step can be saved into a new account.
4. **Portal.** Dashboard, My resumes, Builder (desktop and the mobile Edit/Preview toggle), Cover letters and the editor, Find jobs with working search, Job detail, Applications board, Auto-Apply (Settings and Queue), ATS check, Account, Billing, Checkout, Upgrade success, Cancel flow.
5. **Business rules.**
   - Enforce the Free vs Pro table from HANDOFF.md on the **server**, not just in the UI.
   - Add contextual upgrade prompts at the listed moments, and tag each checkout start with its trigger.
6. **Bugs.** Fix the six live-site bugs listed in HANDOFF.md.
7. **Polish.**
   - Remove every em dash (—) from user-facing copy.
   - Check every page at 390 px and 1440 px.
   - Keep all existing URLs working, adding 301 redirects where routes changed.
   - Don't touch admin functionality.

## Rules
- Placeholders in `[square brackets]` must stay visible and be listed at the end. Don't invent prices, stats, testimonials or legal text.
- Wire sample data (jobs, match scores) to the real job data and matching the app already has. If something doesn't exist yet, build a clean interface for it and tell me what's missing. Don't fake it in production.
- Accessibility: real buttons, links and labels; `aria-label` on icon buttons; 4.5:1 contrast; 44 px tap targets; visible focus.

## Verify
Before you deploy:
- Run the build, lint, type-check and tests. Fix all failures.
- Run the app locally and click through every route in the HANDOFF route map, at desktop and mobile widths.
- Run Lighthouse on `/`, `/pricing`, `/jobs` and `/dashboard`. Targets: Accessibility 95+, Performance 85+ on mobile.
- Confirm sign-up, log-in, onboarding, resume create/edit/PDF download, job search, upgrade checkout handoff and cancel all work end to end.

## Ship it live
1. Work on a branch named `redesign-2026`. Open a pull request with a summary and screenshots of key pages (desktop and mobile).
2. Deploy a preview or staging build using this project's existing deployment setup. Check it works.
3. Merge to the production branch and deploy to production using the same pipeline the site already uses. Ask me only if a step needs credentials or access you don't have.
4. After deploying, visit https://www.hiredtodayapp.com and the key routes to confirm the new design is live and working, including on a mobile viewport.

## Report back
When you're done, tell me:
- what changed
- the PR link and deployment URL
- anything you couldn't finish and why
- the full list of placeholders I still need to fill in
- any new environment variables or services I need to set up (for example, LinkedIn or Apple sign-in, a job data source)
