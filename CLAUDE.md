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
- Two subscription stacks: Learn + Research (Stack 3 Community removed — no live sessions, WhatsApp, or 1:1 access)
- Learn tiers: Free / Learner ₹999/mo / Pro ₹2499/mo
- Research tiers: Newsletter ₹499/mo / Essential ₹4999/mo / Premium ₹12499/mo
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
- Dark (primary): #1C0F3F
- Dark light: #2D1B69
- Purple: #7C3AED
- Purple light: #8B5CF6
- Amber: #D4860A
- Amber hover: #F0A020
- Background: #FFFFFF
- Surface: #F5F3FF
- Surface 2: #EDE9FF
- Text: #1C0F3F
- Text muted: #4B3F6B
- Text hint: #8B7BAB
- Green: #1A7A4A
- Border (rgba): rgba(124,58,237,0.15)

## Font System
- All text: Outfit (--font-outfit) — weights 400/500/600/700/800 — single font family
- Mono: DM Mono (--font-mono) — prices, tags, labels, badges, eyebrow text only

## Open Items
- SEBI RA registration number pending
- Developer hiring not finalised