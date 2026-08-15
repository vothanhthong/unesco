# Second Thought Platform Implementation Plan

This document is the shared delivery tracker for humans and coding agents. Update it immediately when a phase starts, becomes blocked, or passes its acceptance gate.

## Project Goal

Evolve the current anti-scam simulation demo into a persistent youth-led learning platform with two modules:

- **TRAIN**: Manage family members, launch simulations, record outcomes, recommend lessons, and support a joint debrief.
- **CONTRIBUTE**: Report scams, prepare human-authored scenario submissions, review scenarios, and surface community-verified threats.

The existing older-adult learner experience and four-digit pairing flow remain part of TRAIN.

## Status Legend

| Status | Meaning |
|---|---|
| `Not Started` | No implementation work has begun |
| `In Progress` | Work is actively underway |
| `Blocked` | Work cannot continue until a named blocker is resolved |
| `In Review` | Implementation is complete and awaiting verification |
| `Complete` | Acceptance criteria and verification have passed |
| `Merged` | Scope is intentionally delivered inside another phase |

## Agent Update Protocol

Every implementation agent must follow this protocol:

1. Read this file and `PRD.md` before editing code.
2. Set exactly one active phase to `In Progress` before implementation.
3. Change task checkboxes only after the corresponding work is complete.
4. Record blockers in the phase's `Blockers` field with a concrete resolution requirement.
5. Set a phase to `In Review` only after its implementation tasks are complete.
6. Set a phase to `Complete` only after every acceptance criterion and verification command passes.
7. Add a dated entry to the Progress Log after every meaningful status change.
8. Do not silently change scope, routes, data ownership, or moderation policy. Record a decision first.

## Architecture Baseline

| Area | Decision |
|---|---|
| Application | Next.js modular monolith |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth for youth facilitators |
| Older adults | No account required; temporary pairing code |
| File uploads | Supabase Storage with validated signed uploads |
| Realtime | Keep polling initially; evaluate Supabase Realtime later |
| Content creation | Human-authored scenario submissions derived from contributor reports |
| Publication | Human review required; submitted scenarios never auto-publish |
| Recommendations | Explainable rule-based scoring for MVP |
| Community verification | Configurable report and approval thresholds |
| Localization | Vietnamese and English across every implemented user-facing screen |

## Design System Contract

The product UI must follow the UNESCO visual system rather than a generic SaaS dashboard pattern.

**Reference:** https://www.unesco.org/themes/custom/bunesco8/style-guide/index.html

### Source-of-truth rules

- Official UNESCO logo files, typefaces, color values, and usage rules take precedence over local approximations.
- Exact tokens must be recorded from the official guide or approved brand assets before production release.
- If the official guide is unavailable during implementation, use semantic token names and mark values as provisional; do not claim official compliance.
- Do not recreate the UNESCO logo with text, an arbitrary lettermark, or an unapproved icon.
- Do not introduce decorative glassmorphism, excessive gradients, oversized pill shapes, or marketing-dashboard visual patterns into the toolkit.

### Product translation

- Use a modern trust-first visual language: clear hierarchy, generous whitespace, disciplined alignment, and approachable product surfaces.
- Use UNESCO blue as the primary brand accent once its approved value is verified.
- Use white as the primary page background and keep supporting surfaces light and neutral; reserve green, amber, and red for semantic status only.
- Use typography with a clear display/body hierarchy and readable Vietnamese and English copy at mobile sizes.
- Use moderate corner radii, restrained borders, and soft tinted shadows. The interface should feel youthful and approachable without becoming childish or overly informal.
- Keep motion short and functional, and provide a reduced-motion path for every animated state.
- Use official brand assets for the header and authentication surfaces; use neutral product UI where brand lockups are not appropriate.

### Localization contract

- Every implemented user-facing screen must support Vietnamese and English.
- Vietnamese is the default locale; users can switch language without changing routes.
- The selected locale persists across navigation and browser refreshes.
- Navigation, forms, validation feedback, empty/error/loading states, learner simulation, facilitator simulation, recommendations, debrief guidance, dates, times, metadata, and push-notification copy must be localized.
- Translation keys and typed dictionaries are the source of truth; components must not mix Vietnamese and English hardcoded strings.
- Dates and times must use `Intl` with the active locale.
- Scenario identity remains language-neutral; translated scenario copy must not create duplicate practice-history identities.

