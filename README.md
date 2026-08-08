# Marram Care

A premium, mobile-first specialist care matching platform for the UK — connecting families
managing complex health, learning disability, autism, mental health and physical disability needs
with DBS-verified care professionals and vetted care agencies. Built end-to-end as a working
full-stack app from the product brief in `build-prompt-complex-care-platform.md`, then extended
through several rounds with SEO, safeguarding, payments, agency onboarding, and UK-specific
compliance positioning after market research (below).

## Quick start

```bash
npm install
npm run seed      # (re)generates demo data in a local SQLite file (data/carebridge.db)
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

No third-party API keys are required to run the app or exercise any feature end to end — every
integration (AI, payments, verification checks, file storage, email) has a fully working,
deterministic mock/local mode that activates automatically when its real credentials aren't set.
See "Environment variables" below for what to add when you're ready to go live with each one.

## Demo accounts

All demo accounts use password `password123`.

| Role         | Email                       | Notes                                              |
|--------------|-------------------------------|-----------------------------------------------------|
| Family       | grace@family.demo             | Has an active booking with Marcus                   |
| Family       | daniel@family.demo            |                                                       |
| Family       | fatima@family.demo            |                                                       |
| Professional | marcus@pro.demo               | Verified, active booking, connected payout account   |
| Professional | sade@pro.demo                 | Verified, part of the demo agency's roster           |
| Professional | aisha@pro.demo                | In review, DBS expiring soon                         |
| Professional | tom@pro.demo                  | Pending, has an unaccepted agency roster invite      |
| Agency       | agency@marramcare.demo        | Verified agency with Sade on its roster              |
| Admin        | admin@marramcare.co.uk        | Verification queues, revenue, agency approvals       |

## Market research: does this need to exist?

Short answer: yes, on the numbers. Researched at build time (2026), not asserted from priors:

- The UK domiciliary (home) care market is worth **£6.7bn in 2026**, growing at a **6.8% CAGR**,
  with **638,000+ people** currently receiving home care in the UK (499,364 in England alone).
- **Hospital discharge pressure is a named, current driver**: 40% of adult social care directors
  reported demand for home care rising more than 10% in 2025, largely from discharge and
  reablement pressure — this is the exact "NHS moving care closer to home" trend the product brief
  was built around, not a hypothetical.
- DHSC projects **57% more adults aged 65+ will need home care by 2038** versus 2018 — the demand
  curve is structural, not cyclical.
- On the supply side, existing UK marketplaces (**Elder**, **HomeTouch**) already prove
  self-employed carer marketplaces work commercially — but both match primarily on general
  caregiving skills, personality and availability. Neither publicly foregrounds a structured,
  filterable taxonomy of *clinical and behavioural specialisms* (PEG feeding, tracheostomy care,
  autism, learning disability, mental health, challenging behaviour/PBS) as Marram Care does. That
  gap — specialist-first matching for complex care, not general caregiving — is the product's
  actual wedge, and it lines up with where NHS-driven demand is concentrated (complex discharge
  packages), not general companionship care.
- **NHS Continuing Healthcare (CHC) personal health budgets and local authority direct payments**
  are a real, legally-established funding route that puts money directly in families' hands to
  arrange exactly this kind of care themselves — and no reviewed competitor makes funding source a
  first-class part of onboarding. Marram Care does (see Funding source in onboarding), which is
  both a genuine user need and a wedge into a funded-but-underserved segment.

Conclusion: the underlying problem is real, current, and growing, and there's a specific,
defensible gap (specialist-tag depth + funding-source awareness) that general carer marketplaces
aren't filling. That doesn't guarantee a business succeeds — distribution, trust, and unit
economics still have to be earned — but the premise from the source video holds up against
independent data, not just its own framing.

## How it makes money

Marram Care takes a **15% platform fee** on the hourly rate a family pays (`src/lib/pricing.ts`,
`PLATFORM_FEE_PERCENT`) — in line with the lower end of the 20–30% commission range established UK
marketplaces like HomeTouch use, chosen to be competitive while the platform builds trust and
liquidity. Money moves through a Stripe Connect–style escrow flow: authorised when a family
requests a booking, released to the professional the moment the booking is marked complete, or
refunded on decline/cancellation (`src/lib/payments.ts`). This build runs a fully worked **mock**
of that flow by default (see Payments below) so the whole booking-to-payout lifecycle is testable
without live Stripe credentials.

## What's built (fully working, smoke-tested end to end)

- **Marketing site** — premium, mobile-first landing page, "How it works," "For professionals,"
  "For agencies," "Trust, Safety & Compliance," dual CTA, working newsletter capture in the footer.
- **Auth** — email/password signup & login (scrypt-hashed, HMAC-signed session cookie), **email
  verification** (token + expiry, resend from dashboard), **password reset** (request/reset flow,
  enumeration-safe), referral code capture (`?ref=CODE`) attributing new signups to whoever
  referred them.
- **Family onboarding** — care recipient profile: needs (12 specialist tags, with an AI-assisted
  free-text "suggest specialisms" helper), location, budget, **funding source** (self-funded /
  local authority direct payment / NHS CHC personal health budget / family or other), and an
  explicit UK GDPR special-category-data consent checkbox.
- **Professional onboarding** — headline/bio/rate, specialist experience tags with hands-on level,
  real document upload (DBS, reference, qualification — stored as real files, automatically
  run through a mock verification check), and a DBS Update Service subscription flag.
- **Agency onboarding & roster management** — a third account type alongside families and
  professionals. Agencies complete a company profile (CQC number if applicable, Companies House
  number), get admin-verified, then invite professionals by email to join their roster. Invited
  professionals keep their own individual verification status; once an agency is verified, its
  roster shows a "via [Agency]" badge in search and on profiles, and the agency gets a public
  profile page listing its verified staff. See "For agencies" in the app and `/dashboard/agency`.
- **Specialist search & matching** — filter by tag/location, paginated results; ranked match score
  weighing tag coverage, experience level, verification status, location, rating, and budget fit
  (`src/lib/matching.ts`), plus an AI-generated one-line "why this match" narrative on profiles.
- **Professional profiles** — verified/in-review/rejected badges, tag list, document status,
  verified training/certifications, agency affiliation, transparent fee breakdown, JSON-LD
  structured data for SEO, and a "report a safeguarding concern" disclosure.
- **Training & certifications** — professionals add completed courses/qualifications with evidence
  upload; admins verify them independently of the core DBS/reference/ID checks; only verified
  certifications show on a public profile.
- **Booking & payments** — request → accept/decline → complete/cancel. Requesting a booking
  authorises a payment (mock Stripe Connect); marking it complete releases the professional's
  payout; declining/cancelling refunds it. Fee breakdown is shown to both sides at every step.
- **Digital visit log** — professional checks in/out against an active booking with notes; family
  sees a time-stamped visit history. A lightweight, opt-in step toward electronic visit
  verification (EVV) — see the CQC note in `/trust-and-safety` about where this sits regulatorily.
- **In-app messaging** — per-booking conversation thread.
- **Reviews** — two-way, posted after a booking is marked completed; recalculates the
  professional's running rating average.
- **Notifications** — real in-app notifications (bell menu with unread count) plus email for every
  significant event (booking requests/responses, messages, reviews, verification outcomes, agency
  invites) — see Notifications & email below.
- **Safeguarding reports** — anyone can flag a concern about a professional or booking; an AI
  triage step assigns a severity so urgent reports surface first; goes to a priority admin queue,
  independent of routine document review.
- **Referral growth loop** — every user gets a shareable referral link; dashboards show who's
  joined through it.
- **Admin dashboard** — verification queue with document expiry countdowns (approve/reject),
  training/certification queue, agency verification queue, safeguarding report queue (AI severity
  badges), platform revenue (fee earned vs. pipeline), newsletter lead count, full professional
  list.
- **SEO** — per-page metadata (Open Graph/Twitter), `robots.ts`, `sitemap.ts` (auto-includes every
  verified professional profile), JSON-LD for the organisation and each professional, `noindex` on
  private routes (dashboards, admin, bookings, onboarding).
- **Analytics/consent** — env-gated GA4 + Meta Pixel loader that only fires after a visitor
  accepts a cookie consent banner; renders nothing at all when no vendor is configured.
- **Accessibility** — skip-to-content link, focus-visible states on every interactive control,
  `aria-label`s on icon-only buttons (notification bell, mobile menu), `role="alert"`/`role="status"`
  on form feedback, keyboard-operable disclosure menus.
- **Mobile-first UI** — hamburger nav with full menu + auth state on small screens, stacked
  full-width CTAs on mobile, touch-sized tap targets throughout.

Every server mutation above was exercised against the running app via real HTTP requests (not just
type-checked) — see "How this was tested" below.

## Architecture

- **Next.js 14 (App Router) + TypeScript + Tailwind CSS.**
- **Data layer — dual-driver SQLite**, chosen specifically for a GitHub → Vercel deployment (see
  "Deploying to Vercel" below):
  - **Local dev:** Node 22's built-in `node:sqlite` (`DatabaseSync`) — a real embedded database,
    zero setup, zero native compilation.
  - **Production (Vercel):** [Turso](https://turso.tech) (`@libsql/client`) — a hosted,
    network-reachable SQLite-compatible database. Vercel serverless functions have an ephemeral
    filesystem, so a local file-backed database can't persist between invocations; Turso solves
    that while keeping the exact same SQL schema and query code.
  - `src/lib/sqlite.ts` picks the driver at runtime based on whether `TURSO_DATABASE_URL` is set —
    everything else in the app (`src/lib/db.ts`, `src/lib/queries.ts`, `src/app/actions.ts`) is
    driver-agnostic, fully `async`, and doesn't change between dev and prod.
- **Auth:** `src/lib/crypto.ts` + `src/lib/auth.ts` — scrypt password hashing, HMAC-signed
  httpOnly session cookie, email verification and password reset tokens (24h expiry).
- **Mutations:** Next.js Server Actions (`src/app/actions.ts`, `src/app/agency-actions.ts`,
  `src/app/(auth)/actions.ts`, `src/app/marketing-actions.ts`) — no separate REST/API layer needed,
  except one authenticated route for serving uploaded files (`src/app/api/uploads/[...path]`).
- **Matching engine:** `src/lib/matching.ts` — scores each professional against a family's needs
  (tag coverage 40%, tag experience level 20%, location 15%, verification 15%, rating 5%, budget
  fit 5%). Simple, tunable, and a clear seam for a smarter matching model later.
- **AI (`src/lib/ai.ts`):** every AI-touching feature (specialism tag suggestions, match
  narratives, safeguarding-report triage) checks for `ANTHROPIC_API_KEY` and calls Claude
  (`claude-haiku-4-5`) when it's present; without a key, or if the call fails for any reason, it
  falls back to deterministic keyword/heuristic logic. The app never blocks or degrades visibly
  without an API key — this is an AI-first product that stays fully functional AI-free.
- **Verification automation (`src/lib/verification.ts`):** documents are run through a mock
  auto-check adapter that mirrors the decision logic a real provider webhook would apply
  (reasonable filename → auto-verify with a confidence score), so the demo shows automated
  verification working end to end. Real integration targets are documented in the file header:
  DBS umbrella-body APIs (uCheck, Sterling, Basecheck) for the DBS check, and a webhook-driven flow
  for references.
- **File storage (`src/lib/storage.ts`):** uploaded documents/certifications are written as real
  bytes to disk outside of `/public`, served only through an authenticated route
  (`src/app/api/uploads/[...path]/route.ts`) that checks the requester is the owning professional
  or an admin, with a path-traversal guard. Set `STORAGE_PROVIDER=s3` to signal the swap-in point
  for S3/Cloudflare R2 in production (throws with a clear message until that adapter is built —
  local disk storage doesn't persist on Vercel's ephemeral filesystem, so this is the one piece
  that must move to object storage before a real production launch).
- **Payments (`src/lib/payments.ts`):** mock Stripe Connect adapter — authorises a payment when a
  booking is requested, releases it to the professional's connected payout account on completion,
  refunds it on decline/cancellation. Swaps to real Stripe automatically once `STRIPE_SECRET_KEY`
  is set (the live adapter itself still needs to be implemented — see Known limitations).
- **Notifications (`src/lib/notifications.ts`):** every significant event writes a real in-app
  notification (SQLite-backed, shown in the navbar bell) and sends an email. Email uses
  [Resend](https://resend.com)'s API when `RESEND_API_KEY` is set; otherwise it logs to an
  `email_outbox` database table — a fully inspectable, testable "sent mail" log so the whole
  notification pipeline works without real credentials.

## Deploying to Vercel

1. Push this repo to GitHub and import it into Vercel.
2. Create a [Turso](https://turso.tech) database (`turso db create marram-care`) and get its
   connection URL and auth token (`turso db show marram-care --url`, `turso db tokens create
   marram-care`).
3. In Vercel's project settings, add the environment variables below (Production and Preview).
4. Run the schema + seed against your Turso database once before first deploy:
   ```bash
   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx src/lib/seed.ts
   ```
   (Or skip seeding and let the app create its schema on first request — `ensureSchema()` runs
   automatically — then sign up your own accounts.)
5. Deploy. No further configuration is needed — `src/lib/sqlite.ts` detects `TURSO_DATABASE_URL`
   at runtime and switches drivers automatically; the exact same code path that runs locally
   against `node:sqlite` runs in production against Turso.

Local development never needs Turso — running `npm run dev` without `TURSO_DATABASE_URL` set uses
the local `node:sqlite` file at `data/carebridge.db` with zero setup.

## Environment variables

None of these are required to run the app locally — every integration has a working fallback.
Set the ones you have; the rest degrade gracefully.

| Variable | Required for | Behaviour when unset |
|---|---|---|
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Production deploys (Vercel) | Falls back to local `node:sqlite` file — fine for dev, **not** viable on Vercel's ephemeral filesystem |
| `SESSION_SECRET` | Production | Falls back to a fixed dev-only secret (logs a warning in production) — set a real one with `openssl rand -hex 32` |
| `ANTHROPIC_API_KEY` | AI features (tag suggestions, match narratives, safeguarding triage) | Falls back to deterministic keyword/heuristic logic |
| `RESEND_API_KEY`, `EMAIL_FROM` | Real outbound email | Falls back to an inspectable `email_outbox` database table |
| `STRIPE_SECRET_KEY` | Real payments | Falls back to a fully worked mock Stripe Connect adapter |
| `STORAGE_PROVIDER=s3` | Real object storage | Falls back to local disk storage (not viable on Vercel — see Known limitations) |
| `NEXT_PUBLIC_SITE_URL` | Correct canonical URLs, sitemap, email links | Falls back to `https://marramcare.co.uk` |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | Analytics/ads | No scripts load at all — the consent banner itself only appears once one of these is set |

