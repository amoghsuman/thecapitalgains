import { client } from './client'

// Powers the Find Your Path homepage feature. Shape is deliberately close to
// the old lib/findYourPath/pathData.ts (persona -> goals -> courses) so
// PathNavigator.tsx's rendering/interaction logic barely has to change —
// depth/priority now come from the real course.depth field and the
// per-relationship pathCourses[].priority instead of the old flat HARVEY
// lookup keyed by course slug.
export async function getFindYourPathData() {
  return client.fetch(`
    *[_type == "persona"] | order(order asc) {
      "key": iconKey,
      "label": title,
      "goals": *[_type == "learningPath" && references(^._id)] | order(order asc) {
        "label": investingGoal->title,
        "courses": pathCourses[] {
          "title": course->title,
          "slug": course->slug.current,
          "reason": rationale,
          "depth": course->depth,
          "priority": priority
        }
      }
    }
  `)
}

export async function getAllCourses(learningPath?: string) {
  const filter = learningPath
    ? `*[_type == "course" && learningPath == "${learningPath}"]`
    : `*[_type == "course"]`

  return client.fetch(`
    ${filter} | order(orderRank asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      tag,
      price,
      accessLevel,
      badge,
      subtitle,
      lessonsCount,
      duration,
      description,
      topics,
      whatYouLearn,
      learningPath,
      orderRank
    }
  `)
}

// Minimal, single-field fetch for the homepage hero's featured-course card
// — deliberately not reusing getCourseBySlug, which also pulls chapters
// and their referenced lessons (unneeded weight for one short sentence).
export async function getCourseWhyPicked(slug: string): Promise<string | null> {
  const result = await client.fetch(
    `*[_type == "course" && slug.current == $slug][0].whyPicked`,
    { slug }
  )
  return result ?? null
}

export async function getCourseBySlug(slug: string) {
  return client.fetch(`
    *[_type == "course" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      tag,
      price,
      accessLevel,
      badge,
      subtitle,
      lessonsCount,
      duration,
      description,
      topics,
      whatYouLearn,
      learningPath,
      chapters[] {
        title,
        lessons[]-> {
          title,
          "slug": slug.current,
          duration,
          isFree,
          body
        }
      }
    }
  `, { slug })
}

export async function getFullCourseForReader(courseSlug: string) {
  return client.fetch(`
    *[_type == "course" && slug.current == $courseSlug][0] {
      title,
      "slug": slug.current,
      accessLevel,
      chapters[] {
        title,
        lessons[]-> {
          title,
          "slug": slug.current,
          duration,
          isFree
        }
      }
    }
  `, { courseSlug })
}

// Deliberately a blanket spread, not a per-`_type` field enumeration. This
// project used to hand-maintain an explicit projection per block `_type`
// here (see git history), which meant every new lesson block type needed a
// matching entry added in two places (the schema AND this query) or its
// fields would be silently stripped on fetch. Empirically confirmed (see
// CLAUDE.md) that `...` already returns every field of every array item
// regardless of `_type`, at any nesting depth — including collapsible's
// nested `content[]` array, whatever block types it contains. With the
// block type surface now large enough that scaling to 1000+ courses means
// scaling to many more block types over time, the blanket spread is the
// simpler, correctness-by-construction choice going forward.
const LESSON_BODY_PROJECTION = `...`

export async function getLessonBySlug(courseSlug: string, lessonSlug: string) {
  const course = await client.fetch(`
    *[_type == "course" && slug.current == $courseSlug][0] {
      title,
      "slug": slug.current,
      accessLevel,
      "lessonRef": (chapters[].lessons[]->{ _id, "slug": slug.current })[slug == $lessonSlug][0]
    }
  `, { courseSlug, lessonSlug })

  if (!course || !course.lessonRef) return null

  const lesson = await client.fetch(`
    *[_id == $lessonId][0] {
      title,
      "slug": slug.current,
      duration,
      isFree,
      body[] {
        ${LESSON_BODY_PROJECTION}
      }
    }
  `, { lessonId: course.lessonRef._id })

  if (!lesson) return null

  return {
    title: course.title,
    slug: course.slug,
    lesson,
  }
}

export async function getLessonContent(courseSlug: string, lessonSlug: string) {
  return client.fetch(`
    *[_type == "course" && slug.current == $courseSlug][0] {
      title,
      price,
      accessLevel,
      "lesson": (chapters[].lessons[]->{
        title,
        "slug": slug.current,
        duration,
        isFree,
        body
      })[slug == $lessonSlug][0]
    }
  `, { courseSlug, lessonSlug })
}

// ─── Model portfolios & market datasets (/portfolios) ─────────────────────────

import type { Portfolio, MarketDataset } from '@/lib/portfolios/types'

