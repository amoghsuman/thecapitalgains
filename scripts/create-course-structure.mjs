// HOW TO RUN (from the project root):
// 1. SANITY_TOKEN is read automatically from .env.local at the project root.
//    To override it for one run: export SANITY_TOKEN="your_token_here"
//    On Windows (PowerShell): $env:SANITY_TOKEN="your_token_here"
// 2. Run: node scripts/create-course-structure.mjs <path-to-json-file>
//    Example: node scripts/create-course-structure.mjs content-drafts/options-trading-from-zero/structure.json
//
// Dependencies: npm install @sanity/client (already installed)
//
// WHAT THIS DOES:
// Creates a brand-new course document in Sanity — the course itself, its
// chapters, and lesson stubs (title/slug/duration/isFree) with empty body
// content. This is the JSON-input equivalent of upload-courses.mjs's
// structural-creation step, for the chat-generated-JSON pipeline instead of
// the legacy Excel pipeline.
//
// This script ONLY creates. It never updates or overwrites an existing
// course — if the slug already exists, it exits without writing anything.
// Use inject-lesson-content.mjs afterwards to fill in lesson body content.
//
// EXAMPLE INPUT JSON SHAPE:
// {
//   "slug": "options-trading-from-zero",
//   "title": "Options Trading from Zero",
//   "subtitle": "A ground-up guide to options mechanics",
//   "tag": "Beginner → Intermediate",
//   "depth": "high",
//   "badge": "BESTSELLER",
//   "accessLevel": "learner",
//   "learningPath": "options-derivatives",
//   "orderRank": 1,
//   "duration": "~4 hrs",
//   "description": "...",
//   "topics": ["Options Basics", "Greeks"],
//   "whatYouLearn": ["...", "..."],
//   "prerequisiteCourseSlug": "stock-market-from-zero",
//   "lastReviewed": "2026-01-15",
//   "authorByline": { "name": "...", "credential": "SEBI Registered Research Analyst" },
//   "chapters": [
//     {
//       "title": "Chapter 1: The Basics",
//       "lessons": [
//         { "title": "What Is an Option?", "durationMinutes": 8, "isFree": true }
//       ]
//     }
//   ]
// }
//
// "depth" is REQUIRED — one of "low" | "medium-low" | "medium-high" | "high"
// (the Harvey Ball scale Find Your Path renders). Every other field above is
// optional except "slug" and "title".

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { randomUUID, createHash } from 'crypto'
import { fileURLToPath } from 'url'
import path from 'path'

// ─── Env + Args ───────────────────────────────────────────────────────────────

// Load .env.local from the project root regardless of cwd or this script's
// own location — falls back silently to already-exported env vars if the
// file isn't present.
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
try {
  process.loadEnvFile(path.join(PROJECT_ROOT, '.env.local'))
} catch (err) {
  if (err.code !== 'ENOENT') throw err
}

const SANITY_TOKEN = process.env.SANITY_TOKEN
if (!SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN environment variable is not set.')
  console.error('Set it with: export SANITY_TOKEN="your_token_here"')
  process.exit(1)
}

const jsonPath = process.argv[2]
if (!jsonPath) {
  console.error('ERROR: No JSON file path provided.')
  console.error('Usage: node create-course-structure.mjs <path-to-json-file>')
  process.exit(1)
}

// ─── Sanity Client ────────────────────────────────────────────────────────────

