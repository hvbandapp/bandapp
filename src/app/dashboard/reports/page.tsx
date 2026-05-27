'use client'

import { useState } from 'react'
import {
  Download,
  ChevronDown,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Users,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { TopNav } from '@/components/layout/TopNav'
import {
  cn,
  getLevelBadgeClasses,
  getLevelLabel,
  getThresholdStatusClasses,
  getThresholdStatusLabel,
} from '@/lib/utils'
import {
  MOCK_SUMMARIES,
  MOCK_SECTION_SUMMARIES,
  MOCK_PERIOD,
  MOCK_NOTIFICATIONS,
} from '@/lib/mock-data'
import { DEFAULT_SECTIONS } from '@/types'

const SECTION_COLORS: Record<string, string> = {
  Trumpet: '#0d9488',
  Trombone: '#2563eb',
  Euphonium: '#7c3aed',
  Tuba: '#d97706',
  Percussion: '#db2777',
}

function getLevelShortLabel(level: number): string {
  switch (level) {
    case 1: return 'L1'
    case 2: return 'L2'
    case 3: return 'L3'
    default: return '—'
  }
}

function PctBar({ pct }: { pct: number }) {
  const color =
    pct >= 90
      ? 'bg-green-500'
      : pct >= 75
      ? 'bg-amber-400'
      : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-10 text-right">{pct}%</span>
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState(MOCK_PERIOD.label)
  const [eventTypeFilter, setEventTypeFilter] = useState('All')
  const [sectionFilter, setSectionFilter] = useState('All')
  const [toastVisible, setToastVisible] = useState(false)

  const filtered = MOCK_SUMMARIES.filter(s => {
    const matchSection = sectionFilter === 'All' || s.section === sectionFilter
    return matchSection
  })

  // Derived stats
  const totalEvents = filtered.length > 0 ? filtered[0].total_events : 0
  const avgAttendance =
    filtered.length > 0
      ? Math.round(filtered.reduce((sum, s) => sum + s.attendance_pct, 0) / filtered.length)
      : 0
  const totalAbsences = filtered.reduce((sum, s) => sum + s.absent_unexcused, 0)
  const atRisk = filtered.filter(s => s.threshold_status === 'warning' || s.threshold_status === 'final_notice' || s.threshold_status === 'exceeded').length

  function handleExport() {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  const notifBadge = MOCK_NOTIFICATIONS.filter(n => n.type === 'final_notice').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav
        title="Reports"
        subtitle="Attendance analytics and export"
        badge={notifBadge}
      />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-5">
        {/* Toast */}
        {toastVisible && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
            <Download size={14} />
            CSV export would download here in production.
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Period */}
            <div className="relative">
              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option>{MOCK_PERIOD.label}</option>
                <option>Fall Trimester 2025</option>
                <option>Summer Trimester 2025</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Event type */}
            <div className="relative">
              <select
                value={eventTypeFilter}
                onChange={e => setEventTypeFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="All">All Event Types</option>
                <option value="rehearsal">Rehearsal</option>
                <option value="sunday_service">Sunday Service</option>
                <option value="concert">Concert</option>
                <option value="funeral">Funeral</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Section */}
            <div className="relative">
              <select
                value={sectionFilter}
                onChange={e => setSectionFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="All">All Sections</option>
                {DEFAULT_SECTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500 font-medium">Overall Attendance</p>
              <TrendingUp size={15} className="text-teal-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{avgAttendance}%</p>
            <p className="text-xs text-slate-400 mt-0.5">{period}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500 font-medium">Total Events</p>
              <Calendar size={15} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{totalEvents}</p>
            <p className="text-xs text-slate-400 mt-0.5">This trimester</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500 font-medium">Total Absences</p>
              <AlertTriangle size={15} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{totalAbsences}</p>
            <p className="text-xs text-slate-400 mt-0.5">Unexcused only</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500 font-medium">Members at Risk</p>
              <Users size={15} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{atRisk}</p>
            <p className="text-xs text-slate-400 mt-0.5">Warning or above</p>
          </div>
        </div>

        {/* Member attendance table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Member Attendance Detail</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden sm:table-cell">Section</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden md:table-cell">Level</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">Events</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">Present</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3 hidden lg:table-cell">Partial</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">Unexcused</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3 hidden lg:table-cell">Excused</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 min-w-[140px]">Attendance %</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-slate-400 text-sm">
                      No data for selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.member_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{s.member_name}</td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{s.section}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                            getLevelBadgeClasses(s.level)
                          )}
                          title={getLevelLabel(s.level)}
                        >
                          {getLevelShortLabel(s.level)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-slate-700">{s.total_events}</td>
                      <td className="px-3 py-3 text-center text-green-700 font-medium">{s.present}</td>
                      <td className="px-3 py-3 text-center text-yellow-600 hidden lg:table-cell">{s.partial}</td>
                      <td className="px-3 py-3 text-center text-red-600 font-medium">{s.absent_unexcused}</td>
                      <td className="px-3 py-3 text-center text-blue-500 hidden lg:table-cell">{s.absent_excused}</td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <PctBar pct={s.attendance_pct} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border',
                            getThresholdStatusClasses(s.threshold_status)
                          )}
                        >
                          {getThresholdStatusLabel(s.threshold_status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom row: section chart + section table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Section Attendance Comparison</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={MOCK_SECTION_SUMMARIES}
                margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
                barSize={28}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="section"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Avg Attendance']}
                  contentStyle={{
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="avg_attendance_pct" radius={[4, 4, 0, 0]}>
                  {MOCK_SECTION_SUMMARIES.map(entry => (
                    <Cell
                      key={entry.section}
                      fill={SECTION_COLORS[entry.section] ?? '#0d9488'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Section summary table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Section Summary</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Section</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">Members</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Avg Attendance</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">Absences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_SECTION_SUMMARIES.map(s => (
                  <tr key={s.section} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: SECTION_COLORS[s.section] ?? '#0d9488' }}
                        />
                        <span className="font-medium text-slate-800">{s.section}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{s.total_members}</td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <PctBar pct={s.avg_attendance_pct} />
                    </td>
                    <td className="px-4 py-3 text-center text-red-600 font-medium">{s.total_absences}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
