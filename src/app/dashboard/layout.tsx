'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { NavigationGuard } from '@/components/layout/NavigationGuard'
import { GroupProvider } from '@/lib/group-context'
import { DemoBanner } from '@/components/demo/DemoBanner'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <GroupProvider>
    <NavigationGuard>
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
            'fixed inset-y-0 left-0 z-30 lg:relative lg:z-auto transition-transform duration-200',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DemoBanner />
          {children}
        </main>
      </div>
    </NavigationGuard>
    </GroupProvider>
  )
}
