// HOW TO RUN (from the project root):
// 1. SANITY_TOKEN is read automatically from .env.local at the project root.
// 2. Dry run (prints the plan, writes nothing):
//      node scripts/seed-glossary-facts.mjs
// 3. Real run:
//      node scripts/seed-glossary-facts.mjs --apply
//
// WHAT THIS DOES:
// Seeds the `glossaryTerm` documents from the terms that were hard-coded in
// components/home/GlossaryOfTheWeek.tsx, and the `marketFactCard` documents
// from the fact strip in components/home/MarketPulseToast.tsx. Cards whose
// figure has no citable source or no as-of date are created as DRAFTS
// (`drafts.` id) with an editorialNote saying what to verify, so nothing
// unsourced is ever published by this script. The two live-computed cards
// (rule of 72, hurdle rate) stay in lib/home/marketFacts.ts and are not
// seeded. Course references are resolved by slug; a missing course aborts.
// Existing documents with the same _id are left untouched (createIfNotExists).

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

const SEBI_SOURCE = 'SEBI, Analysis of Profits and Losses in the Equity Derivatives Segment, Sept 2024'
const SEBI_URL = 'https://www.sebi.gov.in'

// ── Glossary terms (from GlossaryOfTheWeek.tsx) ──────────────────────────────
const TERMS = [
  {
    id: 'roce',
    term: 'ROCE (Return on Capital Employed)',
    category: 'fundamentals',
    shortDefinition: 'Measures how much pure operating profit a company squeezes out of every ₹100 of total capital invested into the business.',
    definition: 'EBIT / (Total Assets − Current Liabilities). Reflects economic moats and management\'s capital allocation efficiency independent of debt financing structure.',
    formula: 'ROCE = EBIT ÷ [Total Debt + Shareholder Equity − Cash]',
    retailTrap: 'Confusing ROCE with ROE. High ROE can be artificially engineered with dangerous financial leverage; high ROCE requires genuine business quality.',
    courseSlug: 'how-to-read-financial-statements',
    order: 1,
  },
  {
    id: 'iv-crush',
    term: 'Implied Volatility (IV) Crush',
    category: 'derivatives',
    shortDefinition: 'The sudden, sharp collapse in option prices immediately after an anticipated binary event passes (e.g., Union Budget or earnings).',
    definition: 'When an uncertainty event resolves, forward standard deviation demand vanishes, causing option vega to shrink premiums even if the underlying moved in your direction.',
    formula: 'Option Price Drop ≈ Vega × ΔIV',
    retailTrap: 'Buying naked Call or Put options on quarterly results day. Even if the stock moves up 3%, IV can fall sharply, leaving buyers with a net capital loss.',
    courseSlug: 'options-trading-from-zero',
    order: 1,
  },
  {
    id: 'margin-of-safety',
    term: 'Margin of Safety',
    category: 'valuation',
    shortDefinition: 'Buying a business at a substantial discount to its conservative intrinsic worth to protect against unforeseen bad luck or human error.',
    definition: 'The quantitative cushion between market capitalization and conservative discounted cash flow (DCF) under conservative terminal growth assumptions.',
    formula: 'Margin of Safety % = (Intrinsic Value − Market Price) ÷ Intrinsic Value',
    retailTrap: 'Assuming a low Price-to-Earnings (P/E) ratio equals a margin of safety. Value traps with decaying cash flows have no safety cushion.',
    courseSlug: 'how-to-read-financial-statements',
    order: 1,
  },
  {
    id: 'stcg-tax-drag',
    term: 'STCG Tax Drag',
    category: 'wealth',
    shortDefinition: 'The silent compounder killer in India where hyperactive trading loses 20% of all profits every financial year before money can compound.',
    definition: 'Under current Indian tax code, short-term equity capital gains are taxed at 20% flat. Annual tax realization interrupts geometric compounding curves.',
    formula: 'Compound FV = P × [1 + r(1 − Tax)]^n',
    retailTrap: 'Thinking a 20% annual trading profit beats a 15% long-term compounder. After paying 20% STCG every cycle, net returns severely lag long-term index holding.',
    courseSlug: 'mutual-funds-etfs-complete-guide',
    order: 1,
  },
]

