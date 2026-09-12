// HOW TO RUN (from the project root):
// 1. SANITY_TOKEN is read automatically from .env.local at the project root.
//    On Windows (PowerShell), to override it for one run: $env:SANITY_TOKEN="your_token_here"
// 2. Dry run (prints the full plan, writes nothing):
//      node scripts/migrate-find-your-path.mjs
// 3. Real run (creates everything in one transaction):
//      node scripts/migrate-find-your-path.mjs --confirm
//
// WHAT THIS DOES:
// One-off migration of the Find Your Path homepage feature (personas ->
// investing goals -> recommended courses) out of hardcoded TypeScript
// (lib/findYourPath/pathData.ts + the HARVEY lookup in
// components/FindYourPath/PathNavigator.tsx) and into three new Sanity
// document types: `persona`, `investingGoal`, `learningPath`.
//
// SOURCE DATA IS DUPLICATED BELOW, NOT IMPORTED — this is a standalone Node
// script outside the Next/Studio TypeScript build, so it can't import a .ts
// module directly (same reason create-course-structure.mjs keeps its own
// copy of LEARNING_PATHS instead of importing sanity/lib/learningPaths.ts).
// This is a one-off migration script, not a recurring authoring tool, so a
// one-time verbatim transcription is simpler than adding a TS loader for a
// script that (per its own design) only ever needs to run once.
//
// This script ONLY creates. If any target persona/investingGoal/learningPath
// document ID already exists, OR any course slug referenced below can't be
// resolved in Sanity, it aborts with nothing written — same all-or-nothing
// contract as create-course-structure.mjs's prerequisite-course resolution.
//
// suggestedLearn/suggestedResearch/suggestedSession from the original Goal
// type are intentionally NOT migrated — inspection found nothing in the live
// UI (SuggestedPlan in PathNavigator.tsx) actually renders them; they were
// dead data. Per direction, dropped rather than carried forward.

import { createClient } from '@sanity/client'
import { randomUUID } from 'crypto'
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Same slugify logic as create-course-structure.mjs / upload-courses.mjs,
// reused verbatim so slugs are generated identically everywhere.
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

// ─── Source data (duplicated from lib/findYourPath/pathData.ts) ─────────────

