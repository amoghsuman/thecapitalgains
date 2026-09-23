// ─────────────────────────────────────────────────────────────────────────────
// refresh-market-reference.mjs — laptop-run refresh of the market_reference
// table (FII/DII provisional flows from NSE's trading-activity report, 10-year
// G-Sec yield from FBIL/CCIL).
//
// HOW TO RUN (from the project root):
//   Dry run (prints what it would write, writes nothing):
//     node scripts/refresh-market-reference.mjs
//   Real run:
//     node scripts/refresh-market-reference.mjs --apply
//   Set one row by hand (skips every fetcher; dry run unless --apply):
//     node scripts/refresh-market-reference.mjs --set gsec_10y=7.02 --as-of 2026-09-11 --source "FBIL 10-year benchmark G-Sec yield" --apply
//   Optional with --set: --source-url https://...   Keys: repo_rate, gsec_10y,
//   fii_net_cr, dii_net_cr, nifty_tri_cagr_inception.
//   Parse a CSV you downloaded from https://www.nseindia.com/reports/fii-dii
//   ("FII/FPI & DII trading activity on NSE, BSE and MSEI in Capital Market
//   Segment", the combined download button) instead of fetching it:
//     node scripts/refresh-market-reference.mjs --nse-csv D:\tcg-fiidii.csv [--apply]
//
// ENV (read from .env.local automatically; override in the shell if needed):
//   SUPABASE_URL                (falls back to NEXT_PUBLIC_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY   (required for --apply)
//
// WINDOWS TASK SCHEDULER — run at 19:00 IST on weekdays (NSE publishes
// provisional FII/DII figures after 18:30 IST). From an elevated PowerShell,
// with the machine's clock in IST:
//
//   schtasks /Create /TN "TCG Market Reference Refresh" `
//     /TR "cmd /c cd /d D:\thecapitalgains && node scripts\refresh-market-reference.mjs --apply >> logs\market-reference.log 2>&1" `
//     /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST 19:00 /F
//
//   (Create D:\thecapitalgains\logs first. Remove with:
//    schtasks /Delete /TN "TCG Market Reference Refresh" /F)
//
// WHAT IT WRITES (upsert by key, as_of = trade date, source + source_url set):
//   fii_net_cr, dii_net_cr  — NSE FII/FPI & DII provisional net figures, ₹ crore,
//                             combined NSE+BSE+MSEI capital-market segment; each
//                             session is also kept as a dated copy (key
//                             "fii_net_cr:YYYY-MM-DD") for the sentiment index
//   gsec_10y                — 10-year benchmark G-Sec yield, % p.a.
// A value that cannot be fetched or parsed is skipped, never invented. A day
// where only one of FII/DII parses is still written; the site's ticker only
// shows flows once both rows carry the same trade date.
//
// HOW THE NSE FETCH WORKS: cookies are warmed on https://www.nseindia.com with
// Chrome headers, the reports page's own script (/dist/js/sections/reports/
// fii-dii.js) is read to discover the combined-report CSV link (currently
// /api/fiidiiTradeReact?csv=true; the old /api/fiidiiTRADE is gone), and that
// CSV is fetched with the same cookies. The discovered URL is logged each run.
// NSE fronts its site with bot protection; a 401/403/404 from some networks is
// expected and is reported, not retried — use --nse-csv on those days.
// ─────────────────────────────────────────────────────────────────────────────

import { fileURLToPath } from 'url'
import path from 'path'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
try {
  process.loadEnvFile(path.join(PROJECT_ROOT, '.env.local'))
} catch (err) {
  if (err.code !== 'ENOENT') throw err
}

const APPLY = process.argv.includes('--apply')

// --flag value (or --flag=value); null when absent.
function argValue(flag) {
  const i = process.argv.indexOf(flag)
  if (i >= 0) return process.argv[i + 1] ?? null
  const inline = process.argv.find((a) => a.startsWith(`${flag}=`))
  return inline ? inline.slice(flag.length + 1) : null
}

const ALLOWED_KEYS = ['repo_rate', 'gsec_10y', 'fii_net_cr', 'dii_net_cr', 'nifty_tri_cagr_inception']

