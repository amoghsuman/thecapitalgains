// HOW TO RUN:
// 1. Place the Excel file at the project root as: TCG_Foundation_Courses_Chapter_Lesson_Breakdown.xlsx
// 2. Set your Sanity token: export SANITY_TOKEN="your_token_here"
//    On Windows (CMD): set SANITY_TOKEN=your_token_here
//    On Windows (PowerShell): $env:SANITY_TOKEN="your_token_here"
// 3. Run: node upload-courses.mjs
//
// Dependencies: npm install @sanity/client xlsx
//
// NOTE: This script UPSERTS — it will update existing courses if they already
// exist in Sanity, or create them fresh if they don't.

import { createClient } from '@sanity/client'
import * as XLSX from 'xlsx'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'

// ─── Config ───────────────────────────────────────────────────────────────────

const SANITY_TOKEN = process.env.SANITY_TOKEN
if (!SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN environment variable is not set.')
  console.error('Set it with: export SANITY_TOKEN="your_token_here"')
  process.exit(1)
}

const client = createClient({
  projectId: 'xmblxfh8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

// ─── Course Metadata ──────────────────────────────────────────────────────────

const COURSES = [
  {
    slug: 'stock-market-from-zero',
    title: 'Stock Market from Zero',
    accessLevel: 'free',
    tag: 'Absolute Beginner',
    badge: 'LEAD MAGNET',
    sheetPrefix: 'C1',
  },
  {
    slug: 'options-trading-from-zero',
    title: 'Options Trading from Zero',
    accessLevel: 'learner',
    tag: 'Beginner → Intermediate',
    badge: 'BESTSELLER',
    sheetPrefix: 'C2',
  },
  {
    slug: 'how-to-read-financial-statements',
    title: 'How to Read Financial Statements',
    accessLevel: 'learner',
    tag: 'Beginner → Intermediate',
    badge: 'NEW',
    sheetPrefix: 'C3',
  },
  {
    slug: 'mutual-funds-etfs-complete-guide',
    title: 'Mutual Funds & ETFs — The Complete Guide',
    accessLevel: 'learner',
    tag: 'Beginner',
    badge: 'NEW',
    sheetPrefix: 'C4',
  },
  {
    slug: 'technical-analysis-charts-patterns-indicators',
    title: 'Technical Analysis — Charts, Patterns & Indicators',
    accessLevel: 'learner',
    tag: 'Beginner → Intermediate',
    badge: '',
    sheetPrefix: 'C5',
  },
  {
    slug: 'futures-derivatives-explained',
    title: 'Futures & Derivatives Explained',
    accessLevel: 'learner',
    tag: 'Intermediate',
    badge: '',
    sheetPrefix: 'C6',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric (except spaces/hyphens)
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '')           // trim leading/trailing hyphens
}

function isFreeLesson(value) {
  if (!value) return false
  return String(value).includes('FREE') || String(value).includes('✅')
}

function isEmptyRow(row) {
  return !row || Object.values(row).every(v => v === null || v === undefined || v === '')
}

// ─── Excel Parser ─────────────────────────────────────────────────────────────

function parseSheet(workbook, sheetPrefix) {
  // Find the sheet whose name starts with the given prefix (e.g. "C1", "C2")
  const sheetName = workbook.SheetNames.find(name => name.startsWith(sheetPrefix))
  if (!sheetName) {
    throw new Error(`No sheet found with prefix "${sheetPrefix}". Available sheets: ${workbook.SheetNames.join(', ')}`)
  }

  const sheet = workbook.Sheets[sheetName]
  // Convert to array of arrays for reliable column indexing
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

  // Find the header row — look for a row that contains "Ch" or "L#" or "Lesson Title"
  let headerRowIdx = -1
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i]
    const rowStr = row.map(c => String(c ?? '')).join('|').toLowerCase()
    if (rowStr.includes('lesson title') || rowStr.includes('l#')) {
      headerRowIdx = i
      break
    }
  }

  if (headerRowIdx === -1) {
    throw new Error(`Could not find header row in sheet "${sheetName}"`)
  }

  const headers = rows[headerRowIdx].map(h => String(h ?? '').trim())

  // Map header names to column indices (case-insensitive, partial match)
  function colIdx(partial) {
    const idx = headers.findIndex(h => h.toLowerCase().includes(partial.toLowerCase()))
    return idx
  }

  const COL_CH       = colIdx('ch')           // Chapter number column
  const COL_LNUM     = colIdx('l#')           // Lesson number column
  const COL_TITLE    = colIdx('lesson title') // Lesson/chapter title
  const COL_DURATION = colIdx('duration')
  const COL_FREE     = colIdx('free?')

  if (COL_TITLE === -1) {
    throw new Error(`Could not find "Lesson Title" column in sheet "${sheetName}". Headers found: ${headers.join(', ')}`)
  }

  const chapters = []
  let currentChapter = null

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue

    const col0 = row[0]  // The "Ch" column — contains a number (lesson) or string (chapter title)

    // Skip blank spacer rows
    if (col0 === null || col0 === undefined || col0 === '') continue

    // Skip the header row if it appears again mid-sheet (e.g. col0 === "Ch")
    if (String(col0).trim() === 'Ch') continue

    const col0IsString = typeof col0 === 'string' || isNaN(Number(col0))

    if (col0IsString) {
      // ── CHAPTER ROW ──
      // The chapter title is in column 0 (the Ch column)
      const chapterTitle = String(col0).trim()
      if (!chapterTitle) continue

      currentChapter = {
        _key: randomUUID(),
        title: chapterTitle,
        lessons: [],
      }
      chapters.push(currentChapter)
    } else {
      // ── LESSON ROW ──
      // col0 is a number (Ch number); L# is in col 1
      const lNumVal  = row[COL_LNUM]
      const titleVal = row[COL_TITLE]
      const durVal   = COL_DURATION !== -1 ? row[COL_DURATION] : null
      const freeVal  = COL_FREE !== -1 ? row[COL_FREE] : null

      const lessonTitle = titleVal ? String(titleVal).trim() : ''
      if (!lessonTitle) continue

      // Ensure there's a chapter to attach to
      if (!currentChapter) {
        currentChapter = {
          _key: randomUUID(),
          title: 'Chapter 1',
          lessons: [],
        }
        chapters.push(currentChapter)
      }

      currentChapter.lessons.push({
        _key: randomUUID(),
        title: lessonTitle,
        slug: {
          _type: 'slug',
          current: slugify(lessonTitle),
        },
        duration: durVal ? String(durVal).trim() : '',
        isFree: isFreeLesson(freeVal),
        body: [],
      })
    }
  }

  const lessonsCount = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)
  return { chapters, lessonsCount }
}