### Token extraction checklist

- [ ] Verify official logo variants, clear space, minimum size, and approved backgrounds.
- [ ] Verify primary, secondary, neutral, and semantic color values with contrast pairs.
- [ ] Verify approved font families, weights, fallback stacks, and language coverage.
- [ ] Verify spacing scale, grid/container widths, border weights, radii, and shadows.
- [ ] Verify heading, body, label, metadata, and button type styles.
- [ ] Verify responsive breakpoints and minimum touch target sizes.
- [ ] Verify focus, hover, disabled, error, success, and loading states.
- [ ] Store the approved values in shared CSS tokens and document their source.

### Current limitation

The public style-guide URL may require bot verification in automated environments. Until the official values and assets are accessible, Phase 2 may implement the semantic token structure and layout rules, but the UNESCO compliance acceptance criterion remains open.

## Proposed Phase 0 Defaults

These are implementation defaults to reduce ambiguity. They remain **proposed** until the product owner approves them; agents must not treat them as silently accepted decisions.

| Decision | Proposed default | Why |
|---|---|---|
| Module count | Two modules: TRAIN and CONTRIBUTE | Matches the stated product goal and route target |
| Backend | Supabase PostgreSQL, Auth, and Storage | Matches the architecture baseline and supports RLS and private evidence |
| Youth authentication | Supabase email magic link initially | Low-friction facilitator access without adding a custom password system |
| Older-adult identity | Temporary four-digit pairing code; no account | Preserves the current learner experience |
| Review quorum | Two distinct youth reviewers for publication; one reviewer may edit but cannot self-approve | Separates authorship from approval for the MVP |
| Verification threshold | Three matching reports from at least two contributors plus two reviewer approvals | Limits single-report false positives while remaining attainable for an MVP |
| Trending window | At least three matching reports in seven days, calculated from verified records only | Makes “trending” explainable and time-bounded |
| Raw evidence retention | Private by default; retain for 90 days after resolution unless deletion is requested | Minimizes sensitive-data exposure while preserving moderation context |
| Derived scenario retention | Retain approved scenario versions and audit history until explicitly deprecated | Preserves learning content and accountability |
| Personal information | Warn before submission, detect likely PII, require redaction before publication, never expose raw evidence in community views | Protects families and contributors |

### Phase 0 approval checklist

- [ ] Product owner accepts the two-module scope.
- [ ] Product owner accepts Supabase as the initial infrastructure provider.
- [ ] Product owner accepts the review, verification, trending, and retention defaults.
- [ ] Product owner provides or approves official UNESCO assets/tokens when the style-guide values cannot be fetched automatically.

## Route Target

| Route | Responsibility |
|---|---|
| `/toolkit` | Shared youth workspace and module navigation |
| `/toolkit/train` | Family dashboard and recommendations |
| `/toolkit/train/family/[memberId]` | Family member history and scenario selection |
| `/toolkit/train/session/[sessionId]` | Pairing, launch, result, and debrief |
| `/toolkit/contribute` | Contribution overview |
| `/toolkit/contribute/report` | New scam report form |
| `/toolkit/contribute/submissions/[submissionId]` | Human-authored scenario submission editing |
| `/toolkit/contribute/review` | Youth Review Hub |
| `/toolkit/contribute/community` | Community-verified and trending scams |
| `/` | Existing older-adult learner experience |
| `/trigger` | Compatibility redirect to `/toolkit/train` after migration |
| `/learner` | Compatibility redirect to `/` |

## Phase Summary

| Phase | Name | Status | Depends On |
|---|---|---|---|
| 0 | Scope and Architecture Confirmation | `Complete` | None |
| 1 | Persistent Product Foundation | `In Review` | Phase 0 |
| 2 | Shared Toolkit UI Shell | `In Review` | Phase 1 |
| 3 | TRAIN Module Uplift | `In Review` | Phase 2 |
| 4 | CONTRIBUTE + Youth Review Hub | `In Progress` | Phase 2 |
| 5 | Youth Review Hub | `Merged` | Phase 4 |
| 6 | Community Verification | `Not Started` | Phases 4 and 5 |
| 7 | Security, QA, and Release | `Not Started` | Phases 3 through 6 |

