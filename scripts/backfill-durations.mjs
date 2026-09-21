// HOW TO RUN (from the project root):
// 1. SANITY_TOKEN is read automatically from .env.local at the project root.
//    On Windows (PowerShell), to override it for one run: $env:SANITY_TOKEN="your_token_here"
// 2. Dry run (prints the plan, writes nothing):
//      node scripts/backfill-durations.mjs
// 3. Real run (writes lesson durations, then course durations):
//      node scripts/backfill-durations.mjs --apply
// 4. Overwrite durations that already exist (default is to keep them):
//      node scripts/backfill-durations.mjs --apply --force
// 5. Recompute every course's duration from its lessons' current durations,
//    overwriting existing course values and leaving all lessons untouched:
//      node scripts/backfill-durations.mjs --apply --force-courses
//
// WHAT THIS DOES:
// Fills `duration` on every lesson and every course.
//   Lesson:  words in body (Portable Text blocks, including blocks nested in
//            `content` arrays such as collapsible sections) / 200 wpm, rounded
//            up, minimum 3 min, plus 30 s per code block and per table.
//            Written as "<N> min". Lessons with an empty body are skipped.
//   Course:  sum of its lessons' minutes, written as "~<H> hrs" (one decimal)
//            or "~<N> min" under an hour. `lessonsCount` is also set to the
//            actual number of lesson references, since the UI displays it.
//
// Existing durations are never overwritten unless --force is passed.
// `lessonsCount` is always corrected when it differs from the real count.
// No other field is touched. No documents are created or deleted.

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

const APPLY = process.argv.includes('--apply')
const FORCE = process.argv.includes('--force')
const FORCE_COURSES = process.argv.includes('--force-courses')
if (FORCE && FORCE_COURSES) {
  console.error('ERROR: --force and --force-courses are mutually exclusive (--force-courses never writes lessons).')
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

// ─── Constants ────────────────────────────────────────────────────────────────

const WORDS_PER_MINUTE = 200 // reading speed for finance text
const MIN_LESSON_MINUTES = 3
const ALLOWANCE_SECONDS = 30 // per code block and per table
const CODE_TYPES = ['codeBlock', 'code']
const TABLE_TYPES = ['table']
const BATCH_SIZE = 50
const LESSON_TABLE_ROWS = 30

// ─── Lesson duration ──────────────────────────────────────────────────────────

function countWords(text) {
  return (text ?? '').trim().split(/\s+/).filter(Boolean).length
}

// Walks a Portable Text array. Counts words in text blocks only; images,
// code blocks, callouts and section titles contribute no words. Recurses
// into nested `content` arrays (collapsible sections).
function measureBody(nodes, acc = { words: 0, codeBlocks: 0, tables: 0 }) {
  if (!Array.isArray(nodes)) return acc
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    if (node._type === 'block') {
      for (const child of node.children ?? []) {
        if (typeof child?.text === 'string') acc.words += countWords(child.text)
      }
    } else if (CODE_TYPES.includes(node._type)) {
      acc.codeBlocks++
    } else if (TABLE_TYPES.includes(node._type)) {
      acc.tables++
    }
    if (Array.isArray(node.content)) measureBody(node.content, acc)
  }
  return acc
}

function lessonMinutes({ words, codeBlocks, tables }) {
  const reading = Math.max(MIN_LESSON_MINUTES, Math.ceil(words / WORDS_PER_MINUTE))
  const allowance = ((codeBlocks + tables) * ALLOWANCE_SECONDS) / 60
  return Math.ceil(reading + allowance)
}

// "8 min" → 8. Also tolerates "8 mins" / "8 minutes" / "1.5 hrs". null if unparseable.
function parseMinutes(duration) {
  if (typeof duration !== 'string') return null
  const m = duration.match(/(\d+(?:\.\d+)?)\s*(min|hr|hour)?/i)
  if (!m) return null
  const n = parseFloat(m[1])
  return /^h/i.test(m[2] ?? '') ? Math.round(n * 60) : Math.round(n)
}

// ─── Course duration ──────────────────────────────────────────────────────────