// ─── Upsert ───────────────────────────────────────────────────────────────────

async function upsertCourse(courseMeta, chapters, lessonsCount) {
  const { slug, title, accessLevel, tag, badge } = courseMeta

  // Check if course exists
  const existing = await client.fetch(
    `*[_type == "course" && slug.current == $slug][0]{ _id }`,
    { slug }
  )

  // Delete existing document first to avoid patch merging issues
  if (existing?._id) {
    await client.delete(existing._id)
    console.log(`  … Deleted existing document for "${title}"`)
  }

  // Always create fresh
  await client.create({
    _type: 'course',
    title,
    slug: {
      _type: 'slug',
      current: slug,
    },
    accessLevel,
    tag,
    badge: badge || undefined,
    lessonsCount,
    chapters,
  })

  const action = existing?._id ? 'Replaced' : 'Created'
  console.log(`  ✓ ${action}: "${title}" (${lessonsCount} lessons, ${chapters.length} chapters)`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const EXCEL_FILE = 'TCG_Foundation_Courses_Chapter_Lesson_Breakdown.xlsx'

  console.log(`\nReading Excel file: ${EXCEL_FILE}`)
  let workbook
  try {
    const fileBuffer = readFileSync(EXCEL_FILE)
    workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  } catch (err) {
    console.error(`ERROR: Could not read Excel file "${EXCEL_FILE}"`)
    console.error(`Make sure the file is in the same directory as this script.`)
    console.error(err.message)
    process.exit(1)
  }

  console.log(`Found sheets: ${workbook.SheetNames.join(', ')}\n`)
  console.log(`Uploading ${COURSES.length} courses to Sanity (project: xmblxfh8, dataset: production)...\n`)

  let successCount = 0
  let errorCount = 0

  for (const courseMeta of COURSES) {
    process.stdout.write(`Processing ${courseMeta.sheetPrefix}: ${courseMeta.title}...\n`)

    try {
      const { chapters, lessonsCount } = parseSheet(workbook, courseMeta.sheetPrefix)

      if (chapters.length === 0) {
        console.warn(`  ⚠ WARNING: No chapters found for "${courseMeta.title}" — skipping upload.`)
        errorCount++
        continue
      }

      await upsertCourse(courseMeta, chapters, lessonsCount)
      successCount++
    } catch (err) {
      console.error(`  ✗ FAILED:   "${courseMeta.title}"`)
      console.error(`    ${err.message}`)
      errorCount++
    }
  }

  console.log(`\n──────────────────────────────────────────`)
  console.log(`Done. ${successCount} succeeded, ${errorCount} failed.`)
  if (errorCount > 0) {
    console.log(`Check the errors above and re-run for any failed courses.`)
  }
  console.log(`──────────────────────────────────────────\n`)
}

main()
