// HOW TO RUN (from the project root):
// 1. SANITY_TOKEN is read automatically from .env.local at the project root.
//    On Windows (PowerShell), to override it for one run: $env:SANITY_TOKEN="your_token_here"
// 2. Dry run (prints the plan, writes nothing):
//      node scripts/backfill-course-depth.mjs
// 3. Real run (applies the plan in one transaction):
//      node scripts/backfill-course-depth.mjs --confirm
//
// WHAT THIS DOES:
// One-off migration. The `course` schema's `depth` field (sanity/schemaTypes/course.ts)
// is now required, but the 28 course documents that predate it have no value
// set — each one throws a validation error in Studio until backfilled. This
// script fetches every course missing `depth`, heuristically infers a value
// from its title / tag / learningPath (falling back to "medium-low" when
// nothing suggests otherwise), prints the full plan, and — only with
// --confirm — patches every course's `depth` field in a single transaction.
//
// This is a standalone one-off script. It does not touch create-course-structure.mjs,
// inject-lesson-content.mjs, or the schema itself.
//
// The heuristic is not precise classification — every course it defaults
// (rather than infers) is flagged separately in the output for manual review.

import { createClient } from '@sanity/client'
import { fileURLToPath } from 'url'
import path from 'path'

// ─── Env + Args ───────────────────────────────────────────────────────────────

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
  console.error('On Windows (PowerShell): $env:SANITY_TOKEN="your_token_here"')
  process.exit(1)
}

const CONFIRM = process.argv.includes('--confirm')

// ─── Sanity Client ────────────────────────────────────────────────────────────