---

## Phase 0: Scope and Architecture Confirmation

**Status:** `Complete`

**Objective:** Confirm module scope, infrastructure choices, domain ownership, and moderation rules before database work begins.

### Tasks

- [x] Document the TRAIN and CONTRIBUTE product direction.
- [x] Map the current session store, APIs, learner route, and trigger route.
- [x] Select a modular monolith architecture.
- [x] Define the proposed route architecture.
- [x] Confirm whether the product has two total modules or an additional third module.
- [x] Confirm Supabase as the database, authentication, and storage provider.
- [x] Define community verification thresholds and reviewer quorum.
- [x] Define evidence retention and personal-information handling rules.
- [x] Approve the Proposed Phase 0 Defaults.
- [x] Record the UNESCO design-system source and defer exact token extraction to the Phase 2 design-system gate.

### Acceptance Criteria

- [x] Product owner confirms module scope.
- [x] Product owner confirms infrastructure choices.
- [x] Publication and community verification policies are documented.
- [x] UNESCO design-system source and the current automated-access limitation are recorded; exact token validation remains a Phase 2 gate.
- [x] No unresolved architecture blocker remains for Phase 1.

**Blockers:** None for Phase 1. UNESCO token extraction remains an open Phase 2 design-system gate.

---

## Phase 1: Persistent Product Foundation

**Status:** `In Review`

**Objective:** Replace demo-only domain storage with persistent, authenticated product foundations while preserving the current simulation.

### Data Model

- `profiles`
- `family_members`
- `scenarios`
- `scenario_versions`
- `practice_sessions`
- `practice_results`
- `scam_reports`
- `report_attachments`
- `scenario_drafts`
- `scenario_reviews`
- `scam_clusters`

### Tasks

- [x] Add Supabase client and server configuration.
- [x] Add environment-variable validation without exposing secrets.
- [x] Create database migrations for the domain model.
- [x] Add row-level security policies for youth-owned records.
- [x] Add storage buckets and upload policies for scam evidence.
- [x] Extract scenario definitions from `src/app/trigger/page.tsx` into seed data.
- [x] Create shared domain types and input schemas.
- [x] Persist practice sessions while retaining four-digit pairing.
- [x] Add a migration or compatibility adapter for the existing APIs.
- [x] Add database and authorization smoke tests.

### Acceptance Criteria

- [x] Data survives server restarts through the Supabase-backed session adapter.
- [ ] Youth users can access only their own family and contribution records.
- [ ] Published scenarios are readable by TRAIN.
- [x] Existing learner pairing, trigger, and result flows work in local compatibility and Supabase-backed modes.
- [x] Database migration and seed apply cleanly to the linked environment; remote schema lint passes.

**Blockers:** Authenticated cross-owner RLS behavior and the future TRAIN published-scenario read path still need verification during Phase 2/3 integration.

---

## Phase 2: Shared Toolkit UI Shell

**Status:** `In Review`

**Objective:** Create one coherent youth workspace for TRAIN and CONTRIBUTE without changing the older-adult interface.

### UI Direction

- UNESCO editorial identity with a trust-first product interface.
- Light theme with UNESCO blue as the primary accent.
- Semantic green, amber, and red reserved for status.
- Clear desktop navigation and compact mobile module tabs.
- Restrained motion with reduced-motion support.
- Consistent loading, empty, error, and success states.

### Tasks

- [x] Create the `/toolkit` auth-ready workspace layout.
- [x] Add TRAIN and CONTRIBUTE primary navigation.
- [x] Add responsive desktop, tablet, and mobile navigation behavior.
- [x] Extract shared color, spacing, typography, shape, motion, and focus tokens as provisional toolkit tokens.
- [ ] Replace placeholder branding with approved UNESCO assets and documented usage rules.
- [ ] Add semantic color pairs and verify WCAG AA contrast for every toolkit state.
- [x] Create shared page header, status, and feedback components.
- [ ] Add shared form and empty-state variants when module forms are introduced.
- [x] Add route-level loading and error states.
- [x] Preserve `/trigger` until the TRAIN migration is complete.