const PERSONAS = [
  {
    key: 'fresh_grad',
    label: 'Fresh graduate / first job',
    goals: [
      {
        label: 'Start investing my salary wisely',
        courses: [
          { slug: 'stock-market-from-zero', reason: 'Mechanics before everything else, eliminates the most costly beginner mistakes' },
          { slug: 'mutual-funds-etfs-complete-guide', reason: 'The right vehicle for your income stage and risk profile' },
          { slug: 'how-to-read-financial-statements', reason: 'Evaluate what you are buying before you buy it' },
        ],
      },
      {
        label: 'Avoid common first-timer mistakes',
        courses: [
          { slug: 'stock-market-from-zero', reason: 'Covers all the mechanics most beginners get wrong' },
          { slug: 'mutual-funds-etfs-complete-guide', reason: 'SIP discipline and fund selection, the two things that matter most early on' },
        ],
      },
    ],
  },
  {
    key: 'active_trader',
    label: 'Active trader (self-taught)',
    goals: [
      {
        label: 'Stop losing on trades I should be winning',
        courses: [
          { slug: 'options-trading-from-zero', reason: 'Greeks, pricing, and setups most self-taught traders never learn correctly' },
          { slug: 'futures-derivatives-explained', reason: 'Position sizing and hedging, what separates consistent traders' },
          { slug: 'technical-analysis-charts-patterns-indicators', reason: 'Structure your chart reading with a repeatable framework' },
        ],
      },
      {
        label: 'Get serious about options trading',
        courses: [
          { slug: 'options-trading-from-zero', reason: 'Full playbook, Greeks, IV, strategies, and when each works' },
          { slug: 'futures-derivatives-explained', reason: 'Understand the underlying mechanics your options are priced against' },
          { slug: 'how-to-read-financial-statements', reason: 'Avoid trading into earnings traps and corporate events blindly' },
        ],
      },
    ],
  },
  {
    key: 'salaried_pro',
    label: 'Salaried professional',
    goals: [
      {
        label: 'Make my savings work harder than an FD',
        courses: [
          { slug: 'mutual-funds-etfs-complete-guide', reason: 'The right equity exposure for a busy professional' },
          { slug: 'how-to-read-financial-statements', reason: 'Evaluate whether what you own is actually good' },
          { slug: 'stock-market-from-zero', reason: 'Fill in the mechanics gaps, know what you are invested in' },
        ],
      },
      {
        label: 'Build a long-term equity portfolio',
        courses: [
          { slug: 'how-to-read-financial-statements', reason: 'Stock selection starts here, everything else is secondary' },
          { slug: 'stock-market-from-zero', reason: 'Market mechanics and how to execute correctly' },
          { slug: 'mutual-funds-etfs-complete-guide', reason: 'For the portion you want managed passively' },
        ],
      },
    ],
  },
  {
    key: 'finance_student',
    label: 'Finance student / career aspirant',
    goals: [
      {
        label: 'Prepare for finance interviews and jobs',
        courses: [
          { slug: 'how-to-read-financial-statements', reason: 'The single most tested skill in equity research and IB interviews' },
          { slug: 'futures-derivatives-explained', reason: 'Derivatives knowledge separates candidates at every level' },
          { slug: 'options-trading-from-zero', reason: 'Practical working knowledge, not just formula memorisation' },
        ],
      },
      {
        label: 'Understand real markets beyond textbooks',
        courses: [
          { slug: 'stock-market-from-zero', reason: 'How Indian markets actually work: NSE, BSE, settlement, participants' },
          { slug: 'how-to-read-financial-statements', reason: 'Applied analysis, not academic ratios' },
          { slug: 'technical-analysis-charts-patterns-indicators', reason: 'Market intuition and price structure, what no textbook covers' },
        ],
      },
    ],
  },
  {
    key: 'business_owner',
    label: 'Business owner / entrepreneur',
    goals: [
      {
        label: 'Deploy business profits into markets',
        courses: [
          { slug: 'stock-market-from-zero', reason: 'Business instincts transfer, but market mechanics must come first' },
          { slug: 'how-to-read-financial-statements', reason: 'You already think like an analyst, now apply it to listed companies' },
          { slug: 'mutual-funds-etfs-complete-guide', reason: 'For the portion you cannot actively manage' },
        ],
      },
      {
        label: 'Understand equity like I understand my business',
        courses: [
          { slug: 'how-to-read-financial-statements', reason: 'Your strongest entry point, you already think in P&L and cash flow' },
          { slug: 'stock-market-from-zero', reason: 'Market mechanics and participant behaviour' },
          { slug: 'options-trading-from-zero', reason: 'Hedging your equity book when needed' },
        ],
      },
    ],
  },
  {
    key: 'hni',
    label: 'HNI / sophisticated investor',
    goals: [
      { label: 'Get unconflicted, independent research', courses: [] },
      { label: 'Get a sharp second opinion on my portfolio', courses: [] },
    ],
  },
  {
    key: 'retiree',
    label: 'Near or at retirement',
    goals: [
      {
        label: 'Protect my capital, no speculation',
        courses: [
          { slug: 'mutual-funds-etfs-complete-guide', reason: 'Conservative equity exposure: balanced funds, dividend stocks, what to avoid' },
          { slug: 'stock-market-from-zero', reason: 'Fill in the mechanics most near-retirees have always wondered about' },
        ],
      },
      {
        label: 'Generate steady income from my corpus',
        courses: [
          { slug: 'mutual-funds-etfs-complete-guide', reason: 'Dividend yield strategies, debt allocation, and rebalancing logic' },
          { slug: 'how-to-read-financial-statements', reason: 'Evaluate the dividend-paying companies in your portfolio' },
        ],
      },
    ],
  },
]

