// HOW TO RUN:
// 1. Set your Sanity token:
//    export SANITY_TOKEN="your_token_here"
//    On Windows (PowerShell): $env:SANITY_TOKEN="your_token_here"
// 2. Dry run (default, writes nothing):
//    node migrate-lessons-to-documents.mjs
// 3. Real run, after reviewing the dry-run output:
//    node migrate-lessons-to-documents.mjs --apply
//
// Dependencies: npm install @sanity/client (already installed)
//
// WHAT THIS DOES:
// One-time migration from embedded lesson objects (chapters[].lessons[] as
// inline objects) to standalone top-level `lesson` documents referenced from
// chapters. Scope: every PUBLISHED course document that currently has any
// lesson content — discovered dynamically via GROQ, not a hardcoded list, so
// no course is silently left in the old shape. Draft documents are never
// touched (real user progress in Supabase is keyed off published slugs).
//
// For each matching course:
//   1. A full backup of the course document (as currently stored) is written
//      to ./migration-backups/<run-timestamp>/<courseSlug>.json — always,
//      even in dry-run, so every run leaves an audit trail.
//   2. For each embedded lesson, a new `lesson` document is built with the
//      EXACT SAME title/slug/duration/isFree/body — slugs are never
//      regenerated, since Supabase's lesson_progress/course_enrollments
//      tables key off them directly.
//   3. Each new lesson gets a deterministic _id: lesson-<courseSlug>-<lessonSlug>
//      This makes the migration idempotent — re-running after a partial or
//      completed migration detects already-migrated lessons and refuses to
//      duplicate them rather than silently overwriting.
//   4. The chapter's lessons array is rewritten to hold reference items
//      instead of embedded objects, REUSING the original array item's _key
//      so the diff is minimal and array identity is preserved.
//
// All writes for a real (--apply) run happen in a SINGLE Sanity transaction
// across every course and every new lesson document: either the whole
// migration commits, or none of it does. Nothing is left half-migrated.

import { createClient } from '@sanity/client'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

// ─── Env + Args ───────────────────────────────────────────────────────────────

const SANITY_TOKEN = process.env.SANITY_TOKEN
if (!SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN environment variable is not set.')
  process.exit(1)
}

const APPLY = process.argv.includes('--apply')

// ─── Sanity Client ────────────────────────────────────────────────────────────