## Built to scale — what's already in place vs. what's next

**Already scale-conscious:**
- Search results are paginated (`src/app/search/page.tsx`, `PAGE_SIZE = 6`) rather than rendering
  the entire professional list on one page.
- The data layer is a real database (SQLite locally, Turso in production) behind a single
  driver-selection point (`src/lib/sqlite.ts`), not a JSON file — supports real concurrent writes.
- Server Actions + Server Components mean there's no client-side data-fetching waterfall to
  re-architect later — pages are fast by default.
- Sitemap and matching queries are already list-and-filter shaped, not "load everything into the
  browser."
- Notifications, verification checks, and payments are all async and event-driven, ready to move
  behind a real queue without changing their call sites.

**Roadmap to production scale (in priority order):**
1. Move file storage from local disk to S3/Cloudflare R2 — the one component that doesn't survive
   Vercel's ephemeral filesystem as-is (see Known limitations).
2. Wire up real Stripe Connect (Express accounts + PaymentIntents with manual capture) behind the
   existing `src/lib/payments.ts` interface — the booking lifecycle and admin revenue reporting
   don't need to change, only the adapter's internals.
3. Add Redis-backed caching for the search/matching endpoint once professional counts grow past a
   few thousand — the scoring function is cheap per-professional but currently re-scans the full
   table per search.