const sanity = createClient({
  projectId: 'xmblxfh8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

// ─── Schema constraints (kept in sync with sanity/schemaTypes/course.ts) ─────

const VALID_DEPTH_LEVELS = ['low', 'medium-low', 'medium-high', 'high']
const DEFAULT_DEPTH = 'medium-low'

// learningPath values that clearly signal a foundational/introductory course.
const LOW_LEARNING_PATHS = ['stock-market-basics', 'career-fundamentals']

// learningPath values that clearly signal an advanced course. Mapped to
// "high" vs "medium-high" by how specialized/technical the path is.
const HIGH_LEARNING_PATHS = ['quant-finance', 'algo-trading']
const MEDIUM_HIGH_LEARNING_PATHS = ['ma-valuation', 'cfa-prep', 'frm-prep', 'private-equity-vc', 'financial-modelling']

// Title/tag keyword signals, checked case-insensitively.
const LOW_KEYWORDS = ['basics', 'introduction', 'intro to', 'zero', 'fundamentals', 'beginner']
const HIGH_KEYWORDS = ['advanced', 'expert', 'mastery']
const MEDIUM_HIGH_KEYWORDS = ['intermediate']

// ─── Heuristic ────────────────────────────────────────────────────────────────

function containsAny(haystack, needles) {
  const lower = (haystack ?? '').toLowerCase()
  return needles.some(n => lower.includes(n))
}

// Returns { depth, source, reason } — source is "inferred" or "default".
function inferDepth(course) {
  const { title, tag, learningPath } = course

  if (HIGH_LEARNING_PATHS.includes(learningPath)) {
    return { depth: 'high', source: 'inferred', reason: `learningPath "${learningPath}" is a specialized/advanced path` }
  }
  if (containsAny(title, HIGH_KEYWORDS) || containsAny(tag, HIGH_KEYWORDS)) {
    return { depth: 'high', source: 'inferred', reason: `title/tag contains an advanced keyword (${HIGH_KEYWORDS.join(', ')})` }
  }

  if (MEDIUM_HIGH_LEARNING_PATHS.includes(learningPath)) {
    return { depth: 'medium-high', source: 'inferred', reason: `learningPath "${learningPath}" suggests advanced/technical content` }
  }
  if (containsAny(title, MEDIUM_HIGH_KEYWORDS) || containsAny(tag, MEDIUM_HIGH_KEYWORDS)) {
    return { depth: 'medium-high', source: 'inferred', reason: `title/tag contains "${MEDIUM_HIGH_KEYWORDS.join(', ')}"` }
  }

  if (LOW_LEARNING_PATHS.includes(learningPath)) {
    return { depth: 'low', source: 'inferred', reason: `learningPath "${learningPath}" is a foundational path` }
  }
  if (containsAny(title, LOW_KEYWORDS) || containsAny(tag, LOW_KEYWORDS)) {
    return { depth: 'low', source: 'inferred', reason: `title/tag contains a foundational keyword (${LOW_KEYWORDS.join(', ')})` }
  }

  return { depth: DEFAULT_DEPTH, source: 'default', reason: 'no title/tag/learningPath signal matched — defaulted' }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nFetching course documents missing "depth"...\n`)

  const courses = await sanity.fetch(
    `*[_type == "course" && !defined(depth)]{ _id, title, "slug": slug.current, tag, learningPath } | order(title asc)`
  )

  if (courses.length === 0) {
    console.log('No course documents are missing "depth". Nothing to do.\n')
    return
  }

  const plan = courses.map(course => ({ course, ...inferDepth(course) }))

  for (const { depth } of plan) {
    if (!VALID_DEPTH_LEVELS.includes(depth)) {
      throw new Error(`Internal error: heuristic produced invalid depth "${depth}"`)
    }
  }

  console.log(`Found ${courses.length} course(s) missing "depth". Plan:\n`)
  console.log(`──────────────────────────────────────────`)
  for (const { course, depth, source, reason } of plan) {
    console.log(`Title:        ${course.title}`)
    console.log(`Slug:         ${course.slug ?? '(no slug)'}`)
    console.log(`_id:          ${course._id}`)
    console.log(`Tag:          ${course.tag ?? '(none)'}`)
    console.log(`LearningPath: ${course.learningPath ?? '(none)'}`)
    console.log(`Depth →       ${depth}  [${source}]`)
    console.log(`Reason:       ${reason}`)
    console.log(`──────────────────────────────────────────`)
  }

  const defaulted = plan.filter(p => p.source === 'default')
  const inferred = plan.filter(p => p.source === 'inferred')

  console.log(`\nSummary of plan:`)
  console.log(`  Total courses to update: ${plan.length}`)
  console.log(`  Inferred from signal:    ${inferred.length}`)
  console.log(`  Defaulted (${DEFAULT_DEPTH}):    ${defaulted.length}`)

  if (!CONFIRM) {
    console.log(`\nDRY RUN — no writes performed. Re-run with --confirm to apply this plan.\n`)
    return
  }

  console.log(`\n--confirm passed. Applying ${plan.length} update(s) in a single transaction...\n`)

  try {
    const tx = sanity.transaction()
    for (const { course, depth } of plan) {
      tx.patch(course._id, p => p.set({ depth }))
    }
    await tx.commit()
  } catch (err) {
    console.error(`\nERROR: Failed to apply depth backfill.`)
    console.error(err.message)
    console.error(`\nNothing was written — all updates are one transaction; it either fully commits or fully fails.`)
    process.exit(1)
  }

  console.log(`──────────────────────────────────────────`)
  console.log(`Backfill complete.`)
  console.log(`──────────────────────────────────────────`)
  console.log(`Courses updated:      ${plan.length}`)
  console.log(`  Inferred:           ${inferred.length}`)
  console.log(`  Defaulted:          ${defaulted.length}`)
  console.log(`──────────────────────────────────────────`)

  if (defaulted.length > 0) {
    console.log(`\nDefaulted to "${DEFAULT_DEPTH}" — review these manually:\n`)
    for (const { course } of defaulted) {
      console.log(`  - ${course.title} (${course.slug ?? course._id})`)
    }
    console.log('')
  }
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
