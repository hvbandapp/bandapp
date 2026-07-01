'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { NavigationGuard } from '@/components/layout/NavigationGuard'
import { GroupProvider } from '@/lib/group-context'
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context'
import { AppVersion } from '@/components/layout/AppVersion'
import { cn } from '@/lib/utils'

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useSidebar()

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden transition-colors">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, slide-in on mobile */}
      <div
        className={cn(
          'sidebar-drawer fixed inset-y-0 left-0 z-30 w-64 lg:relative lg:z-auto lg:w-auto transition-transform duration-200',
          sidebarOpen && 'sidebar-drawer--open'
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
        <AppVersion className="shrink-0 py-1 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400" />
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <GroupProvider>
        <NavigationGuard>
          <DashboardShell>{children}</DashboardShell>
        </NavigationGuard>
      </GroupProvider>
    </SidebarProvider>
  )
}
