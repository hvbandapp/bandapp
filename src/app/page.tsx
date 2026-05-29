'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard, Music2, Loader2, ChevronRight } from 'lucide-react'
import { AppFooter } from '@/components/layout/AppFooter'
import { demoSignInAs } from '@/lib/auth/mock-auth'

export default function LoginPage() {
  const [loading, setLoading] = useState<'admin' | 'member' | null>(null)
  const router = useRouter()

  async function handleSelect(role: 'admin' | 'member') {
    setLoading(role)
    await new Promise(r => setTimeout(r, 350))
    const session = demoSignInAs(role)
    sessionStorage.setItem('mock_session', JSON.stringify(session))
    router.push(role === 'admin' ? '/dashboard' : '/member')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">

      {/* ── Hero section ── */}
      <div className="flex flex-col items-center justify-end pb-8 pt-12 px-4"
           style={{ minHeight: '30vh' }}>
        <div className="relative flex flex-col items-center">
          <div
            className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-20 bg-teal-400"
            style={{ width: 220, height: 220, transform: 'translate(-50%, -50%)', top: '50%', left: '50%' }}
          />
          <Image
            src="/logo.png"
            alt="Grand Valley Brass Band"
            width={120}
            height={120}
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <h1 className="mt-4 text-3xl font-bold text-white tracking-tight text-center">
          Ensemble Trackr
        </h1>
        <p className="mt-1 text-slate-400 text-sm text-center">
          Grand Valley Brass Band · Est. 2005
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px w-12 bg-amber-500/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
          <div className="h-px w-12 bg-amber-500/40" />
        </div>
      </div>

      {/* ── Role picker ── */}
      <div className="flex-1 flex flex-col items-center justify-start pt-6 pb-8 px-4">
        <div className="w-full max-w-sm space-y-4">

          {/* Demo notice */}
          <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
              Demo
            </span>
            <p className="text-xs text-amber-200 text-center">
              Interactive preview — choose a role to explore the app
            </p>
          </div>

          <p className="text-center text-sm text-slate-400 pt-1">
            Who would you like to sign in as?
          </p>

          {/* Admin card */}
          <button
            onClick={() => handleSelect('admin')}
            disabled={loading !== null}
            className="w-full group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 rounded-2xl px-5 py-5 flex items-center gap-4 text-left transition-all disabled:opacity-60"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-500 transition-colors">
              <LayoutDashboard size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Director / Admin</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Full dashboard — members, events, attendance, notifications
              </p>
            </div>
            <div className="shrink-0">
              {loading === 'admin'
                ? <Loader2 size={18} className="text-teal-400 animate-spin" />
                : <ChevronRight size={18} className="text-slate-500 group-hover:text-teal-400 transition-colors" />
              }
            </div>
          </button>

          {/* Member card */}
          <button
            onClick={() => handleSelect('member')}
            disabled={loading !== null}
            className="w-full group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-2xl px-5 py-5 flex items-center gap-4 text-left transition-all disabled:opacity-60"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 transition-colors">
              <Music2 size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Member / Player</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Personal view — attendance history, standing, upcoming events
              </p>
            </div>
            <div className="shrink-0">
              {loading === 'member'
                ? <Loader2 size={18} className="text-indigo-400 animate-spin" />
                : <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
              }
            </div>
          </button>

          <p className="text-center text-[11px] text-slate-600 pt-1">
            By continuing you agree to our{' '}
            <Link href="/terms" className="text-slate-500 hover:text-slate-400 underline">
              Terms &amp; Conditions
            </Link>
          </p>

          <AppFooter className="mt-2 text-slate-600" />
        </div>
      </div>

    </div>
  )
}