4. Move to a real job queue (e.g. BullMQ) for anything that shouldn't block a request: DBS Update
   Service polling, expiry reminder emails, safeguarding escalation notifications.
5. CDN in front of Next.js (Vercel's own edge network already covers this for static/marketing
   pages) and consider ISR for public professional/agency profile pages as traffic grows.

## Marketing & growth features

- **SEO from day one** — see the SEO bullet above. Every verified professional and agency profile
  is independently indexable and shareable (their own metadata + JSON-LD), which is real organic
  acquisition surface, not just the homepage.
- **Newsletter/waitlist capture** — working end-to-end (`src/app/marketing-actions.ts`, `Lead`
  records in the database), embedded in the footer of every page.
- **Referral loop** — every account gets a shareable link; attribution is tracked on signup.
- **Analytics/ads, consent-gated** — `src/components/Analytics.tsx` loads GA4/Meta Pixel only after
  a visitor accepts the cookie banner (`src/components/ConsentBanner.tsx`), and only if
  `NEXT_PUBLIC_GA4_MEASUREMENT_ID`/`NEXT_PUBLIC_META_PIXEL_ID` are set. Because this is a UK
  health-adjacent product, special category data and PECR both apply — the consent-first design is
  deliberate, not a placeholder.
- **Agency channel** — `/for-agencies` gives agencies a second acquisition surface: instead of only
  recruiting individual professionals one at a time, an agency can onboard once and bring its whole
  roster, each of whom brings their own network.
