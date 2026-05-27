'use client'

import Link from 'next/link'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  CalendarDays,
  ShieldCheck,
  Music2,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'
import { AppFooter } from '@/components/layout/AppFooter'
import { cn, formatDate, getLevelBadgeClasses, getLevelLabel, getThresholdStatusClasses, getThresholdStatusLabel } from '@/lib/utils'
import {
  MOCK_MEMBERS,
  MOCK_EVENTS,
  MOCK_ATTENDANCE,
  MOCK_SUMMARIES,
  MOCK_LEVEL_POLICIES,
} from '@/lib/mock-data'
import type { AttendanceStatus } from '@/types'
import { EVENT_TYPE_LABELS, ATTENDANCE_LABELS } from '@/types'

// Demo: use James Carter (m1) as the logged-in member
const DEMO_MEMBER = MOCK_MEMBERS[0]

function getStatusIcon(status: AttendanceStatus) {
  switch (status) {
    case 'present': return <CheckCircle2 size={15} className="text-green-500" />
    case 'partial':  return <MinusCircle size={15} className="text-yellow-400" />
    case 'absent':   return <XCircle size={15} className="text-red-500" />
    case 'excused':  return <CheckCircle2 size={15} className="text-blue-400" />
  }
}

function getStatusDot(status: AttendanceStatus) {
  const colors: Record<AttendanceStatus, string> = {
    present: 'bg-green-500',
    partial: 'bg-yellow-400',
    absent: 'bg-red-500',
    excused: 'bg-blue-400',
  }
  return <span className={cn('w-2 h-2 rounded-full shrink-0 inline-block', colors[status])} />
}