const sanity = createClient({
  projectId: 'xmblxfh8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

// ─── Schema constraints (kept in sync with sanity/schemaTypes/course.ts) ─────

const VALID_ACCESS_LEVELS = ['free', 'learner', 'pro']

// Harvey Ball scale used by the Find Your Path homepage feature. Kept in
// sync manually with the `depth` field's options in sanity/schemaTypes/course.ts.
const VALID_DEPTH_PRIORITY_LEVELS = ['low', 'medium-low', 'medium-high', 'high']

// { value, title } pairs exactly as defined in course.ts's learningPath options.
const LEARNING_PATHS = [
  { value: 'stock-market-basics', title: 'Stock Market Basics' },
  { value: 'value-investing', title: 'Value Investing' },
  { value: 'momentum-investing', title: 'Momentum Investing' },
  { value: 'technical-trading', title: 'Technical Trading' },
  { value: 'options-derivatives', title: 'Options & Derivatives' },
  { value: 'mutual-funds-etfs', title: 'Mutual Funds & ETFs' },
  { value: 'investment-banking', title: 'Investment Banking' },
  { value: 'equity-research', title: 'Equity Research' },
  { value: 'private-equity-vc', title: 'Private Equity & Venture Capital' },
  { value: 'cfa-prep', title: 'CFA Preparation' },
  { value: 'frm-prep', title: 'FRM Preparation' },
  { value: 'financial-modelling', title: 'Financial Modelling' },
  { value: 'quant-finance', title: 'Quantitative Finance' },
  { value: 'algo-trading', title: 'Algorithmic Trading' },
  { value: 'python-finance', title: 'Python for Finance' },
  { value: 'corporate-finance', title: 'Corporate Finance' },
  { value: 'ma-valuation', title: 'M&A & Valuation' },
  { value: 'career-fundamentals', title: 'Career Fundamentals' },
  { value: 'exam-prep', title: 'Exam Preparation' },
  { value: 'macro-and-markets', title: 'Macro & Markets' },
  { value: 'alternative-investing', title: 'Alternative Investing' },
  { value: 'tax-wealth-planning', title: 'Tax & Wealth Planning' },
  { value: 'forensic-compliance', title: 'Forensic Accounting & Compliance' },
  { value: 'fintech-careers', title: 'Fintech Careers' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Same slugify logic as upload-courses.mjs, reused verbatim so lesson slugs
// are generated identically everywhere in this codebase.
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Sanity document IDs have a hard length ceiling (128 chars). Long course +
// lesson slugs combined can exceed that, so the id is truncated with a short
// content hash suffix always appended — deterministic (same course+lesson
// slug always produces the same id) while guaranteeing a valid, unique id
// regardless of title length. Kept in sync with migrate-lessons-to-documents.mjs.
const MAX_ID_LENGTH = 96

function lessonDocId(courseSlug, lessonSlug) {
  const hash = createHash('sha1').update(`${courseSlug}::${lessonSlug}`).digest('hex').slice(0, 10)
  const base = `lesson-${courseSlug}-${lessonSlug}`
  const budget = MAX_ID_LENGTH - hash.length - 1
  const truncatedBase = base.length <= budget ? base : base.slice(0, budget)
  return `${truncatedBase}-${hash}`
}

function resolveLearningPath(input) {
  if (!input) return LEARNING_PATHS[0].value // schema default: stock-market-basics
  const byValue = LEARNING_PATHS.find(p => p.value === input)
  if (byValue) return byValue.value
  const byTitle = LEARNING_PATHS.find(p => p.title.toLowerCase() === String(input).toLowerCase())
  if (byTitle) return byTitle.value
  return null // caller treats this as a validation failure
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateInput(input) {
  const errors = []

  if (!input.slug || typeof input.slug !== 'string') {
    errors.push('"slug" is required and must be a string.')
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug)) {
    errors.push(`"slug" must be lowercase kebab-case (letters, digits, hyphens only). Got: "${input.slug}"`)
  }

  if (!input.title || typeof input.title !== 'string') {
    errors.push('"title" is required and must be a string.')
  }

  if (input.accessLevel && !VALID_ACCESS_LEVELS.includes(input.accessLevel)) {
    errors.push(`"accessLevel" must be one of: ${VALID_ACCESS_LEVELS.join(', ')}. Got: "${input.accessLevel}"`)
  }

  if (!input.depth) {
    errors.push('"depth" is required.')
  } else if (!VALID_DEPTH_PRIORITY_LEVELS.includes(input.depth)) {
    errors.push(`"depth" must be one of: ${VALID_DEPTH_PRIORITY_LEVELS.join(', ')}. Got: "${input.depth}"`)
  }

  const learningPathInput = input.learningPath
  let resolvedLearningPath = LEARNING_PATHS[0].value
  if (learningPathInput) {
    const resolved = resolveLearningPath(learningPathInput)
    if (resolved === null) {
      errors.push(
        `"learningPath" value "${learningPathInput}" is not recognized. Valid values:\n` +
        LEARNING_PATHS.map(p => `    - "${p.value}" (${p.title})`).join('\n')
      )
    } else {
      resolvedLearningPath = resolved
    }
  }

  if (input.lastReviewed !== undefined) {
    if (typeof input.lastReviewed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.lastReviewed) || Number.isNaN(Date.parse(input.lastReviewed))) {
      errors.push(`"lastReviewed" must be a valid date string in "YYYY-MM-DD" format if provided. Got: ${JSON.stringify(input.lastReviewed)}`)
    }
  }

  if (input.authorByline !== undefined) {
    if (typeof input.authorByline !== 'object' || input.authorByline === null || Array.isArray(input.authorByline)) {
      errors.push('"authorByline" must be an object ({ name, credential }) if provided.')
    } else {
      if (input.authorByline.name !== undefined && typeof input.authorByline.name !== 'string') {
        errors.push('"authorByline.name" must be a string if provided.')
      }
      if (input.authorByline.credential !== undefined && typeof input.authorByline.credential !== 'string') {
        errors.push('"authorByline.credential" must be a string if provided.')
      }
    }
  }

  if (input.prerequisiteCourseSlug !== undefined && typeof input.prerequisiteCourseSlug !== 'string') {
    errors.push('"prerequisiteCourseSlug" must be a string (the slug of an existing course) if provided.')
  }

  if (input.chapters !== undefined && !Array.isArray(input.chapters)) {
    errors.push('"chapters" must be an array if provided.')
  }

  const chapters = Array.isArray(input.chapters) ? input.chapters : []
  chapters.forEach((chapter, ci) => {
    if (!chapter.title || typeof chapter.title !== 'string') {
      errors.push(`Chapter ${ci + 1}: "title" is required and must be a string.`)
    }
    const lessons = Array.isArray(chapter.lessons) ? chapter.lessons : null
    if (chapter.lessons !== undefined && lessons === null) {
      errors.push(`Chapter ${ci + 1} ("${chapter.title ?? '?'}"): "lessons" must be an array if provided.`)
    }
    ;(lessons ?? []).forEach((lesson, li) => {
      if (!lesson.title || typeof lesson.title !== 'string') {
        errors.push(`Chapter ${ci + 1}, lesson ${li + 1}: "title" is required and must be a string.`)
      }
      if (lesson.durationMinutes !== undefined && typeof lesson.durationMinutes !== 'number') {
        errors.push(`Chapter ${ci + 1}, lesson ${li + 1} ("${lesson.title ?? '?'}"): "durationMinutes" must be a number if provided.`)
      }
      if (lesson.isFree !== undefined && typeof lesson.isFree !== 'boolean') {
        errors.push(`Chapter ${ci + 1}, lesson ${li + 1} ("${lesson.title ?? '?'}"): "isFree" must be a boolean if provided.`)
      }
    })
  })

  return { errors, resolvedLearningPath }
}

// ─── Document building ────────────────────────────────────────────────────────

// Builds the standalone lesson document to be created, plus the reference
// item that goes into the chapter's `lessons` array in its place.
function buildLesson(courseSlug, lesson) {
  const lessonSlug = slugify(lesson.title)
  const lessonId = lessonDocId(courseSlug, lessonSlug)

  const lessonDoc = {
    _id: lessonId,
    _type: 'lesson',
    title: lesson.title,
    slug: { _type: 'slug', current: lessonSlug },
    duration: lesson.durationMinutes !== undefined ? `${lesson.durationMinutes} min read` : '',
    isFree: lesson.isFree ?? false,
    body: [], // filled in later by inject-lesson-content.mjs
  }

  const lessonRef = {
    _key: randomUUID(),
    _type: 'reference',
    _ref: lessonId,
  }

  return { lessonDoc, lessonRef }
}

function buildChapter(courseSlug, chapter) {
  const built = (chapter.lessons ?? []).map(lesson => buildLesson(courseSlug, lesson))
  return {
    chapter: {
      _key: randomUUID(),
      title: chapter.title,
      lessons: built.map(b => b.lessonRef),
    },
    lessonDocs: built.map(b => b.lessonDoc),
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  let input
  try {
    const raw = readFileSync(jsonPath, 'utf-8')
    input = JSON.parse(raw)
  } catch (err) {
    console.error(`ERROR: Could not read or parse JSON file "${jsonPath}"`)
    console.error(err.message)
    process.exit(1)
  }

  const { errors, resolvedLearningPath } = validateInput(input)
  if (errors.length > 0) {
    console.error(`ERROR: Input validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):\n`)
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  console.log(`\nChecking whether course "${input.slug}" already exists in Sanity...`)

  const existing = await sanity.fetch(
    `*[_type == "course" && slug.current == $slug][0]{ _id, title }`,
    { slug: input.slug }
  )

  if (existing) {
    console.error(`\nERROR: A course with slug "${input.slug}" already exists in Sanity.`)
    console.error(`  _id: ${existing._id}`)
    console.error(`  title: "${existing.title}"`)
    console.error(`\nThis script only creates new courses — it will not modify or overwrite an existing one.`)
    console.error(`Use inject-lesson-content.mjs to add body content to an existing course.`)
    process.exit(1)
  }

  console.log(`No existing course found — proceeding to create.\n`)

  let prerequisiteCourseRef
  if (input.prerequisiteCourseSlug) {
    const prereq = await sanity.fetch(
      `*[_type == "course" && slug.current == $slug][0]{ _id, title }`,
      { slug: input.prerequisiteCourseSlug }
    )
    if (!prereq) {
      console.error(`\nERROR: "prerequisiteCourseSlug" is "${input.prerequisiteCourseSlug}", but no course with that slug exists in Sanity.`)
      console.error(`The prerequisite course must already exist — create it first, then reference it here.`)
      process.exit(1)
    }
    console.log(`Prerequisite course resolved: "${prereq.title}" (${prereq._id})`)
    prerequisiteCourseRef = { _type: 'reference', _ref: prereq._id }
  }

  // Build the full document set in memory first: the course document itself,
  // plus one standalone `lesson` document per lesson (chapters hold reference
  // items pointing at them). Everything below is written as a SINGLE Sanity
  // transaction — either the whole course + all its lesson stubs are created,
  // or the commit throws and nothing is written. No partial-document or
  // partial-course state is possible by construction.
  const builtChapters = (input.chapters ?? []).map(chapter => buildChapter(input.slug, chapter))
  const chapters = builtChapters.map(bc => bc.chapter)
  const lessonDocs = builtChapters.flatMap(bc => bc.lessonDocs)
  const lessonsCount = lessonDocs.length

  if (lessonDocs.length > 0) {
    const collisions = await sanity.fetch(`*[_id in $ids]{_id}`, { ids: lessonDocs.map(d => d._id) })
    if (collisions.length > 0) {
      console.error(`\nERROR: ${collisions.length} target lesson document _id(s) already exist in Sanity — aborting, nothing written.`)
      for (const c of collisions) console.error(`  - ${c._id}`)
      process.exit(1)
    }
  }

  const doc = {
    _id: randomUUID(),
    _type: 'course',
    title: input.title,
    slug: { _type: 'slug', current: input.slug },
    subtitle: input.subtitle,
    tag: input.tag ?? input.difficultyLabel,
    depth: input.depth,
    badge: input.badge,
    price: input.price,
    accessLevel: input.accessLevel ?? 'learner',
    learningPath: resolvedLearningPath,
    orderRank: input.orderRank ?? 99,
    lessonsCount,
    duration: input.duration,
    description: input.description,
    topics: input.topics,
    whatYouLearn: input.whatYouLearn,
    prerequisiteCourse: prerequisiteCourseRef,
    lastReviewed: input.lastReviewed,
    authorByline: input.authorByline,
    chapters,
  }

  // Strip undefined keys — Sanity's client rejects `undefined` field values.
  for (const key of Object.keys(doc)) {
    if (doc[key] === undefined) delete doc[key]
  }

  try {
    const tx = sanity.transaction()
    for (const lessonDoc of lessonDocs) tx.create(lessonDoc)
    tx.create(doc)
    await tx.commit()
  } catch (err) {
    console.error(`\nERROR: Failed to create course in Sanity.`)
    console.error(err.message)
    console.error(`\nNothing was written — the whole course + lesson stubs are one transaction; it either fully commits or fully fails.`)
    process.exit(1)
  }

  console.log(`──────────────────────────────────────────`)
  console.log(`Course created successfully.`)
  console.log(`──────────────────────────────────────────`)
  console.log(`Title:          ${doc.title}`)
  console.log(`Slug:           ${doc.slug.current}`)
  console.log(`_id:            ${doc._id}`)
  console.log(`Learning path:  ${resolvedLearningPath}`)
  console.log(`Access level:   ${doc.accessLevel}`)
  console.log(`Depth:          ${doc.depth}`)
  console.log(`Chapters:       ${chapters.length}`)
  console.log(`Lesson stubs:   ${lessonsCount}`)
  console.log(`──────────────────────────────────────────`)
  console.log(`\nNext step: add body content to each lesson with inject-lesson-content.mjs:`)
  console.log(`  node inject-lesson-content.mjs <content-file-for-${input.slug}>.json\n`)
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
