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
- Recharts — all lesson charts (`chart`, `payoffDiagram`, `candlestickChart`, `donutChart`) and calculator visualizations
- react-syntax-highlighter — `codeBlock` lesson content (Prism-light build, only `python`/`sql` languages registered to keep it lean)
- Razorpay (payments — integration pending)
- Vercel hosting, GitHub auto-deploy

## Key Business Rules
- Educational content only — not SEBI investment advice
- SEBI RA registration in progress — placeholder [SEBI_RA_REG_NO] must be filled before public launch
- Anonymous brand — founder identity not surfaced on platform
- Two subscription stacks:
  - Stack 1 Learn: Learner ₹999/mo, Pro ₹2499/mo
  - Stack 2 Research: Newsletter ₹499/mo, Essential ₹4999/mo, Premium ₹12499/mo

## App Router Structure
- Main site routes live under `app/(site)/` (a route group — doesn't appear in URLs), with `app/(site)/layout.tsx` as their root layout (Navbar/Footer/DisclaimerBar/globals.css).
- `app/studio/` (Sanity Studio) is a sibling of that group with its own separate, deliberately minimal `app/studio/layout.tsx` — no Navbar/Footer/theme CSS. Two independent root layouts sharing nothing, so Studio never inherits the site's chrome.
- `app/api/` route handlers aren't page routes, so they're unaffected by either layout tree.

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
- create-course-structure.mjs — JSON-input equivalent of upload-courses.mjs; creates a new course plus one standalone `lesson` document per lesson (empty body placeholder), referenced from `chapters[].lessons[]`. Accepts optional `prerequisiteCourseSlug` (resolved to a reference — errors if that course doesn't exist yet), `lastReviewed` (`"YYYY-MM-DD"`), and `authorByline` (`{name, credential}`) in its input JSON. Refuses to touch an existing course slug. Everything (course + all lesson stubs) is written as a single atomic Sanity transaction.
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
- `prerequisiteCourse` — optional single reference to another `course` document. `create-course-structure.mjs` accepts this as `prerequisiteCourseSlug` (a slug string) in its input JSON and resolves it to a reference, erroring if that course doesn't already exist yet — the prerequisite must be created first.
- `lastReviewed` — optional date field. Editorial/compliance tracking for when tax/regulatory/rate-sensitive content in a course was last verified as current. Not surfaced to learners by default.
- `authorByline` — optional `{ name, credential }` object (e.g. `{ name: "...", credential: "SEBI Registered Research Analyst" }`). Leave empty for the default anonymous-brand presentation.
- Learning Paths: stock-market-basics, value-investing, momentum-investing, technical-trading, options-derivatives, mutual-funds-etfs, investment-banking, equity-research, private-equity-vc, cfa-prep, frm-prep, financial-modelling, quant-finance, algo-trading, python-finance, corporate-finance, ma-valuation

## Sanity Content Architecture
`lesson` is a top-level Sanity document type (`sanity/schemaTypes/lesson.ts`), not an object embedded inside a course. A course's `chapters[].lessons[]` array holds reference items (`{ _type: 'reference', _ref: <lesson _id> }`), one per lesson, in chapter order. This replaced the original embedded-object model (migrated in full via migrate-lessons-to-documents.mjs) specifically so lessons are individually browsable/searchable in Sanity Studio (see `sanity/structure.ts`'s "All Lessons" list) and editable on a full page instead of in a cramped nested-array modal.

**Why this matters for Supabase**: `lesson_progress` and `course_enrollments` are keyed by **slug** (`course_slug`, `lesson_slug`), never by Sanity `_id`. Lesson slugs must never be regenerated once real user progress exists against them — any script that touches lesson documents must preserve `slug.current` exactly.

**GROQ gotcha**: filtering an array immediately after a dereference-and-project chain (`arr[]->{...}` ) needs the whole expression wrapped in parentheses before the filter bracket, e.g. `(chapters[].lessons[]->{ "slug": slug.current })[slug == $lessonSlug][0]` — without the parens, the filter silently binds to the wrong part of the chain and the query returns nulls instead of throwing, which will NOT surface as an error. `lib/sanity/queries.ts`'s `getLessonBySlug` and `getLessonContent` both rely on this pattern; if either function starts returning null/empty lessons after a future edit, check this first.

Standalone lesson `_id`s created by the pipeline scripts follow `lesson-<courseSlug>-<lessonSlug>`, truncated to 96 characters with a short SHA-1 suffix always appended (Sanity document IDs have a hard 128-character ceiling, and full course-slug + lesson-slug combinations can exceed it) — deterministic (same course+lesson slug always produces the same id) but not human-guessable at a glance for long titles.

## Lesson Body Block Types
A `lesson` document's `body` field is Sanity Portable Text (array of typed blocks). Supported `_type`s:
- Standard `block` — paragraphs, `h2`/`h3` headings, blockquotes, bullet/numbered lists. Two custom annotations (markDefs) are available on spans: `link` (`{ href }`) and `glossaryTerm` (`{ definition }` — see below). These are the **only** inline marks in the schema — every other block type below is a top-level `_type`, not an annotation, and none of them touch `markDefs`/`span.marks[]`.
- `callout` — `{ type: 'insight' | 'warning' | 'disclaimer', text }` — highlighted box. `disclaimer` is deliberately neutral-toned (not alarming like warning, not celebratory like insight) — for compliance/scope notes like "not investment advice," distinct enough to read unmistakably as such given the SEBI RA context this platform operates under.
- `exercise` — `{ variant: 'checklist' | 'scenario' | 'quiz' | 'fillInTheBlank' | 'numericInput', title, ... }`. A missing `variant` is treated as `checklist` for backward compatibility with content written before variants existed.
  - `checklist` — `{ steps: string[] }` — interactive checkbox list, unchanged since introduction
  - `scenario` — `{ scenario, prompt, modelAnswer }` — model answer hidden behind a "Show model answer" toggle
  - `quiz` — `{ question, options: string[], correctIndex, explanation }` — multiple choice; selecting an option reveals correct/incorrect plus the explanation
  - `fillInTheBlank` — `{ textWithBlank, correctAnswers: string[], explanation }` — `textWithBlank` uses `___` (three underscores, exactly once) to mark the input position; matched case-insensitively, trimmed, against any entry in `correctAnswers` (list synonyms as separate array entries)
  - `numericInput` — `{ prompt, correctValue, tolerance, unit?, explanation }` — learner's numeric answer accepted if within `± tolerance` of `correctValue`; `unit` (e.g. `"₹"`) shown as a prefix on the input
- `mathBlock` — `{ latex, caption }` — rendered via KaTeX
- `keyFact` — `{ label, value, context }` — single stat callout
- `table` — `{ caption?, headers: string[], rows: [{ cells: string[] }] }` — rendered as a real HTML table. `rows` is an array of row objects (each with a flat `cells` array), **not** a plain array of arrays — Sanity's schema system doesn't support multidimensional arrays (`array` nested directly inside another `array`), so tabular data always needs this one level of object-wrapping around each row.
- `statGrid` — `{ stats: [{ label, value, context? }] }`, 2–4 stats — the infographic substitute, rendered as a responsive grid of stat cards
- `chart` — `{ chartType: 'line'|'bar'|'area', title?, xAxisLabel?, yAxisLabel?, data: [{label, value}], series?: [{label, values: number[]}] }` — recharts, Ivory Ledger palette. `data[].label` always supplies the x-axis categories. Single-series: also fill in `data[].value`. Multi-series: add `series[]` instead — each series' `values` array must be the same length/order as `data` (`data[].value` is ignored when `series` is present).
- `payoffDiagram` — `{ instrumentType: 'call'|'put'|'futures', position: 'long'|'short', strikePrice, premium?, spotPriceRange: {min,max}, caption? }` — options/futures payoff curve computed from standard formulas (not stored), rendered with a zero line, a breakeven reference line, and shaded profit (green)/loss (red) regions. `premium` is ignored for futures; `strikePrice` doubles as the futures entry/contracted price. Standard red/green convention is used here deliberately, overriding the brand forest/gold palette, since profit/loss needs to read unambiguously.
- `candlestickChart` — `{ title?, data: [{date, open, high, low, close}] }` — OHLC chart. Recharts has no native candlestick type, so this is a `Bar` with a range dataKey (`[low, high]`, giving recharts the wick's pixel bounds) and a custom `shape` renderer that draws the wick line plus a body rect positioned proportionally within those bounds from `open`/`close`. Standard market convention colors (green close ≥ open, red close < open), same reasoning as the payoff diagram — overrides brand palette deliberately.
- `donutChart` — `{ title?, data: [{label, value}] }` — recharts `PieChart` with `innerRadius`. Segment colors cycle through a fixed palette of tints/shades derived from forest green and gold (`components/lesson/DonutChartBlock.tsx`'s `DONUT_COLORS`) rather than introducing off-brand hues, even with more than 2 slices.
- `codeBlock` — `{ language: 'python'|'sql', code, caption? }` — syntax highlighted via react-syntax-highlighter's Prism-light build. Only `python`/`sql` are registered (see Tech Stack) — register additional languages in `components/lesson/CodeBlock.tsx` if content ever needs more.
- `timeline` — `{ title?, events: [{date, title, description}] }` — vertical timeline with a connecting line, for historical/case-study sequencing.
- `annotatedImage` — `{ image (Sanity image, hotspot-enabled), caption?, annotations: [{x, y, label}] }` — for chart patterns and visuals that need a real image rather than a data-driven chart. `x`/`y` are percentages (0–100) positioning a hover/tap marker over the image via `components/lesson/AnnotatedImageBlock.tsx`, reusing the same tooltip-on-hover-or-tap interaction pattern as `GlossaryTerm`. Uses the existing `urlFor()` helper (`sanity/lib/image.ts`) directly on the raw stored image object — no GROQ dereference needed.
- `comparison` — `{ title?, columns: [{label, points: string[]}, {label, points: string[]}] }` — exactly 2 columns (old vs new, pros vs cons, etc.), rendered side by side.
- `flashcardSet` — `{ title?, cards: [{term, definition}] }` — grid of click/tap-to-flip cards. High-value for the exam-prep catalog (CFA, FRM, CA, etc.) where rapid term recall matters.
- `toolLink` — `{ label, url, description? }` — a distinctly-styled external-tool CTA card, opens in a new tab, visually different from a plain in-text `link` mark.
- `bigIdea` — `{ text }` — one large centered stylized takeaway statement. Reserve for the single most important idea in a lesson — not meant to be used more than once or twice per lesson.
- `keyTakeaways` — `{ points: string[] }` — bordered closing bullet summary, typically placed near the end of a lesson.
- `calculator` — `{ calculatorType: 'sip'|'capitalGainsTax'|'emi' }` — embeds one of three self-contained interactive calculators. No other data needed; all inputs default and all formulas live in the component (`components/lesson/SipCalculator.tsx`, `CapitalGainsTaxCalculator.tsx`, `EmiCalculator.tsx`). The tax calculator's rate constants (equity STCG/LTCG, debt slab-rate treatment, real estate) are centralized at the top of `CapitalGainsTaxCalculator.tsx` with a comment flagging them for periodic review — Indian capital gains rules change almost every Union Budget. The `emi` calculator includes an expandable "View Full Amortization Schedule" section — a full month-by-month breakdown computed from the same inputs (not separately authored content).
- `collapsible` — `{ title, content: [...] }` — renders as an accordion, collapsed by default. `content` accepts any block type above **except another `collapsible`** (one level of nesting only, by design — see `blockContentTypes` in `sanity/schemaTypes/lesson.ts`, shared between `body` and `collapsible.content` so the two never drift out of sync).

**Glossary terms**: mark a span with the `glossaryTerm` annotation (`markDefs: [{ _type: 'glossaryTerm', _key, definition }]`, `span.marks: [thatKey]`) to get a dotted-underline term that shows its definition in a tooltip on hover (desktop) or tap (mobile). Rendered by `components/lesson/GlossaryTerm.tsx` via `portableTextComponents.marks.glossaryTerm`.

Most interactive block types (`chart`, `payoffDiagram`, `candlestickChart`, `donutChart`, `codeBlock`, `annotatedImage`, `flashcardSet`, `calculator` and its three variants, `collapsible`, `GlossaryTerm`) are their own client components under `components/lesson/`, kept separate from the reader page itself for isolation. The `fillInTheBlank`/`numericInput` exercise variants are the one exception — they live inline in the reader page file alongside their siblings `ExerciseBlock`/`ScenarioExercise`/`QuizExercise`, which have always been defined inline; keeping that whole family together took priority over moving just the two newest ones out. The reader page (`app/(site)/learn/[course]/[lesson]/page.tsx`) has been a full client component since early in the project (client-side auth, progress tracking, sidebar state) and converting it to a server component is a separate, larger undertaking not folded into adding these block types.

All rendering is wired into `app/(site)/learn/[course]/[lesson]/page.tsx`'s `portableTextComponents` (`types` for block-level types, `marks` for `link`/`glossaryTerm`). `inject-lesson-content.mjs` works with all of these unmodified — it patches a lesson document's `body` array generically without validating block shape. **Gotcha it needed a real fix for**: its `regenerateKeys()` helper used to blindly replace every `_key` in the tree, including `markDefs[]._key` — since a span's `marks` array references a markDef by that `_key` **value** (not by `_type`), regenerating it without updating the reference silently orphaned every `link`/`glossaryTerm` annotation injected through the pipeline (the span rendered, just with no annotation attached — `@portabletext/react` logs `Unknown mark type "<oldKey>"` to the console, easy to miss). Fixed: block-type objects now regenerate `markDefs` keys first, build an old→new map, and apply that map to every child span's `marks` array as it's regenerated. If a future edit reintroduces a similar per-field blind regeneration, this is the failure mode to watch for.

`lib/sanity/queries.ts`'s `getLessonBySlug` query fetches `body` with a blanket GROQ spread (`body[] { ... }`), not a per-`_type` field enumeration — empirically confirmed to return every field of every array item regardless of `_type`, at any nesting depth, including whatever's inside `collapsible.content[]`. (This used to be an explicit per-type projection that needed a matching entry added for every new block type or its fields would be silently stripped on fetch; simplified once the block type surface grew large enough that hand-maintaining two parallel lists — the schema and the query — stopped being worth it. If a future edit reintroduces per-type projections here, don't forget new block types need entries in both places again.)

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
