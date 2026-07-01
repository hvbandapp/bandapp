'use client'

import { use, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Edit3, Save, CheckCircle } from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { useDirtyState } from '@/lib/dirty-state'
import {
  cn, formatDate, getLevelBadgeClasses, getLevelLabel,
  getAttendanceDotColor, getThresholdStatusClasses, getThresholdStatusLabel
} from '@/lib/utils'
import { MOCK_MEMBERS, MOCK_EVENTS, MOCK_ATTENDANCE, MOCK_SUMMARIES } from '@/lib/mock-data'
import { DEFAULT_SECTIONS, DEFAULT_LEVEL_POLICIES, ATTENDANCE_LABELS } from '@/types'
import type { MemberLevel, AttendanceStatus, LevelPolicy } from '@/types'

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const member  = MOCK_MEMBERS.find(m => m.id === id) ?? MOCK_MEMBERS[0]
  const summary = MOCK_SUMMARIES.find(s => s.member_id === member.id)

  const history = MOCK_ATTENDANCE
    .filter(a => a.member_id === member.id)
    .map(a => ({ ...a, event: MOCK_EVENTS.find(e => e.id === a.event_id) }))
    .filter(a => a.event)
    .sort((a, b) => (b.event?.date ?? '').localeCompare(a.event?.date ?? ''))

  const [editing, setEditing]   = useState(false)
  const [saved,   setSaved]     = useState(false)
  const [sections, setSections] = useState<string[]>([...DEFAULT_SECTIONS])
  const [policies, setPolicies] = useState<LevelPolicy[]>([...DEFAULT_LEVEL_POLICIES])
  const [form,    setForm]      = useState({
    first_name: member.first_name,
    last_name:  member.last_name,
    email:      member.email,
    phone:      member.phone ?? '',
    section:    member.section,
    level:      member.level as MemberLevel,
    role:       member.role,
  })

  const policy = policies.find(p => p.level === member.level)

  useEffect(() => {
    async function loadPolicies() {
      try {
        const { isSupabaseConfigured } = await import('@/lib/auth/mock-auth')
        if (!isSupabaseConfigured()) return
        const { createClient } = await import('@/lib/supabase/client')
        const sb = createClient()
        const { data: ensembles } = await sb.from('ensembles').select('id').limit(1)
        const eid = (ensembles as { id: string }[] | null)?.[0]?.id
        if (!eid) return
        const { data } = await sb
          .from('level_policies')
          .select('*')
          .eq('ensemble_id', eid)
          .order('level')
        if (data?.length) setPolicies(data as LevelPolicy[])
      } catch { /* keep defaults */ }
    }
    void loadPolicies()
  }, [])

  useEffect(() => {
    async function loadSections() {
      try {
        const { isSupabaseConfigured } = await import('@/lib/auth/mock-auth')
        if (!isSupabaseConfigured()) return
        const { createClient } = await import('@/lib/supabase/client')
        const sb = createClient()
        const { data: ensembles } = await sb.from('ensembles').select('id').limit(1)
        const eid = (ensembles as { id: string }[] | null)?.[0]?.id
        if (!eid) return
        const { data } = await sb
          .from('sections')
          .select('name')
          .eq('ensemble_id', eid)
          .order('sort_order')
        if (data?.length) setSections((data as { name: string }[]).map(s => s.name))
      } catch { /* keep defaults */ }
    }
    void loadSections()
  }, [])

  const { setDirty, clearDirty } = useDirtyState()

  const handleSave = useCallback(() => {
    setSaved(true)
    setEditing(false)
    clearDirty()
    setTimeout(() => setSaved(false), 2500)
  }, [clearDirty])

  function startEditing() {
    setEditing(true)
    setDirty(true, handleSave)
  }

  function cancelEditing() {
    setEditing(false)
    clearDirty()
    setForm({
      first_name: member.first_name, last_name: member.last_name,
      email: member.email, phone: member.phone ?? '',
      section: member.section, level: member.level as MemberLevel,
      role: member.role,
    })
  }

  const thresholdPct = policy?.max_absences
    ? Math.min(100, Math.round(((summary?.absent_unexcused ?? 0) / policy.max_absences) * 100))
    : 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title={`${member.first_name} ${member.last_name}`} subtitle={`${member.section} · ${getLevelLabel(member.level)}`} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard/members" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors">
            <ArrowLeft size={14} /> All Members
          </Link>
          <div className="flex gap-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                <CheckCircle size={12} /> Saved
              </span>
            )}
            {editing ? (
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Save size={14} /> Save Changes
              </button>
            ) : (
              <button onClick={startEditing} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                <Edit3 size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Profile card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white text-lg font-bold flex items-center justify-center shrink-0">
                {member.first_name[0]}{member.last_name[0]}
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">{member.first_name} {member.last_name}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded border', getLevelBadgeClasses(member.level))}>
                    {getLevelLabel(member.level)}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">{member.role.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
                    <input value={form.first_name} onChange={e => setForm(f => ({...f, first_name: e.target.value}))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
                    <input value={form.last_name} onChange={e => setForm(f => ({...f, last_name: e.target.value}))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Section</label>
                  <select value={form.section} onChange={e => setForm(f => ({...f, section: e.target.value}))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Level</label>
                  <select value={form.level} onChange={e => setForm(f => ({...f, level: Number(e.target.value) as MemberLevel}))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {policies.map(p => (
                      <option key={p.level} value={p.level}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value as typeof form.role}))} className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="member">Member</option>
                    <option value="section_leader">Section Leader</option>
                    <option value="director">Director</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <a href={`mailto:${member.email}`} className="hover:text-teal-600 truncate">{member.email}</a>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                  <p><span className="text-slate-400">Section:</span> {member.section}</p>
                  <p><span className="text-slate-400">Member since:</span> {formatDate(member.created_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Attendance stats */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary stats */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Attendance Rate', value: `${summary.attendance_pct}%`, color: summary.attendance_pct >= 80 ? 'text-green-600' : summary.attendance_pct >= 60 ? 'text-amber-600' : 'text-red-600' },
                  { label: 'Unexcused Absences', value: summary.absent_unexcused, color: 'text-red-600' },
                  { label: 'Excused Absences', value: summary.absent_excused, color: 'text-blue-600' },
                  { label: 'Partial Attendance', value: summary.partial, color: 'text-yellow-600' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                    <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Threshold status */}
            {policy && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{policy.label}</p>
                    <p className="text-xs text-slate-400">{policy.description}</p>
                  </div>
                  {summary && (
                    <span className={cn('text-xs font-medium px-2 py-1 rounded-full border', getThresholdStatusClasses(summary.threshold_status))}>
                      {getThresholdStatusLabel(summary.threshold_status)}
                    </span>
                  )}
                </div>
                {policy.max_absences !== null && (
                  <>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{summary?.absent_unexcused ?? 0} unexcused absences</span>
                      <span>Limit: {policy.max_absences}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', thresholdPct >= 100 ? 'bg-red-500' : thresholdPct >= 66 ? 'bg-amber-400' : 'bg-green-500')}
                        style={{ width: `${thresholdPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {policy.warning_threshold !== null && `Warning at ${policy.warning_threshold} · `}
                      {policy.final_notice_threshold !== null && `Final notice at ${policy.final_notice_threshold}`}
                    </p>
                  </>
                )}
                {policy.max_absences === null && (
                  <p className="text-xs text-slate-400 mt-1">No formal absence limit for this level.</p>
                )}
              </div>
            )}

            {/* Attendance history */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Attendance History</h3>
              </div>
              {history.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-400 text-center">No attendance logged yet</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {history.map(h => (
                    <div key={h.id} className="px-5 py-3 flex items-center gap-3">
                      <div className={cn('w-2 h-2 rounded-full shrink-0', getAttendanceDotColor(h.status))} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{h.event?.name}</p>
                        {h.note && <p className="text-xs text-slate-400 italic truncate">"{h.note}"</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-slate-600">{ATTENDANCE_LABELS[h.status]}</p>
                        <p className="text-xs text-slate-400">{h.event ? formatDate(h.event.date) : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