// ── Fact cards (from MarketPulseToast.tsx's strip) ───────────────────────────
// `draft: true` + `editorialNote` marks a card that must not be published as is.
const CARDS = [
  {
    id: 'sebi-fo-losses',
    title: '93% of individual F&O traders lost money',
    categoryLabel: 'SEBI derivatives stats',
    headlineValue: '₹1.8 lakh crore lost',
    body: 'SEBI\'s study found 93% of individual F&O traders lost money over FY22 to FY24, with ₹1.8 lakh crore of aggregate losses over those three years.',
    source: SEBI_SOURCE,
    sourceUrl: SEBI_URL,
    asOf: '2024-09-23',
    staleAfterDays: 730,
    courseSlug: 'options-trading-from-zero',
    order: 1,
    draft: false,
  },
  {
    id: 'cfo-divergence',
    title: 'The CFO divergence warning',
    categoryLabel: 'Forensic accounting',
    headlineValue: 'CFO vs PAT',
    body: 'In many governance collapses on Dalal Street, net profit kept growing on paper while operating cash flow (CFO) trended negative for two or more consecutive years. Profit is an opinion; cash is a fact.',
    source: 'TODO',
    sourceUrl: undefined,
    asOf: '2026-09-24',
    staleAfterDays: 365,
    courseSlug: 'how-to-read-financial-statements',
    order: 2,
    draft: true,
    editorialNote: 'TODO: cite at least two named cases with the filing years where PAT grew while CFO was negative (annual reports or forensic audit reports), then set source/sourceUrl/asOf and publish.',
  },
  {
    id: 'stcg-vs-ltcg',
    title: 'STCG 20% drag vs deferred LTCG',
    categoryLabel: 'Tax friction',
    headlineValue: '20% STCG annual drag',
    body: 'An active trader realizing gains every month pays 20% STCG immediately, losing the exponential yield curve compared to deferred 12.5% LTCG after the 1-year threshold.',
    source: 'TODO',
    sourceUrl: undefined,
    asOf: '2026-09-24',
    staleAfterDays: 365,
    courseSlug: 'mutual-funds-etfs-complete-guide',
    order: 3,
    draft: true,
    editorialNote: 'TODO: the 20% / 12.5% rates need the Finance Act / Budget that set them and the effective date as asOf (rates change most Budgets); set staleAfterDays to the next Budget, then publish.',
  },
  {
    id: 'iv-trap',
    title: 'The implied volatility trap',
    categoryLabel: 'Derivatives mechanics',
    headlineValue: 'Vega decay > spot delta',
    body: 'Buying options right before Union Budget or corporate earnings often leads to a large loss within minutes of market open due to rapid vega collapse (IV crush).',
    source: 'TODO',
    sourceUrl: undefined,
    asOf: '2026-09-24',
    staleAfterDays: 365,
    courseSlug: 'options-trading-from-zero',
    order: 4,
    draft: true,
    editorialNote: 'TODO: the original card said "40%+ loss"; that number has no source. Either cite a study of India VIX / Nifty option premium behaviour around Budget or results days, or keep the body qualitative. Publish only with a source and asOf.',
  },
]

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xmblxfh8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

// Resolve course slugs → _ids (published ids only).
const slugs = Array.from(new Set([...TERMS.map((t) => t.courseSlug), ...CARDS.map((c) => c.courseSlug)]))
const courses = await sanity.fetch(`*[_type == "course" && !(_id in path("drafts.**")) && slug.current in $slugs]{ _id, "slug": slug.current, title }`, { slugs })
const courseId = Object.fromEntries(courses.map((c) => [c.slug, c._id]))
const missing = slugs.filter((s) => !courseId[s])
if (missing.length) {
  console.error(`ERROR: courses not found in Sanity: ${missing.join(', ')}`)
  process.exit(1)
}

const existing = new Set(
  (await sanity.fetch(`*[_type in ["glossaryTerm", "marketFactCard"]]._id`)).map((id) => id)
)

const tx = sanity.transaction()
let creates = 0
let skips = 0

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — seed glossary terms and market fact cards\n`)
console.log('Glossary terms:')
for (const t of TERMS) {
  const _id = `glossaryTerm-${t.id}`
  const doc = {
    _id,
    _type: 'glossaryTerm',
    term: t.term,
    category: t.category,
    shortDefinition: t.shortDefinition,
    definition: t.definition,
    formula: t.formula,
    retailTrap: t.retailTrap,
    taughtInCourse: { _type: 'reference', _ref: courseId[t.courseSlug] },
    order: t.order,
  }
  if (existing.has(_id)) {
    skips++
    console.log(`  skip     ${_id.padEnd(36)} already exists`)
  } else {
    tx.createIfNotExists(doc)
    creates++
    console.log(`  publish  ${_id.padEnd(36)} ${t.category.padEnd(12)} "${t.term}" → ${t.courseSlug}`)
  }
}

console.log('\nMarket fact cards:')
for (const c of CARDS) {
  const baseId = `marketFactCard-${c.id}`
  const _id = c.draft ? `drafts.${baseId}` : baseId
  const doc = {
    _id,
    _type: 'marketFactCard',
    title: c.title,
    categoryLabel: c.categoryLabel,
    headlineValue: c.headlineValue,
    body: c.body,
    source: c.source,
    sourceUrl: c.sourceUrl,
    asOf: c.asOf,
    staleAfterDays: c.staleAfterDays,
    referenceCourse: { _type: 'reference', _ref: courseId[c.courseSlug] },
    order: c.order,
    editorialNote: c.editorialNote,
  }
  if (existing.has(_id) || existing.has(baseId)) {
    skips++
    console.log(`  skip     ${_id.padEnd(40)} already exists`)
  } else {
    tx.createIfNotExists(doc)
    creates++
    console.log(`  ${c.draft ? 'DRAFT  ' : 'publish'}  ${_id.padEnd(40)} "${c.title}" · source: ${c.source} · as of ${c.asOf}${c.draft ? `\n           note: ${c.editorialNote}` : ''}`)
  }
}

console.log(`\nNot seeded (live-computed in lib/home/marketFacts.ts): Rule of 72 (niftyLongTermCagr → doublingYears), ROCE vs hurdle rate (hurdleRateAssumption).`)
console.log(`\nPlan: ${creates} create (${CARDS.filter((c) => c.draft).length} as drafts), ${skips} skip.`)
if (!APPLY) {
  console.log('Dry run only. Re-run with --apply to write.')
  process.exit(0)
}
if (creates === 0) {
  console.log('Nothing to write.')
  process.exit(0)
}
await tx.commit()
console.log('Done.')
