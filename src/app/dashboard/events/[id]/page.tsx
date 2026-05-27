'use client'

import { useState, use, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Edit3, Save, ChevronDown, ChevronUp,
  CheckCircle, Clock, XCircle, AlertCircle, FileText
} from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { cn, formatDate, getAttendanceClasses } from '@/lib/utils'
import { MOCK_EVENTS, MOCK_MEMBERS, MOCK_ATTENDANCE } from '@/lib/mock-data'
import { useDirtyState } from '@/lib/dirty-state'
import type { AttendanceStatus, AbsenceType, Member } from '@/types'

const SECTIONS = ['Trumpet', 'Trombone', 'Euphonium', 'Tuba', 'Percussion']

const EVENT_TYPE_COLORS: Record<string, string> = {
  rehearsal:      'bg-teal-100 text-teal-700',
  sunday_service: 'bg-purple-100 text-purple-700',
  funeral:        'bg-slate-100 text-slate-600',
  concert:        'bg-amber-100 text-amber-700',
  custom:         'bg-blue-100 text-blue-700',
}
const EVENT_TYPE_LABELS: Record<string, string> = {
  rehearsal: 'Rehearsal', sunday_service: 'Sunday Service',
  funeral: 'Funeral', concert: 'Concert', custom: 'Custom',
}

interface AttendanceState {
  status: AttendanceStatus
  note: string
  absence_type: AbsenceType | ''
}

const STATUS_CYCLE: AttendanceStatus[] = ['absent', 'present', 'partial', 'excused']

function statusLabel(s: AttendanceStatus) {
  return s === 'present' ? 'Present' : s === 'partial' ? 'Partial' : s === 'excused' ? 'Excused' : 'Absent'
}