function formatCourseDuration(totalMinutes) {
  if (totalMinutes < 60) return `~${totalMinutes} min`
  const hours = Math.round((totalMinutes / 60) * 10) / 10
  return `~${hours} hrs`
}

// ─── Output helpers ───────────────────────────────────────────────────────────

function printTable(headers, rows) {
  const clip = (v, max = 48) => {
    const s = String(v ?? '')
    return s.length > max ? s.slice(0, max - 1) + '…' : s
  }
  const cells = rows.map(r => r.map(c => clip(c)))
  const widths = headers.map((h, i) => Math.max(h.length, ...cells.map(r => r[i].length)))
  const line = r => r.map((c, i) => c.padEnd(widths[i])).join('  ')
  console.log(line(headers))
  console.log(widths.map(w => '─'.repeat(w)).join('  '))
  for (const r of cells) console.log(line(r))
}

async function commitInBatches(patches) {
  let written = 0
  for (let i = 0; i < patches.length; i += BATCH_SIZE) {
    const batch = patches.slice(i, i + BATCH_SIZE)
    const tx = sanity.transaction()
    for (const { _id, set } of batch) tx.patch(_id, p => p.set(set))
    await tx.commit()
    written += batch.length
    console.log(`  committed ${written}/${patches.length}`)
  }
  return written
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nMode: ${APPLY ? 'APPLY' : 'DRY RUN'}${FORCE ? ' + FORCE (existing durations will be overwritten)' : ''}${FORCE_COURSES ? ' + FORCE-COURSES (every course duration recomputed; lessons untouched)' : ''}\n`)

  // ── Lesson pass ──
  console.log('Fetching lessons...')
  const lessons = await sanity.fetch(`*[_type == "lesson"]{ _id, title, duration, body } | order(title asc)`)

  const lessonPlan = lessons.map(lesson => {
    const hasBody = Array.isArray(lesson.body) && lesson.body.length > 0
    const stats = measureBody(lesson.body)
    const computed = hasBody ? `${lessonMinutes(stats)} min` : null
    let action
    if (FORCE_COURSES) action = 'untouched'
    else if (!hasBody) action = 'skip-empty'
    else if (lesson.duration && !FORCE) action = 'keep'
    else if (lesson.duration === computed) action = 'unchanged'
    else action = 'write'
    return { lesson, stats, computed, action }
  })

  // Minutes each lesson will have once the lesson pass is done.
  const minutesAfter = new Map()
  for (const { lesson, computed, action } of lessonPlan) {
    const effective = action === 'write' ? computed : lesson.duration
    minutesAfter.set(lesson._id, parseMinutes(effective))
  }

  const lessonWrites = lessonPlan.filter(p => p.action === 'write')
  const lessonKept = lessonPlan.filter(p => ['keep', 'unchanged', 'untouched'].includes(p.action))
  const lessonEmpty = lessonPlan.filter(p => p.action === 'skip-empty')

  console.log(`\nLESSONS (first ${LESSON_TABLE_ROWS} of ${lessonPlan.length})\n`)
  printTable(
    ['Lesson', 'Current', 'Computed', 'Words', 'Code', 'Tables', 'Action'],
    lessonPlan.slice(0, LESSON_TABLE_ROWS).map(({ lesson, stats, computed, action }) => [
      lesson.title ?? lesson._id, lesson.duration ?? '—', computed ?? '—', stats.words, stats.codeBlocks, stats.tables, action,
    ])
  )
  console.log(`\nLesson totals: ${lessonPlan.length} total | ${lessonWrites.length} to write | ${lessonKept.length} kept (already set) | ${lessonEmpty.length} skipped (empty body)`)
  const drafts = lessons.filter(l => l._id.startsWith('drafts.')).length
  if (drafts) console.log(`  (${drafts} of these are draft documents — patched alongside their published versions)`)

  if (lessonEmpty.length > 0) {
    console.log(`\nLessons with an empty body (skipped):`)
    for (const { lesson } of lessonEmpty) console.log(`  - ${lesson.title ?? '(untitled)'} (${lesson._id})`)
  }

  // ── Course pass ──
  console.log('\nFetching courses...')
  const courses = await sanity.fetch(
    `*[_type == "course"]{ _id, title, duration, lessonsCount, chapters[]{ lessons[]->{ _id, duration } } } | order(title asc)`
  )

  const coursePlan = courses.map(course => {
    const refs = (course.chapters ?? []).flatMap(ch => ch?.lessons ?? [])
    let total = 0
    let missing = 0
    for (const ref of refs) {
      // Dangling reference (null) or a lesson that still has no duration → 0, counted as missing.
      const minutes = ref ? (minutesAfter.has(ref._id) ? minutesAfter.get(ref._id) : parseMinutes(ref.duration)) : null
      if (minutes == null) missing++
      else total += minutes
    }
    const computed = refs.length > 0 ? formatCourseDuration(total) : null
    const set = {}
    if (computed && computed !== course.duration && (!course.duration || FORCE || FORCE_COURSES)) set.duration = computed
    if (course.lessonsCount !== refs.length) set.lessonsCount = refs.length
    return { course, total, computed, lessonCount: refs.length, missing, set }
  })

  const courseWrites = coursePlan.filter(p => Object.keys(p.set).length > 0)

  console.log(`\nCOURSES (${coursePlan.length})\n`)
  printTable(
    ['Course', 'Current', 'Computed', 'Lessons', 'Count now', 'Missing', 'Will set'],
    coursePlan.map(({ course, computed, lessonCount, missing, set }) => [
      course.title ?? course._id, course.duration ?? '—', computed ?? '—', lessonCount, course.lessonsCount ?? '—', missing,
      Object.keys(set).join(', ') || '—',
    ])
  )

  const existingFormats = [...new Set(courses.map(c => c.duration).filter(Boolean))]
  const ranked = coursePlan.filter(p => p.computed).sort((a, b) => b.total - a.total)
  const fmt = p => `  ${p.computed.padEnd(10)} ${p.course.title} (${p.lessonCount} lessons, ${p.missing} missing)`

  console.log(`\nSummary:`)
  console.log(`  Lessons: ${lessonPlan.length} total | ${lessonWrites.length} to write | ${lessonKept.length} kept | ${lessonEmpty.length} empty body`)
  console.log(`  Courses: ${coursePlan.length} total | ${courseWrites.length} to write (${courseWrites.filter(p => p.set.duration).length} duration, ${courseWrites.filter(p => 'lessonsCount' in p.set).length} lessonsCount) | ${coursePlan.length - courseWrites.length} unchanged`)
  console.log(`  Lesson references without a duration: ${coursePlan.reduce((s, p) => s + p.missing, 0)}`)
  console.log(`  Existing course duration values: ${existingFormats.length ? existingFormats.map(f => `"${f}"`).join(', ') : '(none)'}`)
  console.log(`\nFive largest course durations:`)
  ranked.slice(0, 5).forEach(p => console.log(fmt(p)))
  console.log(`\nFive smallest course durations:`)
  ranked.slice(-5).reverse().forEach(p => console.log(fmt(p)))

  if (!APPLY) {
    console.log(`\nDRY RUN — no writes performed. Re-run with --apply to write.\n`)
    return
  }

  // ── Apply: lessons first, then courses ──
  console.log(`\n--apply passed. Writing ${lessonWrites.length} lesson duration(s) in batches of ${BATCH_SIZE}...`)
  const lessonsWritten = await commitInBatches(
    lessonWrites.map(({ lesson, computed }) => ({ _id: lesson._id, set: { duration: computed } }))
  )

  console.log(`\nWriting ${courseWrites.length} course update(s) in batches of ${BATCH_SIZE}...`)
  const coursesWritten = await commitInBatches(courseWrites.map(({ course, set }) => ({ _id: course._id, set })))

  console.log(`\n──────────────────────────────────────────`)
  console.log(`Backfill complete.`)
  console.log(`──────────────────────────────────────────`)
  console.log(`Lessons written:      ${lessonsWritten}`)
  console.log(`Lessons skipped:      ${lessonPlan.length - lessonsWritten} (${lessonKept.length} already set, ${lessonEmpty.length} empty body)`)
  console.log(`Courses written:      ${coursesWritten}`)
  console.log(`Courses skipped:      ${coursePlan.length - coursesWritten}`)
  console.log(`──────────────────────────────────────────\n`)
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