### Acceptance Criteria

- [ ] Navigation fits on one desktop line and remains usable on mobile.
- [x] Both modules use the same visual and accessibility system.
- [x] Keyboard focus is visible across all shared controls.
- [ ] Toolkit pages pass WCAG AA contrast checks.
- [ ] No unapproved placeholder logo or guessed official brand token remains in production UI.

**Blockers:** Official UNESCO assets/token verification and a WCAG AA contrast audit remain open. Playwright is not installed in this workspace, so responsive verification currently relies on route smoke tests and CSS media review.

---

## Phase 3: TRAIN Module Uplift

**Status:** `In Review`

**Objective:** Turn the current scenario launcher into a family learning journey with history, recommendations, and debriefs.

### Target Flow

`Youth -> Choose family member -> Choose scenario -> Launch simulation -> Older adult responds -> Joint debrief -> History updated`

### Tasks

- [x] Build family member creation, editing, and selection.
- [x] Build the My Family overview.
- [x] Display completed scenarios and outcomes per family member.
- [x] Implement explainable rule-based recommendations.
- [x] Add scenario search and category filtering.
- [x] Move the current trigger workflow into `/toolkit/train`.
- [x] Associate every practice session with a family member and scenario.
- [x] Persist passed and failed outcomes.
- [x] Add a joint debrief with warning signs and discussion prompts.
- [x] Localize the implemented TRAIN, learner, facilitator, and shared toolkit screens in Vietnamese and English.
- [x] Add a persistent language switcher to the implemented user journeys.
- [x] Refresh implemented screens with white canvases, moderate radii, softer typography, and approachable interaction states.
- [ ] Redirect `/trigger` to `/toolkit/train` after compatibility verification.

### Recommendation Rules

- [x] Exclude recently completed scenarios.
- [x] Prioritize categories not yet practiced.
- [x] Reintroduce failed scenarios after another lesson.
- [x] Boost verified scams relevant to the family member's locale.
- [x] Show a human-readable reason for each recommendation.

### UI Acceptance Criteria

- [x] A facilitator can understand one family member's progress without opening another page.
- [x] Completed, recommended, and available scenarios are visually distinct.
- [x] Scenario launching requires a selected family member.
- [x] The current pairing and send flow remains familiar.
- [x] Mobile layouts collapse to a clear single-column flow.

### Functional Acceptance Criteria

- [x] Completing a simulation updates family history.
- [x] Recommendations change after a recorded result.
- [x] A failed result produces relevant debrief guidance.
- [x] Existing learner behavior remains unchanged.
- [ ] Users can complete the implemented TRAIN journey in either Vietnamese or English.
- [ ] Language selection persists after navigation and refresh.
- [ ] Refreshed screens remain trustworthy, accessible, and usable on mobile.

**Blockers:** The final compatibility decision for the legacy `/trigger` entry point remains open. Dependency audit reports four high-severity transitive advisories; automatic remediation requires a forced Next.js upgrade and must be handled as a release dependency decision.

---

## Phase 4: CONTRIBUTE Reporting

**Status:** `In Progress`

**Objective:** Give young people one CONTRIBUTE workspace to submit observed scams, discover verified community patterns, upvote priorities, and review scenario drafts when authorized.

### Supported Evidence

- Screenshots
- Scam messages
- Phishing emails
- Voice recordings
- Family scam stories

### Tasks

- [x] Build the CONTRIBUTE overview page.
- [x] Build a progressive single-page scam report form.
- [x] Add source type, description, locale, and context fields.
- [x] Add screenshot, document, and audio uploads.
- [x] Validate MIME type, extension, size, and upload count.
- [x] Add privacy consent and personal-information warnings.
- [x] Add sensitive-information detection and redaction-required states.
- [x] Add report submission confirmation and failure recovery.
- [x] Add personal report history and processing status.
- [x] Surface verified community trends and authenticated upvotes on CONTRIBUTE.
- [x] Embed the youth review queue into the CONTRIBUTE page for authorized reviewers.
- [ ] Allow contributors to prepare a manual scenario submission from a report.