function statusIcon(s: AttendanceStatus, size = 14) {
  if (s === 'present') return <CheckCircle size={size} />
  if (s === 'partial')  return <Clock size={size} />
  if (s === 'excused')  return <AlertCircle size={size} />
  return <XCircle size={size} />
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const event  = MOCK_EVENTS.find(e => e.id === id) ?? MOCK_EVENTS[0]

  // Build initial attendance map from mock data
  const initialMap: Record<string, AttendanceState> = {}
  MOCK_MEMBERS.forEach(m => {
    const existing = MOCK_ATTENDANCE.find(a => a.event_id === id && a.member_id === m.id)
    initialMap[m.id] = {
      status:       existing?.status ?? 'absent',
      note:         existing?.note ?? '',
      absence_type: existing?.absence_type ?? '',
    }
  })

  const [attendance, setAttendance] = useState<Record<string, AttendanceState>>(initialMap)
  const [editMode, setEditMode]     = useState(!MOCK_ATTENDANCE.some(a => a.event_id === id))
  const [noteOpen, setNoteOpen]     = useState<string | null>(null)
  const [notes, setNotes]           = useState(event.notes ?? '')
  const [editNotes, setEditNotes]   = useState(false)
  const [saved, setSaved]           = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(SECTIONS))

  const { setDirty, clearDirty } = useDirtyState()

  const doSave = useCallback(() => {
    setSaved(true)
    setEditMode(false)
    setEditNotes(false)
    clearDirty()
    setTimeout(() => setSaved(false), 2500)
  }, [clearDirty])

  function enterEditMode() {
    setEditMode(true)
    setDirty(true, doSave)
  }

  function enterEditNotes() {
    setEditNotes(true)
    setDirty(true, doSave)
  }

  function cycleStatus(memberId: string) {
    if (!editMode) return
    setAttendance(prev => {
      const current = prev[memberId].status
      const idx     = STATUS_CYCLE.indexOf(current)
      const next    = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
      return { ...prev, [memberId]: { ...prev[memberId], status: next, note: next === 'absent' || next === 'present' ? '' : prev[memberId].note } }
    })
  }

  function setNote(memberId: string, note: string) {
    setAttendance(prev => ({ ...prev, [memberId]: { ...prev[memberId], note } }))
  }

  function setAbsenceType(memberId: string, absence_type: AbsenceType) {
    setAttendance(prev => ({ ...prev, [memberId]: { ...prev[memberId], absence_type } }))
  }

  function handleSave() {
    doSave()
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(section) ? next.delete(section) : next.add(section)
      return next
    })
  }

  const totalPresent = Object.values(attendance).filter(a => a.status === 'present').length
  const totalPartial = Object.values(attendance).filter(a => a.status === 'partial').length
  const totalAbsent  = Object.values(attendance).filter(a => a.status === 'absent').length
  const totalExcused = Object.values(attendance).filter(a => a.status === 'excused').length
  const total        = MOCK_MEMBERS.length
  const pct          = total > 0 ? Math.round(((totalPresent + totalPartial * 0.5) / total) * 100) : 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav
        title={event.name}
        subtitle={`${formatDate(event.date)} · ${EVENT_TYPE_LABELS[event.type] ?? event.custom_type}`}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        {/* Back + header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Link href="/dashboard/events" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors">
            <ArrowLeft size={14} />
            All Events
          </Link>
          <div className="flex gap-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                <CheckCircle size={12} /> Saved
              </span>
            )}
            {editMode ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Save size={14} /> Save Attendance
              </button>
            ) : (
              <button
                onClick={enterEditMode}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
              >
                <Edit3 size={14} /> Edit Attendance
              </button>
            )}
          </div>
        </div>

        {/* Event info + attendance summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Present', count: totalPresent, color: 'bg-green-500', icon: <CheckCircle size={14} /> },
            { label: 'Partial',  count: totalPartial, color: 'bg-yellow-400', icon: <Clock size={14} /> },
            { label: 'Absent',   count: totalAbsent,  color: 'bg-red-500',   icon: <XCircle size={14} /> },
            { label: 'Excused',  count: totalExcused, color: 'bg-blue-400',  icon: <AlertCircle size={14} /> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0', s.color)}>
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 leading-none">{s.count}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance rate bar */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Event Attendance Rate</span>
            <span className="text-2xl font-bold text-slate-800">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-300', pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-500')}
              style={{ width: `${pct}%` }}
            />
          </div>
          {editMode && (
            <p className="text-xs text-teal-600 mt-2 flex items-center gap-1">
              <Edit3 size={11} /> Tap a member to cycle status · Hold-tap for note
            </p>
          )}
        </div>

        {/* Event notes */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700">Event Notes</h3>
            </div>
            <button
              onClick={() => editNotes ? doSave() : enterEditNotes()}
              className="text-xs text-teal-600 hover:text-teal-700"
            >
              {editNotes ? 'Done' : 'Edit'}
            </button>
          </div>
          {editNotes ? (
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Add rehearsal notes, music covered, announcements, reminders…"
            />
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">
              {notes || <span className="text-slate-400 italic">No notes added yet. Click Edit to add notes.</span>}
            </p>
          )}
        </div>

        {/* Section-by-section attendance */}
        <div className="space-y-3">
          {SECTIONS.map(section => {
            const sectionMembers = MOCK_MEMBERS.filter(m => m.section === section)
            if (sectionMembers.length === 0) return null
            const expanded = expandedSections.has(section)
            const sPresent = sectionMembers.filter(m => attendance[m.id]?.status === 'present').length
            const sTotal   = sectionMembers.length
            const sPct     = Math.round((sPresent / sTotal) * 100)

            return (
              <div key={section} className="bg-white rounded-xl border border-slate-200">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-800">{section}</span>
                    <span className="text-xs text-slate-400">{sectionMembers.length} members</span>
                    <div className="flex gap-1">
                      {sectionMembers.map(m => (
                        <div
                          key={m.id}
                          className={cn('w-2 h-2 rounded-full', {
                            'bg-green-500': attendance[m.id]?.status === 'present',
                            'bg-yellow-400': attendance[m.id]?.status === 'partial',
                            'bg-red-500': attendance[m.id]?.status === 'absent',
                            'bg-blue-400': attendance[m.id]?.status === 'excused',
                          })}
                          title={`${m.first_name} — ${attendance[m.id]?.status}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">{sPct}%</span>
                    {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </button>

                {/* Member rows */}
                {expanded && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {sectionMembers.map(member => {
                      const state   = attendance[member.id]
                      const isOpen  = noteOpen === member.id
                      const needsNote = state.status === 'partial' || state.status === 'excused' || state.status === 'absent'

                      return (
                        <div key={member.id} className="px-5">
                          <div className="flex items-center justify-between py-3 gap-3">
                            {/* Member name + role */}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {member.first_name} {member.last_name}
                                {member.role === 'section_leader' && (
                                  <span className="ml-1.5 text-[10px] text-teal-600 font-medium">SL</span>
                                )}
                              </p>
                              {state.note && (
                                <p className="text-xs text-slate-400 truncate italic">"{state.note}"</p>
                              )}
                            </div>

                            {/* Status toggle button */}
                            <div className="flex items-center gap-2 shrink-0">
                              {needsNote && editMode && (
                                <button
                                  onClick={() => setNoteOpen(isOpen ? null : member.id)}
                                  className="text-xs text-slate-400 hover:text-teal-600 transition-colors"
                                >
                                  {isOpen ? 'Close' : '+ Note'}
                                </button>
                              )}
                              <button
                                onClick={() => cycleStatus(member.id)}
                                disabled={!editMode}
                                className={cn(
                                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                  getAttendanceClasses(state.status),
                                  editMode ? 'cursor-pointer hover:opacity-80 active:scale-95' : 'cursor-default'
                                )}
                              >
                                {statusIcon(state.status)}
                                {statusLabel(state.status)}
                              </button>
                            </div>
                          </div>

                          {/* Expandable note/excused panel */}
                          {isOpen && editMode && (
                            <div className="pb-3 space-y-2">
                              {(state.status === 'absent' || state.status === 'excused') && (
                                <div className="flex gap-2">
                                  {(['unexcused', 'excused'] as AbsenceType[]).map(t => (
                                    <button
                                      key={t}
                                      onClick={() => setAbsenceType(member.id, t)}
                                      className={cn(
                                        'px-2.5 py-1 rounded text-xs font-medium border transition-colors',
                                        state.absence_type === t
                                          ? 'bg-slate-800 text-white border-slate-800'
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                      )}
                                    >
                                      {t === 'unexcused' ? 'Unexcused' : 'Excused'}
                                    </button>
                                  ))}
                                </div>
                              )}
                              <input
                                type="text"
                                value={state.note}
                                onChange={e => setNote(member.id, e.target.value)}
                                placeholder={
                                  state.status === 'partial'
                                    ? 'e.g. Arrived 20 min late'
                                    : state.status === 'excused'
                                    ? 'e.g. Family emergency'
                                    : 'Note (optional)'
                                }
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
