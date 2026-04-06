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

  // Build a flat map of lesson title → body from the input JSON
  const bodyByTitle = new Map()
  for (const chapter of inputChapters) {
    for (const lesson of chapter.lessons ?? []) {
      if (lesson.title && Array.isArray(lesson.body)) {
        bodyByTitle.set(lesson.title.trim(), lesson.body)
      }
    }
  }

  console.log(`\nFetching course "${courseSlug}" from Sanity...`)

  const course = await sanity.fetch(
    `*[_type == "course" && slug.current == $slug][0]`,
    { slug: courseSlug }
  )

  if (!course) {
    console.error(`ERROR: Course "${courseSlug}" not found in Sanity.`)
    process.exit(1)
  }

  console.log(`Found: "${course.title}"`)

  const sanityChapters = course.chapters ?? []
  const totalSanityLessons = sanityChapters.reduce(
    (sum, ch) => sum + (ch.lessons?.length ?? 0), 0
  )
  console.log(`Sanity chapters: ${sanityChapters.length}  |  Sanity lessons: ${totalSanityLessons}`)
  console.log(`JSON lessons with body content: ${bodyByTitle.size}\n`)

  let matchedCount = 0
  let unmatchedCount = 0

  // Deep clone the Sanity chapters before mutating
  const updatedChapters = JSON.parse(JSON.stringify(sanityChapters))

  for (const chapter of updatedChapters) {
    for (const lesson of chapter.lessons ?? []) {
      const title = lesson.title?.trim() ?? ''
      const inputBody = bodyByTitle.get(title)

      if (inputBody !== undefined) {
        // Regenerate all _key values before injecting
        lesson.body = regenerateKeys(inputBody)
        console.log(`Matched lesson: ${title}`)
        matchedCount++
      } else {
        console.warn(`Warning: Could not match lesson: ${title}`)
        unmatchedCount++
      }
    }
  }

  console.log(`\nPatching Sanity...`)

  await sanity
    .patch(course._id)
    .set({ chapters: updatedChapters })
    .commit()

  console.log(`Done. ${matchedCount} lessons updated.`)
  if (unmatchedCount > 0) {
    console.log(`${unmatchedCount} lessons had no matching content in the JSON and were left unchanged.`)
  }
  console.log()
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
