'use client'

import { useState } from 'react'
import {
  ShieldCheck, User, Server, ToggleLeft, ToggleRight,
  Trash2, UserPlus, AlertTriangle, Mail, Clock
} from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { cn, formatDate, formatDateTime } from '@/lib/utils'
import { MOCK_USERS } from '@/lib/mock-data'
import type { UserAccount } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  admin:           'Admin',
  director:        'Director',
  section_leader:  'Section Leader',
  member:          'Member',
  service_account: 'Service Account',
}

const ROLE_COLORS: Record<string, string> = {
  admin:           'bg-teal-100 text-teal-700 border-teal-200',
  director:        'bg-purple-100 text-purple-700 border-purple-200',
  section_leader:  'bg-blue-100 text-blue-700 border-blue-200',
  member:          'bg-slate-100 text-slate-600 border-slate-200',
  service_account: 'bg-amber-100 text-amber-700 border-amber-200',
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function toggleActive(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))
  }

  function handleDelete(id: string) {
    setUsers(prev => prev.filter(u => u.id !== id))
    setConfirmDelete(null)
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    const newUser: UserAccount = {
      id:         `u${Date.now()}`,
      email:      inviteEmail,
      name:       inviteEmail.split('@')[0],
      role:       inviteRole as UserAccount['role'],
      type:       'person',
      active:     false,
      created_at: new Date().toISOString(),
    }
    setUsers(prev => [...prev, newUser])
    setInviteEmail('')
    setInviteRole('member')
    setShowInvite(false)
  }

  const people   = users.filter(u => u.type === 'person')
  const services = users.filter(u => u.type === 'service_account')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title="Users & Permissions" subtitle="All accounts with system access" />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

        {/* Info banner */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <ShieldCheck size={16} className="text-teal-600 mt-0.5 shrink-0" />
          <p className="text-xs text-teal-800 leading-relaxed">
            This dashboard shows every person, role, and service account with access to Ensemble Trackr.
            Admin accounts can view all data, manage members, and block or remove users.
          </p>
        </div>

        {/* Invite button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <UserPlus size={15} />
            Invite User
          </button>
        </div>

        {/* Invite panel */}
        {showInvite && (
          <div className="bg-white rounded-xl border border-teal-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Send Invite</h3>
            <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                <input
                  required type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="member@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="member">Member</option>
                  <option value="section_leader">Section Leader</option>
                  <option value="director">Director</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowInvite(false)} className="px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <Mail size={13} /> Send Invite
                </button>
              </div>
            </form>
            <p className="text-xs text-slate-400 mt-3">An invitation email will be sent. All invited users consent to platform terms before accessing the app.</p>
          </div>
        )}

        {/* People */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <User size={15} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">People</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{people.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {people.map(user => (
              <div key={user.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 text-sm font-bold flex items-center justify-center shrink-0">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{user.name}</span>
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', ROLE_COLORS[user.role])}>
                      {ROLE_LABELS[user.role]}
                    </span>
                    {!user.active && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                  {user.last_login && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> Last login {formatDateTime(user.last_login)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(user.id)}
                    className={cn('transition-colors', user.active ? 'text-teal-500 hover:text-teal-700' : 'text-slate-300 hover:text-slate-500')}
                    title={user.active ? 'Deactivate user' : 'Activate user'}
                  >
                    {user.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  {user.role !== 'admin' && (
                    confirmDelete === user.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-600">Confirm?</span>
                        <button onClick={() => handleDelete(user.id)} className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded transition-colors">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-xs text-slate-500 hover:text-slate-700">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(user.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="Remove user"
                      >
                        <Trash2 size={15} />
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service accounts */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Server size={15} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">Service Accounts & Integrations</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{services.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {services.map(svc => (
              <div key={svc.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                  {(svc.service_name ?? 'SVC').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{svc.name}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-amber-100 text-amber-700 border-amber-200">
                      Integration
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{svc.email}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500">
            This list reflects all active and invited accounts. Developer infrastructure access is managed separately and does not appear here.
          </p>
        </div>

      </div>
    </div>
  )
}
