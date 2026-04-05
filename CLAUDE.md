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

## Colour Palette
- Navy (primary): #1E1245 — was #0F2348
- Navy light: #2D1B69 — was #1A3460
- Navy deep: #3D2785 — was #2A1A5E
- Amber: #D4860A
- Amber hover: #F0A020
- Background: #FAFAF7
- Text muted: #5A5A72
- Text label: #9494A8
- Green: #1A7A4A
- Border (rgba): rgba(30,18,69,0.1) — was rgba(15,35,72,0.1)

## Open Items
- SEBI RA registration number pending
- Developer hiring not finalised