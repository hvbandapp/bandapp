'use client'

import { useState, useCallback } from 'react'
import { Save, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { cn, getLevelBadgeClasses } from '@/lib/utils'
import { MOCK_LEVEL_POLICIES, MOCK_PERIOD } from '@/lib/mock-data'
import { useDirtyState } from '@/lib/dirty-state'
import { DEFAULT_SECTIONS } from '@/types'
import type { LevelPolicy, MemberLevel } from '@/types'

export default function SettingsPage() {
  const [policies, setPolicies] = useState<LevelPolicy[]>(MOCK_LEVEL_POLICIES)
  const [sections, setSections] = useState<string[]>([...DEFAULT_SECTIONS])
  const [newSection, setNewSection] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [periodLabel, setPeriodLabel] = useState(MOCK_PERIOD.label)
  const [periodStart, setPeriodStart] = useState(MOCK_PERIOD.start_date)
  const [periodEnd,   setPeriodEnd]   = useState(MOCK_PERIOD.end_date)
  const [notifyEmail, setNotifyEmail] = useState(true)

  const { setDirty, clearDirty } = useDirtyState()

  function markDirty() {
    setDirty(true, doSave)
  }
  const [eventReminders, setEventReminders] = useState(true)
  const [reminderHours, setReminderHours]   = useState('24')

  function updatePolicy(level: MemberLevel, field: keyof LevelPolicy, value: number | null | string) {
    markDirty()
    setPolicies(prev => prev.map(p => p.level === level ? { ...p, [field]: value } : p))
  }

  const doSave = useCallback(() => {
    setSaving(true)
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setSaving(false)
        setSaved(true)
        clearDirty()
        setTimeout(() => setSaved(false), 2500)
        resolve()
      }, 800)
    })
  }, [clearDirty])

  function handleSave() { void doSave() }

  function addSection() {
    const trimmed = newSection.trim()
    if (trimmed && !sections.includes(trimmed)) {
      setSections(prev => [...prev, trimmed])
      setNewSection('')
    }
  }

  function removeSection(s: string) {
    if (DEFAULT_SECTIONS.includes(s as typeof DEFAULT_SECTIONS[number])) return
    setSections(prev => prev.filter(x => x !== s))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title="Settings" subtitle="Attendance periods, levels, notifications, sections" />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

        {/* Save button */}
        <div className="flex justify-end gap-3 items-center">
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
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded border', getLevelBadgeClasses(policy.level))}>
                    {policy.label}
                  </span>
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

      </div>
    </div>
  )
}
