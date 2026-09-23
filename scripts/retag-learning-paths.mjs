// HOW TO RUN (from the project root):
// 1. SANITY_TOKEN is read automatically from .env.local at the project root.
// 2. Dry run (prints the table, writes nothing):
//      node scripts/retag-learning-paths.mjs
// 3. Real run:
//      node scripts/retag-learning-paths.mjs --apply
//
// WHAT THIS DOES:
// Moves courses onto the two learning paths that currently have no courses,
// so their home-page tracks (learningPathMeta, featuredOnHome) can render:
//   mutual-funds-etfs   ← mutual-funds-etfs-complete-guide + any course whose
//                         title contains "Mutual Fund" or "ETF"
//   forensic-compliance ← deep-dive-into-financial-statement-fraud-and-forensic-red-flags
//                         + any course whose title contains "Forensic", "Fraud"
//                         or "Governance"
// Title matching is case-insensitive on whole words ("ETF" does not match
// "safety"). A course matching both rule sets is listed under both and left
// unchanged with a CONFLICT marker so a human decides. Only `learningPath` is
// patched; slugs, orderRank and everything else stay as they are.

import { createClient } from '@sanity/client'
import { fileURLToPath } from 'url'
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

const RULES = [
  {
    path: 'mutual-funds-etfs',
    slugs: ['mutual-funds-etfs-complete-guide'],
    titleWords: ['Mutual Fund', 'ETF'],
  },
  {
    path: 'forensic-compliance',
    slugs: ['deep-dive-into-financial-statement-fraud-and-forensic-red-flags'],
    titleWords: ['Forensic', 'Fraud', 'Governance'],
  },
]

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xmblxfh8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

const courses = await sanity.fetch(
  `*[_type == "course"] | order(title asc) { _id, title, "slug": slug.current, learningPath }`
)

const wordRe = (w) => new RegExp(`(^|[^A-Za-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?([^A-Za-z]|$)`, 'i')

// slug → { course, targets: Set<path>, reasons: string[] }
const matches = new Map()
for (const c of courses) {
  for (const rule of RULES) {
    const reasons = []
    if (rule.slugs.includes(c.slug)) reasons.push('slug')
    for (const w of rule.titleWords) if (wordRe(w).test(c.title ?? '')) reasons.push(`title "${w}"`)
    if (reasons.length === 0) continue
    const m = matches.get(c.slug) ?? { course: c, targets: new Map() }
    m.targets.set(rule.path, reasons)
    matches.set(c.slug, m)
  }
}

// Explicit slugs that do not exist in Sanity are reported, not silently skipped.
const known = new Set(courses.map((c) => c.slug))
for (const rule of RULES) for (const s of rule.slugs) if (!known.has(s)) console.log(`WARNING: course "${s}" not found in Sanity`)

const rows = []
const patches = []
for (const { course, targets } of matches.values()) {
  const paths = [...targets.keys()]
  const conflict = paths.length > 1
  const proposed = conflict ? course.learningPath : paths[0]
  const change = !conflict && course.learningPath !== proposed
  rows.push({
    slug: course.slug,
    title: course.title,
    current: course.learningPath ?? '(none)',
    proposed: conflict ? `CONFLICT: ${paths.join(' | ')}` : proposed,
    why: paths.map((p) => `${p}: ${targets.get(p).join(', ')}`).join('; '),
    action: conflict ? 'skip' : change ? 'patch' : 'ok',
  })
  if (change) patches.push({ id: course._id, path: proposed })
}

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — retag courses to learning paths\n`)
console.log(`${courses.length} courses in Sanity · ${rows.length} matched\n`)
const w = (s, n) => String(s).padEnd(n).slice(0, n)
console.log(`${w('action', 6)} ${w('slug', 62)} ${w('current', 22)} ${w('proposed', 22)} why`)
for (const r of rows.sort((a, b) => a.action.localeCompare(b.action) || a.slug.localeCompare(b.slug))) {
  console.log(`${w(r.action, 6)} ${w(r.slug, 62)} ${w(r.current, 22)} ${w(r.proposed, 22)} ${r.why}`)
}
for (const rule of RULES) {
  const after = rows.filter((r) => r.action !== 'skip' && (r.proposed === rule.path)).length
  console.log(`\n${rule.path}: ${courses.filter((c) => c.learningPath === rule.path).length} courses now → ${after} after`)
}
console.log(`\nPlan: ${patches.length} patch(es), ${rows.filter((r) => r.action === 'skip').length} conflict(s) skipped.`)

if (!APPLY) {
  console.log('Dry run only. Re-run with --apply to write.')
  process.exit(0)
}
if (patches.length === 0) {
  console.log('Nothing to write.')
  process.exit(0)
}
const tx = sanity.transaction()
for (const p of patches) tx.patch(p.id, { set: { learningPath: p.path } })
await tx.commit()
console.log('Done.')
