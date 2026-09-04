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
- courses
- lessons
- enrollments (user_id, course_id, payment_id)
- subscriptions (user_id, plan, status, valid_until)
- progress (user_id, lesson_id, completed_at)

## Payment Logic
- Subscription → Razorpay webhook → subscriptions table
- Access: free lesson OR active subscription OR enrolled

## Content Scripts
- upload-courses.mjs — uploads course structure to Sanity
- inject-lesson-content.mjs — patches lesson content into existing Sanity documents
- generate-lesson-content.mjs — generates lesson JSON for injection
- Lesson title matching in inject script is case and character sensitive

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
- Learning Paths: stock-market-basics, value-investing, momentum-investing, technical-trading, options-derivatives, mutual-funds-etfs, investment-banking, equity-research, private-equity-vc, cfa-prep, frm-prep, financial-modelling, quant-finance, algo-trading, python-finance, corporate-finance, ma-valuation

## Lesson Body Block Types
`chapters[].lessons[].body` is Sanity Portable Text (array of typed blocks). Supported `_type`s:
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

All rendering lives in `app/learn/[course]/[lesson]/page.tsx`'s `portableTextComponents`. `inject-lesson-content.mjs` works with all of these unmodified — it patches the `body` array generically without validating block shape. **Gotcha:** `lib/sanity/queries.ts`'s `getLessonBySlug` query uses an explicit field-level GROQ projection per `_type` (not a blanket `...`), so adding a new block type or a new field to an existing type requires adding it there too, or it'll be silently stripped on fetch even though it's stored correctly in Sanity.

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