// --set key=value --as-of YYYY-MM-DD --source "text" [--source-url url]
function parseManualRow() {
  const set = argValue('--set')
  if (set === null) return null

  const eq = set.indexOf('=')
  const key = eq > 0 ? set.slice(0, eq).trim() : ''
  const rawValue = eq > 0 ? set.slice(eq + 1).trim() : ''
  const asOf = argValue('--as-of')
  const source = argValue('--source')
  const sourceUrl = argValue('--source-url')
  const problems = []

  if (!ALLOWED_KEYS.includes(key)) problems.push(`--set key must be one of ${ALLOWED_KEYS.join(', ')} (got "${key || set}")`)
  const value = Number(rawValue.replace(/,/g, ''))
  if (rawValue === '' || !Number.isFinite(value)) problems.push(`--set value must be numeric (got "${rawValue}")`)
  if (!asOf || !/^\d{4}-\d{2}-\d{2}$/.test(asOf) || Number.isNaN(Date.parse(`${asOf}T00:00:00Z`))) problems.push('--as-of YYYY-MM-DD is required')
  if (!source) problems.push('--source "text" is required')
  if (sourceUrl && !/^https?:\/\//.test(sourceUrl)) problems.push('--source-url must start with http:// or https://')

  if (problems.length) {
    console.error('ERROR: ' + problems.join('\n       '))
    process.exit(1)
  }
  return { key, value, as_of: asOf, source, source_url: sourceUrl ?? null }
}

const MANUAL_ROW = parseManualRow()
const NSE_CSV_PATH = argValue('--nse-csv')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (APPLY && (!SUPABASE_URL || !SERVICE_KEY)) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for --apply.')
  process.exit(1)
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const MONTHS = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' }

// "21-Sep-2026" → "2026-09-21"
function nseDateToIso(input) {
  const [dd, mon, yyyy] = String(input).trim().split('-')
  const mm = MONTHS[mon]
  if (!dd || !mm || !yyyy) throw new Error(`unparseable NSE date "${input}"`)
  return `${yyyy}-${mm}-${dd.padStart(2, '0')}`
}

function toNumber(v) {
  const n = Number(String(v ?? '').replace(/,/g, ''))
  if (!Number.isFinite(n)) throw new Error('non-numeric value')
  return n
}

async function withTimeout(url, init = {}, ms = 20000) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms) })
}

// ─── NSE FII/DII trading activity report ──────────────────────────────────────

const NSE_ORIGIN = 'https://www.nseindia.com'
const NSE_REPORT_PAGE = `${NSE_ORIGIN}/reports/fii-dii`
// Pinned fallback for when the page script cannot be read; the script's
// downloadCSV() is the authoritative source and is logged when discovered.
const NSE_CSV_FALLBACK = `${NSE_ORIGIN}/api/fiidiiTradeReact?csv=true`
const NSE_SOURCE = 'NSE FII/DII trading activity report'

const NSE_HEADERS = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9',
  Referer: `${NSE_ORIGIN}/`,
}

// Minimal RFC-4180 parser: quoted fields may contain commas, quotes ("") and
// newlines — NSE's header cells do.
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const src = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
    } else field += ch
  }
  row.push(field)
  if (row.some((c) => c.trim() !== '')) rows.push(row)
  return rows
}

// Header cells arrive as e.g. "NET VALUE \n(₹ Crores)"; match on the first word(s).
function findColumn(header, ...needles) {
  const norm = header.map((h) => h.replace(/\s+/g, ' ').trim().toUpperCase())
  const idx = norm.findIndex((h) => needles.every((n) => h.includes(n)))
  if (idx < 0) throw new Error(`column "${needles.join(' ')}" not found in header [${norm.join(' | ')}]`)
  return idx
}