export default function MemberPage() {
  const member = DEMO_MEMBER

  // Find this member's summary
  const summary = MOCK_SUMMARIES.find(s => s.member_id === member.id) ?? {
    total_events: 12,
    present: 12,
    partial: 0,
    absent_unexcused: 0,
    absent_excused: 0,
    attendance_pct: 100,
    threshold_status: 'ok' as const,
  }

  // Level policy for this member
  const policy = MOCK_LEVEL_POLICIES.find(p => p.level === member.level)

  // Attendance records for this member (last 8 events)
  const myRecords = MOCK_ATTENDANCE
    .filter(a => a.member_id === member.id)
    .slice(0, 8)

  // Build event lookup
  const eventMap = Object.fromEntries(MOCK_EVENTS.map(e => [e.id, e]))

  // All recent events (last 8) — pad with "not recorded" if no record
  const recentEvents = MOCK_EVENTS.slice(0, 8)

  // Upcoming events (future or current — compare to demo date 2026-05-19)
  const today = '2026-05-19'
  const upcoming = MOCK_EVENTS.filter(e => e.date >= today).slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 lg:px-8 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <Music2 size={16} className="text-white" />
          </div>
          <div>
            <span className="text-white text-sm font-semibold">Ensemble Trackr</span>
            <span className="hidden sm:inline text-slate-500 text-xs ml-2">Happy Valley Brass Band</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            <LayoutDashboard size={13} />
            Director View
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            <LogOut size={13} />
            Sign Out
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 lg:px-8 py-6 max-w-4xl mx-auto w-full space-y-5">
        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Welcome back, {member.first_name}!
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {member.section} · {getLevelLabel(member.level)}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border mt-1',
              getLevelBadgeClasses(member.level)
            )}
          >
            {getLevelLabel(member.level)}
          </span>
        </div>

        {/* Attendance stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Attendance rate */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-500 font-medium mb-1">Attendance Rate</p>
            <p
              className={cn(
                'text-3xl font-bold',
                summary.attendance_pct >= 90
                  ? 'text-green-600'
                  : summary.attendance_pct >= 75
                  ? 'text-amber-500'
                  : 'text-red-500'
              )}
            >
              {summary.attendance_pct}%
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Spring Trimester 2026</p>
          </div>

          {/* Absences */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Unexcused Absences</p>
            <p
              className={cn(
                'text-3xl font-bold',
                summary.absent_unexcused === 0
                  ? 'text-slate-700'
                  : summary.absent_unexcused <= 1
                  ? 'text-amber-500'
                  : 'text-red-500'
              )}
            >
              {summary.absent_unexcused}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">This trimester</p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Standing</p>
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border mt-1',
                getThresholdStatusClasses(summary.threshold_status)
              )}
            >
              {getThresholdStatusLabel(summary.threshold_status)}
            </span>
          </div>

          {/* Events attended */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Events Attended</p>
            <p className="text-3xl font-bold text-slate-700">{summary.present}</p>
            <p className="text-xs text-slate-400 mt-0.5">of {summary.total_events} total</p>
          </div>
        </div>

        {/* Level policy */}
        {policy && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={15} className="text-teal-600" />
              <h2 className="text-sm font-semibold text-slate-700">Your Level Policy</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{policy.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{policy.description}</p>
              </div>
              <div className="flex gap-4 shrink-0">
                {policy.max_absences !== null ? (
                  <>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800">{policy.max_absences}</p>
                      <p className="text-xs text-slate-500">Max Absences</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-amber-600">{policy.warning_threshold}</p>
                      <p className="text-xs text-slate-500">Warning At</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{policy.final_notice_threshold}</p>
                      <p className="text-xs text-slate-500">Final Notice</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs font-semibold text-purple-700">No formal absence limit</p>
                    <p className="text-xs text-purple-500">Elite commitment expected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar (only for levels with thresholds) */}
            {policy.max_absences !== null && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Absence progress</span>
                  <span className="text-xs text-slate-500">
                    {summary.absent_unexcused} / {policy.max_absences} used
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      summary.absent_unexcused === 0
                        ? 'bg-green-500'
                        : summary.absent_unexcused < (policy.warning_threshold ?? 99)
                        ? 'bg-green-400'
                        : summary.absent_unexcused < (policy.max_absences ?? 99)
                        ? 'bg-amber-400'
                        : 'bg-red-500'
                    )}
                    style={{
                      width: `${Math.min(100, (summary.absent_unexcused / policy.max_absences) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent attendance history */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-700">Recent Attendance</h2>
            </div>
            <span className="text-xs text-slate-400">Last {recentEvents.length} events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Event</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden sm:table-cell">Type</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEvents.map(event => {
                  const record = MOCK_ATTENDANCE.find(
                    a => a.event_id === event.id && a.member_id === member.id
                  )
                  const status: AttendanceStatus = record?.status ?? 'absent'
                  const isRecorded = !!record

                  return (
                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{event.name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-slate-500 text-xs">
                        {EVENT_TYPE_LABELS[event.type]}
                      </td>
                      <td className="px-4 py-3">
                        {isRecorded ? (
                          <div className="flex items-center gap-1.5">
                            {getStatusDot(status)}
                            <span
                              className={cn(
                                'text-xs font-medium',
                                status === 'present' && 'text-green-700',
                                status === 'partial' && 'text-yellow-600',
                                status === 'absent' && 'text-red-600',
                                status === 'excused' && 'text-blue-600',
                              )}
                            >
                              {ATTENDANCE_LABELS[status]}
                            </span>
                            {record?.note && (
                              <span className="text-xs text-slate-400 hidden md:inline">
                                — {record.note}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not recorded</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <CalendarDays size={14} className="text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-700">Upcoming Events</h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400 text-center">No upcoming events scheduled.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming.map(event => (
                <div key={event.id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                    <CalendarDays size={16} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{event.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(event.date)} · {EVENT_TYPE_LABELS[event.type]}
                    </p>
                    {event.notes && (
                      <p className="text-xs text-slate-400 mt-1 truncate">{event.notes}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                    {formatDate(event.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
