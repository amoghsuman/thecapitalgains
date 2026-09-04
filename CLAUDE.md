@AGENTS.md
# The Capital Gains — Project Briefing

## What This Is
Financial education platform for Indian retail investors.
Text-first, read-and-apply courses. No videos.
thecapitalgains.com

## Tech Stack
- Next.js 14.2.24 (App Router, TypeScript strict)
- Tailwind CSS v3.4.x
- Supabase (auth + database) — no storage bucket used
- Sanity v3 CMS — project ID: xmblxfh8, dataset: production
- Razorpay (payments — integration pending)
- Vercel hosting, GitHub auto-deploy

## Key Business Rules
- Educational content only — not SEBI investment advice
- SEBI RA registration in progress — placeholder [SEBI_RA_REG_NO] must be filled before public launch
- Anonymous brand — founder identity not surfaced on platform
- Two subscription stacks:
  - Stack 1 Learn: Learner ₹999/mo, Pro ₹2499/mo
  - Stack 2 Research: Newsletter ₹499/mo, Essential ₹4999/mo, Premium ₹12499/mo

## Middleware
- middleware lives in proxy.ts (function named `proxy`, not `middleware`) — Next.js 16 convention used here

## Supabase Tables
- users (Supabase auth)
- course_enrollments (user_id, course_slug, ...) — keyed by course **slug**, not Sanity `_id`
- lesson_progress (user_id, course_slug, lesson_slug, ...) — keyed by course/lesson **slug**, not Sanity `_id`
- subscriptions (user_id, plan, status, valid_until)

Note: `courses` and `lessons` are Sanity documents, not Supabase tables — Supabase only stores per-user state (enrollment, progress, subscriptions) referencing Sanity content by slug.

## Payment Logic
- Subscription → Razorpay webhook → subscriptions table
- Access: free lesson OR active subscription OR enrolled

## Content Scripts
- upload-courses.mjs — uploads course structure to Sanity (legacy Excel pipeline; embeds lessons the old way — not yet updated for standalone `lesson` documents)
- create-course-structure.mjs — JSON-input equivalent of upload-courses.mjs; creates a new course plus one standalone `lesson` document per lesson (empty body placeholder), referenced from `chapters[].lessons[]`. Refuses to touch an existing course slug. Everything (course + all lesson stubs) is written as a single atomic Sanity transaction.
- inject-lesson-content.mjs — dereferences a course's chapters to find its standalone `lesson` documents, then patches each matched lesson's `body` field directly (not the course document). Matches by lesson **slug** first (reliable — slugs are unique per course and never renamed); falls back to matching by **title** only when the input JSON has no `slug` for that lesson (title matching is case and character sensitive).
- migrate-lessons-to-documents.mjs — one-time migration script (already run) that converted embedded lesson objects into standalone referenced `lesson` documents across all published courses. Kept for reference/audit trail; not part of the regular pipeline. Defaults to a dry run; `--apply` writes for real. Always backs up the pre-migration course state to `migration-backups/<timestamp>/` first.
- generate-lesson-content.mjs — generates lesson JSON for injection

## Current Status
- [x] Homepage
- [x] Courses page
- [x] Course detail page
- [x] Pricing page
- [x] Model portfolios page
- [x] Newsletter page
- [x] About page
- [x] Auth (login/signup)
- [x] Supabase setup
- [ ] Razorpay integration
- [ ] Course reader wired to Supabase
- [ ] C5 and C6 lesson content injection pending
- [ ] Domain connected

## Course Schema — Key Fields
- `learningPath` — groups course into a learning path (see list below); replaces deprecated `track` field
- `orderRank` — controls sort order within a learning path (lower = first, default 99)
- `chapters[].lessons[]` — an array of **references** to standalone `lesson` documents (see "Sanity Content Architecture" below), not embedded lesson objects.
- Learning Paths: stock-market-basics, value-investing, momentum-investing, technical-trading, options-derivatives, mutual-funds-etfs, investment-banking, equity-research, private-equity-vc, cfa-prep, frm-prep, financial-modelling, quant-finance, algo-trading, python-finance, corporate-finance, ma-valuation

