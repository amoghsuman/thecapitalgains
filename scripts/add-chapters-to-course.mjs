// HOW TO RUN:
// 1. Set your Sanity token:
//    export SANITY_TOKEN="your_token_here"
//    On Windows (PowerShell): $env:SANITY_TOKEN="your_token_here"
// 2. Dry run (preview only, writes nothing):
//    node add-chapters-to-course.mjs <path-to-json-file> --dry-run
// 3. Real run:
//    node add-chapters-to-course.mjs <path-to-json-file>
//
// Dependencies: npm install @sanity/client (already installed)
//
// WHAT THIS DOES:
// Appends new chapters (with empty lesson stubs) to a course that ALREADY
// exists in Sanity. Complements create-course-structure.mjs (which only
// ever creates brand-new courses and refuses to touch an existing one) and
// inject-lesson-content.mjs (which only patches body content into existing
// lesson stubs) — this is the missing "add more structure to a course
// that's already live" step.
//
// This script ONLY adds to an existing course. If the given courseSlug
// doesn't exist, it exits without writing anything — the opposite safety
// direction from create-course-structure.mjs.
//
// It never modifies any existing chapter or lesson document. It only ever
// creates new standalone `lesson` documents and patches the course's
// `chapters` array by inserting new chapter objects — every chapter/lesson
// that was already there, published or not, is carried through completely
// untouched.

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { randomUUID, createHash } from 'crypto'

// ─── Env + Args ───────────────────────────────────────────────────────────────

const SANITY_TOKEN = process.env.SANITY_TOKEN
if (!SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN environment variable is not set.')
  console.error('Set it with: export SANITY_TOKEN="your_token_here"')
  process.exit(1)
}

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const jsonPath = args.find(a => !a.startsWith('--'))