export async function getPortfolios(): Promise<Portfolio[]> {
  return client.fetch(`
    *[_type == "portfolio"] | order(order asc, name asc) {
      _id,
      name,
      "slug": slug.current,
      strategy,
      inceptionDate,
      dataStatus,
      benchmark,
      "profile": {
        "horizon": profile.horizon,
        "riskLabel": profile.riskLabel,
        "rebalanceCadence": profile.rebalanceCadence,
        "allocation": coalesce(profile.allocation[] { label, pct }, [])
      },
      "holdings": coalesce(holdings[] { symbol, name, sector, weight, entryDate, returnYtd }, []),
      "monthlyReturns": coalesce(monthlyReturns[] { month, portfolioReturn, benchmarkReturn, topHolding, memo }, []),
      "metrics": {
        "cagr": metrics.cagr,
        "sharpe": metrics.sharpe,
        "winRate": metrics.winRate,
        "bestMonth": metrics.bestMonth,
        "worstMonth": metrics.worstMonth,
        "avgMonthlyReturn": metrics.avgMonthlyReturn,
        "annualisedVol": metrics.annualisedVol,
        "benchmarkVol": metrics.benchmarkVol,
        "maxDrawdown": metrics.maxDrawdown
      }
    }
  `)
}

export async function getMarketDatasets(): Promise<MarketDataset[]> {
  return client.fetch(`
    *[_type == "marketDataset"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      dataStatus,
      asOf,
      source,
      "rows": coalesce(rows[] {
        label,
        sublabel,
        "values": coalesce(values[] { key, value }, [])
      }, [])
    }
  `)
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
//
// Only testimonials with written consent are ever returned. The filter lives
// here, not in the component, so no caller can accidentally show the rest.

export type Testimonial = {
  _id: string
  name: string
  role: string | null
  city: string | null
  quote: string
  rating: number
  consentReceived: boolean
  consentDate: string | null
  publishedAt: string | null
  course: { title: string; slug: string } | null
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return client.fetch(`
    *[_type == "testimonial" && consentReceived == true] | order(publishedAt desc, _createdAt desc) {
      _id,
      name,
      role,
      city,
      quote,
      rating,
      consentReceived,
      consentDate,
      publishedAt,
      "course": course->{ title, "slug": slug.current }
    }
  `)
}

// ─── Featured learning paths (home page tracks) ───────────────────────────────

export type FeaturedLearningPath = {
  path: string
  homeOrder: number
  blurb: string | null
  /** Live count of courses on this path. */
  courseCount: number
}

// Paths flagged featuredOnHome on their learningPathMeta document, ordered by
// homeOrder, with a live course count. Paths with no courses are dropped here
// so the home page never shows an empty track.
export async function getFeaturedLearningPaths(): Promise<FeaturedLearningPath[]> {
  const rows: FeaturedLearningPath[] = await client.fetch(`
    *[_type == "learningPathMeta" && featuredOnHome == true] | order(homeOrder asc, path asc) {
      path,
      "homeOrder": coalesce(homeOrder, 99),
      blurb,
      "courseCount": count(*[_type == "course" && learningPath == ^.path])
    }
  `)
  return rows.filter((r) => r.courseCount > 0)
}

// ─── Glossary terms and market fact cards (home page Market Desk) ────────────

export type GlossaryCategory = "fundamentals" | "derivatives" | "valuation" | "wealth"

export type GlossaryTerm = {
  _id: string
  term: string
  category: GlossaryCategory
  shortDefinition: string | null
  definition: string
  formula: string | null
  retailTrap: string | null
  /** null when the referenced course is missing or unpublished. */
  course: { slug: string; title: string } | null
  order: number
}

// Published terms only, ordered for the weekly rotation.
export async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  return client.fetch(`
    *[_type == "glossaryTerm" && !(_id in path("drafts.**"))] | order(category asc, order asc, term asc) {
      _id,
      term,
      category,
      shortDefinition,
      definition,
      formula,
      retailTrap,
      "course": taughtInCourse->{ "slug": slug.current, title },
      "order": coalesce(order, 99)
    }
  `)
}

export type MarketFactCard = {
  _id: string
  title: string
  categoryLabel: string
  headlineValue: string | null
  body: string
  source: string
  sourceUrl: string | null
  /** YYYY-MM-DD */
  asOf: string
  staleAfterDays: number
  /** null when the referenced course is missing or unpublished; the card then shows no reference link. */
  course: { slug: string; title: string } | null
  order: number
}

// Published cards only. Staleness (asOf + staleAfterDays) is applied by the
// component so the cut-off uses the viewer's date, not the fetch date.
export async function getMarketFactCards(): Promise<MarketFactCard[]> {
  return client.fetch(`
    *[_type == "marketFactCard" && !(_id in path("drafts.**"))] | order(order asc, title asc) {
      _id,
      title,
      categoryLabel,
      headlineValue,
      body,
      source,
      sourceUrl,
      asOf,
      "staleAfterDays": coalesce(staleAfterDays, 365),
      "course": referenceCourse->{ "slug": slug.current, title },
      "order": coalesce(order, 99)
    }
  `)
}
