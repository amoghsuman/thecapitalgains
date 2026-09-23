// HOW TO RUN (from the project root):
// 1. SANITY_TOKEN is read automatically from .env.local at the project root.
//    On Windows (PowerShell), to override it for one run: $env:SANITY_TOKEN="your_token_here"
// 2. Dry run (prints the plan, writes nothing):
//      node scripts/seed-portfolios.mjs
// 3. Real run (creates the documents):
//      node scripts/seed-portfolios.mjs --apply
// 4. Overwrite documents that already exist (default is to skip them):
//      node scripts/seed-portfolios.mjs --apply --force
// 5. Read the source constant from somewhere other than lib/portfolios/portfolioData.ts
//    (the file is deleted from the repo once the documents exist; recover it with
//    `git show <commit>:lib/portfolios/portfolioData.ts > /tmp/portfolioData.ts`):
//      node scripts/seed-portfolios.mjs --source /tmp/portfolioData.ts
//
// WHAT THIS DOES:
// Creates three `portfolio` documents and two `marketDataset` documents from
// the hand-written PORTFOLIOS_DATA / ASSET_CLASS_QUILT_DATA / DISPERSION_ASSETS
// constants, all with dataStatus "illustrative". Holdings are exactly the
// listed entries (stocksCount is dropped); "ZOMATO" is written as "ETERNAL".
// Existing documents (matched by _id) are skipped unless --force is passed.
// Everything is written as one atomic transaction. No documents are deleted.
//
// Requires Node 22.6+ with TypeScript type stripping (`node --experimental-strip-types`
// on 22.x, on by default from 23.6) because the source file is TypeScript.

import { createClient } from '@sanity/client'
import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'

// ─── Env + Args ───────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
try {
  process.loadEnvFile(path.join(PROJECT_ROOT, '.env.local'))
} catch (err) {
  if (err.code !== 'ENOENT') throw err
}

const APPLY = process.argv.includes('--apply')
const FORCE = process.argv.includes('--force')
const sourceIdx = process.argv.indexOf('--source')
const SOURCE = sourceIdx >= 0 ? path.resolve(process.argv[sourceIdx + 1]) : path.join(PROJECT_ROOT, 'lib/portfolios/portfolioData.ts')

const SANITY_TOKEN = process.env.SANITY_TOKEN
if (APPLY && !SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN environment variable is not set.')
  console.error('On Windows (PowerShell): $env:SANITY_TOKEN="your_token_here"')
  process.exit(1)
}

// ─── Load source constant ─────────────────────────────────────────────────────

let source
try {
  source = await import(pathToFileURL(SOURCE).href)
} catch (err) {
  console.error(`ERROR: could not import ${SOURCE}`)
  console.error(err.message)
  console.error('If the file has been deleted, recover it from git and pass --source <path>.')
  process.exit(1)
}
const { PORTFOLIOS_DATA, ASSET_CLASS_QUILT_DATA, DISPERSION_ASSETS } = source
if (!Array.isArray(PORTFOLIOS_DATA) || !Array.isArray(ASSET_CLASS_QUILT_DATA) || !Array.isArray(DISPERSION_ASSETS)) {
  console.error('ERROR: source file does not export PORTFOLIOS_DATA, ASSET_CLASS_QUILT_DATA and DISPERSION_ASSETS.')
  process.exit(1)
}

// ─── Transform ────────────────────────────────────────────────────────────────

const SYMBOL_RENAMES = { ZOMATO: 'ETERNAL' }
const MONTH_NUM = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' }

const SLUGS = { wealth_builder: 'wealth-builder', dividend_cashflow: 'dividend-cashflow', active_momentum: 'active-momentum' }

function key(prefix, i) {
  return `${prefix}-${String(i).padStart(3, '0')}`
}

function pct(str) {
  // "18%" → 18, "+14.2%" → 14.2
  const n = Number(String(str).replace(/[%+,\s]/g, ''))
  return Number.isFinite(n) ? n : null
}

function renameSymbol(sym) {
  return SYMBOL_RENAMES[sym] ?? sym
}

function renameInText(text) {
  return Object.entries(SYMBOL_RENAMES).reduce((t, [from, to]) => t.replaceAll(from, to), text)
}

function maxDrawdownFromMonths(months) {
  // Peak-to-trough on the compounded monthly series, in %.
  let peak = 1
  let nav = 1
  let worst = 0
  const ordered = [...months].sort((a, b) => a.month.localeCompare(b.month))
  for (const m of ordered) {
    nav *= 1 + m.portfolioReturn / 100
    if (nav > peak) peak = nav
    const dd = (nav / peak - 1) * 100
    if (dd < worst) worst = dd
  }
  return Number(worst.toFixed(1))
}