// Strict: every number must parse, and net must equal buy − sell (₹0.05 tolerance).
function parseFiiDiiCsv(text) {
  const rows = parseCsv(text)
  if (rows.length < 2) throw new Error('CSV has no data rows')
  const header = rows[0]
  const cCat = findColumn(header, 'CATEGORY')
  const cDate = findColumn(header, 'DATE')
  const cBuy = findColumn(header, 'BUY')
  const cSell = findColumn(header, 'SELL')
  const cNet = findColumn(header, 'NET')

  const parsed = []
  for (const r of rows.slice(1)) {
    const category = (r[cCat] ?? '').trim()
    const kind = /FII|FPI/i.test(category) ? 'fii' : /DII/i.test(category) ? 'dii' : null
    if (!kind) continue
    const buy = toNumber(r[cBuy])
    const sell = toNumber(r[cSell])
    const net = toNumber(r[cNet])
    if (Math.abs(buy - sell - net) > 0.05) throw new Error(`${category}: net ${net} ≠ buy ${buy} − sell ${sell}`)
    parsed.push({ kind, category, tradeDate: nseDateToIso(r[cDate]), buy, sell, net })
  }
  if (parsed.length === 0) throw new Error('no FII/FPI or DII rows in CSV')
  return parsed
}

// Each session is written twice: the current row ("fii_net_cr") that the ticker
// reads, and a dated copy ("fii_net_cr:2026-09-22") that accumulates into the
// history the sentiment index needs (five sessions for the flows input).
function flowsToRows(parsed, sourceUrl) {
  return parsed.flatMap((p) => {
    const key = p.kind === 'fii' ? 'fii_net_cr' : 'dii_net_cr'
    const row = { value: p.net, as_of: p.tradeDate, source: NSE_SOURCE, source_url: sourceUrl }
    return [{ key, ...row }, { key: `${key}:${p.tradeDate}`, ...row }]
  })
}