## Sanity Content Architecture
`lesson` is a top-level Sanity document type (`sanity/schemaTypes/lesson.ts`), not an object embedded inside a course. A course's `chapters[].lessons[]` array holds reference items (`{ _type: 'reference', _ref: <lesson _id> }`), one per lesson, in chapter order. This replaced the original embedded-object model (migrated in full via migrate-lessons-to-documents.mjs) specifically so lessons are individually browsable/searchable in Sanity Studio (see `sanity/structure.ts`'s "All Lessons" list) and editable on a full page instead of in a cramped nested-array modal.

**Why this matters for Supabase**: `lesson_progress` and `course_enrollments` are keyed by **slug** (`course_slug`, `lesson_slug`), never by Sanity `_id`. Lesson slugs must never be regenerated once real user progress exists against them — any script that touches lesson documents must preserve `slug.current` exactly.

**GROQ gotcha**: filtering an array immediately after a dereference-and-project chain (`arr[]->{...}` ) needs the whole expression wrapped in parentheses before the filter bracket, e.g. `(chapters[].lessons[]->{ "slug": slug.current })[slug == $lessonSlug][0]` — without the parens, the filter silently binds to the wrong part of the chain and the query returns nulls instead of throwing, which will NOT surface as an error. `lib/sanity/queries.ts`'s `getLessonBySlug` and `getLessonContent` both rely on this pattern; if either function starts returning null/empty lessons after a future edit, check this first.

Standalone lesson `_id`s created by the pipeline scripts follow `lesson-<courseSlug>-<lessonSlug>`, truncated to 96 characters with a short SHA-1 suffix always appended (Sanity document IDs have a hard 128-character ceiling, and full course-slug + lesson-slug combinations can exceed it) — deterministic (same course+lesson slug always produces the same id) but not human-guessable at a glance for long titles.

## Lesson Body Block Types
A `lesson` document's `body` field is Sanity Portable Text (array of typed blocks). Supported `_type`s:
- Standard `block` — paragraphs, `h2`/`h3` headings, blockquotes, bullet/numbered lists
- `callout` — `{ type: 'insight' | 'warning', text }` — highlighted box
- `exercise` — `{ variant: 'checklist' | 'scenario' | 'quiz', title, ... }`. A missing `variant` is treated as `checklist` for backward compatibility with content written before variants existed.
  - `checklist` — `{ steps: string[] }` — interactive checkbox list, unchanged since introduction
  - `scenario` — `{ scenario, prompt, modelAnswer }` — model answer hidden behind a "Show model answer" toggle
  - `quiz` — `{ question, options: string[], correctIndex, explanation }` — multiple choice; selecting an option reveals correct/incorrect plus the explanation
- `mathBlock` — `{ latex, caption }` — rendered via KaTeX
- `keyFact` — `{ label, value, context }` — single stat callout
- `table` — `{ caption?, headers: string[], rows: [{ cells: string[] }] }` — rendered as a real HTML table. `rows` is an array of row objects (each with a flat `cells` array), **not** a plain array of arrays — Sanity's schema system doesn't support multidimensional arrays (`array` nested directly inside another `array`), so tabular data always needs this one level of object-wrapping around each row.
- `statGrid` — `{ stats: [{ label, value, context? }] }`, 2–4 stats — the infographic substitute, rendered as a responsive grid of stat cards

All rendering lives in `app/learn/[course]/[lesson]/page.tsx`'s `portableTextComponents`. `inject-lesson-content.mjs` works with all of these unmodified — it patches a lesson document's `body` array generically without validating block shape. **Gotcha:** `lib/sanity/queries.ts`'s `getLessonBySlug` query uses an explicit field-level GROQ projection per `_type` (not a blanket `...`), so adding a new block type or a new field to an existing type requires adding it there too, or it'll be silently stripped on fetch even though it's stored correctly in Sanity.

## Colour Palette
- Primary: #1E1245
- Light: #2D1B69
- Amber CTA: #D4860A
- Background: #FAFAF7
- (See premium-theme.css for full design token set)

## Font System
- All text: Playfair Display — weights 400/500/600/700 — used for body and headings
- Mono: DM Mono — prices, tags, labels, badges, eyebrow text only

## Open Items
- SEBI RA registration number pending — [SEBI_RA_REG_NO] placeholder in About, Privacy, Footer
- C5 and C6 lesson content injection pending
- Razorpay integration pending
- amoghsuman.com personal site not yet built
