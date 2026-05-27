'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, Save, LogOut, X } from 'lucide-react'
import { DirtyStateProvider, useDirtyState } from '@/lib/dirty-state'

function GuardModal() {
  const { pendingHref, invokeSave, clearDirty, dismissModal } = useDirtyState()
  const router = useRouter()

  if (!pendingHref) return null

  async function handleSaveAndLeave() {
    const href = pendingHref!
    await invokeSave()
    clearDirty()
    router.push(href)
  }

  function handleLeaveAnyway() {
    const href = pendingHref!
    clearDirty()
    router.push(href)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={dismissModal}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Unsaved Changes</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              You have unsaved changes on this page. What would you like to do?
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-5">
          <button
            onClick={handleSaveAndLeave}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Save size={14} />
            Save &amp; Leave
          </button>
          <button
            onClick={handleLeaveAnyway}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-xl transition-colors"
          >
            <LogOut size={14} />
            Leave without saving
          </button>
          <button
            onClick={dismissModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-colors"
          >
            <X size={14} />
            Stay on page
          </button>
        </div>
      </div>
    </div>
  )
}

export function NavigationGuard({ children }: { children: React.ReactNode }) {
  return (
    <DirtyStateProvider>
      <GuardModal />
      {children}
    </DirtyStateProvider>
  )
}
