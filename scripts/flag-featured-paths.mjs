// HOW TO RUN (from the project root):
// 1. SANITY_TOKEN is read automatically from .env.local at the project root.
//    On Windows (PowerShell), to override it for one run: $env:SANITY_TOKEN="your_token_here"
// 2. Dry run (prints the plan, writes nothing):
//      node scripts/flag-featured-paths.mjs
// 3. Real run:
//      node scripts/flag-featured-paths.mjs --apply
//
// WHAT THIS DOES:
// Creates or updates one `learningPathMeta` document per entry in FEATURED
// below (_id "learningPathMeta-<path>") with featuredOnHome = true and the
// given homeOrder. Any other learningPathMeta document that is currently
// featured is set featuredOnHome = false, so the list below is the whole
// home-page selection. Paths are validated against sanity/lib/learningPaths.ts.
// Note: these are catalogue paths (course.learningPath values); the
// `learningPath` document type is the Find Your Path persona→goal join and is
// not touched.

import { createClient } from '@sanity/client'
import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
try {
  process.loadEnvFile(path.join(PROJECT_ROOT, '.env.local'))
} catch (err) {
  if (err.code !== 'ENOENT') throw err
}

const APPLY = process.argv.includes('--apply')
const SANITY_TOKEN = process.env.SANITY_TOKEN
if (APPLY && !SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN environment variable is not set.')
  process.exit(1)
}

// The home-page selection, in display order.
const FEATURED = [
  ['stock-market-basics', 1],
  ['options-derivatives', 2],
  ['value-investing', 3],
  ['technical-trading', 4],
  ['mutual-funds-etfs', 5],
  ['forensic-compliance', 6],
]

// Validate against the canonical list (TypeScript file; Node strips the types).
const { LEARNING_PATHS } = await import(pathToFileURL(path.join(PROJECT_ROOT, 'sanity/lib/learningPaths.ts')).href)
const known = new Set(LEARNING_PATHS.map((p) => p.value))
const unknown = FEATURED.map(([p]) => p).filter((p) => !known.has(p))
if (unknown.length) {
  console.error(`ERROR: not in sanity/lib/learningPaths.ts: ${unknown.join(', ')}`)
  process.exit(1)
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xmblxfh8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

// Current state and live course counts, for the plan.
const [existing, counts] = await Promise.all([
  sanity.fetch('*[_type == "learningPathMeta"]{ _id, path, featuredOnHome, homeOrder }'),
  sanity.fetch('*[_type == "course" && defined(learningPath)]{ learningPath }'),
])
const courseCount = {}
for (const c of counts) courseCount[c.learningPath] = (courseCount[c.learningPath] || 0) + 1
const byId = Object.fromEntries(existing.map((d) => [d._id, d]))

const tx = sanity.transaction()
let creates = 0
let updates = 0
let unfeatured = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — flag featured learning paths\n`)
for (const [p, order] of FEATURED) {
  const id = `learningPathMeta-${p}`
  const title = LEARNING_PATHS.find((x) => x.value === p)?.title ?? p
  const n = courseCount[p] || 0
  const cur = byId[id]
  const warn = n === 0 ? '  (0 courses: will be hidden on the home page until a course is assigned)' : ''
  if (!cur) {
    tx.createIfNotExists({ _id: id, _type: 'learningPathMeta', path: p, featuredOnHome: true, homeOrder: order })
    creates++
    console.log(`create   ${id.padEnd(44)} order ${order}  "${title}"  courses=${n}${warn}`)
  } else if (cur.featuredOnHome !== true || cur.homeOrder !== order) {
    tx.patch(id, { set: { featuredOnHome: true, homeOrder: order } })
    updates++
    console.log(`update   ${id.padEnd(44)} order ${cur.homeOrder ?? '—'} → ${order}, featured ${cur.featuredOnHome ?? false} → true  courses=${n}${warn}`)
  } else {
    console.log(`ok       ${id.padEnd(44)} order ${order}  courses=${n}${warn}`)
  }
}
const featuredIds = new Set(FEATURED.map(([p]) => `learningPathMeta-${p}`))
for (const d of existing) {
  if (d.featuredOnHome === true && !featuredIds.has(d._id)) {
    tx.patch(d._id, { set: { featuredOnHome: false } })
    unfeatured++
    console.log(`unflag   ${d._id.padEnd(44)} featured true → false`)
  }
}

console.log(`\nPlan: ${creates} create, ${updates} update, ${unfeatured} unflag.`)
if (!APPLY) {
  console.log('Dry run only. Re-run with --apply to write.')
  process.exit(0)
}
if (creates + updates + unfeatured === 0) {
  console.log('Nothing to write.')
  process.exit(0)
}
await tx.commit()
console.log('Done.')
