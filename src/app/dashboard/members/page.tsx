'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  Plus,
  X,
  UserCircle,
  Pencil,
  ChevronDown,
  Users,
  Loader2,
} from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { cn, getLevelBadgeClasses, getLevelLabel } from '@/lib/utils'
import { MOCK_MEMBERS, MOCK_USERS } from '@/lib/mock-data'
import { DEFAULT_SECTIONS } from '@/types'
import type { Member, MemberLevel, Role } from '@/types'

const ROLE_LABELS: Record<Role, string> = {
  director: 'Director',
  section_leader: 'Section Leader',
  member: 'Member',
}

const ROLE_BADGE: Record<Role, string> = {
  director: 'bg-teal-100 text-teal-800 border-teal-200',
  section_leader: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  member: 'bg-slate-100 text-slate-600 border-slate-200',
}

function getLevelShortLabel(level: MemberLevel): string {
  switch (level) {
    case 1: return 'L1'
    case 2: return 'L2'
    case 3: return 'L3'
  }
}

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  section: 'Trumpet',
  level: '1',
  role: 'member',
}

function MembersContent() {
  const params = useSearchParams()
  const [search, setSearch] = useState('')
  const [sectionFilter, setSectionFilter] = useState('All')
  const [levelFilter, setLevelFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showModal, setShowModal] = useState(params.get('add') === '1')
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS)

  // Load real members from Supabase if connected
  useEffect(() => {
    async function load() {
      try {
        const { isSupabaseConfigured } = await import('@/lib/auth/mock-auth')
        if (!isSupabaseConfigured()) return
        const { createClient } = await import('@/lib/supabase/client')
        const { data } = await createClient()
          .from('members')
          .select('*')
          .eq('active', true)
          .order('last_name')
        if (data?.length) setMembers(data as Member[])
      } catch { /* keep mock data */ }
    }
    void load()
  }, [])

  const filtered = useMemo(() => {
    return members.filter(m => {
      const name = `${m.first_name} ${m.last_name}`.toLowerCase()
      const matchSearch =
        !search || name.includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
      const matchSection = sectionFilter === 'All' || m.section === sectionFilter
      const matchLevel = levelFilter === 'All' || m.level === Number(levelFilter)
      const matchRole = roleFilter === 'All' || m.role === roleFilter
      return matchSearch && matchSection && matchLevel && matchRole
    })
  }, [members, search, sectionFilter, levelFilter, roleFilter])

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const { isSupabaseConfigured } = await import('@/lib/auth/mock-auth')
      if (isSupabaseConfigured()) {
        const { createClient } = await import('@/lib/supabase/client')
        const sb = createClient()

        // Insert member row (auth_user_id nullable — set when they first log in)
        const { data: newMember, error: insertErr } = await sb
          .from('members')
          .insert({
            first_name: form.first_name,
            last_name:  form.last_name,
            email:      form.email,
            phone:      form.phone || null,
            section:    form.section,
            level:      Number(form.level) as MemberLevel,
            role:       form.role as Role,
            active:     true,
          })
          .select('*')
          .single()

        if (insertErr) throw new Error(insertErr.message)

        // Also add to ensemble_members for the first ensemble
        if (newMember) {
          const { data: ensembles } = await sb.from('ensembles').select('id').limit(1)
          const eid = (ensembles as { id: string }[] | null)?.[0]?.id
          if (eid) {
            await sb.from('ensemble_members').insert({
              ensemble_id: eid,
              member_id:   (newMember as Member).id,
              section:     form.section,
              level:       Number(form.level),
              role:        form.role,
              active:      true,
            }).throwOnError()
          }
          setMembers(prev => [...prev, newMember as Member])
        }
      } else {
        // Mock mode: add locally
        const mockNew: Member = {
          id:             `mock-${Date.now()}`,
          first_name:     form.first_name,
          last_name:      form.last_name,
          email:          form.email,
          phone:          form.phone || undefined,
          section:        form.section,
          level:          Number(form.level) as MemberLevel,
          role:           form.role as Role,
          active:         true,
          backup_enabled: true,
          created_at:     new Date().toISOString(),
        }
        setMembers(prev => [...prev, mockNew])
      }
      setShowModal(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add member.')
    } finally {
      setSubmitting(false)
    }
  }

  const notifCount = MOCK_USERS.filter(u => u.type === 'person' && u.role !== 'admin').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav
        title="Members"
        subtitle={`Happy Valley Brass Band · ${members.length} member${members.length !== 1 ? 's' : ''}`}
        badge={notifCount}
      />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-0 sm:max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
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

            {/* Level */}
            <div className="relative">
              <select
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="1">L1 — Elite</option>
                <option value="2">L2 — Standard</option>
                <option value="3">L3 — Developmental</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Role */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="director">Director</option>
                <option value="section_leader">Section Leader</option>
                <option value="member">Member</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            <Plus size={15} />
            Add Member
          </button>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2">
          <Users size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500">
            {filtered.length} member{filtered.length !== 1 ? 's' : ''} shown
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Section</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Level</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                      No members match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-semibold text-xs shrink-0">
                            {member.first_name[0]}{member.last_name[0]}
                          </div>
                          <span className="font-medium text-slate-800">
                            {member.first_name} {member.last_name}
                          </span>
                        </div>
                      </td>

                      {/* Section */}
                      <td className="px-4 py-3 text-slate-600">{member.section}</td>

                      {/* Level badge */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                            getLevelBadgeClasses(member.level)
                          )}
                          title={getLevelLabel(member.level)}
                        >
                          {getLevelShortLabel(member.level)}
                        </span>
                      </td>

                      {/* Role badge */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            ROLE_BADGE[member.role]
                          )}
                        >
                          {ROLE_LABELS[member.role]}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-xs">
                        {member.email}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                            member.active
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              member.active ? 'bg-green-500' : 'bg-slate-400'
                            )}
                          />
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/members/${member.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            <UserCircle size={12} />
                            View
                          </Link>
                          <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors">
                            <Pencil size={12} />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Add New Member</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="first_name"
                    type="text"
                    required
                    value={form.first_name}
                    onChange={handleFormChange}
                    placeholder="James"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="last_name"
                    type="text"
                    required
                    value={form.last_name}
                    onChange={handleFormChange}
                    placeholder="Carter"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="james.carter@email.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="623-555-0100"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Section</label>
                  <div className="relative">
                    <select
                      name="section"
                      value={form.section}
                      onChange={handleFormChange}
                      className="appearance-none w-full px-3 pr-7 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      {DEFAULT_SECTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Level</label>
                  <div className="relative">
                    <select
                      name="level"
                      value={form.level}
                      onChange={handleFormChange}
                      className="appearance-none w-full px-3 pr-7 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      <option value="1">L1 — Elite</option>
                      <option value="2">L2 — Standard</option>
                      <option value="3">L3 — Developmental</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Role</label>
                  <div className="relative">
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleFormChange}
                      className="appearance-none w-full px-3 pr-7 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      <option value="director">Director</option>
                      <option value="section_leader">Section Leader</option>
                      <option value="member">Member</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {submitError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{submitError}</p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSubmitError('') }}
                  className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-70"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {submitting ? 'Adding…' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MembersPage() {
  return (
    <Suspense>
      <MembersContent />
    </Suspense>
  )
}
