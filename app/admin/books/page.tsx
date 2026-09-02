'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type BookStatus = 'not_started' | 'in_progress' | 'draft_complete' | 'published'
type LessonStatus = 'not_started' | 'outline_done' | 'draft_done' | 'edited' | 'final'

interface Lesson {
  id: string
  lesson_number: number
  title: string
  description: string
  key_concepts: string[]
  indian_examples: string[]
  status: LessonStatus
  word_count: number
  chapter_id: string
  book_id: string
  notes: string
}

interface Chapter {
  id: string
  chapter_number: number
  title: string
  description: string
  status: string
  target_word_count: number
  current_word_count: number
  book_id: string
  lessons?: Lesson[]
}

interface Book {
  id: string
  slug: string
  title: string
  subtitle: string
  target_audience: string
  priority_rank: number
  status: BookStatus
  target_word_count: number
  current_word_count: number
  target_publish_date: string
  lead_magnet_tier: string
}

interface ProgressRow {
  id: string
  slug: string
  title: string
  priority_rank: number
  status: BookStatus
  target_word_count: number
  written_words: number
  total_lessons: number
  done_lessons: number
  completion_pct: number
  target_publish_date: string
  lead_magnet_tier: string
}

// ── Lesson Detail Panel ───────────────────────────────────────────────────────