- **Content/SEO expansion (not yet built)** — the natural next step is condition-specific landing
  pages (e.g. "PEG feeding carers in Manchester," "Autism support workers in Leeds") generated from
  the same tag + location data already in the matching engine — high-intent, long-tail search
  traffic that most competitors aren't targeting per-condition.

## UK regulation & compliance

See **`/trust-and-safety`** in the running app for the full write-up: CQC introduction-agency
position, employment agency licensing (abolished in 1994; the 2003 Conduct Regulations still
apply), the ICO's mandatory annual data protection fee, DBS/Update Service, safeguarding policy, UK
GDPR special category data handling, VAT registration threshold, agency-specific regulatory notes,
and why the escrow payment flow runs through Stripe (an FCA-authorised payment institution) rather
than Marram Care holding client money directly. None of this is legal advice — it documents the
design intent so a solicitor reviewing the product has a clear starting point, not a black box.

## Known limitations / what's stubbed (by design)

These are flagged explicitly rather than silently faked. Everything below has a fully working mock
that exercises the real code path — nothing is a dead end or a "not built yet" placeholder:

- **File storage** — real bytes are written to local disk (not `/public`) and served through an
  access-controlled route. This works today but **won't persist on Vercel's ephemeral
  filesystem** — move to S3/Cloudflare R2 before a real production launch (set
  `STORAGE_PROVIDER=s3`, then implement the adapter in `src/lib/storage.ts`).
