import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Task = {
  id: string
  task_id: string
  group_id: string
  group_name: string
  feature: string
  description: string | null
  status: string
  backend_table: string | null
  frontend_file: string | null
  notes: string | null
  priority: number
  updated_at: string
}

export default async function AdminTasksPage() {
  const supabase = await createClient()

  const tasks: Task[] = (await supabase.from('platform_tasks').select('*').order('priority')).data ?? []

  const total = tasks.length
  const implemented = tasks.filter(t => t.status === 'implemented').length
  const partial = tasks.filter(t => t.status === 'partial').length
  const missing = tasks.filter(t => t.status === 'missing').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const pctDone = total > 0 ? Math.round((implemented / total) * 100) : 0

  const groups = tasks.reduce((acc: Record<string, Task[]>, task: Task) => {
    if (!acc[task.group_name]) acc[task.group_name] = []
    acc[task.group_name].push(task)
    return acc
  }, {})

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      implemented: { bg: '#F0FDF4', color: '#166534', label: 'Implemented' },
      partial:     { bg: '#FEF3C7', color: '#92400E', label: 'Partial' },
      missing:     { bg: '#FEF2F2', color: '#991B1B', label: 'Missing' },
      in_progress: { bg: '#EEF2FF', color: '#3730A3', label: 'In Progress' },
    }
    const s = styles[status] ?? { bg: '#F3F4F6', color: '#6B7280', label: status }
    return (
      <span style={{
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 4,
        whiteSpace: 'nowrap' as const,
      }}>
        {s.label}
      </span>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', fontFamily: 'Outfit, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1C0F3F', margin: 0, marginBottom: 6 }}>
            Platform task tracker
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
            Feature implementation status across The Capital Gains
          </p>
        </div>
        <Link href="/admin/books" style={{ fontSize: 13, color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>
          ← Books pipeline
        </Link>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total features', value: total, color: '#1C0F3F' },
          { label: 'Implemented', value: `${implemented} (${pctDone}%)`, color: '#166534' },
          { label: 'Partial', value: partial, color: '#92400E' },
          { label: 'Missing / In Progress', value: missing + inProgress, color: '#991B1B' },
        ].map((card) => (
          <div key={card.label} style={{
            background: '#fff',
            border: '1px solid #F3F4F6',
            borderRadius: 10,
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {card.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#7C3AED', borderRadius: 4, width: `${pctDone}%`, transition: 'width 0.3s' }} />
        </div>
        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>
          {implemented} of {total} features fully implemented
        </p>
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([groupName, groupTasks]) => {
        const groupDone = groupTasks.filter(t => t.status === 'implemented').length
        return (
          <div key={groupName} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1C0F3F', margin: 0 }}>
                {groupName}
              </h2>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#7C3AED',
                background: '#EEF2FF',
                padding: '2px 8px',
                borderRadius: 10,
              }}>
                {groupDone}/{groupTasks.length} done
              </span>
            </div>

            <div style={{ background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['ID', 'Feature', 'Description', 'Status', 'Backend', 'Notes'].map((col) => (
                      <th key={col} style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: 11,
                        color: '#6B7280',
                        fontWeight: 500,
                        borderBottom: '1px solid #F3F4F6',
                        background: '#F9FAFB',
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupTasks.map((task, idx) => (
                    <tr key={task.task_id}>
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: idx < groupTasks.length - 1 ? '1px solid #F9FAFB' : 'none',
                        verticalAlign: 'top',
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: '#9CA3AF',
                        whiteSpace: 'nowrap',
                      }}>
                        {task.task_id}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: idx < groupTasks.length - 1 ? '1px solid #F9FAFB' : 'none',
                        verticalAlign: 'top',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#1C0F3F',
                      }}>
                        {task.feature}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: idx < groupTasks.length - 1 ? '1px solid #F9FAFB' : 'none',
                        verticalAlign: 'top',
                        fontSize: 12,
                        color: '#6B7280',
                        maxWidth: 220,
                      }}>
                        {task.description ? task.description.slice(0, 60) + (task.description.length > 60 ? '…' : '') : '—'}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: idx < groupTasks.length - 1 ? '1px solid #F9FAFB' : 'none',
                        verticalAlign: 'top',
                      }}>
                        {statusBadge(task.status)}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: idx < groupTasks.length - 1 ? '1px solid #F9FAFB' : 'none',
                        verticalAlign: 'top',
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: '#9CA3AF',
                      }}>
                        {task.backend_table ?? '—'}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        borderBottom: idx < groupTasks.length - 1 ? '1px solid #F9FAFB' : 'none',
                        verticalAlign: 'top',
                        fontSize: 12,
                        color: '#6B7280',
                        maxWidth: 180,
                      }}>
                        {task.notes ? task.notes.slice(0, 50) + (task.notes.length > 50 ? '…' : '') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* Footer */}
      <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16 }}>
        Task statuses are managed in Supabase · Update via SQL Editor or build the edit UI
      </p>
    </div>
  )
}