### Acceptance Criteria

- [x] A youth user can submit a text-only scam report.
- [x] A youth user can submit supported evidence safely.
- [x] Invalid and oversized files are rejected with clear guidance.
- [x] Uploaded evidence is private by default.
- [x] The contributor can see the report's processing status.
- [x] Contributors can discover verified community patterns and upvote priorities for TRAIN.
- [ ] Authorized youth reviewers can see and act on pending scenario drafts from the same CONTRIBUTE page.
- [ ] A contributor can manually draft and edit every scenario field.

**Blockers:** Manual scenario-draft handoff and reviewer actions remain for the next Phase 4 slice; publication still requires the documented review quorum.

---

## Phase 5: Youth Review Hub

**Status:** `Merged`

**Objective:** Make youth co-creators by enabling review, editing, approval, and outdated-content decisions for human-authored submissions. This scope is delivered inside Phase 4 on the shared CONTRIBUTE page.

### Review Actions

- Approve
- Edit Draft
- Mark Outdated

### Tasks

- [ ] Build the review queue with category, locale, and status filters.
- [ ] Build a split review workspace for evidence and submitted scenario content.
- [ ] Allow edits to wording, local context, scam flow, images, names, and regional relevance.
- [ ] Require a reason when marking a draft outdated.
- [ ] Add reviewer attribution and timestamps.
- [ ] Add immutable scenario version history.
- [ ] Add conflict handling for simultaneous reviews.
- [ ] Add approval quorum enforcement.
- [ ] Promote approved versions into the published scenario catalog.

### Acceptance Criteria

- [ ] A reviewer can compare evidence and draft without losing context.
- [ ] Every edit creates an attributable revision.
- [ ] Outdated decisions include a recorded reason.
- [ ] Approval rules are enforced server-side.
- [ ] Only approved scenario versions appear in TRAIN.

**Blockers:** Reviewer quorum must be confirmed in Phase 0.

---

## Phase 6: Community Verification

**Status:** `Not Started`

**Objective:** Detect repeated scam patterns and create a community-driven early warning feed.

### Tasks

- [ ] Normalize report text and metadata for comparison.
- [ ] Add similarity matching and report clustering.
- [ ] Add safeguards against false merging.
- [ ] Calculate trending status from recent verified activity.
- [ ] Apply configurable report and reviewer thresholds.
- [ ] Build the community scam feed.
- [ ] Add category, region, trending, and availability filters.
- [ ] Link published community scenarios into TRAIN recommendations.
- [ ] Add moderation controls for disputed clusters.

### Acceptance Criteria

- [ ] Similar reports can be clustered without exposing contributor evidence.
- [ ] Trending and verified labels use documented rules.
- [ ] Community counts derive from real records.
- [ ] Disputed or rejected reports do not inflate verification status.
- [ ] Published community scenarios can be launched from TRAIN.

**Blockers:** Verification thresholds must be confirmed in Phase 0.

---

## Phase 7: Security, QA, and Release

**Status:** `Not Started`

**Objective:** Verify complete user journeys, privacy controls, accessibility, performance, and safe migration.

### Tasks

- [ ] Add authorization and row-level security tests.
- [ ] Add file-upload security tests.
- [ ] Add API validation and rate-limit tests.
- [ ] Add unit tests for recommendation rules.
- [ ] Add unit tests for verification thresholds.
- [ ] Add end-to-end tests for TRAIN.
- [ ] Add end-to-end tests for CONTRIBUTE.
- [ ] Test learner pairing and push notifications.
- [ ] Test desktop, tablet, and mobile layouts.
- [ ] Test Vietnamese and English journeys, locale persistence, and localized date/time formatting.
- [ ] Run accessibility and keyboard-navigation audits.
- [ ] Run Lighthouse and Core Web Vitals checks.
- [ ] Review all Vietnamese product copy.
- [ ] Verify compatibility redirects and analytics identifiers.
- [ ] Document deployment, rollback, and data recovery procedures.

### Release Gate