// Flat per-course-slug lookup (components/FindYourPath/PathNavigator.tsx).
// Depth is dropped here — course.depth already covers it as a global,
// path-independent property; only priority becomes contextual per learningPath.
const HARVEY_PRIORITY = {
  'stock-market-from-zero': 'high',
  'mutual-funds-etfs-complete-guide': 'medium-high',
  'how-to-read-financial-statements': 'medium-high',
  'options-trading-from-zero': 'medium-high',
  'futures-derivatives-explained': 'medium-low',
  'technical-analysis-charts-patterns-indicators': 'medium-low',
}

// ─── Build the plan ───────────────────────────────────────────────────────────

async function buildPlan() {
  const errors = []

  // Resolve every distinct course slug referenced anywhere above, up front,
  // so every unresolved slug is reported together in one run rather than
  // failing one at a time.
  const allSlugs = [...new Set(PERSONAS.flatMap(p => p.goals.flatMap(g => g.courses.map(c => c.slug))))]
  const foundCourses = allSlugs.length > 0
    ? await sanity.fetch(`*[_type == "course" && slug.current in $slugs]{ _id, title, "slug": slug.current }`, { slugs: allSlugs })
    : []
  const courseBySlug = new Map(foundCourses.map(c => [c.slug, c]))

  const missingSlugs = allSlugs.filter(s => !courseBySlug.has(s))
  if (missingSlugs.length > 0) {
    errors.push(
      `${missingSlugs.length} course slug(s) referenced in Find Your Path data do not exist in Sanity:\n` +
      missingSlugs.map(s => `    - "${s}"`).join('\n')
    )
  }

  const missingPriority = allSlugs.filter(s => !(s in HARVEY_PRIORITY))
  if (missingPriority.length > 0) {
    errors.push(
      `${missingPriority.length} course slug(s) have no entry in HARVEY_PRIORITY (required, not defaulted):\n` +
      missingPriority.map(s => `    - "${s}"`).join('\n')
    )
  }

  if (errors.length > 0) {
    return { errors }
  }

  // Personas
  const personaDocs = PERSONAS.map((persona, i) => {
    const slug = slugify(persona.label)
    return {
      _id: `persona-${slug}`,
      _type: 'persona',
      title: persona.label,
      slug: { _type: 'slug', current: slug },
      iconKey: persona.key,
      order: i + 1,
    }
  })
  const personaIdByKey = new Map(PERSONAS.map((p, i) => [p.key, personaDocs[i]._id]))

  // Investing goals — deduplicated by slugified label. None collide across
  // personas in the current data, but this makes that an explicit guarantee
  // rather than an accident: two goals with the same label become ONE
  // investingGoal document, referenced from two different learningPath docs.
  const goalDocsBySlug = new Map()
  for (const persona of PERSONAS) {
    for (const goal of persona.goals) {
      const slug = slugify(goal.label)
      if (!goalDocsBySlug.has(slug)) {
        goalDocsBySlug.set(slug, {
          _id: `investingGoal-${slug}`,
          _type: 'investingGoal',
          title: goal.label,
          slug: { _type: 'slug', current: slug },
        })
      }
    }
  }

  // Learning paths — one per (persona, goal) pair, in original array order.
  const learningPathDocs = []
  for (const persona of PERSONAS) {
    const personaSlug = slugify(persona.label)
    persona.goals.forEach((goal, gi) => {
      const goalSlug = slugify(goal.label)
      const pathCourses = goal.courses.map(c => ({
        _key: randomUUID(),
        course: { _type: 'reference', _ref: courseBySlug.get(c.slug)._id },
        priority: HARVEY_PRIORITY[c.slug],
        rationale: c.reason,
        // Kept for readability in the dry-run plan only, stripped before write.
        _courseTitle: courseBySlug.get(c.slug).title,
      }))
      learningPathDocs.push({
        _id: `learningPath-${personaSlug}-${goalSlug}`,
        _type: 'learningPath',
        persona: { _type: 'reference', _ref: personaIdByKey.get(persona.key) },
        investingGoal: { _type: 'reference', _ref: goalDocsBySlug.get(goalSlug)._id },
        order: gi + 1,
        pathCourses,
        // Kept for readability in the dry-run plan / Studio preview list only.
        _personaLabel: persona.label,
        _goalLabel: goal.label,
      })
    })
  }

  return {
    errors: [],
    personaDocs,
    goalDocs: [...goalDocsBySlug.values()],
    learningPathDocs,
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nBuilding Find Your Path migration plan...\n`)

  const plan = await buildPlan()
  if (plan.errors.length > 0) {
    console.error(`ERROR: Cannot build migration plan (${plan.errors.length} issue${plan.errors.length === 1 ? '' : 's'}):\n`)
    for (const e of plan.errors) console.error(`  - ${e}`)
    console.error(`\nNothing was written.`)
    process.exit(1)
  }

  const { personaDocs, goalDocs, learningPathDocs } = plan

  // Refuse to overwrite — this script only creates. Check every target ID
  // up front, same as create-course-structure.mjs's lesson-id collision check.
  const allIds = [...personaDocs, ...goalDocs, ...learningPathDocs].map(d => d._id)
  const collisions = await sanity.fetch(`*[_id in $ids]{ _id, _type }`, { ids: allIds })
  if (collisions.length > 0) {
    console.error(`\nERROR: ${collisions.length} target document ID(s) already exist in Sanity — aborting, nothing written.`)
    for (const c of collisions) console.error(`  - ${c._id} (${c._type})`)
    process.exit(1)
  }

  console.log(`──────────────────────────────────────────`)
  console.log(`PLAN`)
  console.log(`──────────────────────────────────────────`)
  console.log(`Personas:        ${personaDocs.length}`)
  console.log(`Investing goals: ${goalDocs.length}`)
  console.log(`Learning paths:  ${learningPathDocs.length}`)
  console.log(`──────────────────────────────────────────\n`)

  for (const p of personaDocs) {
    console.log(`PERSONA: "${p.title}"  (order ${p.order}, icon "${p.iconKey}", id ${p._id})`)
  }
  console.log('')
  for (const g of goalDocs) {
    console.log(`GOAL: "${g.title}"  (id ${g._id})`)
  }
  console.log('')
  for (const lp of learningPathDocs) {
    console.log(`LEARNING PATH: "${lp._personaLabel}" → "${lp._goalLabel}"  (order ${lp.order}, id ${lp._id})`)
    if (lp.pathCourses.length === 0) {
      console.log(`    (no courses — research-only path)`)
    } else {
      for (const pc of lp.pathCourses) {
        console.log(`    - "${pc._courseTitle}"  [${pc.priority}]  — ${pc.rationale}`)
      }
    }
  }

  if (!CONFIRM) {
    console.log(`\nDRY RUN — no writes performed. Re-run with --confirm to create this plan.\n`)
    return
  }

  console.log(`\n--confirm passed. Creating ${allIds.length} document(s) in a single transaction...\n`)

  try {
    const tx = sanity.transaction()
    for (const p of personaDocs) tx.create(p)
    for (const g of goalDocs) tx.create(g)
    for (const lp of learningPathDocs) {
      const { _personaLabel, _goalLabel, ...doc } = lp
      doc.pathCourses = doc.pathCourses.map(({ _courseTitle, ...pc }) => pc)
      tx.create(doc)
    }
    await tx.commit()
  } catch (err) {
    console.error(`\nERROR: Failed to create Find Your Path documents in Sanity.`)
    console.error(err.message)
    console.error(`\nNothing was written — this is one transaction; it either fully commits or fully fails.`)
    process.exit(1)
  }

  console.log(`──────────────────────────────────────────`)
  console.log(`Migration complete.`)
  console.log(`──────────────────────────────────────────`)
  console.log(`Personas created:        ${personaDocs.length}`)
  console.log(`Investing goals created: ${goalDocs.length}`)
  console.log(`Learning paths created:  ${learningPathDocs.length}`)
  console.log(`──────────────────────────────────────────\n`)
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
