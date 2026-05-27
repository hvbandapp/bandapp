'use client'

import { useState, Fragment } from 'react'
import {
  Bell,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Send,
  Megaphone,
  ChevronRight,
  Info,
} from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { cn, formatDateTime } from '@/lib/utils'
import { MOCK_NOTIFICATIONS, MOCK_MEMBERS } from '@/lib/mock-data'
import { DEFAULT_SECTIONS } from '@/types'
import type { SentNotification } from '@/types'

type NotifType = SentNotification['type']

const TYPE_LABEL: Record<NotifType, string> = {
  warning: 'Warning',
  final_notice: 'Final Notice',
  announcement: 'Announcement',
  event_reminder: 'Event Reminder',
}

const TYPE_BADGE: Record<NotifType, string> = {
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  final_notice: 'bg-red-100 text-red-800 border-red-200',
  announcement: 'bg-blue-100 text-blue-800 border-blue-200',
  event_reminder: 'bg-teal-100 text-teal-800 border-teal-200',
}

const TRIGGERED_BADGE: Record<'auto' | 'manual', string> = {
  auto: 'bg-slate-100 text-slate-600 border-slate-200',
  manual: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<'log' | 'send'>('log')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // Send form state
  const [toType, setToType] = useState<'all' | 'section' | 'individual'>('all')
  const [toSection, setToSection] = useState('Trumpet')
  const [toMember, setToMember] = useState(MOCK_MEMBERS[0].id)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setSubject('')
      setMessage('')
      setTimeout(() => setSent(false), 3000)
    }, 1400)
  }

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.delivered).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav
        title="Notifications"
        subtitle="Automated and manual communications"
        badge={unreadCount}
      />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('log')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
              tab === 'log'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Bell size={14} />
              Log
            </span>
          </button>
          <button
            onClick={() => setTab('send')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
              tab === 'send'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Megaphone size={14} />
              Send Announcement
            </span>
          </button>
        </div>

        {/* ── LOG TAB ── */}
        {tab === 'log' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Notification History</h2>
              <span className="text-xs text-slate-400">{MOCK_NOTIFICATIONS.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Member</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Subject</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden sm:table-cell">Triggered By</th>
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Delivered</th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_NOTIFICATIONS.map(n => (
                    <Fragment key={n.id}>
                      <tr
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}
                      >
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {formatDateTime(n.sent_at)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                          {n.member_name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border',
                              TYPE_BADGE[n.type]
                            )}
                          >
                            {TYPE_LABEL[n.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                          {n.subject}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span
                            className={cn(
                              'inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize',
                              TRIGGERED_BADGE[n.triggered_by]
                            )}
                          >
                            {n.triggered_by}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {n.delivered ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <XCircle size={16} className="text-red-400" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight
                            size={14}
                            className={cn(
                              'text-slate-400 transition-transform',
                              expandedRow === n.id && 'rotate-90'
                            )}
                          />
                        </td>
                      </tr>

                      {/* Expanded message row */}
                      {expandedRow === n.id && (
                        <tr key={`${n.id}-expanded`} className="bg-slate-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                Message Body
                              </p>
                              <p className="text-sm text-slate-700 leading-relaxed">{n.message}</p>
                              <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                                <span>To: {n.member_email === 'all' ? 'All Members (BCC)' : n.member_email}</span>
                                <span>·</span>
                                <span>Sent: {formatDateTime(n.sent_at)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SEND TAB ── */}
        {tab === 'send' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700">Compose Announcement</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sent via email. All announcements are BCC'd and logged automatically.
                </p>
              </div>

              {sent && (
                <div className="mx-5 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 size={15} />
                  Announcement sent and logged successfully.
                </div>
              )}

              <form onSubmit={handleSend} className="px-5 py-5 space-y-5">
                {/* To */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">
                    Send To <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {(['all', 'section', 'individual'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setToType(t)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                          toType === t
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
                        )}
                      >
                        {t === 'all' ? 'All Members' : t === 'section' ? 'By Section' : 'Individual'}
                      </button>
                    ))}
                  </div>

                  {toType === 'section' && (
                    <div className="relative w-56">
                      <select
                        value={toSection}
                        onChange={e => setToSection(e.target.value)}
                        className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      >
                        {DEFAULT_SECTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )}

                  {toType === 'individual' && (
                    <div className="relative w-72">
                      <select
                        value={toMember}
                        onChange={e => setToMember(e.target.value)}
                        className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      >
                        {MOCK_MEMBERS.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.first_name} {m.last_name} — {m.section}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Spring Concert — Reminder for Saturday"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Write your announcement here…"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* BCC note */}
                <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                  <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">
                    All recipients are BCC'd for privacy. This message will be recorded in the notification log with a <strong>manual</strong> trigger tag.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={sending || sent}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
                  >
                    <Send size={14} />
                    {sending ? 'Sending…' : sent ? 'Sent!' : 'Send Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
