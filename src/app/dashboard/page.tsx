'use client'

import Link from 'next/link'
import {
  Users, CalendarDays, TrendingUp, AlertTriangle,
  ChevronRight, Music2, CheckCircle2, Clock, XCircle
} from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { cn, formatDate, getThresholdStatusClasses, getThresholdStatusLabel, getLevelBadgeClasses, getLevelLabel } from '@/lib/utils'
import {
  MOCK_MEMBERS, MOCK_EVENTS, MOCK_SUMMARIES,
  MOCK_SECTION_SUMMARIES, MOCK_NOTIFICATIONS, MOCK_PERIOD
} from '@/lib/mock-data'

const alertMembers = MOCK_SUMMARIES.filter(s => s.threshold_status !== 'ok')

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', color)}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  rehearsal:     'bg-teal-100 text-teal-700',
  sunday_service: 'bg-purple-100 text-purple-700',
  funeral:       'bg-slate-100 text-slate-600',
  concert:       'bg-amber-100 text-amber-700',
  custom:        'bg-blue-100 text-blue-700',
}
const EVENT_TYPE_LABELS: Record<string, string> = {
  rehearsal:     'Rehearsal',
  sunday_service: 'Sunday Service',
  funeral:       'Funeral',
  concert:       'Concert',
  custom:        'Custom',
}

export default function DashboardPage() {
  const recentEvents   = [...MOCK_EVENTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const overallPct     = MOCK_SUMMARIES.length > 0
    ? Math.round(MOCK_SUMMARIES.reduce((sum, s) => sum + s.attendance_pct, 0) / MOCK_SUMMARIES.length)
    : 0
  const activeMembers  = MOCK_MEMBERS.filter(m => m.active).length
  const alertCount     = alertMembers.length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title="Dashboard" subtitle={MOCK_PERIOD.label} badge={alertCount} />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}       label="Active Members"    value={activeMembers}  sub={`${MOCK_MEMBERS.length} total`}  color="bg-teal-600" />
          <StatCard icon={TrendingUp}  label="Overall Attendance" value={`${overallPct}%`} sub={MOCK_PERIOD.label}           color="bg-blue-600" />
          <StatCard icon={CalendarDays} label="Events This Period" value={MOCK_EVENTS.length} sub="Across all types"         color="bg-violet-600" />
          <StatCard icon={AlertTriangle} label="Absence Alerts"   value={alertCount}    sub="Members at or near limit"       color="bg-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Absence Alert Queue */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500" />
                <h2 className="text-sm font-semibold text-slate-800">Absence Alert Queue</h2>
              </div>
              <Link href="/dashboard/reports" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            {alertMembers.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">No alerts — all members in good standing</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {alertMembers.map(s => (
                  <div key={s.member_id} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <Link href={`/dashboard/members/${s.member_id}`} className="text-sm font-medium text-slate-800 hover:text-teal-600 truncate block">
                        {s.member_name}
                      </Link>
                      <p className="text-xs text-slate-400">{s.section} · {getLevelLabel(s.level)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-700">{s.absent_unexcused} unexcused</p>
                        <p className="text-xs text-slate-400">{s.attendance_pct}% attendance</p>
                      </div>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', getThresholdStatusClasses(s.threshold_status))}>
                        {getThresholdStatusLabel(s.threshold_status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Snapshot */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music2 size={15} className="text-teal-600" />
                <h2 className="text-sm font-semibold text-slate-800">Section Snapshot</h2>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {MOCK_SECTION_SUMMARIES.map(s => (
                <div key={s.section} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{s.section}</span>
                    <span className="text-sm font-bold text-slate-800">{s.avg_attendance_pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', s.avg_attendance_pct >= 85 ? 'bg-green-500' : s.avg_attendance_pct >= 70 ? 'bg-amber-400' : 'bg-red-500')}
                      style={{ width: `${s.avg_attendance_pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.total_members} members · {s.total_absences} absences</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="text-teal-600" />
              <h2 className="text-sm font-semibold text-slate-800">Recent Events</h2>
            </div>
            <Link href="/dashboard/events" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentEvents.map(event => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors block"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0', EVENT_TYPE_COLORS[event.type] ?? 'bg-slate-100 text-slate-600')}>
                    {EVENT_TYPE_LABELS[event.type] ?? event.custom_type ?? 'Event'}
                  </span>
                  <span className="text-sm font-medium text-slate-800 truncate">{event.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400">{formatDate(event.date)}</span>
                  <ChevronRight size={13} className="text-slate-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent notifications */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Recent Notifications Sent</h2>
            <Link href="/dashboard/notifications" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {MOCK_NOTIFICATIONS.slice(0, 3).map(n => (
              <div key={n.id} className="px-5 py-3 flex items-center gap-3">
                {n.delivered ? (
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                ) : (
                  <Clock size={14} className="text-amber-400 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 truncate">{n.subject}</p>
                  <p className="text-xs text-slate-400">{n.member_name} · {formatDate(n.sent_at)}</p>
                </div>
                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0',
                  n.triggered_by === 'auto' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500')}>
                  {n.triggered_by === 'auto' ? 'Auto' : 'Manual'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