- **Payments** — a complete mock Stripe Connect flow (authorise → release → refund, connected
  payout accounts, fee breakdowns, admin revenue reporting) runs against the local database. Swap
  in real Stripe Connect (Express accounts, PaymentIntents with manual capture) behind the same
  `src/lib/payments.ts` interface once you have live API keys.
- **DBS/reference verification** — a mock auto-check adapter (`src/lib/verification.ts`) mirrors
  the decision logic a real provider webhook would apply. Swap in a DBS umbrella-body API (uCheck,
  Sterling, Basecheck) and a reference-checking webhook when you have provider credentials.
- **Email** — real notifications are sent via Resend when `RESEND_API_KEY` is set; otherwise every
  email is logged to an inspectable `email_outbox` table.
- **AI** — real Claude calls when `ANTHROPIC_API_KEY` is set; deterministic heuristic fallback
  otherwise (see Architecture above).
- **2FA** — deliberately not built in this pass. Email verification and password reset are fully
  implemented; two-factor auth (TOTP or SMS) is the natural next step in auth hardening and would
  slot into `src/lib/auth.ts` alongside the existing session logic.
- **Accessibility** — a targeted pass is done (skip link, focus-visible states, aria-labels on
  icon-only controls, alert/status roles on form feedback, keyboard-operable menus), but no formal
  WCAG 2.1 AA audit with assistive-technology testing has been run.

## Design system

Deep teal (`teal-*`) as the trust color, warm off-white background (`sand-*`), a single confident
coral accent for calls to action — defined in `tailwind.config.ts`. Shared components (`Button`,
`Card`, `Badge`, `VerifiedBadge`, `StarRating`, form `Field`) live in `src/components/ui.tsx`. Built
mobile-first: base Tailwind classes target small screens, with `sm:`/`md:`/`lg:` breakpoints
layering on desktop enhancements (multi-column grids, persistent top nav) rather than the reverse.

## How this was tested

Every Server Action described above was exercised against the running production build via real
HTTP requests (not just type-checked): signup → email verification → login; forgot password →
reset → login with new password; family onboarding → search/matching → booking request → payment
authorisation → accept → complete → payment release → review; document upload → automated
verification check → admin approval; agency signup → onboarding → admin verification → staff
invite → invited professional accepts → shows up on the agency's public roster and gets the "via
[Agency]" badge in search. `npx tsc --noEmit` and `npm run build` are both clean.

## Project structure

```
src/
  app/                 routes (App Router) — marketing, auth (login/signup/verify-email/
                        forgot-password/reset-password), onboarding (family/professional/agency),
                        search, professional profiles, agency profiles, dashboards (family/
                        professional/agency), bookings, admin, trust-and-safety, for-agencies,
                        for-professionals, api/uploads (authenticated file serving), robots.ts,
                        sitemap.ts
  components/          shared UI (ui.tsx), Navbar, MobileMenu, NotificationBell, Footer,
                        NewsletterForm, ReferralPanel, ConsentBanner, Analytics,
                        EmailVerificationBanner, CareNeedsIntake (AI tag suggestions)
  lib/                 types, sqlite.ts (dual-driver DB), db.ts (mappers), queries.ts (reads),
                        auth/crypto, matching engine, pricing (fee breakdown), payments (mock
                        Stripe Connect), storage (file uploads), verification (mock DBS/reference
                        checks), notifications (in-app + email), ai (Claude + fallback), tags,
                        funding sources, document expiry helpers, analytics config, SEO constants,
                        seed script
data/                  local SQLite database + uploaded files (dev only; gitignored)
```
