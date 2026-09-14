'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────────

type ContentStatus =
  | 'not_started'
  | 'chapters_planned'
  | 'drafting'
  | 'ready_for_injection'
  | 'injected'
  | 'published'

interface Course {
  slug: string
  title: string
  track: string
  tier: string
  format: string
  exam: string | null
  persona_tags: string[]
  status: string
  content_status: ContentStatus
  chapter_count: number | null
  chapters_completed: number | null
  last_worked_on: string | null
  created_at: string
}

type SortKey = 'title' | 'slug' | 'track' | 'tier' | 'format' | 'content_status' | 'chapters_completed' | 'last_worked_on'

// ── Constants ──────────────────────────────────────────────────────────────────

const VALID_TRACKS = [
  'retail', 'career', 'quant', 'corporate', 'cross_track',
  'alternative_investing', 'tax_wealth_planning', 'forensic_accounting_compliance', 'fintech_careers',
]

const CONTENT_STATUSES: ContentStatus[] = [
  'not_started', 'chapters_planned', 'drafting', 'ready_for_injection', 'injected', 'published',
]

const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  not_started: 'Not Started',
  chapters_planned: 'Chapters Planned',
  drafting: 'Drafting',
  ready_for_injection: 'Ready for Injection',
  injected: 'Injected',
  published: 'Published',
}

const CONTENT_STATUS_COLORS: Record<ContentStatus, { bg: string; text: string; bar: string }> = {
  not_started:         { bg: '#F7F4EC', text: '#6E6A5F', bar: '#DFD9C8' },
  chapters_planned:    { bg: '#EDEFEE', text: '#1B3A2B', bar: '#98A6A0' },
  drafting:            { bg: '#F6F3EA', text: '#6E5620', bar: '#A9822F' },
  ready_for_injection: { bg: '#F6F3EA', text: '#6E5620', bar: '#8A6825' },
  injected:            { bg: '#EDEFEE', text: '#173224', bar: '#1B3A2B' },
  published:           { bg: '#EDEFEE', text: '#1A1A18', bar: '#1A1A18' },
}

const PAGE_SIZE = 50

// ── Helpers ────────────────────────────────────────────────────────────────────

function titleCase(s: string): string {
  return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
  const diffMonth = Math.floor(diffDay / 30)
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`
  const diffYear = Math.floor(diffMonth / 12)
  return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`
}

function compareCourses(a: Course, b: Course, key: SortKey, dir: 'asc' | 'desc'): number {
  let result: number
  if (key === 'last_worked_on') {
    const av = a.last_worked_on ? new Date(a.last_worked_on).getTime() : 0
    const bv = b.last_worked_on ? new Date(b.last_worked_on).getTime() : 0
    result = av - bv
  } else if (key === 'chapters_completed') {
    result = (a.chapters_completed ?? -1) - (b.chapters_completed ?? -1)
  } else {
    result = String(a[key]).localeCompare(String(b[key]))
  }
  return dir === 'asc' ? result : -result
}

// ── Shared inline styles ──────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  border: '1px solid #DFD9C8', borderRadius: 8, padding: '7px 10px', fontSize: 12,
  color: '#6E6A5F', background: 'white', outline: 'none',
}