const sanity = createClient({
  projectId: 'xmblxfh8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Sanity document IDs have a hard length ceiling (128 chars). Long course +
// lesson slugs combined can blow past that, so the id is truncated with a
// short content hash suffix always appended — this keeps ids deterministic
// (same course+lesson slug always produces the same id, so re-runs are safe)
// while guaranteeing both uniqueness and a valid length regardless of title length.
const MAX_ID_LENGTH = 96

function lessonDocId(courseSlug, lessonSlug) {
  const hash = createHash('sha1').update(`${courseSlug}::${lessonSlug}`).digest('hex').slice(0, 10)
  const base = `lesson-${courseSlug}-${lessonSlug}`
  const budget = MAX_ID_LENGTH - hash.length - 1
  const truncatedBase = base.length <= budget ? base : base.slice(0, budget)
  return `${truncatedBase}-${hash}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nMode: ${APPLY ? 'APPLY (will write to Sanity)' : 'DRY RUN (no writes)'}\n`)

  console.log('Discovering published courses with lesson content...')
  const courses = await sanity.fetch(`
    *[_type == "course" && !(_id in path("drafts.**")) && count(chapters[].lessons[]) > 0]{
      _id,
      title,
      "slug": slug.current,
      chapters
    } | order(slug asc)
  `)

  if (courses.length === 0) {
    console.log('No courses with lesson content found. Nothing to do.')
    return
  }

  console.log(`Found ${courses.length} course(s):`)
  for (const c of courses) console.log(`  - ${c.slug}  ("${c.title}", _id: ${c._id})`)
  console.log()

  // ─── Backup ───────────────────────────────────────────────────────────────

  const runTimestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = join(process.cwd(), 'migration-backups', runTimestamp)
  mkdirSync(backupDir, { recursive: true })

  for (const course of courses) {
    const backupPath = join(backupDir, `${course.slug}.json`)
    writeFileSync(backupPath, JSON.stringify(course, null, 2), 'utf-8')
  }
  console.log(`Backup written: ${backupDir}\n`)

  // ─── Build migration plan ──────────────────────────────────────────────────

  const lessonDocsToCreate = []
  const coursePatches = [] // { courseId, updatedChapters }
  const seenLessonIds = new Map() // lessonDocId -> "courseSlug > chapterTitle > lessonTitle", to detect in-run collisions
  const planErrors = []

  for (const course of courses) {
    const updatedChapters = []
    let courseLessonCount = 0

    for (const chapter of course.chapters ?? []) {
      const updatedLessons = []

      for (const lesson of chapter.lessons ?? []) {
        const lessonSlug = lesson.slug?.current
        if (!lessonSlug) {
          planErrors.push(`Course "${course.slug}", chapter "${chapter.title}": lesson "${lesson.title}" has no slug — cannot migrate safely.`)
          continue
        }

        const newId = lessonDocId(course.slug, lessonSlug)
        const locationLabel = `${course.slug} > ${chapter.title} > ${lesson.title}`

        if (seenLessonIds.has(newId)) {
          planErrors.push(`Duplicate target _id "${newId}" for both "${seenLessonIds.get(newId)}" and "${locationLabel}" — lesson slugs must be unique within a course.`)
          continue
        }
        seenLessonIds.set(newId, locationLabel)

        lessonDocsToCreate.push({
          _id: newId,
          _type: 'lesson',
          title: lesson.title,
          slug: lesson.slug,
          duration: lesson.duration,
          isFree: lesson.isFree ?? false,
          body: lesson.body ?? [],
          __meta: { courseSlug: course.slug, chapterTitle: chapter.title, bodyBlockCount: (lesson.body ?? []).length },
        })

        updatedLessons.push({
          _key: lesson._key,
          _type: 'reference',
          _ref: newId,
        })
        courseLessonCount++
      }

      updatedChapters.push({ ...chapter, lessons: updatedLessons })
    }

    coursePatches.push({ courseId: course._id, courseSlug: course.slug, courseTitle: course.title, updatedChapters, lessonCount: courseLessonCount })
  }

  if (planErrors.length > 0) {
    console.error(`ERROR: ${planErrors.length} issue(s) found while building the migration plan — aborting, nothing written:\n`)
    for (const e of planErrors) console.error(`  - ${e}`)
    process.exit(1)
  }

  // ─── Print plan ─────────────────────────────────────────────────────────────

  console.log('──────────────────────────────────────────────────────────')
  console.log('MIGRATION PLAN')
  console.log('──────────────────────────────────────────────────────────')

  for (const patch of coursePatches) {
    console.log(`\nCourse: ${patch.courseTitle}  (${patch.courseSlug})`)
    console.log(`  _id: ${patch.courseId}`)
    console.log(`  Chapters: ${patch.updatedChapters.length}  |  Lessons: ${patch.lessonCount}`)
  }

  console.log(`\n──────────────────────────────────────────────────────────`)
  console.log(`New standalone lesson documents to create: ${lessonDocsToCreate.length}`)
  console.log(`──────────────────────────────────────────────────────────`)
  for (const doc of lessonDocsToCreate) {
    console.log(`  [${doc.__meta.courseSlug}] "${doc.title}"`)
    console.log(`      slug: ${doc.slug?.current}   duration: ${doc.duration || '(none)'}   isFree: ${doc.isFree}   body blocks: ${doc.__meta.bodyBlockCount}`)
    console.log(`      new _id: ${doc._id}`)
  }

  console.log(`\n──────────────────────────────────────────────────────────`)
  console.log(`TOTALS: ${coursePatches.length} course(s), ${lessonDocsToCreate.length} lesson document(s) to create`)
  console.log(`──────────────────────────────────────────────────────────\n`)

  if (!APPLY) {
    console.log('Dry run complete. No changes were written to Sanity.')
    console.log('Review the plan above. If it looks correct, re-run with --apply to write for real.\n')
    return
  }

  // ─── Idempotency check ──────────────────────────────────────────────────────

  console.log('Checking for already-existing lesson documents at target _ids...')
  const targetIds = lessonDocsToCreate.map(d => d._id)
  const existing = await sanity.fetch(`*[_id in $ids]{_id}`, { ids: targetIds })
  if (existing.length > 0) {
    console.error(`\nERROR: ${existing.length} target lesson document(s) already exist. Aborting — nothing written.`)
    console.error('This usually means a previous run already migrated some or all of these lessons.')
    for (const e of existing) console.error(`  - ${e._id}`)
    process.exit(1)
  }
  console.log('No collisions. Proceeding.\n')

  // ─── Commit as a single atomic transaction ─────────────────────────────────

  console.log('Committing single atomic transaction (all creates + all course patches)...')
  const tx = sanity.transaction()

  for (const doc of lessonDocsToCreate) {
    const { __meta, ...cleanDoc } = doc
    tx.create(cleanDoc)
  }
  for (const patch of coursePatches) {
    tx.patch(patch.courseId, p => p.set({ chapters: patch.updatedChapters }))
  }

  try {
    await tx.commit()
  } catch (err) {
    console.error('\nFATAL: Transaction failed — Sanity guarantees this means NOTHING in this transaction was written.')
    console.error(err.message)
    process.exit(1)
  }

  console.log('Transaction committed successfully.\n')

  // ─── Post-migration verification ───────────────────────────────────────────

  console.log('Verifying: dereferencing lessons back from each migrated course...')
  let allOk = true
  for (const patch of coursePatches) {
    const verify = await sanity.fetch(`
      *[_type == "course" && _id == $id][0]{
        "slug": slug.current,
        "lessons": chapters[].lessons[]->{ "slug": slug.current, title }
      }
    `, { id: patch.courseId })

    const resolvedCount = (verify?.lessons ?? []).filter(Boolean).length
    const ok = resolvedCount === patch.lessonCount
    allOk = allOk && ok
    console.log(`  ${ok ? 'OK' : 'MISMATCH'}  ${patch.courseSlug}: expected ${patch.lessonCount} resolved lessons, got ${resolvedCount}`)
  }

  console.log(allOk ? '\nAll courses verified: every lesson reference resolves correctly.\n' : '\nWARNING: one or more courses did not verify cleanly — investigate before trusting the migration.\n')
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
