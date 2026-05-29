'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Bell, Search, ChevronDown, Menu, Sun, Moon } from 'lucide-react'
import { useDirtyState } from '@/lib/dirty-state'
import { useTheme } from '@/lib/theme'

interface TopNavProps {
  title:        string
  subtitle?:    string
  onMenuClick?: () => void
  badge?:       number
}

export function TopNav({ title, subtitle, onMenuClick, badge = 0 }: TopNavProps) {
  const router               = useRouter()
  const { requestNavigation } = useDirtyState()
  const { theme, toggle }    = useTheme()

  function handleLogoClick() {
    const ok = requestNavigation('/dashboard')
    if (ok) router.push('/dashboard')
  }

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

        {/* Logo — always visible, links to /dashboard */}
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

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

        {/* Page title */}
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

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-md text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* User menu */}
        <button className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-0.5">
          <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
            LV
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:block">LiveViral</span>
          <ChevronDown size={13} className="text-slate-400 dark:text-slate-500 hidden sm:block" />
        </button>
      </div>
    </header>
  )
}
