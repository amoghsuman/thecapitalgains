// HOW TO RUN:
// 1. Set your Sanity token:
//    export SANITY_TOKEN="your_token_here"
//    On Windows (PowerShell): $env:SANITY_TOKEN="your_token_here"
// 2. Run: node inject-lesson-content.mjs <path-to-json-file>
//    Example: node inject-lesson-content.mjs c1-content.json
//
// Dependencies: npm install @sanity/client (already installed)

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { randomUUID } from 'crypto'

// ─── Env + Args ───────────────────────────────────────────────────────────────

const SANITY_TOKEN = process.env.SANITY_TOKEN
if (!SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN environment variable is not set.')
  process.exit(1)
}

const jsonPath = process.argv[2]
if (!jsonPath) {
  console.error('ERROR: No JSON file path provided.')
  console.error('Usage: node inject-lesson-content.mjs <path-to-json-file>')
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

// ─── Key Regeneration ─────────────────────────────────────────────────────────

// Recursively replace every _key in an object/array with a fresh UUID.
// This ensures no duplicate _key errors in Sanity Portable Text.
function regenerateKeys(value) {
  if (Array.isArray(value)) {
    return value.map(item => regenerateKeys(item))
  }
  if (value !== null && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = k === '_key' ? randomUUID() : regenerateKeys(v)
    }
    return out
  }
  return value
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Read and parse the JSON file
  let input
  try {
    const raw = readFileSync(jsonPath, 'utf-8')
    input = JSON.parse(raw)
  } catch (err) {
    console.error(`ERROR: Could not read or parse JSON file "${jsonPath}"`)
    console.error(err.message)
    process.exit(1)
  }

  const { courseSlug, chapters: inputChapters } = input

  if (!courseSlug) {
    console.error('ERROR: JSON file is missing "courseSlug" field.')
    process.exit(1)
  }
  if (!Array.isArray(inputChapters)) {
    console.error('ERROR: JSON file is missing "chapters" array.')
    process.exit(1)
  }

  // Build flat maps of lesson slug/title → body from the input JSON. Slug is
  // the preferred match key (see below); title is kept only as a fallback
  // for older input files that don't carry a "slug" per lesson.
  const bodyBySlug = new Map()
  const bodyByTitle = new Map()
  let inputLessonsWithBody = 0
  for (const chapter of inputChapters) {
    for (const lesson of chapter.lessons ?? []) {
      if (!Array.isArray(lesson.body)) continue
      inputLessonsWithBody++
      if (lesson.slug) bodyBySlug.set(String(lesson.slug).trim(), lesson.body)
      if (lesson.title) bodyByTitle.set(lesson.title.trim(), lesson.body)
    }
  }

  console.log(`\nFetching course "${courseSlug}" from Sanity...`)

  // Lessons are now standalone documents referenced from chapters. Dereference
  // them here to get each lesson's _id, slug and title for matching.
  const course = await sanity.fetch(`
    *[_type == "course" && slug.current == $slug][0] {
      _id,
      title,
      chapters[] {
        title,
        lessons[]-> { _id, title, "slug": slug.current }
      }
    }
  `, { slug: courseSlug })

  if (!course) {
    console.error(`ERROR: Course "${courseSlug}" not found in Sanity.`)
    process.exit(1)
  }

  console.log(`Found: "${course.title}"`)

  const sanityChapters = course.chapters ?? []
  const sanityLessons = sanityChapters.flatMap(ch => ch.lessons ?? [])
  console.log(`Sanity chapters: ${sanityChapters.length}  |  Sanity lessons: ${sanityLessons.length}`)
  console.log(`JSON lessons with body content: ${inputLessonsWithBody}\n`)

  // Match each dereferenced lesson to input body content — slug first
  // (reliable: slugs are unique per course and never renamed), falling back
  // to title only when the input JSON has no slug for that lesson.
  const patches = [] // { lessonId, body, label }
  let unmatchedCount = 0

  for (const lesson of sanityLessons) {
    const bySlug = lesson.slug ? bodyBySlug.get(lesson.slug) : undefined
    const byTitle = bodyByTitle.get(lesson.title?.trim() ?? '')
    const inputBody = bySlug ?? byTitle
    const matchedVia = bySlug !== undefined ? 'slug' : byTitle !== undefined ? 'title (fallback)' : null

    if (inputBody !== undefined) {
      patches.push({ lessonId: lesson._id, body: regenerateKeys(inputBody), label: lesson.title })
      console.log(`Matched lesson: ${lesson.title}  (via ${matchedVia})`)
    } else {
      console.warn(`Warning: Could not match lesson: ${lesson.title}`)
      unmatchedCount++
    }
  }

  if (patches.length === 0) {
    console.log(`\nNo lessons matched — nothing to patch.\n`)
    return
  }

  console.log(`\nPatching ${patches.length} lesson document(s) in Sanity...`)

  const tx = sanity.transaction()
  for (const p of patches) {
    tx.patch(p.lessonId, patch => patch.set({ body: p.body }))
  }
  await tx.commit()

  console.log(`Done. ${patches.length} lessons updated.`)
  if (unmatchedCount > 0) {
    console.log(`${unmatchedCount} lessons had no matching content in the JSON and were left unchanged.`)
  }
  console.log()
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
