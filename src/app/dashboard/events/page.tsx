'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarDays, Plus, ChevronRight, FileText, Loader2, Settings2 } from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { cn, formatDate } from '@/lib/utils'
import { MOCK_EVENTS } from '@/lib/mock-data'
import { DEFAULT_EVENT_TYPES, EVENT_TYPE_SLUG } from '@/types'
import type { EventType, Event } from '@/types'

const EVENT_TYPE_COLORS: Record<string, string> = {
  rehearsal:      'bg-teal-100 text-teal-700 border-teal-200',
  sunday_service: 'bg-purple-100 text-purple-700 border-purple-200',
  funeral:        'bg-slate-100 text-slate-600 border-slate-200',
  concert:        'bg-amber-100 text-amber-700 border-amber-200',
  custom:         'bg-blue-100 text-blue-700 border-blue-200',
}

/** Returns the display label for any event */
function eventLabel(event: Event): string {
  if (event.type === 'custom' && event.custom_type) return event.custom_type
  const labels: Record<string, string> = {
    rehearsal: 'Rehearsal', sunday_service: 'Sunday Service',
    funeral: 'Funeral', concert: 'Concert',
  }
  return labels[event.type] ?? event.type
}

const BLANK_EVENT = { name: '', date: '', type: 'rehearsal' as EventType, custom_type: '', notes: '' }

export default function EventsPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(BLANK_EVENT)
  const [saving, setSaving] = useState(false)
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS)
  const [eventTypes, setEventTypes] = useState<string[]>([...DEFAULT_EVENT_TYPES])

  // Load event types (built-in + custom) from Supabase
  useEffect(() => {
    async function loadEventTypes() {
      try {
        const { isSupabaseConfigured } = await import('@/lib/auth/mock-auth')
        if (!isSupabaseConfigured()) return
        const { createClient } = await import('@/lib/supabase/client')
        const sb = createClient()
        const { data: ensembles } = await sb.from('ensembles').select('id').limit(1)
        const eid = (ensembles as { id: string }[] | null)?.[0]?.id
        if (!eid) return
        const { data } = await sb
          .from('event_types')
          .select('name')
          .eq('ensemble_id', eid)
          .order('sort_order')
        if (data?.length) setEventTypes((data as { name: string }[]).map(s => s.name))
      } catch { /* keep defaults */ }
    }
    void loadEventTypes()
  }, [])

  /** Convert a display-name option value into form type/custom_type */
  function applyEventType(name: string) {
    const slug = EVENT_TYPE_SLUG[name]
    if (slug) {
      setForm(f => ({ ...f, type: slug as EventType, custom_type: '' }))
    } else {
      setForm(f => ({ ...f, type: 'custom' as EventType, custom_type: name }))
    }
  }

  /** Derive the select's current value from form state */
  const formTypeValue = form.type === 'custom' && form.custom_type
    ? form.custom_type
    : (Object.entries(EVENT_TYPE_SLUG).find(([, v]) => v === form.type)?.[0] ?? form.type)

  /** Derive filter key for a display name */
  function filterKey(name: string) {
    return EVENT_TYPE_SLUG[name] ?? `custom:${name}`
  }

  /** Active filter key for an event */
  function eventFilterKey(event: Event) {
    if (event.type === 'custom' && event.custom_type) return `custom:${event.custom_type}`
    return event.type
  }

  const filtered = events.filter(e =>
    typeFilter === 'all' || eventFilterKey(e) === typeFilter
  )
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      const newEvent: Event = {
        ...form,
        custom_type: form.custom_type || undefined,
        id: `e${Date.now()}`,
        created_by: 'director',
        created_at: new Date().toISOString(),
      }
      setEvents(prev => [newEvent, ...prev])
      setForm(BLANK_EVENT)
      setShowCreate(false)
      setSaving(false)
    }, 600)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title="Events" subtitle={`${events.length} total events`} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">

        {/* Filter + Create bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setTypeFilter('all')}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                typeFilter === 'all' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')}
            >
              All Types
            </button>
            {eventTypes.map(name => (
              <button
                key={name}
                onClick={() => setTypeFilter(filterKey(name))}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  typeFilter === filterKey(name) ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/settings#event-types"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Settings2 size={13} />
              Manage types
            </Link>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={15} />
              Create Event
            </button>
          </div>
        </div>

        {/* Create event panel */}
        {showCreate && (
          <div className="bg-white rounded-xl border border-teal-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">New Event</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Event Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Weekly Rehearsal"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Event Type</label>
                <select
                  value={formTypeValue}
                  onChange={e => applyEventType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {eventTypes.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
                <input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Rehearsal content, reminders, etc."
                />
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setForm(BLANK_EVENT) }}
                  className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-60"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {saving ? 'Creating…' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events list */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50">
          {sorted.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-400">No events found</div>
          ) : sorted.map(event => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <CalendarDays size={16} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{event.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded border', EVENT_TYPE_COLORS[event.type] ?? EVENT_TYPE_COLORS.custom)}>
                    {eventLabel(event)}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(event.date)}</span>
                  {event.notes && (
                    <span className="flex items-center gap-0.5 text-xs text-slate-400">
                      <FileText size={10} /> Notes
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-300 shrink-0" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