function LessonPanel({
  lesson,
  bookId,
  onClose,
  onUpdated,
}: {
  lesson: Lesson
  bookId: string
  onClose: () => void
  onUpdated: () => void
}) {
  const supabase = createClient()
  const [status, setStatus] = useState<LessonStatus>(lesson.status)
  const [wordCount, setWordCount] = useState(lesson.word_count)
  const [notes, setNotes] = useState(lesson.notes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const LESSON_STATUS_CYCLE: LessonStatus[] = [
    'not_started', 'outline_done', 'draft_done', 'edited', 'final',
  ]

  const statusColors: Record<LessonStatus, { bg: string; text: string; border: string }> = {
    not_started: { bg: '#F7F4EC', text: '#6E6A5F', border: '#DFD9C8' },
    outline_done: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    draft_done: { bg: '#F6F3EA', text: '#6E5620', border: '#A9822F' },
    edited: { bg: '#EDEFEE', text: '#1B3A2B', border: '#98A6A0' },
    final: { bg: '#1B3A2B', text: 'white', border: '#1B3A2B' },
  }

  const handleSave = async () => {
    setSaving(true)
    const prevStatus = lesson.status
    const wordsAdded = wordCount - lesson.word_count

    await supabase
      .from('book_lessons')
      .update({ status, word_count: wordCount, notes })
      .eq('id', lesson.id)

    if (wordsAdded !== 0 || status !== prevStatus) {
      await supabase.from('book_progress_log').insert({
        book_id: bookId,
        lesson_id: lesson.id,
        log_date: new Date().toISOString().split('T')[0],
        words_added: wordsAdded > 0 ? wordsAdded : 0,
        status_change_from: status !== prevStatus ? prevStatus : null,
        status_change_to: status !== prevStatus ? status : null,
        notes: notes || null,
      })
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onUpdated()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 560, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: '#1B3A2B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Lesson</div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A18', lineHeight: 1.3 }}>{lesson.title}</h2>
            {lesson.description && (
              <p style={{ fontSize: 12, color: '#6E6A5F', marginTop: 6, lineHeight: 1.5 }}>{lesson.description}</p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6E6A5F', flexShrink: 0, marginLeft: 12 }}>×</button>
        </div>

        {/* Status selector */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#6E6A5F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Status</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {LESSON_STATUS_CYCLE.map(s => {
              const sc = statusColors[s]
              const isActive = status === s
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    fontSize: 11, padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                    fontWeight: isActive ? 600 : 400,
                    background: isActive ? sc.bg : 'white',
                    color: isActive ? sc.text : '#6E6A5F',
                    border: `1px solid ${isActive ? sc.border : '#DFD9C8'}`,
                  }}
                >
                  {s.replace('_', ' ')}
                </button>
              )
            })}
          </div>
        </div>

        {/* Word count */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#6E6A5F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Words written</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="number"
              min={0}
              value={wordCount}
              onChange={e => setWordCount(parseInt(e.target.value) || 0)}
              style={{ width: 120, border: '1px solid #DFD9C8', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1A1A18', outline: 'none' }}
            />
            <span style={{ fontSize: 12, color: '#6E6A5F' }}>
              {wordCount > 0 && lesson.word_count > 0 && wordCount !== lesson.word_count
                ? `${wordCount > lesson.word_count ? '+' : ''}${wordCount - lesson.word_count} from last save`
                : 'words'}
            </span>
          </div>
        </div>

        {/* Key concepts */}
        {lesson.key_concepts?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#6E6A5F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Key concepts</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {lesson.key_concepts.map((k, i) => (
                <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: '#EDEFEE', color: '#1B3A2B', borderRadius: 6 }}>{k}</span>
              ))}
            </div>
          </div>
        )}

        {/* Indian examples */}
        {lesson.indian_examples?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#6E6A5F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Indian examples</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {lesson.indian_examples.map((e, i) => (
                <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: '#F6F3EA', color: '#6E5620', borderRadius: 6 }}>{e}</span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#6E6A5F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Notes</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Research links, draft ideas, reminders..."
            rows={3}
            style={{ width: '100%', border: '1px solid #DFD9C8', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1A1A18', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ background: 'white', border: '1px solid #DFD9C8', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: '#6E6A5F' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: saved ? '#173224' : '#1B3A2B', color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minWidth: 100 }}
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add Book Modal ────────────────────────────────────────────────────────────

interface NewChapter {
  chapter_number: number
  title: string
  description: string
  lessons: { lesson_number: number; title: string; description: string }[]
}

interface NewBook {
  slug: string
  title: string
  subtitle: string
  target_audience: string
  priority_rank: number
  target_word_count: number
  target_publish_date: string
  lead_magnet_tier: string
  chapters: NewChapter[]
}

const emptyBook = (): NewBook => ({
  slug: '',
  title: '',
  subtitle: '',
  target_audience: '',
  priority_rank: 13,
  target_word_count: 60000,
  target_publish_date: '',
  lead_magnet_tier: 'Pro',
  chapters: [{ chapter_number: 1, title: '', description: '', lessons: [{ lesson_number: 1, title: '', description: '' }] }],
})

function AddBookModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [book, setBook] = useState<NewBook>(emptyBook())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const updateBook = (field: keyof NewBook, value: unknown) => setBook(prev => ({ ...prev, [field]: value }))
  const updateChapter = (ci: number, field: keyof NewChapter, value: unknown) =>
    setBook(prev => { const c = [...prev.chapters]; c[ci] = { ...c[ci], [field]: value }; return { ...prev, chapters: c } })
  const updateLesson = (ci: number, li: number, field: string, value: string) =>
    setBook(prev => { const c = [...prev.chapters]; const l = [...c[ci].lessons]; l[li] = { ...l[li], [field]: value }; c[ci] = { ...c[ci], lessons: l }; return { ...prev, chapters: c } })
  const addChapter = () => setBook(prev => ({ ...prev, chapters: [...prev.chapters, { chapter_number: prev.chapters.length + 1, title: '', description: '', lessons: [{ lesson_number: 1, title: '', description: '' }] }] }))
  const addLesson = (ci: number) => setBook(prev => { const c = [...prev.chapters]; c[ci] = { ...c[ci], lessons: [...c[ci].lessons, { lesson_number: c[ci].lessons.length + 1, title: '', description: '' }] }; return { ...prev, chapters: c } })
  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSave = async () => {
    if (!book.title || !book.slug) { setError('Title and slug are required.'); return }
    setSaving(true); setError('')
    const { data: bookRow, error: bookErr } = await supabase.from('books').insert({ slug: book.slug, title: book.title, subtitle: book.subtitle, target_audience: book.target_audience, priority_rank: book.priority_rank, status: 'not_started', target_word_count: book.target_word_count, target_publish_date: book.target_publish_date, lead_magnet_tier: book.lead_magnet_tier }).select().single()
    if (bookErr || !bookRow) { setError(bookErr?.message || 'Failed to insert book.'); setSaving(false); return }
    for (const ch of book.chapters) {
      const { data: chRow, error: chErr } = await supabase.from('book_chapters').insert({ book_id: bookRow.id, chapter_number: ch.chapter_number, title: ch.title, description: ch.description, status: 'not_started', target_word_count: ch.lessons.length * 1800, current_word_count: 0 }).select().single()
      if (chErr || !chRow) { setError(chErr?.message || 'Failed to insert chapter.'); setSaving(false); return }
      const lessonRows = ch.lessons.filter(l => l.title.trim()).map(l => ({ chapter_id: chRow.id, book_id: bookRow.id, lesson_number: l.lesson_number, title: l.title, description: l.description, key_concepts: [], indian_examples: [], status: 'not_started' as LessonStatus, word_count: 0 }))
      if (lessonRows.length > 0) { const { error: lErr } = await supabase.from('book_lessons').insert(lessonRows); if (lErr) { setError(lErr.message); setSaving(false); return } }
    }
    setSaving(false); onSaved(); onClose()
  }

  const iStyle: React.CSSProperties = { width: '100%', border: '1px solid #DFD9C8', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#1A1A18', outline: 'none', background: 'white' }
  const lStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: '#6E6A5F', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, overflowY: 'auto', padding: '40px 16px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 12, maxWidth: 720, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A18' }}>Add new book</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}>×</button>
        </div>
        {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', color: '#B91C1C', fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={lStyle}>Title *</label><input style={iStyle} value={book.title} onChange={e => { updateBook('title', e.target.value); if (!book.slug) updateBook('slug', autoSlug(e.target.value)) }} placeholder="The New Indian Investor" /></div>
          <div><label style={lStyle}>Slug *</label><input style={iStyle} value={book.slug} onChange={e => updateBook('slug', autoSlug(e.target.value))} /></div>
          <div><label style={lStyle}>Priority rank</label><input style={iStyle} type="number" min={1} value={book.priority_rank} onChange={e => updateBook('priority_rank', parseInt(e.target.value))} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={lStyle}>Subtitle</label><input style={iStyle} value={book.subtitle} onChange={e => updateBook('subtitle', e.target.value)} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={lStyle}>Target audience</label><input style={iStyle} value={book.target_audience} onChange={e => updateBook('target_audience', e.target.value)} /></div>
          <div><label style={lStyle}>Target word count</label><input style={iStyle} type="number" value={book.target_word_count} onChange={e => updateBook('target_word_count', parseInt(e.target.value))} /></div>
          <div><label style={lStyle}>Target publish date</label><input style={iStyle} value={book.target_publish_date} onChange={e => updateBook('target_publish_date', e.target.value)} placeholder="2027-Q2" /></div>
          <div><label style={lStyle}>Lead magnet tier</label><select style={iStyle} value={book.lead_magnet_tier} onChange={e => updateBook('lead_magnet_tier', e.target.value)}><option>Starter</option><option>Pro</option><option>Elite</option></select></div>
        </div>
        <div style={{ borderTop: '1px solid #DFD9C8', paddingTop: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18' }}>Chapters & lessons</h3>
            <button onClick={addChapter} style={{ background: 'white', border: '1px solid #DFD9C8', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', color: '#6E6A5F' }}>+ Add chapter</button>
          </div>
          {book.chapters.map((ch, ci) => (
            <div key={ci} style={{ background: '#F7F4EC', borderRadius: 8, padding: '14px 16px', marginBottom: 12, border: '1px solid #DFD9C8' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 10, marginBottom: 10 }}>
                <div style={{ background: '#1B3A2B', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{ch.chapter_number}</div>
                <input style={iStyle} value={ch.title} onChange={e => updateChapter(ci, 'title', e.target.value)} placeholder="Chapter title" />
              </div>
              <input style={{ ...iStyle, marginBottom: 10 }} value={ch.description} onChange={e => updateChapter(ci, 'description', e.target.value)} placeholder="Chapter description (optional)" />
              {ch.lessons.map((l, li) => (
                <div key={li} style={{ display: 'flex', gap: 8, marginBottom: 8, paddingLeft: 42 }}>
                  <span style={{ fontSize: 11, color: '#1B3A2B', minWidth: 18, paddingTop: 9 }}>{l.lesson_number}.</span>
                  <input style={{ ...iStyle, flex: 1 }} value={l.title} onChange={e => updateLesson(ci, li, 'title', e.target.value)} placeholder="Lesson title" />
                </div>
              ))}
              <div style={{ paddingLeft: 42 }}><button onClick={() => addLesson(ci)} style={{ background: 'white', border: '1px solid #DFD9C8', borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', color: '#6E6A5F' }}>+ Add lesson</button></div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ background: 'white', border: '1px solid #DFD9C8', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', color: '#6E6A5F' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ background: saving ? 'rgba(27,58,43,0.6)' : '#1B3A2B', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save book to Supabase'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<BookStatus, string> = { not_started: 'Not started', in_progress: 'In progress', draft_complete: 'Draft done', published: 'Published' }
const STATUS_COLORS: Record<BookStatus, { bg: string; text: string }> = { not_started: { bg: '#F7F4EC', text: '#6E6A5F' }, in_progress: { bg: '#FEF3C7', text: '#92400E' }, draft_complete: { bg: '#F6F3EA', text: '#6E5620' }, published: { bg: '#EDEFEE', text: '#1B3A2B' } }

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BooksAdminPage() {
  const supabase = createClient()
  const [progress, setProgress] = useState<ProgressRow[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedChapters, setExpandedChapters] = useState<Chapter[]>([])
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'tracker' | 'priority'>('tracker')
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<{ lesson: Lesson; bookId: string } | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('book_progress').select('*').order('priority_rank')
    setProgress(data || [])
    const { data: booksData } = await supabase.from('books').select('*').order('priority_rank')
    setBooks(booksData || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const expandBook = async (bookId: string) => {
    if (expandedId === bookId) { setExpandedId(null); return }
    setExpandedId(bookId)
    setLoadingChapters(true)
    const { data: chapters } = await supabase.from('book_chapters').select('*, lessons:book_lessons(*)').eq('book_id', bookId).order('chapter_number')
    setExpandedChapters((chapters as Chapter[]) || [])
    setLoadingChapters(false)
  }

  const refreshChapters = async (bookId: string) => {
    const { data: chapters } = await supabase.from('book_chapters').select('*, lessons:book_lessons(*)').eq('book_id', bookId).order('chapter_number')
    setExpandedChapters((chapters as Chapter[]) || [])
    load()
  }

  const lessonStatusStyle = (s: LessonStatus): React.CSSProperties => ({
    fontSize: 10, padding: '3px 8px', borderRadius: 8, fontWeight: 500, cursor: 'pointer', display: 'inline-block',
    ...(s === 'final' ? { background: '#1B3A2B', color: 'white' }
      : s === 'edited' ? { background: '#EDEFEE', color: '#1B3A2B', border: '1px solid #98A6A0' }
      : s === 'draft_done' ? { background: '#F6F3EA', color: '#6E5620', border: '1px solid #A9822F' }
      : s === 'outline_done' ? { background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }
      : { background: 'white', color: '#6E6A5F', border: '1px solid #DFD9C8' }),
  })

  const filtered = filter === 'all' ? progress : progress.filter(b => b.status === filter)
  const totalLessons = progress.reduce((a, b) => a + b.total_lessons, 0)
  const doneLessons = progress.reduce((a, b) => a + b.done_lessons, 0)
  const totalWords = progress.reduce((a, b) => a + (b.written_words || 0), 0)
  const totalTargetWords = books.reduce((a, b) => a + (b.target_word_count || 0), 0)

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-inter)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1A1A18', marginBottom: 4 }}>Book publishing pipeline</h1>
          <p style={{ fontSize: 13, color: '#6E6A5F' }}>Track writing progress across all Capital Gains books</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{ background: '#1B3A2B', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          + Add book
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total books', value: progress.length, sub: 'In pipeline' },
          { label: 'Total lessons', value: totalLessons, sub: 'Individual sections' },
          { label: 'Lessons done', value: `${totalLessons ? Math.round(doneLessons / totalLessons * 100) : 0}%`, sub: `${doneLessons} of ${totalLessons} final` },
          { label: 'Words written', value: totalWords > 0 ? `${(totalWords / 1000).toFixed(1)}k` : '0', sub: `of ${(totalTargetWords / 100000).toFixed(1)}L target` },
        ].map(m => (
          <div key={m.label} style={{ background: '#EDEFEE', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#1B3A2B', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#1A1A18' }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#6E6A5F', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {(['tracker', 'priority'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: '1px solid', borderColor: activeTab === t ? '#1B3A2B' : '#DFD9C8', background: activeTab === t ? '#EDEFEE' : 'white', color: activeTab === t ? '#1B3A2B' : '#6E6A5F', fontWeight: activeTab === t ? 600 : 400 }}>
            {t === 'tracker' ? 'Book tracker' : 'Priority matrix'}
          </button>
        ))}
      </div>

      {/* Tracker tab */}
      {activeTab === 'tracker' && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {['all', 'not_started', 'in_progress', 'draft_complete', 'published'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', border: '1px solid', fontWeight: filter === f ? 600 : 400, borderColor: filter === f ? '#1B3A2B' : '#DFD9C8', background: filter === f ? '#1B3A2B' : 'white', color: filter === f ? 'white' : '#6E6A5F' }}>
                {f === 'all' ? 'All' : STATUS_LABELS[f as BookStatus]}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: '#6E6A5F', fontSize: 13 }}>Loading...</p>
          ) : (
            filtered.map(row => {
              const isExpanded = expandedId === row.id
              const pct = row.completion_pct || 0
              const sc = STATUS_COLORS[row.status]
              return (
                <div key={row.id} style={{ background: 'white', border: `1px solid ${isExpanded ? '#98A6A0' : '#DFD9C8'}`, borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }} onClick={() => expandBook(row.id)}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1B3A2B', color: 'white', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{row.priority_rank}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.title}</div>
                      <div style={{ fontSize: 11, color: '#6E6A5F', marginTop: 2 }}>
                        {row.total_lessons} lessons · {(row.target_word_count / 1000).toFixed(0)}k words
                        {row.written_words > 0 && <span style={{ color: '#1B3A2B', marginLeft: 6 }}> · {row.written_words.toLocaleString()} written</span>}
                      </div>
                    </div>
                    <div style={{ width: 140, flexShrink: 0 }}>
                      <div style={{ height: 5, background: '#DFD9C8', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#1B3A2B', borderRadius: 3, width: `${pct}%` }} />
                      </div>
                      <div style={{ fontSize: 10, color: '#6E6A5F', marginTop: 3, textAlign: 'right' }}>{row.done_lessons}/{row.total_lessons} done</div>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, fontWeight: 500, background: sc.bg, color: sc.text, flexShrink: 0 }}>{STATUS_LABELS[row.status]}</span>
                    <span style={{ color: '#6E6A5F', fontSize: 12, flexShrink: 0 }}>{isExpanded ? '▲' : '▶'}</span>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #DFD9C8', padding: '14px 16px' }}>
                      {loadingChapters ? (
                        <p style={{ fontSize: 12, color: '#6E6A5F' }}>Loading chapters...</p>
                      ) : (
                        expandedChapters.map(ch => (
                          <div key={ch.id} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A18', marginBottom: 6 }}>
                              Ch {ch.chapter_number}: {ch.title}
                              <span style={{ fontSize: 10, color: '#6E6A5F', fontWeight: 400, marginLeft: 8 }}>
                                ({(ch.lessons || []).filter(l => l.status === 'final').length}/{(ch.lessons || []).length})
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {(ch.lessons || []).map(l => (
                                <span
                                  key={l.id}
                                  style={lessonStatusStyle(l.status)}
                                  title={`Click to open: ${l.title}`}
                                  onClick={() => setSelectedLesson({ lesson: l, bookId: row.id })}
                                >
                                  {l.title.length > 30 ? l.title.slice(0, 28) + '…' : l.title}
                                  {l.word_count > 0 && <span style={{ marginLeft: 4, opacity: 0.7 }}>· {l.word_count}w</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </>
      )}

      {/* Priority matrix tab */}
      {activeTab === 'priority' && (
        <div style={{ background: 'white', border: '1px solid #DFD9C8', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#F7F4EC' }}>
                {['#', 'Book', 'Target words', 'Written', 'Progress', 'Publish', 'Tier', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6E6A5F', fontWeight: 500, borderBottom: '1px solid #DFD9C8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {progress.map((row, i) => {
                const sc = STATUS_COLORS[row.status]
                const pct = row.completion_pct || 0
                return (
                  <tr key={row.id} style={{ borderBottom: i < progress.length - 1 ? '1px solid #DFD9C8' : 'none' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1B3A2B' }}>{row.priority_rank}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 500, color: '#1A1A18', maxWidth: 200 }}>{row.title}</td>
                    <td style={{ padding: '10px 14px', color: '#6E6A5F' }}>{((row.target_word_count || 0) / 1000).toFixed(0)}k</td>
                    <td style={{ padding: '10px 14px', color: '#6E6A5F' }}>{row.written_words > 0 ? `${row.written_words.toLocaleString()}` : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ width: 80, height: 4, background: '#DFD9C8', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#1B3A2B', width: `${pct}%` }} />
                      </div>
                      <div style={{ fontSize: 10, color: '#6E6A5F', marginTop: 2 }}>{pct}%</div>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#6E6A5F' }}>{row.target_publish_date || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#6E6A5F' }}>{row.lead_magnet_tier || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: sc.bg, color: sc.text, fontWeight: 500 }}>{STATUS_LABELS[row.status]}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && <AddBookModal onClose={() => setShowAddModal(false)} onSaved={() => load()} />}

      {selectedLesson && (
        <LessonPanel
          lesson={selectedLesson.lesson}
          bookId={selectedLesson.bookId}
          onClose={() => setSelectedLesson(null)}
          onUpdated={() => refreshChapters(selectedLesson.bookId)}
        />
      )}
    </div>
  )
}