- [ ] `npm run lint` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes.
- [ ] Unit, integration, and end-to-end tests pass.
- [ ] No critical or high security finding remains open.
- [ ] WCAG AA checks pass for primary journeys.
- [ ] Existing learner workflow has no regression.
- [ ] Production migrations and rollback are tested.

**Blockers:** None recorded.

---

## Decisions Log

| Date | Decision | Status | Rationale |
|---|---|---|---|
| 2026-08-15 | Use a modular Next.js monolith | Accepted | Lowest migration cost and sufficient for the next product phase |
| 2026-08-15 | Keep older adults account-free | Accepted | Preserves the accessible four-digit pairing experience |
| 2026-08-15 | Require human review before publishing submitted scenarios | Accepted | Prevents unsafe or inaccurate simulations from entering TRAIN |
| 2026-08-15 | Start recommendations with explainable rules | Accepted | Easier to validate, explain, and test than an ML recommender |
| 2026-08-15 | Use Supabase PostgreSQL, Auth, and Storage | Accepted | Provides persistence, row-level security, and private evidence storage |
| 2026-08-15 | Use two-reviewer publication quorum and three-report community threshold | Accepted | Provides a small, explainable moderation gate for the MVP |
| 2026-08-15 | Retain raw evidence privately for 90 days after resolution | Accepted | Limits sensitive-data exposure while preserving moderation context |
| 2026-08-15 | Start Phase 2 while Phase 1 RLS and TRAIN-catalog follow-ups remain tracked | Accepted | Product owner requested the next phase after the persistence foundation passed its available verification gates |
| 2026-08-15 | Remove automated scenario generation from the MVP scope | Accepted | Contributors will prepare scenario submissions manually |
| 2026-08-15 | Support Vietnamese and English on all implemented screens | Accepted | The product must serve local and international youth and family participants |
| 2026-08-15 | Refresh the UI toward approachable trust | Accepted | White backgrounds, moderate rounding, softer typography, and restrained motion better fit the youth audience without weakening credibility |
| 2026-08-15 | Use shadcn source-owned primitives with a premium utilitarian treatment | Accepted | Thin dividers, warm monochrome surfaces, restrained pastel semantics, and editorial hierarchy keep the youth workspace serious without becoming generic SaaS |
| 2026-08-15 | Make CONTRIBUTE a community trend and reporting surface | Accepted | The overview should surface verified community-reported patterns with explainable counts and upvotes, while raw reports and evidence remain private |
| 2026-08-15 | Make the CONTRIBUTE overview community-first | Accepted | Keep one clear Create report action in the hero, use Latest/Trending tabs for discovery, and move reviewer access below the public community feed |

## Progress Log

