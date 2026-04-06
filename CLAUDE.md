@AGENTS.md
# The Capital Gains — Project Briefing

## What This Is
Financial education platform for Indian retail investors.
Text-first, read-and-apply courses. No videos.
thecapitalgains.com

## Tech Stack
- Next.js 14 (App Router, TypeScript strict)
- Supabase (auth + database + storage)
- Razorpay (one-time payments + subscriptions)
- Tailwind CSS
- MDX (course content)
- Vercel (hosting)

## Key Business Rules
- Educational content only — not SEBI investment advice
- SEBI RA registration in progress
- Subscription tiers: Free / Learner ₹499 / Trader Pro ₹999 / Elite ₹2499
- Individual course purchases also available
- Anonymous brand — founder identity not on platform

## Supabase Tables
- users (Supabase auth)
- courses
- lessons
- enrollments (user_id, course_id, payment_id)
- subscriptions (user_id, plan, status, valid_until)
- progress (user_id, lesson_id, completed_at)

## Payment Logic
- One-time → enrollments table
- Subscription → Razorpay webhook → subscriptions table
- Access: free lesson OR active subscription OR enrolled

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
- [ ] Domain connected

## Course Schema — Key Fields
- `learningPath` — groups course into a learning path (see list below); replaces deprecated `track` field
- `orderRank` — controls sort order within a learning path (lower = first, default 99)
- Learning Paths: stock-market-basics, value-investing, momentum-investing, technical-trading, options-derivatives, mutual-funds-etfs, investment-banking, equity-research, private-equity-vc, cfa-prep, frm-prep, financial-modelling, quant-finance, algo-trading, python-finance, corporate-finance, ma-valuation

## Colour Palette
- Navy (primary): #111111
- Navy light: #2A2A2A
- Navy deep: #333333
- Amber: #D4860A
- Amber hover: #F0A020
- Background: #FAFAF7
- Text: #111111
- Text muted: #3D3D3D
- Text hint: #7A7A8A
- Green: #1A7A4A
- Border (rgba): rgba(17,17,17,0.1)

## Font System
- Headings: Playfair Display (font-serif) — weights 400/500/600/700
- Body: Plus Jakarta Sans (--font-jakarta) — weights 400/500/600 — replaced DM Sans
- Mono: DM Mono (font-mono) — prices, tags, labels, badges, eyebrow text only

## Open Items
- SEBI RA registration number pending
- Developer hiring not finalised