if (!jsonPath) {
  console.error('ERROR: No JSON file path provided.')
  console.error('Usage: node add-chapters-to-course.mjs <path-to-json-file> [--dry-run]')
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Same slugify logic as create-course-structure.mjs / upload-courses.mjs,
// reused verbatim so lesson slugs are generated identically everywhere.
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
// regardless of title length. Kept in sync with create-course-structure.mjs
// and migrate-lessons-to-documents.mjs.
const MAX_ID_LENGTH = 96

function lessonDocId(courseSlug, lessonSlug) {
  const hash = createHash('sha1').update(`${courseSlug}::${lessonSlug}`).digest('hex').slice(0, 10)
  const base = `lesson-${courseSlug}-${lessonSlug}`
  const budget = MAX_ID_LENGTH - hash.length - 1
  const truncatedBase = base.length <= budget ? base : base.slice(0, budget)
  return `${truncatedBase}-${hash}`
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateInput(input) {
  const errors = []

  if (!input.courseSlug || typeof input.courseSlug !== 'string') {
    errors.push('"courseSlug" is required and must be a string.')
  }

  if (!Array.isArray(input.chapters) || input.chapters.length === 0) {
    errors.push('"chapters" is required and must be a non-empty array.')
  }

  if (input.insertAtIndex !== undefined) {
    if (typeof input.insertAtIndex !== 'number' || !Number.isInteger(input.insertAtIndex) || input.insertAtIndex < 0) {
      errors.push(`"insertAtIndex" must be a non-negative integer if provided. Got: ${JSON.stringify(input.insertAtIndex)}`)
    }
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

  return errors
}

// ─── Document building ────────────────────────────────────────────────────────

// Builds the standalone lesson document to be created, plus the reference
// item that goes into the chapter's `lessons` array in its place. Identical
// shape to create-course-structure.mjs's buildLesson.
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
  console.log(`\nMode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'APPLY (will write to Sanity)'}\n`)

  let input
  try {
    const raw = readFileSync(jsonPath, 'utf-8')
    input = JSON.parse(raw)
  } catch (err) {
    console.error(`ERROR: Could not read or parse JSON file "${jsonPath}"`)
    console.error(err.message)
    process.exit(1)
  }

  const errors = validateInput(input)
  if (errors.length > 0) {
    console.error(`ERROR: Input validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):\n`)
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  console.log(`Looking up course "${input.courseSlug}" in Sanity...`)

  const course = await sanity.fetch(
    `*[_type == "course" && slug.current == $slug][0]{ _id, title, chapters }`,
    { slug: input.courseSlug }
  )

  if (!course) {
    console.error(`\nERROR: No course with slug "${input.courseSlug}" exists in Sanity.`)
    console.error(`This script only adds chapters to an EXISTING course — it never creates one.`)
    console.error(`Use create-course-structure.mjs first if this course doesn't exist yet.`)
    process.exit(1)
  }

  const existingChapters = course.chapters ?? []
  console.log(`Found: "${course.title}"  (${existingChapters.length} existing chapter${existingChapters.length === 1 ? '' : 's'})\n`)

  // insertAtIndex validated for range now that we know how many chapters
  // actually exist. 0..length inclusive — length itself means "at the end",
  // same as the default.
  let insertAtIndex = existingChapters.length
  if (input.insertAtIndex !== undefined) {
    if (input.insertAtIndex > existingChapters.length) {
      console.error(`\nERROR: "insertAtIndex" is ${input.insertAtIndex}, but the course only has ${existingChapters.length} existing chapter(s).`)
      console.error(`Valid range is 0 to ${existingChapters.length} (inclusive — ${existingChapters.length} means "at the end").`)
      process.exit(1)
    }
    insertAtIndex = input.insertAtIndex
  }

  // Warn (don't block) on chapter title collisions — could be an intentional
  // revision.
  const existingTitles = new Set(existingChapters.map(c => c.title))
  const duplicateTitles = input.chapters.map(c => c.title).filter(t => existingTitles.has(t))
  if (duplicateTitles.length > 0) {
    console.warn(`WARNING: ${duplicateTitles.length} new chapter title(s) already exist on this course:`)
    for (const t of duplicateTitles) console.warn(`  - "${t}"`)
    console.warn(`Proceeding anyway — this might be intentional (e.g. a genuine chapter revision).\n`)
  }

  // Build the new chapters + lesson stubs in memory first.
  const builtChapters = input.chapters.map(chapter => buildChapter(input.courseSlug, chapter))
  const newChapters = builtChapters.map(bc => bc.chapter)
  const newLessonDocs = builtChapters.flatMap(bc => bc.lessonDocs)

  // Global slug collision check — lesson slugs must be unique platform-wide
  // now that lessons are standalone documents, not just unique within this
  // course. Checked across ALL lesson documents in the project, published or
  // draft, not just this course's.
  if (newLessonDocs.length > 0) {
    const newSlugs = newLessonDocs.map(d => d.slug.current)
    const slugCollisions = await sanity.fetch(
      `*[_type == "lesson" && slug.current in $slugs]{ _id, "slug": slug.current }`,
      { slugs: newSlugs }
    )
    if (slugCollisions.length > 0) {
      console.error(`\nERROR: ${slugCollisions.length} new lesson slug(s) already exist somewhere in the project — aborting, nothing written.`)
      for (const c of slugCollisions) console.error(`  - "${c.slug}"  (existing doc: ${c._id})`)
      console.error(`\nLesson slugs must be unique platform-wide. Rename the colliding lesson title(s) and try again.`)
      process.exit(1)
    }

    // Belt-and-braces: also check the deterministic _ids themselves,
    // matching create-course-structure.mjs's convention.
    const idCollisions = await sanity.fetch(`*[_id in $ids]{_id}`, { ids: newLessonDocs.map(d => d._id) })
    if (idCollisions.length > 0) {
      console.error(`\nERROR: ${idCollisions.length} target lesson document _id(s) already exist in Sanity — aborting, nothing written.`)
      for (const c of idCollisions) console.error(`  - ${c._id}`)
      process.exit(1)
    }
  }

  // Splice the new chapters into the existing array at insertAtIndex,
  // leaving every existing chapter/lesson entry completely untouched —
  // this only ever inserts new array entries, never rewrites existing ones.
  const finalChapters = [
    ...existingChapters.slice(0, insertAtIndex),
    ...newChapters,
    ...existingChapters.slice(insertAtIndex),
  ]

  const existingLessonCount = existingChapters.reduce((sum, ch) => sum + (ch.lessons?.length ?? 0), 0)
  const newLessonCount = newLessonDocs.length
  const totalLessonCount = existingLessonCount + newLessonCount

  // ─── Plan summary ───────────────────────────────────────────────────────────

  console.log(`──────────────────────────────────────────────────────────`)
  console.log(`PLAN`)
  console.log(`──────────────────────────────────────────────────────────`)
  console.log(`Course:              "${course.title}"  (${course._id})`)
  console.log(`Insert position:     index ${insertAtIndex} of ${existingChapters.length} existing chapter(s)${insertAtIndex === existingChapters.length ? ' (i.e. at the end)' : ''}`)
  console.log(`New chapters:        ${newChapters.length}`)
  console.log(`New lesson stubs:    ${newLessonDocs.length}`)
  console.log()
  for (const bc of builtChapters) {
    console.log(`  Chapter: "${bc.chapter.title}"`)
    for (const lessonDoc of bc.lessonDocs) {
      console.log(`    - "${lessonDoc.title}"`)
      console.log(`        slug: ${lessonDoc.slug.current}   duration: ${lessonDoc.duration || '(none)'}   isFree: ${lessonDoc.isFree}`)
      console.log(`        new _id: ${lessonDoc._id}`)
    }
  }
  console.log()
  console.log(`Resulting totals:    ${finalChapters.length} chapters, ${totalLessonCount} lessons (was ${existingChapters.length} chapters, ${existingLessonCount} lessons)`)
  console.log(`Course.lessonsCount will be updated to: ${totalLessonCount}`)
  console.log(`──────────────────────────────────────────────────────────\n`)

  if (DRY_RUN) {
    console.log('Dry run complete. No changes were written to Sanity.')
    console.log('Review the plan above. If it looks correct, re-run without --dry-run to write for real.\n')
    return
  }

  // ─── Commit as a single atomic transaction ─────────────────────────────────
  // Every existing chapter/lesson entry is carried through in finalChapters
  // completely unmodified — this patch only ever adds new lesson documents
  // and new chapter array entries, it never rewrites an existing one.

  try {
    const tx = sanity.transaction()
    for (const lessonDoc of newLessonDocs) tx.create(lessonDoc)
    tx.patch(course._id, p => p.set({ chapters: finalChapters, lessonsCount: totalLessonCount }))
    await tx.commit()
  } catch (err) {
    console.error(`\nERROR: Failed to add chapters to course in Sanity.`)
    console.error(err.message)
    console.error(`\nNothing was written — the lesson stubs + course patch are one transaction; it either fully commits or fully fails.`)
    process.exit(1)
  }

  console.log(`──────────────────────────────────────────`)
  console.log(`Chapters added successfully.`)
  console.log(`──────────────────────────────────────────`)
  console.log(`Course:              "${course.title}"  (${course._id})`)
  console.log(`Chapters added:      ${newChapters.length}`)
  console.log(`Lesson stubs added:  ${newLessonDocs.length}`)
  for (const lessonDoc of newLessonDocs) {
    console.log(`  - "${lessonDoc.title}"  →  ${lessonDoc.slug.current}`)
  }
  console.log(`Resulting totals:    ${finalChapters.length} chapters, ${totalLessonCount} lessons`)
  console.log(`──────────────────────────────────────────`)
  console.log(`\nNext step: add body content to the new lesson stubs with inject-lesson-content.mjs:`)
  console.log(`  node inject-lesson-content.mjs <content-file-for-${input.courseSlug}>.json\n`)
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