const numberInputStyle: React.CSSProperties = {
  width: 44, border: '1px solid #DFD9C8', borderRadius: 6, padding: '4px 6px',
  fontSize: 12, color: '#1A1A18', outline: 'none', textAlign: 'center',
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const supabase = createClient()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [trackFilter, setTrackFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  const [savingSlug, setSavingSlug] = useState<string | null>(null)
  const [errorSlug, setErrorSlug] = useState<string | null>(null)

  const originalValueRef = useRef<Record<string, number | null>>({})

  // Supabase/PostgREST caps any single request at 1000 rows by default
  // (the `db-max-rows` server setting), regardless of how many rows actually
  // match the query — a plain `.select('*')` silently truncates past that,
  // it does NOT error, so this is easy to miss until the row count grows
  // past 1000. With 1302+ courses, a single unpaginated request here WILL
  // silently drop the tail of the table. Fetch in `.range()` pages and
  // concatenate until a page comes back short of PAGE_FETCH_SIZE (the real
  // signal there's no more data — relying on a fixed "total" count instead
  // would need a second request and can race with concurrent writes).
  // See CLAUDE.md's "Known regression risk" note before changing this.
  const PAGE_FETCH_SIZE = 1000
  const MAX_PAGES = 50 // 50,000-row safety cap against a runaway loop, not a real limit at current scale

  const load = async () => {
    setLoading(true)
    setError(null)
    const allRows: Course[] = []
    for (let i = 0; i < MAX_PAGES; i++) {
      const from = i * PAGE_FETCH_SIZE
      const to = from + PAGE_FETCH_SIZE - 1
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('title')
        .order('slug') // tiebreaker for a stable sort across page boundaries — title alone isn't guaranteed unique
        .range(from, to)
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      allRows.push(...((data as Course[]) || []))
      if (!data || data.length < PAGE_FETCH_SIZE) break
    }
    setCourses(allRows)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => { setPage(1) }, [trackFilter, tierFilter, statusFilter, formatFilter, search, sortKey, sortDir])

  // ── Derived data ───────────────────────────────────────────────────────────

  const totalCourses = courses.length

  const statusCounts = useMemo(() => {
    const counts: Record<ContentStatus, number> = {
      not_started: 0, chapters_planned: 0, drafting: 0, ready_for_injection: 0, injected: 0, published: 0,
    }
    for (const c of courses) counts[c.content_status] = (counts[c.content_status] ?? 0) + 1
    return counts
  }, [courses])

  const trackStats = useMemo(() => {
    return VALID_TRACKS.map(track => {
      const inTrack = courses.filter(c => c.track === track)
      const total = inTrack.length
      const published = inTrack.filter(c => c.content_status === 'published').length
      const pct = total > 0 ? Math.round((published / total) * 100) : 0
      return { track, total, published, pct }
    })
  }, [courses])

  // Filter dropdown options are derived from whatever's actually in the
  // data, not a hardcoded enum — a new track/tier/format/status value shows
  // up here automatically the moment a course using it exists, no code
  // change needed. (Deliberately separate from CONTENT_STATUSES, which
  // stays a fixed list — it still drives the per-row status editor and the
  // legend/color maps, where every known status must always be selectable
  // even if zero courses currently have it.)
  const distinctTracks = useMemo(() => [...new Set(courses.map(c => c.track))].sort(), [courses])
  const distinctTiers = useMemo(() => [...new Set(courses.map(c => c.tier))].sort(), [courses])
  const distinctFormats = useMemo(() => [...new Set(courses.map(c => c.format))].sort(), [courses])
  const distinctStatuses = useMemo(() => [...new Set(courses.map(c => c.content_status))].sort(), [courses])

  const filteredSorted = useMemo(() => {
    let list = courses
    if (trackFilter !== 'all') list = list.filter(c => c.track === trackFilter)
    if (tierFilter !== 'all') list = list.filter(c => c.tier === tierFilter)
    if (statusFilter !== 'all') list = list.filter(c => c.content_status === statusFilter)
    if (formatFilter !== 'all') list = list.filter(c => c.format === formatFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => compareCourses(a, b, sortKey, sortDir))
  }, [courses, trackFilter, tierFilter, statusFilter, formatFilter, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE))
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredSorted.slice(start, start + PAGE_SIZE)
  }, [filteredSorted, page])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const flashError = (slug: string) => {
    setErrorSlug(slug)
    setTimeout(() => setErrorSlug(prev => (prev === slug ? null : prev)), 3000)
  }

  const handleStatusChange = async (slug: string, newStatus: ContentStatus) => {
    const prevCourses = courses
    const now = new Date().toISOString()
    setCourses(cs => cs.map(c => (c.slug === slug ? { ...c, content_status: newStatus, last_worked_on: now } : c)))
    setSavingSlug(slug)
    const { error } = await supabase
      .from('courses')
      .update({ content_status: newStatus, last_worked_on: now })
      .eq('slug', slug)
    setSavingSlug(null)
    if (error) {
      setCourses(prevCourses)
      flashError(slug)
    }
  }

  const handleChapterFieldFocus = (slug: string, field: 'chapter_count' | 'chapters_completed', value: number | null) => {
    originalValueRef.current[`${slug}:${field}`] = value
  }

  const handleChapterFieldChange = (slug: string, field: 'chapter_count' | 'chapters_completed', raw: string) => {
    const value = raw === '' ? null : Math.max(0, parseInt(raw, 10) || 0)
    setCourses(cs => cs.map(c => (c.slug === slug ? { ...c, [field]: value } : c)))
  }

  const handleChapterFieldBlur = async (slug: string, field: 'chapter_count' | 'chapters_completed') => {
    const key = `${slug}:${field}`
    const original = originalValueRef.current[key] ?? null
    const course = courses.find(c => c.slug === slug)
    if (!course) return
    const value = course[field]
    if (value === original) return

    setSavingSlug(slug)
    const { error } = await supabase.from('courses').update({ [field]: value }).eq('slug', slug)
    setSavingSlug(null)
    if (error) {
      setCourses(cs => cs.map(c => (c.slug === slug ? { ...c, [field]: original } : c)))
      flashError(slug)
    }
  }


  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @keyframes tcg-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
        .tcg-skeleton { animation: tcg-pulse 1.4s ease-in-out infinite; background: #DFD9C8; border-radius: 8px; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A18', margin: 0, marginBottom: 6 }}>
            Course content pipeline
          </h1>
          <p style={{ fontSize: 14, color: '#6E6A5F', margin: 0 }}>
            Content production progress across all courses
          </p>
        </div>
        <Link href="/admin/tasks" style={{ fontSize: 13, color: '#1B3A2B', fontWeight: 600, textDecoration: 'none' }}>
          ← Task tracker
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
          padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p style={{ color: '#B91C1C', fontSize: 13, margin: 0 }}>Failed to load courses: {error}</p>
          <button
            onClick={load}
            style={{ background: '#B91C1C', color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[0, 1, 2, 3].map(i => <div key={i} className="tcg-skeleton" style={{ height: 76 }} />)}
          </div>
          <div className="tcg-skeleton" style={{ height: 220, marginBottom: 32 }} />
          <div className="tcg-skeleton" style={{ height: 320 }} />
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Top summary ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#fff', border: '1px solid #DFD9C8', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, color: '#6E6A5F', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Total courses
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#1A1A18' }}>{totalCourses.toLocaleString()}</div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #DFD9C8', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, color: '#6E6A5F', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Published
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#1B3A2B' }}>
                  {statusCounts.published.toLocaleString()}
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#6E6A5F', marginLeft: 6 }}>
                    ({totalCourses > 0 ? Math.round((statusCounts.published / totalCourses) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #DFD9C8', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, color: '#6E6A5F', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  In progress
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#A9822F' }}>
                  {(statusCounts.chapters_planned + statusCounts.drafting + statusCounts.ready_for_injection + statusCounts.injected).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Stacked progress bar */}
            <div style={{ height: 14, borderRadius: 7, overflow: 'hidden', display: 'flex', background: '#DFD9C8', marginBottom: 10 }}>
              {CONTENT_STATUSES.map(s => {
                const pct = totalCourses > 0 ? (statusCounts[s] / totalCourses) * 100 : 0
                if (pct === 0) return null
                return (
                  <div
                    key={s}
                    title={`${CONTENT_STATUS_LABELS[s]}: ${statusCounts[s]} (${pct.toFixed(1)}%)`}
                    style={{ width: `${pct}%`, background: CONTENT_STATUS_COLORS[s].bar, transition: 'width 0.3s' }}
                  />
                )
              })}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
              {CONTENT_STATUSES.map(s => {
                const count = statusCounts[s]
                const pct = totalCourses > 0 ? Math.round((count / totalCourses) * 100) : 0
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6E6A5F' }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: CONTENT_STATUS_COLORS[s].bar, display: 'inline-block' }} />
                    {CONTENT_STATUS_LABELS[s]}: <strong style={{ color: '#1A1A18' }}>{count}</strong> ({pct}%)
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Per-track progress ──────────────────────────────────────── */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A18', marginBottom: 14 }}>Progress by track</h2>
            <div style={{ background: '#fff', border: '1px solid #DFD9C8', borderRadius: 10, padding: '4px 20px' }}>
              {trackStats.map((t, idx) => (
                <div
                  key={t.track}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0',
                    borderBottom: idx < trackStats.length - 1 ? '1px solid #F7F4EC' : 'none',
                  }}
                >
                  <div style={{ width: 220, fontSize: 13, fontWeight: 600, color: '#1A1A18', flexShrink: 0 }}>
                    {titleCase(t.track)}
                  </div>
                  <div style={{ flex: 1, height: 7, background: '#DFD9C8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#1B3A2B', borderRadius: 4, width: `${t.pct}%`, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ width: 150, fontSize: 12, color: '#6E6A5F', textAlign: 'right', flexShrink: 0 }}>
                    {t.published}/{t.total} published <span style={{ color: '#6E6A5F' }}>({t.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* ── Filters ──────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or slug…"
              style={{ ...selectStyle, width: 240 }}
            />
            <select value={trackFilter} onChange={e => setTrackFilter(e.target.value)} style={selectStyle}>
              <option value="all">All tracks</option>
              {distinctTracks.map(t => <option key={t} value={t}>{titleCase(t)}</option>)}
            </select>
            <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} style={selectStyle}>
              <option value="all">All tiers</option>
              {distinctTiers.map(t => <option key={t} value={t}>{titleCase(t)}</option>)}
            </select>
            <select value={formatFilter} onChange={e => setFormatFilter(e.target.value)} style={selectStyle}>
              <option value="all">All formats</option>
              {distinctFormats.map(f => <option key={f} value={f}>{titleCase(f)}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="all">All statuses</option>
              {distinctStatuses.map(s => <option key={s} value={s}>{CONTENT_STATUS_LABELS[s] ?? titleCase(s)}</option>)}
            </select>
            <span style={{ fontSize: 12, color: '#6E6A5F', marginLeft: 'auto' }}>
              {filteredSorted.length.toLocaleString()} of {totalCourses.toLocaleString()} courses
            </span>
          </div>

          {/* ── Table ────────────────────────────────────────────────────── */}
          {/* Root cause of the "columns disappear on the unfiltered view" bug:
              the Slug column had no max-width, so it sized to whatever the
              longest slug on the current page happened to be — up to ~105
              chars in the real data (e.g.
              "understanding-optimization-theory-convex-optimization-and-...").
              Combined with `width: '100%'` on <table> below (forces
              shrink-to-fit instead of growing to natural content width, which
              defeats the overflow-x-auto wrapper that was already here — same
              bug pattern as the lesson reader's table block), the auto table
              layout had to squeeze every other column to compensate, crushing
              Content Status down to where its border/chevron became
              invisible and pushing Chapters/Last Worked On out of visible
              width entirely. A row-count-filtered view "fixed" it only by
              accident, by excluding whichever course happened to have the
              longest slug. Fixed at the root: Slug now wraps (like Title
              already does) instead of forcing one unbroken line — capped at
              a max-width so it wraps rather than stretching the table, with
              word-break so long hyphenated slugs break cleanly across lines
              instead of overflowing. Nothing is ever truncated or hidden;
              the full slug is always visible, just on more than one line
              when it's long. The table can also grow past its container
              (min-width, not width) so if total content width ever does
              exceed the viewport for any other reason, it scrolls via the
              existing wrapper instead of squeezing or clipping. */}
          <div style={{ background: '#fff', border: '1px solid #DFD9C8', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#F7F4EC' }}>
                    {([
                      ['title', 'Title'],
                      ['slug', 'Slug'],
                      ['track', 'Track'],
                      ['tier', 'Tier'],
                      ['format', 'Format'],
                      ['content_status', 'Content Status'],
                      ['chapters_completed', 'Chapters'],
                      ['last_worked_on', 'Last Worked On'],
                    ] as [SortKey, string][]).map(([key, label]) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        style={{
                          padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#6E6A5F', fontWeight: 500,
                          borderBottom: '1px solid #DFD9C8', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                        }}
                      >
                        {label}{sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c, idx) => {
                    const sc = CONTENT_STATUS_COLORS[c.content_status]
                    const isLast = idx === paginated.length - 1
                    const rowBorder = isLast ? 'none' : '1px solid #F7F4EC'
                    const isErrored = errorSlug === c.slug
                    return (
                      <tr key={c.slug} style={{ background: isErrored ? '#FEF2F2' : 'transparent' }}>
                        <td style={{ padding: '10px 14px', borderBottom: rowBorder, fontWeight: 500, color: '#1A1A18', maxWidth: 260 }}>
                          {c.title}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px', borderBottom: rowBorder, fontFamily: 'monospace', fontSize: 11, color: '#6E6A5F',
                            maxWidth: 260, whiteSpace: 'normal', wordBreak: 'break-word',
                          }}
                        >
                          {c.slug}
                        </td>
                        <td style={{ padding: '10px 14px', borderBottom: rowBorder, color: '#6E6A5F', whiteSpace: 'nowrap' }}>
                          {titleCase(c.track)}
                        </td>
                        <td style={{ padding: '10px 14px', borderBottom: rowBorder, color: '#6E6A5F', whiteSpace: 'nowrap' }}>
                          {titleCase(c.tier)}
                        </td>
                        <td style={{ padding: '10px 14px', borderBottom: rowBorder, color: '#6E6A5F', whiteSpace: 'nowrap' }}>
                          {titleCase(c.format)}
                        </td>
                        <td style={{ padding: '10px 14px', borderBottom: rowBorder, whiteSpace: 'nowrap' }}>
                          <select
                            value={c.content_status}
                            onChange={e => handleStatusChange(c.slug, e.target.value as ContentStatus)}
                            style={{
                              fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 8, border: `1px solid ${sc.bar}`,
                              background: sc.bg, color: sc.text, cursor: 'pointer', outline: 'none',
                              // Explicit minWidth — without it, the native <select> sizes to its
                              // own intrinsic width, which some browsers clip below what's needed
                              // to show the longest label ("Ready for Injection") in full.
                              minWidth: 172, maxWidth: '100%',
                            }}
                          >
                            {CONTENT_STATUSES.map(s => (
                              <option key={s} value={s}>{CONTENT_STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                          {savingSlug === c.slug && <span style={{ marginLeft: 6, fontSize: 10, color: '#6E6A5F' }}>saving…</span>}
                          {isErrored && <span style={{ marginLeft: 6, fontSize: 10, color: '#B91C1C' }}>save failed, reverted</span>}
                        </td>
                        <td style={{ padding: '10px 14px', borderBottom: rowBorder, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <input
                              type="number"
                              min={0}
                              value={c.chapters_completed ?? ''}
                              onFocus={() => handleChapterFieldFocus(c.slug, 'chapters_completed', c.chapters_completed)}
                              onChange={e => handleChapterFieldChange(c.slug, 'chapters_completed', e.target.value)}
                              onBlur={() => handleChapterFieldBlur(c.slug, 'chapters_completed')}
                              style={numberInputStyle}
                            />
                            <span style={{ color: '#6E6A5F' }}>/</span>
                            <input
                              type="number"
                              min={0}
                              value={c.chapter_count ?? ''}
                              onFocus={() => handleChapterFieldFocus(c.slug, 'chapter_count', c.chapter_count)}
                              onChange={e => handleChapterFieldChange(c.slug, 'chapter_count', e.target.value)}
                              onBlur={() => handleChapterFieldBlur(c.slug, 'chapter_count')}
                              style={numberInputStyle}
                            />
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', borderBottom: rowBorder, color: '#6E6A5F', whiteSpace: 'nowrap' }}>
                          {relativeTime(c.last_worked_on)}
                        </td>
                      </tr>
                    )
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '32px 14px', textAlign: 'center', color: '#6E6A5F' }}>
                        No courses match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination ───────────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 12, color: '#6E6A5F' }}>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid #DFD9C8',
                  background: 'white', color: page <= 1 ? '#DFD9C8' : '#6E6A5F', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid #DFD9C8',
                  background: 'white', color: page >= totalPages ? '#DFD9C8' : '#6E6A5F', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
