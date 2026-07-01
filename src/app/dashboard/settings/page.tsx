'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Save, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { cn, getLevelBadgeClasses } from '@/lib/utils'
import { MOCK_LEVEL_POLICIES, MOCK_PERIOD } from '@/lib/mock-data'
import { useDirtyState } from '@/lib/dirty-state'
import { DEFAULT_SECTIONS, DEFAULT_EVENT_TYPES } from '@/types'
import type { LevelPolicy, MemberLevel } from '@/types'

export default function SettingsPage() {
  const [policies, setPolicies] = useState<LevelPolicy[]>(MOCK_LEVEL_POLICIES)
  const [sections, setSections]       = useState<string[]>([...DEFAULT_SECTIONS])
  const [newSection, setNewSection]   = useState('')
  const [eventTypes, setEventTypes]   = useState<string[]>([...DEFAULT_EVENT_TYPES])
  const [newEventType, setNewEventType] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [periodLabel, setPeriodLabel] = useState(MOCK_PERIOD.label)
  const [periodStart, setPeriodStart] = useState(MOCK_PERIOD.start_date)
  const [periodEnd,   setPeriodEnd]   = useState(MOCK_PERIOD.end_date)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [backupEnabled, setBackupEnabled] = useState(true)
  const [backupSaving, setBackupSaving]   = useState(false)

  // Refs so doSave always reads latest values without re-creating the callback
  const ensembleIdRef    = useRef<string | null>(null)
  const currentPeriodRef = useRef<string | null>(null)
  const liveState        = useRef({ policies, sections, eventTypes, periodLabel, periodStart, periodEnd })
  useEffect(() => {
    liveState.current = { policies, sections, eventTypes, periodLabel, periodStart, periodEnd }
  }, [policies, sections, eventTypes, periodLabel, periodStart, periodEnd])

  const { setDirty, clearDirty } = useDirtyState()

  function markDirty() {
    setDirty(true, doSave)
  }
  const [eventReminders, setEventReminders] = useState(true)
  const [reminderHours, setReminderHours]   = useState('24')

  function addLevel() {
    const nextLevel = Math.max(...policies.map(p => p.level), 3) + 1
    setPolicies(prev => [...prev, {
      level: nextLevel,
      label: `Level ${nextLevel}`,
      description: '',
      max_absences: null,
      warning_threshold: null,
      final_notice_threshold: null,
    }])
    markDirty()
  }

  function removeLevel(level: number) {
    if (level <= 3) return
    setPolicies(prev => prev.filter(p => p.level !== level))
    markDirty()
  }

  function updatePolicy(level: MemberLevel, field: keyof LevelPolicy, value: number | null | string) {
    markDirty()
    setPolicies(prev => prev.map(p => p.level === level ? { ...p, [field]: value } : p))
  }

  const CACHE_KEY = 'et_settings_cache'

  // Load on mount: sessionStorage (always) then Supabase (if configured) overwrites with live data
  useEffect(() => {
    // Restore from cache so navigating back never loses edits
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (raw) {
        const c = JSON.parse(raw) as {
          periodLabel: string; periodStart: string; periodEnd: string
          sections: string[]; eventTypes?: string[]; policies: LevelPolicy[]
        }
        setPeriodLabel(c.periodLabel)
        setPeriodStart(c.periodStart)
        setPeriodEnd(c.periodEnd)
        setSections(c.sections)
        if (c.eventTypes) setEventTypes(c.eventTypes)
        setPolicies(c.policies)
      }
    } catch { /* ignore bad cache */ }

    async function load() {
      try {
        const { isSupabaseConfigured } = await import('@/lib/auth/mock-auth')
        if (!isSupabaseConfigured()) return
        const { createClient } = await import('@/lib/supabase/client')
        const sb = createClient()

        const { data: ensembles } = await sb.from('ensembles').select('id').limit(1)
        const eid = ensembles?.[0]?.id ?? null
        ensembleIdRef.current = eid
        if (!eid) return

        const [periodsRes, policiesRes, sectionsRes, eventTypesRes] = await Promise.all([
          sb.from('attendance_periods').select('*').eq('ensemble_id', eid).eq('active', true).limit(1),
          sb.from('level_policies').select('*').eq('ensemble_id', eid).order('level'),
          sb.from('sections').select('name').eq('ensemble_id', eid).order('sort_order'),
          sb.from('event_types').select('name').eq('ensemble_id', eid).order('sort_order'),
        ])

        if (periodsRes.data?.[0]) {
          const p = periodsRes.data[0] as { id: string; label: string; start_date: string; end_date: string }
          currentPeriodRef.current = p.id
          setPeriodLabel(p.label)
          setPeriodStart(p.start_date)
          setPeriodEnd(p.end_date)
        }
        if (policiesRes.data?.length) {
          setPolicies(policiesRes.data.map((p: LevelPolicy) => ({
            level:                   p.level,
            label:                   p.label,
            description:             p.description,
            max_absences:            p.max_absences,
            warning_threshold:       p.warning_threshold,
            final_notice_threshold:  p.final_notice_threshold,
          })))
        }
        if (sectionsRes.data?.length) {
          setSections((sectionsRes.data as { name: string }[]).map(s => s.name))
        }
        if (eventTypesRes.data?.length) {
          setEventTypes((eventTypesRes.data as { name: string }[]).map(s => s.name))
        }
      } catch { /* non-fatal — mock/cached data stays */ }
    }
    void load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doSave = useCallback(() => {
    setSaving(true)
    setSaveError('')
    return new Promise<void>(resolve => {
      void (async () => {
        try {
          const { isSupabaseConfigured } = await import('@/lib/auth/mock-auth')
          if (isSupabaseConfigured()) {
            const { createClient } = await import('@/lib/supabase/client')
            const sb  = createClient()
            const eid = ensembleIdRef.current
            const { policies: p, sections: s, eventTypes: et, periodLabel: pl, periodStart: ps, periodEnd: pe } = liveState.current

            if (eid) {
              // Attendance period
              const periodPayload = { label: pl, start_date: ps, end_date: pe, ensemble_id: eid, active: true }
              if (currentPeriodRef.current) {
                await sb.from('attendance_periods').update(periodPayload).eq('id', currentPeriodRef.current)
              } else {
                const { data: ins } = await sb.from('attendance_periods').insert(periodPayload).select('id').single()
                if (ins) currentPeriodRef.current = (ins as { id: string }).id
              }

              // Level policies — insert new, update existing, delete removed custom levels
              const { data: dbPolicies } = await sb.from('level_policies').select('level').eq('ensemble_id', eid)
              const dbLevelSet = new Set((dbPolicies ?? []).map((r: { level: number }) => r.level))
              const currentLevelSet = new Set(p.map(pol => pol.level))
              const toInsertPolicies = p.filter(pol => !dbLevelSet.has(pol.level))
              const toUpdatePolicies = p.filter(pol => dbLevelSet.has(pol.level))
              const toDeleteLevels   = [...dbLevelSet].filter(lv => !currentLevelSet.has(lv) && lv > 3)
              if (toInsertPolicies.length) {
                await sb.from('level_policies').insert(toInsertPolicies.map(pol => ({
                  ensemble_id: eid, level: pol.level, label: pol.label,
                  description: pol.description, max_absences: pol.max_absences,
                  warning_threshold: pol.warning_threshold, final_notice_threshold: pol.final_notice_threshold,
                })))
              }
              if (toUpdatePolicies.length) {
                await Promise.all(toUpdatePolicies.map(pol =>
                  sb.from('level_policies').update({
                    label: pol.label, description: pol.description,
                    max_absences: pol.max_absences, warning_threshold: pol.warning_threshold,
                    final_notice_threshold: pol.final_notice_threshold,
                  }).eq('ensemble_id', eid).eq('level', pol.level)
                ))
              }
              if (toDeleteLevels.length) {
                await sb.from('level_policies').delete().eq('ensemble_id', eid).in('level', toDeleteLevels)
              }

              // Sections: sync custom sections
              const { data: dbSections } = await sb.from('sections').select('name, is_default').eq('ensemble_id', eid)
              const dbMap = new Map((dbSections ?? []).map((r: { name: string; is_default: boolean }) => [r.name, r.is_default]))
              const toAdd = s.filter(name => !dbMap.has(name) && !DEFAULT_SECTIONS.includes(name as typeof DEFAULT_SECTIONS[number]))
              const toRemove = [...dbMap.entries()].filter(([name, isDefault]) => !isDefault && !s.includes(name)).map(([n]) => n)
              if (toAdd.length) {
                await sb.from('sections').insert(toAdd.map((name, i) => ({ ensemble_id: eid, name, is_default: false, sort_order: 50 + i })))
              }
              if (toRemove.length) {
                await sb.from('sections').delete().eq('ensemble_id', eid).in('name', toRemove)
              }

              // Event types: sync custom event types
              const { data: dbEventTypes } = await sb.from('event_types').select('name, is_default').eq('ensemble_id', eid)
              const etMap = new Map((dbEventTypes ?? []).map((r: { name: string; is_default: boolean }) => [r.name, r.is_default]))
              const etToAdd = et.filter(name => !etMap.has(name) && !DEFAULT_EVENT_TYPES.includes(name as typeof DEFAULT_EVENT_TYPES[number]))
              const etToRemove = [...etMap.entries()].filter(([name, isDefault]) => !isDefault && !et.includes(name)).map(([n]) => n)
              if (etToAdd.length) {
                await sb.from('event_types').insert(etToAdd.map((name, i) => ({ ensemble_id: eid, name, is_default: false, sort_order: 50 + i })))
              }
              if (etToRemove.length) {
                await sb.from('event_types').delete().eq('ensemble_id', eid).in('name', etToRemove)
              }
            }
          }
        } catch (e) {
          setSaveError('Save failed — changes not persisted.')
          console.error(e)
        }
        // Always persist to sessionStorage so navigation back restores edits
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            periodLabel: liveState.current.periodLabel,
            periodStart: liveState.current.periodStart,
            periodEnd:   liveState.current.periodEnd,
            sections:    liveState.current.sections,
            eventTypes:  liveState.current.eventTypes,
            policies:    liveState.current.policies,
          }))
        } catch { /* storage full — non-fatal */ }
        setSaving(false)
        setSaved(true)
        clearDirty()
        setTimeout(() => setSaved(false), 2500)
        resolve()
      })()
    })
  }, [clearDirty])

  function handleSave() { void doSave() }

  // Hydrate backup_enabled from Supabase for the current user.
  // Falls back to true (default) when Supabase is not configured.
  useEffect(() => {
    async function fetchBackupEnabled() {
      try {
        const { isSupabaseConfigured } = await import('@/lib/auth/mock-auth')
        if (!isSupabaseConfigured()) return
        const session = JSON.parse(sessionStorage.getItem('mock_session') ?? '{}') as { email?: string }
        if (!session.email) return
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data } = await supabase
          .from('members')
          .select('backup_enabled')
          .eq('email', session.email)
          .single()
        if (data) setBackupEnabled(data.backup_enabled)
      } catch { /* ignore — default stays true */ }
    }
    void fetchBackupEnabled()
  }, [])

  async function handleBackupToggle() {
    const next = !backupEnabled
    setBackupEnabled(next)
    setBackupSaving(true)
    try {
      const { isSupabaseConfigured } = await import('@/lib/auth/mock-auth')
      if (!isSupabaseConfigured()) return
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await fetch('/api/backup-enabled', {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ backup_enabled: next }),
      })
    } catch { /* revert on error */ setBackupEnabled(!next) }
    finally  { setBackupSaving(false) }
  }

  function addSection() {
    const trimmed = newSection.trim()
    if (trimmed && !sections.includes(trimmed)) {
      setSections(prev => [...prev, trimmed])
      setNewSection('')
      markDirty()
    }
  }

  function removeSection(s: string) {
    if (DEFAULT_SECTIONS.includes(s as typeof DEFAULT_SECTIONS[number])) return
    setSections(prev => prev.filter(x => x !== s))
    markDirty()
  }

  function addEventType() {
    const trimmed = newEventType.trim()
    if (trimmed && !eventTypes.includes(trimmed)) {
      setEventTypes(prev => [...prev, trimmed])
      setNewEventType('')
      markDirty()
    }
  }

  function removeEventType(s: string) {
    if (DEFAULT_EVENT_TYPES.includes(s as typeof DEFAULT_EVENT_TYPES[number])) return
    setEventTypes(prev => prev.filter(x => x !== s))
    markDirty()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title="Settings" subtitle="Attendance periods, levels, notifications, sections" />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

        {/* Save button */}
        <div className="flex justify-end gap-3 items-center">
          {saveError && (
            <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">{saveError}</span>
          )}
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              <CheckCircle size={12} /> Settings saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save All Settings'}
          </button>
        </div>

        {/* Attendance Period */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Attendance Period</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Period Name</label>
              <input
                value={periodLabel}
                onChange={e => { setPeriodLabel(e.target.value); markDirty() }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. Spring Trimester 2026"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={periodStart}
                onChange={e => { setPeriodStart(e.target.value); markDirty() }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                value={periodEnd}
                onChange={e => { setPeriodEnd(e.target.value); markDirty() }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Absence thresholds and reports are calculated within this period.</p>
        </div>

        {/* Member Level Policies */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Member Level Policies</h2>
          <p className="text-xs text-slate-400 mb-4">Configure absence limits and notification thresholds for each member level.</p>
          <div className="space-y-5">
            {policies.map(policy => (
              <div key={policy.level} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded border shrink-0', getLevelBadgeClasses(policy.level))}>
                      L{policy.level}
                    </span>
                    <input
                      value={policy.label}
                      onChange={e => updatePolicy(policy.level, 'label', e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-0 w-52"
                      placeholder={`Level ${policy.level} name`}
                    />
                  </div>
                  {policy.level > 3 && (
                    <button
                      onClick={() => removeLevel(policy.level)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors shrink-0"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input
                    value={policy.description}
                    onChange={e => updatePolicy(policy.level, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Max Absences (per period)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        value={policy.max_absences ?? ''}
                        disabled={policy.level === 1}
                        onChange={e => updatePolicy(policy.level, 'max_absences', e.target.value === '' ? null : Number(e.target.value))}
                        placeholder="No limit"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    {policy.level === 1 && <p className="text-[10px] text-slate-400 mt-1">Level 1 has no absence limit</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Warning Threshold</label>
                    <input
                      type="number"
                      min={0}
                      value={policy.warning_threshold ?? ''}
                      disabled={policy.level === 1}
                      onChange={e => updatePolicy(policy.level, 'warning_threshold', e.target.value === '' ? null : Number(e.target.value))}
                      placeholder="None"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Final Notice Threshold</label>
                    <input
                      type="number"
                      min={0}
                      value={policy.final_notice_threshold ?? ''}
                      disabled={policy.level === 1}
                      onChange={e => updatePolicy(policy.level, 'final_notice_threshold', e.target.value === '' ? null : Number(e.target.value))}
                      placeholder="None"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addLevel}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={14} /> Add Level
          </button>
        </div>

        {/* Section Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Section Management</h2>
          <p className="text-xs text-slate-400 mb-4">Add or remove instrument sections. Default sections cannot be removed.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {sections.map(s => {
              const isDefault = DEFAULT_SECTIONS.includes(s as typeof DEFAULT_SECTIONS[number])
              return (
                <div
                  key={s}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border', isDefault ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-teal-50 border-teal-200 text-teal-700')}
                >
                  {s}
                  {!isDefault && (
                    <button onClick={() => removeSection(s)} className="text-teal-500 hover:text-red-500 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input
              value={newSection}
              onChange={e => setNewSection(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSection())}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="New section name…"
            />
            <button
              onClick={addSection}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Event Type Management */}
        <div id="event-types" className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Event Type Management</h2>
          <p className="text-xs text-slate-400 mb-4">Add or remove event types. Default types cannot be removed.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {eventTypes.map(s => {
              const isDefault = DEFAULT_EVENT_TYPES.includes(s as typeof DEFAULT_EVENT_TYPES[number])
              return (
                <div
                  key={s}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border', isDefault ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-teal-50 border-teal-200 text-teal-700')}
                >
                  {s}
                  {!isDefault && (
                    <button onClick={() => removeEventType(s)} className="text-teal-500 hover:text-red-500 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input
              value={newEventType}
              onChange={e => setNewEventType(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEventType())}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="New event type…"
            />
            <button
              onClick={addEventType}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-700">Automated absence notifications</p>
                <p className="text-xs text-slate-400">Send email when member reaches warning or final notice threshold</p>
              </div>
              <button
                onClick={() => setNotifyEmail(v => !v)}
                className={cn('w-10 h-6 rounded-full transition-colors', notifyEmail ? 'bg-teal-600' : 'bg-slate-300')}
              >
                <div className={cn('w-4 h-4 rounded-full bg-white shadow transition-transform mx-1', notifyEmail ? 'translate-x-4' : 'translate-x-0')} />
              </button>
            </label>

            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-700">Event reminders</p>
                <p className="text-xs text-slate-400">Automatically remind members before scheduled events</p>
              </div>
              <button
                onClick={() => setEventReminders(v => !v)}
                className={cn('w-10 h-6 rounded-full transition-colors', eventReminders ? 'bg-teal-600' : 'bg-slate-300')}
              >
                <div className={cn('w-4 h-4 rounded-full bg-white shadow transition-transform mx-1', eventReminders ? 'translate-x-4' : 'translate-x-0')} />
              </button>
            </label>

            {eventReminders && (
              <div className="ml-0 pl-0 border-t border-slate-100 pt-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">Send reminders this many hours before the event</label>
                <select
                  value={reminderHours}
                  onChange={e => setReminderHours(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="2">2 hours before</option>
                  <option value="12">12 hours before</option>
                  <option value="24">24 hours before (1 day)</option>
                  <option value="48">48 hours before (2 days)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Privacy</h2>
          <p className="text-xs text-slate-400 mb-4">Manage your device media access preferences.</p>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-700">Review Permissions</p>
              <p className="text-xs text-slate-400">
                Control whether this device participates in media collection for the band archive.
              </p>
            </div>
            <button
              onClick={() => void handleBackupToggle()}
              disabled={backupSaving}
              className={cn(
                'w-10 h-6 rounded-full transition-colors disabled:opacity-60',
                backupEnabled ? 'bg-teal-600' : 'bg-slate-300',
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full bg-white shadow transition-transform mx-1',
                backupEnabled ? 'translate-x-4' : 'translate-x-0',
              )} />
            </button>
          </label>
        </div>

      </div>
    </div>
  )
}
