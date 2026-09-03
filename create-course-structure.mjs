// HOW TO RUN:
// 1. Set your Sanity token:
//    export SANITY_TOKEN="your_token_here"
//    On Windows (PowerShell): $env:SANITY_TOKEN="your_token_here"
// 2. Run: node create-course-structure.mjs <path-to-json-file>
//    Example: node create-course-structure.mjs c7-structure.json
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

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { randomUUID } from 'crypto'

// ─── Env + Args ───────────────────────────────────────────────────────────────

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

function buildLesson(lesson) {
  return {
    _key: randomUUID(),
    title: lesson.title,
    slug: { _type: 'slug', current: slugify(lesson.title) },
    duration: lesson.durationMinutes !== undefined ? `${lesson.durationMinutes} min read` : '',
    isFree: lesson.isFree ?? false,
    body: [], // filled in later by inject-lesson-content.mjs
  }
}

function buildChapter(chapter) {
  return {
    _key: randomUUID(),
    title: chapter.title,
    lessons: (chapter.lessons ?? []).map(buildLesson),
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

  // Build the full document in memory first. The actual write below is a
  // single sanity.create() call for one complete document — Sanity either
  // creates the whole thing or the call throws and nothing is written.
  // There is no multi-step write sequence here, so no partial-document
  // state is possible: it's all-or-nothing by construction.
  const chapters = (input.chapters ?? []).map(buildChapter)
  const lessonsCount = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)

  const doc = {
    _type: 'course',
    title: input.title,
    slug: { _type: 'slug', current: input.slug },
    subtitle: input.subtitle,
    tag: input.tag ?? input.difficultyLabel,
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
    chapters,
  }

  // Strip undefined keys — Sanity's client rejects `undefined` field values.
  for (const key of Object.keys(doc)) {
    if (doc[key] === undefined) delete doc[key]
  }

  let created
  try {
    created = await sanity.create(doc)
  } catch (err) {
    console.error(`\nERROR: Failed to create course in Sanity.`)
    console.error(err.message)
    console.error(`\nNothing was written — sanity.create() either fully succeeds or fully fails for a single document.`)
    process.exit(1)
  }

  console.log(`──────────────────────────────────────────`)
  console.log(`Course created successfully.`)
  console.log(`──────────────────────────────────────────`)
  console.log(`Title:          ${created.title}`)
  console.log(`Slug:           ${created.slug.current}`)
  console.log(`_id:            ${created._id}`)
  console.log(`Learning path:  ${resolvedLearningPath}`)
  console.log(`Access level:   ${doc.accessLevel}`)
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
