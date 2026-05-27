'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard, Users, CalendarDays, BarChart3,
  Bell, ShieldCheck, Settings, LogOut, ChevronRight, Music2,
  ChevronsUpDown, Check, Plus, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDirtyState } from '@/lib/dirty-state'
import { useGroup } from '@/lib/group-context'
import { AppFooter } from './AppFooter'

const NAV_ITEMS = [
  { href: '/dashboard',               label: 'Overview',            icon: LayoutDashboard, exact: true },
  { href: '/dashboard/members',       label: 'Members',             icon: Users },
  { href: '/dashboard/events',        label: 'Events',              icon: CalendarDays },
  { href: '/dashboard/reports',       label: 'Reports',             icon: BarChart3 },
  { href: '/dashboard/notifications', label: 'Notifications',       icon: Bell },
  { href: '/dashboard/users',         label: 'Users & Permissions', icon: ShieldCheck },
  { href: '/dashboard/settings',      label: 'Settings',            icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname              = usePathname()
  const router                = useRouter()
  const { requestNavigation } = useDirtyState()
  const { groups, activeGroup, setActiveGroupId, createGroup } = useGroup()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [createOpen,   setCreateOpen]   = useState(false)
  const [newName,      setNewName]      = useState('')
  const [newDesc,      setNewDesc]      = useState('')
  const [newYear,      setNewYear]      = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [dropdownOpen])

  function navigate(href: string) {
    const ok = requestNavigation(href)
    if (ok) {
      router.push(href)
      onClose?.()
    }
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  function handleCreateGroup() {
    if (!newName.trim()) return
    createGroup(newName.trim(), newDesc.trim() || undefined, newYear ? parseInt(newYear) : undefined)
    setCreateOpen(false)
    setNewName('')
    setNewDesc('')
    setNewYear('')
  }

  return (
    <aside className="flex flex-col h-full w-64 bg-slate-900 text-white sidebar-scroll overflow-y-auto shrink-0">

      {/* Logo + group switcher */}
      <div className="px-5 py-5 border-b border-slate-700/50">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 w-full text-left group mb-3"
        >
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Ensemble Trackr"
              width={36}
              height={36}
              className="object-contain w-full h-full"
            />
          </div>
          <p className="font-bold text-sm leading-tight text-white truncate group-hover:text-teal-300 transition-colors">
            Ensemble Trackr
          </p>
        </button>

        {/* Group switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className={cn(
              'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors',
              dropdownOpen
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            )}
          >
            <span className="truncate font-medium">{activeGroup.name}</span>
            <ChevronsUpDown size={12} className="shrink-0 text-slate-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 overflow-hidden">
              <p className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
                Your Groups
              </p>
              {groups.map(g => (
                <button
                  key={g.id}
                  onClick={() => { setActiveGroupId(g.id); setDropdownOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                    g.id === activeGroup.id
                      ? 'text-teal-300 bg-teal-600/10'
                      : 'text-slate-300 hover:bg-slate-700'
                  )}
                >
                  <Check
                    size={13}
                    className={cn('shrink-0', g.id === activeGroup.id ? 'text-teal-400' : 'opacity-0')}
                  />
                  <span className="truncate">{g.name}</span>
                </button>
              ))}
              <div className="my-1 mx-3 border-t border-slate-700" />
              <button
                onClick={() => { setDropdownOpen(false); setCreateOpen(true) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-teal-300 hover:bg-slate-700/50 transition-colors text-left"
              >
                <Plus size={13} className="shrink-0" />
                Create new group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <button
              key={href}
              onClick={() => navigate(href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group text-left',
                active
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon
                size={17}
                className={cn(
                  'shrink-0 transition-colors',
                  active ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              {label}
              {active && <ChevronRight size={13} className="ml-auto text-teal-500" />}
            </button>
          )
        })}
      </nav>

      {/* Member view */}
      <div className="px-3 pb-2">
        <button
          onClick={() => navigate('/member')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors text-left"
        >
          <Music2 size={14} />
          Switch to Member View
        </button>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-3 border-t border-slate-700/50 pt-3">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <AppFooter className="px-4 pb-4 text-slate-600 text-[10px]" />

      {/* Create group modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Create New Group</h3>
              <button
                onClick={() => setCreateOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Group name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
                  placeholder="e.g. Phoenix Concert Band"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="e.g. Community concert band"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Established year (optional)</label>
                <input
                  type="number"
                  value={newYear}
                  onChange={e => setNewYear(e.target.value)}
                  placeholder="e.g. 1986"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setCreateOpen(false)}
                className="flex-1 py-2 rounded-lg text-sm text-slate-400 border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newName.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-40"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
