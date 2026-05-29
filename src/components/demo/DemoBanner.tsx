'use client'

import { useRouter } from 'next/navigation'
import { FlaskConical, RotateCcw } from 'lucide-react'

export function DemoBanner() {
  const router = useRouter()

  function handleReset() {
    sessionStorage.removeItem('mock_session')
    router.push('/')
  }

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
          <FlaskConical size={10} />
          Demo
        </span>
        <p className="text-xs text-amber-800 truncate">
          Interactive demo — explore freely, no data is saved or modified
        </p>
      </div>
      <button
        onClick={handleReset}
        className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 shrink-0 transition-colors"
      >
        <RotateCcw size={12} />
        Reset
      </button>
    </div>
  )
}
