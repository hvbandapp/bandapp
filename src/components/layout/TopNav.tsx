'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Search, ChevronDown, Menu, Sun, Moon, LogOut, Settings } from 'lucide-react'
import { useDirtyState } from '@/lib/dirty-state'
import { useTheme } from '@/lib/theme'
import { isSupabaseConfigured } from '@/lib/auth/mock-auth'

interface TopNavProps {
  title:        string
  subtitle?:    string
  onMenuClick?: () => void
  badge?:       number
}

interface StoredSession {
  email: string
  name:  string
  role:  string
}

export function TopNav({ title, subtitle, onMenuClick, badge = 0 }: TopNavProps) {
  const router                = useRouter()
  const { requestNavigation } = useDirtyState()
  const { theme, toggle }     = useTheme()

  const [session, setSession] = useState<StoredSession | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('mock_session')
    if (stored) {
      try { setSession(JSON.parse(stored) as StoredSession) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  function handleLogoClick() {
    const ok = requestNavigation('/dashboard')
    if (ok) router.push('/dashboard')
  }

  async function handleSignOut() {
    sessionStorage.removeItem('mock_session')
    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        await createClient().auth.signOut()
      } catch { /* ignore */ }
    }
    router.push('/')
  }

  const displayName  = session?.name ?? 'Guest'
  const firstName    = displayName.split(' ')[0]
  const initial      = (displayName[0] ?? 'G').toUpperCase()

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 flex items-center justify-between shrink-0 gap-3 transition-colors">

      {/* Left: hamburger (mobile) + logo + divider + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 group shrink-0"
          aria-label="Go to dashboard"
        >
          <div className="w-7 h-7 rounded-md overflow-hidden shrink-0 group-hover:opacity-80 transition-opacity flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Ensemble Trackr"
              width={28}
              height={28}
              className="object-contain w-full h-full"
            />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors hidden md:block leading-tight">
            Ensemble Trackr
          </span>
        </button>

        <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors hidden sm:flex">
          <Search size={17} />
        </button>

        <button className="relative p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <Bell size={17} />
          {badge > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </button>

        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-md text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* User menu */}
        <div className="relative ml-0.5" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
              {firstName}
            </span>
            <ChevronDown size={13} className="text-slate-400 dark:text-slate-500 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.email ?? 'Not signed in'}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Settings size={14} />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