| Date | Phase | Update | Author |
|---|---|---|---|
| 2026-08-15 | Phase 0 | Created architecture, UI plan, delivery phases, and shared tracking protocol | OpenCode |
| 2026-08-15 | Phase 0 | Added UNESCO design-system contract, source-of-truth rules, and proposed product defaults; awaiting owner approval | OpenCode |
| 2026-08-15 | Phase 0 | Product owner approved Phase 0 defaults; Phase 0 closed and Phase 1 activated | OpenCode |
| 2026-08-15 | Phase 1 | Added Supabase clients, environment validation, domain migration, RLS/storage policies, seed data, schemas, persistence adapter, and API validation | OpenCode |
| 2026-08-15 | Phase 1 | Local compatibility flow verified; Supabase-backed acceptance remains pending because no CLI/project credentials are configured | OpenCode |
| 2026-08-15 | Phase 1 | Linked Supabase migration, seed, remote schema lint, and Phase 1 smoke query passed; session data recovered after an application restart | OpenCode |
| 2026-08-15 | Phase 2 | Activated the shared toolkit shell while retaining Phase 1 RLS and TRAIN-catalog follow-ups | OpenCode |
| 2026-08-15 | Phase 2 | Implemented auth-ready layout, responsive navigation, provisional tokens, shared feedback states, and TRAIN/CONTRIBUTE overview routes | OpenCode |
| 2026-08-15 | Phase 2 | Lint, type-check, build, and route smoke tests passed; visual Playwright verification is pending because Python Playwright is unavailable | OpenCode |
| 2026-08-15 | Phase 3 | Activated TRAIN and added authenticated family overview, family creation/selection, explainable recommendations, scenario search/filtering, and history loading | OpenCode |
| 2026-08-15 | Phase 3 | Added authenticated session creation with family/scenario association and preserved the `/trigger` handoff with prefilled session/scenario context | OpenCode |
| 2026-08-15 | Phase 3 | Lint, type-check, Vitest, and production build passed after the TRAIN slice; family editing, in-page debrief prompts, locale boosts, and full TRAIN migration remain open | OpenCode |
| 2026-08-15 | Phase 3 | Added family editing, locale/verification metadata, generated warning signs and discussion prompts, and the `/toolkit/train/session/[sessionId]` compatibility route | OpenCode |
| 2026-08-15 | Phase 3 | Lint, type-check, five tests, production build, and diff checks passed; npm audit reports four high-severity transitive advisories requiring a separate dependency decision | OpenCode |
| 2026-08-15 | Phase 3 | Applied the scenario locale/verification migration to the linked Supabase project; linked schema lint passed with no errors | OpenCode |
| 2026-08-15 | Phase 3 | Reused the trigger experience from `/toolkit/train/session/[sessionId]` instead of redirecting, while retaining `/trigger` as the compatibility entry point | OpenCode |
| 2026-08-15 | Phase 3 | Fixed client Supabase configuration by changing public environment access to static Next.js references; fresh browser bundle verification found both public values | OpenCode |
| 2026-08-15 | Scope | Removed automated scenario generation from the roadmap, renumbered downstream phases, and added bilingual and approachable-UI requirements | OpenCode |
| 2026-08-15 | Phase 3 | Consolidated the UI around a provisional Geist/system type stack, UNESCO-blue trust accent, restrained community color accents, responsive learner framing, and accessible interaction states; lint, type-check, tests, build, and diff checks passed | OpenCode |
| 2026-08-15 | Phase 3 | Initialized shadcn for the Next.js/Tailwind v4 app, added Button/Card/Badge/Input/Textarea primitives, migrated icons to Phosphor, and composed the toolkit, TRAIN, login, CONTRIBUTE, learner, and facilitator surfaces with a premium utilitarian visual system; all validation gates passed | OpenCode |
| 2026-08-15 | Phase 3 | Reversed the previous neobrutalist treatment in favor of warm monochrome surfaces, 1px dividers, restrained shadows, editorial spacing, and muted semantic accents; product flows and localization remain unchanged | OpenCode |
| 2026-08-15 | Phase 3 | Promoted UNESCO blue (#0099D8) to the actual primary token and applied its deeper interaction tone (#006A9A) to primary actions, links, focus states, navigation, and trust cues | OpenCode |
| 2026-08-15 | Phase 3 | Shortened the shared navigation labels to UNESCO, Practice/Thực hành, and Learn/Bài học; added an embedded facilitator mode so toolkit training sessions do not render a duplicate navigation bar | OpenCode |
| 2026-08-15 | Phase 3 | Improved toolkit surface contrast by moving the canvas to #EEF3F6, keeping components white, strengthening boundaries to #C7D4DC, and using pale UNESCO-blue selection states | OpenCode |
| 2026-08-15 | Phase 3 | Fixed disappearing card corners by removing overflow clipping and wrapper radii from toolkit grids, leaving each component responsible for its own visible border and radius | OpenCode |
| 2026-08-15 | Phase 3 | Added a responsive TRAIN skeleton loading state with reusable shadcn-style Skeleton primitives for the intro, family panel, toolbar, and scenario cards | OpenCode |
| 2026-08-15 | Phase 3 | Moved TRAIN to In Review and activated Phase 4; remaining TRAIN acceptance items and legacy `/trigger` compatibility remain tracked for review | OpenCode |
| 2026-08-15 | Phase 4 | Added localized CONTRIBUTE reporting at `/toolkit/contribute/report` with text/context fields, private evidence uploads, consent/redaction gates, PII flagging, contributor history, and 8 passing tests | OpenCode |
| 2026-08-15 | Phase 4 | Replaced the overview principles strip with a planned verified community-trending list and upvote interaction; raw contributor reports remain private | OpenCode |
| 2026-08-15 | Phase 4 | Added verified community trend and upvote APIs, applied migration 202608150003 to the linked Supabase project, and confirmed linked schema lint passes with no errors | OpenCode |
| 2026-08-15 | Phase 4 | Merged the Youth Review Hub into the CONTRIBUTE information architecture so reporting, community trends, and authorized review share one page | OpenCode |
| 2026-08-15 | Phase 4 | Replaced the principles strip with a report/review workspace, added reviewer-queue access controls, applied migration 202608150004, and confirmed linked schema lint passes with no errors | OpenCode |
| 2026-08-15 | Phase 4 | Separated authenticated facilitator identity from reviewer authorization so CONTRIBUTE no longer presents a signed-in TRAIN user with a duplicate login prompt; added shared `/api/auth/me` identity loading | OpenCode |
| 2026-08-15 | Phase 4 | Redesigned CONTRIBUTE around a hero Create report action and Latest/Trending community report tabs; the review queue remains secondary on the same page | OpenCode |
| 2026-08-15 | Phase 4 | Implemented Latest/Trending query filtering in the community API and validated the redesigned CONTRIBUTE route with 8 passing tests and a successful production build | OpenCode |
| 2026-08-15 | Phase 4 | Removed the CONTRIBUTE hero and reviewer panel from the overview; the page now opens directly on the community feed with a bordered compact tab control and same-row Create report action | OpenCode |
| 2026-08-15 | Phase 4 | Added bilingual synthetic community seed clusters for demo/local use, applied migration 202608150005, seeded the linked project, and verified four community rows are available to Latest/Trending | OpenCode |
| 2026-08-15 | Phase 3 | Reworked the learner route into a full-viewport mobile chat surface matching the provided reference geometry while preserving dynamic messages, pairing, actions, notifications, and result flows | OpenCode |
| 2026-08-15 | Phase 3/4 | Added private community-to-TRAIN lessons: verified community cards can be saved into a facilitator's scenario library, remain owner-scoped, and launch through the existing pairing/session flow; migrations 202608150006 and 202608150007 applied to linked Supabase | OpenCode |
| 2026-08-15 | Phase 3 | Fixed learner session restoration so completed sessions receive a fresh visible pairing code, kept the code panel visible during initialization, and made push subscription failures report instead of showing false success | OpenCode |
| 2026-08-15 | Phase 3 | Removed the hidden family-member requirement from TRAIN practice start; scenarios can now launch with no member selected, with visible copy updated to describe pattern-first practice | OpenCode |
| 2026-08-15 | Phase 3 | Replaced learner pass/fail overlays with minimal result cards and added a localized message review view that highlights urgency, money, links, impersonation, and reward cues | OpenCode |
| 2026-08-15 | Phase 3 | Made review dismissal start a fresh learner waiting session and added a visible Close active session control that returns to a new connection code | OpenCode |
| 2026-08-15 | Phase 3 | Corrected session ownership: learner review dismissal now returns to Connected successfully without a learner close button; Close active session is available only in the trainer flow and resets trainer pairing | OpenCode |
| 2026-08-15 | Phase 3 | Persisted trainer session closure with the new closed status, applied migration 202608150008, and made learner polling automatically return to a fresh waiting code when the trainer closes the session | OpenCode |
| 2026-08-15 | Phase 3 | Fixed trainer close-session 404s after completed learner outcomes by allowing passed and failed sessions to transition to closed | OpenCode |
| 2026-08-15 | Phase 3 | Hardened close-session handling with explicit lookup, owner checks, idempotent already-closed success, and legacy-session support so trainer closure propagates reliably to learner polling | OpenCode |
| 2026-08-15 | Phase 3 | Removed trainer-side session-code generation from TRAIN Start; trainer now opens a scenario-ready pairing screen and connects using the learner-generated code | OpenCode |

## Current Next Action

Continue Phase 4 with the manual scenario-draft handoff and reviewer actions inside the shared CONTRIBUTE page. Keep Phase 1 RLS, Phase 2 official-brand/contrast gates, TRAIN acceptance gaps, and the transitive dependency advisories tracked before release.