function toPortfolioDoc(p, index) {
  const monthlyReturns = p.monthlyReturns.map((r, i) => ({
    _type: 'object',
    _key: key('m', i),
    month: `${r.year}-${MONTH_NUM[r.month]}`,
    portfolioReturn: r.portfolioReturn,
    benchmarkReturn: r.niftyReturn,
    topHolding: r.topHolding ? renameInText(r.topHolding) : undefined,
    memo: r.macroMemo ? renameInText(r.macroMemo) : undefined,
  }))

  const earliest = [...monthlyReturns].sort((a, b) => a.month.localeCompare(b.month))[0]

  return {
    _id: `portfolio-${SLUGS[p.id] ?? p.id}`,
    _type: 'portfolio',
    name: p.name,
    slug: { _type: 'slug', current: SLUGS[p.id] ?? p.id },
    strategy: p.desc,
    inceptionDate: earliest ? `${earliest.month}-01` : undefined,
    dataStatus: 'illustrative',
    benchmark: 'NIFTY 50',
    order: index + 1,
    profile: {
      horizon: p.horizon,
      riskLabel: p.risk,
      rebalanceCadence: p.rebalance,
      allocation: p.allocation.map((a, i) => ({ _type: 'object', _key: key('a', i), label: a.label, pct: a.pct })),
    },
    holdings: p.holdings.map((h, i) => ({
      _type: 'object',
      _key: key('h', i),
      symbol: renameSymbol(h.name),
      name: renameSymbol(h.name),
      sector: h.sector,
      weight: pct(h.weight),
      returnYtd: pct(h.returnYtd),
    })),
    monthlyReturns,
    metrics: {
      cagr: p.fiveYearCagr,
      sharpe: p.sharpeRatio,
      winRate: p.winRate,
      bestMonth: p.bestMonth.returnPct,
      worstMonth: p.worstMonth.returnPct,
      avgMonthlyReturn: p.avgMonthlyReturn,
      annualisedVol: p.annualizedVol,
      benchmarkVol: p.benchmarkVol,
      maxDrawdown: maxDrawdownFromMonths(p.monthlyReturns.map((r) => ({ month: `${r.year}-${MONTH_NUM[r.month]}`, portfolioReturn: r.portfolioReturn }))),
    },
  }
}

function quiltDoc(rows) {
  return {
    _id: 'marketDataset-asset-class-quilt',
    _type: 'marketDataset',
    name: 'Asset class quilt (annual returns)',
    slug: { _type: 'slug', current: 'asset-class-quilt' },
    dataStatus: 'illustrative',
    source: 'Constructed example',
    rows: rows.map((r, i) => ({
      _type: 'object',
      _key: key('r', i),
      label: r.name,
      sublabel: r.category,
      values: Object.entries(r.returns)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([yr, value], j) => ({ _type: 'object', _key: key(`r${i}v`, j), key: String(yr), value })),
    })),
  }
}

function dispersionDoc(assets) {
  return {
    _id: 'marketDataset-cross-asset-dispersion',
    _type: 'marketDataset',
    name: 'Cross-asset dispersion (5-year)',
    slug: { _type: 'slug', current: 'cross-asset-dispersion' },
    dataStatus: 'illustrative',
    source: 'Constructed example',
    rows: assets.map((a, i) => ({
      _type: 'object',
      _key: key('r', i),
      label: a.name,
      sublabel: `${a.ticker} · ${a.category}`,
      values: [
        ['cagr', a.fiveYearCagr],
        ['volatility', a.volatility],
        ['sharpe', a.sharpe],
        ['maxDrawdown', a.maxDrawdown],
        ['correlation', a.correlationToNifty],
      ].map(([k, value], j) => ({ _type: 'object', _key: key(`r${i}v`, j), key: k, value })),
    })),
  }
}

const docs = [
  ...PORTFOLIOS_DATA.map(toPortfolioDoc),
  quiltDoc(ASSET_CLASS_QUILT_DATA),
  dispersionDoc(DISPERSION_ASSETS),
]

// ─── Plan ─────────────────────────────────────────────────────────────────────

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — source: ${path.relative(PROJECT_ROOT, SOURCE)}`)
console.log('')
for (const d of docs) {
  if (d._type === 'portfolio') {
    const renamed = d.holdings.filter((h) => Object.values(SYMBOL_RENAMES).includes(h.symbol)).map((h) => h.symbol)
    console.log(`portfolio      ${d._id}`)
    console.log(`               "${d.name}" · ${d.dataStatus} · benchmark ${d.benchmark} · inception ${d.inceptionDate}`)
    console.log(`               ${d.holdings.length} holdings${renamed.length ? ` (renamed: ${renamed.join(', ')})` : ''} · ${d.monthlyReturns.length} months · CAGR ${d.metrics.cagr}% · Sharpe ${d.metrics.sharpe} · max drawdown ${d.metrics.maxDrawdown}%`)
  } else {
    console.log(`marketDataset  ${d._id}`)
    console.log(`               "${d.name}" · ${d.dataStatus} · ${d.rows.length} rows × ${d.rows[0]?.values.length ?? 0} values`)
  }
}
console.log('')
console.log(`Total: ${docs.length} documents (${docs.filter((d) => d._type === 'portfolio').length} portfolio, ${docs.filter((d) => d._type === 'marketDataset').length} marketDataset), all dataStatus "illustrative".`)

if (!APPLY) {
  console.log('\nDry run only. Re-run with --apply to write.')
  process.exit(0)
}

// ─── Write ────────────────────────────────────────────────────────────────────

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xmblxfh8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

const existing = await sanity.fetch('*[_id in $ids]._id', { ids: docs.map((d) => d._id) })
const tx = sanity.transaction()
let created = 0
let replaced = 0
let skipped = 0
for (const d of docs) {
  if (existing.includes(d._id)) {
    if (FORCE) {
      tx.createOrReplace(d)
      replaced++
    } else {
      skipped++
      console.log(`skip (exists)  ${d._id}  — pass --force to overwrite`)
    }
  } else {
    tx.create(d)
    created++
  }
}

if (created + replaced === 0) {
  console.log('\nNothing to write.')
  process.exit(0)
}

await tx.commit()
console.log(`\nDone: ${created} created, ${replaced} replaced, ${skipped} skipped.`)