async function nseSession() {
  const warm = await withTimeout(`${NSE_ORIGIN}/`, { headers: NSE_HEADERS })
  if (!warm.ok) throw new Error(`NSE warm-up HTTP ${warm.status}`)
  const cookie = (warm.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ')
  return cookie ? { ...NSE_HEADERS, Cookie: cookie } : NSE_HEADERS
}

// Read the reports page and the script it loads; return the combined-report
// CSV link the page's own download button uses.
async function discoverCsvUrl(headers) {
  const page = await withTimeout(NSE_REPORT_PAGE, { headers })
  if (!page.ok) throw new Error(`reports page HTTP ${page.status}`)
  const html = await page.text()
  const scriptSrc = html.match(/<script[^>]+src="([^"]*\/reports\/fii-dii\.js[^"]*)"/)?.[1]
  if (!scriptSrc) return { url: NSE_CSV_FALLBACK, how: 'pinned fallback: page script tag not found' }
  const js = await withTimeout(new URL(scriptSrc, NSE_ORIGIN).href, { headers: { ...headers, Referer: NSE_REPORT_PAGE, Accept: '*/*' } })
  if (!js.ok) return { url: NSE_CSV_FALLBACK, how: `pinned fallback: page script HTTP ${js.status}` }
  // function downloadCSV() { downloadFile('/api/fiidiiTradeReact?csv=true'); }
  const link = (await js.text()).match(/function\s+downloadCSV\s*\(\)\s*\{\s*downloadFile\(\s*['"]([^'"]+)['"]/)?.[1]
  return link
    ? { url: new URL(link, NSE_ORIGIN).href, how: `discovered from ${scriptSrc.split('?')[0]} downloadCSV()` }
    : { url: NSE_CSV_FALLBACK, how: 'pinned fallback: downloadCSV() not found in page script' }
}

async function fetchNseFlows() {
  const headers = await nseSession()
  const { url: csvUrl, how } = await discoverCsvUrl(headers)
  console.log(`nse csv url  ${csvUrl}  (${how})`)
  const res = await withTimeout(csvUrl, { headers: { ...headers, Referer: NSE_REPORT_PAGE, Accept: 'text/csv,*/*' } })
  if (!res.ok) throw new Error(`NSE CSV HTTP ${res.status}`)
  const parsed = parseFiiDiiCsv(await res.text())
  return { parsed, rows: flowsToRows(parsed, csvUrl) }
}

async function readLocalFlows(file) {
  const fs = await import('fs')
  const text = fs.readFileSync(file, 'utf8')
  const parsed = parseFiiDiiCsv(text)
  return { parsed, rows: flowsToRows(parsed, NSE_REPORT_PAGE) }
}

// ─── 10-year benchmark G-Sec yield ────────────────────────────────────────────
//
// FBIL publishes the benchmark through its web app rather than static HTML, so
// two public pages are tried and a strict "10 year … N.NN" match is required.
// Nothing is written if neither yields a parseable figure.

const GSEC_SOURCES = [
  { name: 'FBIL', url: 'https://www.fbil.org.in/', source: 'FBIL 10-year benchmark G-Sec yield', source_url: 'https://www.fbil.org.in' },
  { name: 'CCIL', url: 'https://www.ccilindia.com/web/ccil/home', source: 'CCIL 10-year benchmark G-Sec yield', source_url: 'https://www.ccilindia.com' },
]

async function fetchGsec10y() {
  const errors = []
  for (const s of GSEC_SOURCES) {
    try {
      const res = await withTimeout(s.url, { headers: { 'User-Agent': UA, Accept: 'text/html' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const html = (await res.text()).replace(/\s+/g, ' ')
      const m = html.match(/10[ -]?(?:year|yr|Y)\b[^0-9]{0,120}?(\d{1,2}\.\d{2,4})\s*%?/i)
      if (!m) throw new Error('no 10-year yield in page')
      const value = Number(m[1])
      if (!(value > 3 && value < 12)) throw new Error(`implausible yield ${value}`)
      return { key: 'gsec_10y', value, as_of: new Date().toISOString().slice(0, 10), source: s.source, source_url: s.source_url }
    } catch (err) {
      errors.push(`${s.name}: ${err.message}`)
    }
  }
  throw new Error(errors.join(' | '))
}

// ─── Collect ──────────────────────────────────────────────────────────────────

const rows = []
const skipped = []

const parsedFlows = []

if (MANUAL_ROW) {
  // --set: one hand-entered row, no fetching.
  rows.push(MANUAL_ROW)
} else if (NSE_CSV_PATH) {
  // --nse-csv: parse a browser-downloaded report, no network at all.
  try {
    const { parsed, rows: flowRows } = await readLocalFlows(NSE_CSV_PATH)
    parsedFlows.push(...parsed)
    rows.push(...flowRows)
  } catch (err) {
    console.error(`ERROR: could not parse ${NSE_CSV_PATH}: ${err.message}`)
    process.exit(1)
  }
} else {
  try {
    const { parsed, rows: flowRows } = await fetchNseFlows()
    parsedFlows.push(...parsed)
    rows.push(...flowRows)
  } catch (err) {
    skipped.push(`fii_net_cr, dii_net_cr — ${err.message} (NSE blocks non-browser clients on some networks; expected — use --nse-csv)`)
  }

  try {
    rows.push(await fetchGsec10y())
  } catch (err) {
    skipped.push(`gsec_10y — ${err.message}`)
  }
}

console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — market_reference ${MANUAL_ROW ? 'manual set' : NSE_CSV_PATH ? `local CSV (${NSE_CSV_PATH})` : 'refresh'}, ${new Date().toISOString()}`)
console.log('')
for (const p of parsedFlows) {
  console.log(`parsed       ${p.category.padEnd(8)} ${p.tradeDate}  buy=${p.buy}  sell=${p.sell}  net=${p.net}  (₹ crore)`)
}
if (rows.length === 0) console.log('Nothing parseable this run.')
for (const r of rows) {
  console.log(`would write  ${r.key.padEnd(24)} value=${r.value}  as_of=${r.as_of}  source="${r.source}"${r.source_url ? `  source_url=${r.source_url}` : ''}`)
}
for (const s of skipped) console.log(`skipped      ${s}`)

if (!APPLY) {
  console.log('\nDry run only. Re-run with --apply to write.')
  process.exit(0)
}
if (rows.length === 0) process.exit(0)

// ─── Write (PostgREST upsert with the service role) ───────────────────────────

const res = await withTimeout(`${SUPABASE_URL}/rest/v1/market_reference?on_conflict=key`, {
  method: 'POST',
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  },
  body: JSON.stringify(rows),
})
if (!res.ok) {
  console.error(`ERROR: upsert failed HTTP ${res.status}: ${await res.text()}`)
  process.exit(1)
}
console.log(`\nDone: ${rows.length} row(s) upserted.`)
