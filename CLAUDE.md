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

## Open Items
- SEBI RA registration number pending
- Developer hiring not finalised