'use client'

// Ensemble Trackr — Dev Observability Dashboard
// LiveViral Media
//
// Accessible only to dan@liveviralmedia.com.
// Not linked from any nav; returns silently to home for all other users.
// Shows per-member device info, diagnostic state, and live backup session activity.

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/auth/mock-auth'
import { createClient } from '@/lib/supabase/client'
import type { Member, UserDevice, UserDiagnostic, BackupSession } from '@/types'

const DEV_EMAIL = 'dan@liveviralmedia.com'

interface MemberCard {
  member:     Member
  devices:    UserDevice[]
  diagnostic: UserDiagnostic | null
  sessions:   BackupSession[]
}

function dedupeDevices(devices: UserDevice[]): UserDevice[] {
  const seen = new Map<string, UserDevice>()
  for (const d of devices) {
    const key = `${d.device_brand ?? ''}|${d.device_model ?? ''}|${d.os_version ?? ''}`
    const existing = seen.get(key)
    if (!existing || d.last_seen_at > existing.last_seen_at) seen.set(key, d)
  }
  return [...seen.values()]
}

export default function DevPage() {
  const router = useRouter()
  const [cards, setCards]       = useState<MemberCard[]>([])
  const [loading, setLoading]   = useState(true)
  const [triggering, setTriggering] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== DEV_EMAIL) {
      router.replace('/')
      return
    }

    const [membersRes, devicesRes, diagnosticsRes, sessionsRes] = await Promise.all([
      supabase.from('members').select('*').eq('active', true).order('last_name'),
      supabase.from('user_devices').select('*'),
      supabase.from('user_diagnostics').select('*'),
      supabase.from('backup_sessions').select('*').order('started_at', { ascending: false }),
    ])

    const members:     Member[]         = membersRes.data     ?? []
    const devices:     UserDevice[]     = devicesRes.data     ?? []
    const diagnostics: UserDiagnostic[] = diagnosticsRes.data ?? []
    const sessions:    BackupSession[]  = sessionsRes.data    ?? []

    const built: MemberCard[] = members.map(m => ({
      member:     m,
      devices:    dedupeDevices(devices.filter(d => d.user_id === m.id)),
      diagnostic: diagnostics.find(d => d.user_id === m.id) ?? null,
      sessions:   sessions.filter(s => s.user_id === m.id).slice(0, 5),
    }))

    setCards(built)
    setLoading(false)
  }, [router])

  useEffect(() => {
    // Quick check via sessionStorage before async Supabase call
    try {
      const s = JSON.parse(sessionStorage.getItem('mock_session') ?? '{}') as { email?: string }
      if (s.email && s.email !== DEV_EMAIL) { router.replace('/'); return }
    } catch { /* ignore */ }

    void fetchData()
  }, [fetchData, router])

  // Realtime subscription — live backup session updates
  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    const channel  = supabase
      .channel('dev_sessions_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'backup_sessions' }, payload => {
        const row = payload.new as BackupSession
        if (!row) return
        setCards(prev => prev.map(card => {
          if (card.member.id !== row.user_id) return card
          const existing = card.sessions.findIndex(s => s.id === row.id)
          const updated  = existing >= 0
            ? card.sessions.map(s => s.id === row.id ? row : s)
            : [row, ...card.sessions].slice(0, 5)
          return { ...card, sessions: updated }
        }))
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [])

  async function triggerBackup(userId: string) {
    if (!isSupabaseConfigured()) return
    setTriggering(userId)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await fetch('/api/webview-bridge', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type: 'RUN_BACKUP_NOW', user_id: userId, override_backup_enabled: true }),
      })
    } finally {
      setTimeout(() => setTriggering(null), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Dev dashboard requires live Supabase connection.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-[10px] font-mono text-teal-500 uppercase tracking-widest mb-1">LiveViral Media — Internal</p>
          <h1 className="text-xl font-bold text-white">Media Backup Monitor</h1>
          <p className="text-xs text-slate-400 mt-0.5">Live device sync status — {cards.length} active members</p>
        </div>

        <div className="space-y-4">
          {cards.map(({ member, devices, diagnostic, sessions }) => {
            const permGranted  = diagnostic?.media_permission === 'granted'
            const runningSession = sessions.find(s => s.status === 'running')

            return (
              <div key={member.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${permGranted ? 'bg-green-400' : 'bg-amber-400'}`} />
                      <span className="text-sm font-semibold text-white">
                        {member.first_name} {member.last_name}
                      </span>
                      <span className="text-[10px] text-slate-500">{member.email}</span>
                    </div>
                    {diagnostic?.last_checked_at && (
                      <p className="text-[10px] text-slate-500 mt-0.5 ml-4">
                        Last check: {new Date(diagnostic.last_checked_at).toLocaleString()}
                        {diagnostic.media_permission && (
                          <> · perm: <span className={permGranted ? 'text-green-400' : 'text-amber-400'}>
                            {diagnostic.media_permission}
                          </span></>
                        )}
                        {diagnostic.photo_count !== undefined && (
                          <> · {diagnostic.photo_count}ph / {diagnostic.video_count}vid</>
                        )}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => void triggerBackup(member.id)}
                    disabled={triggering === member.id}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-teal-700 hover:bg-teal-600 disabled:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    {triggering === member.id ? 'Triggered ✓' : 'Trigger sync'}
                  </button>
                </div>

                {/* Devices */}
                {devices.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Devices</p>
                    <div className="flex flex-wrap gap-2">
                      {devices.map(d => (
                        <div key={d.id} className="text-[10px] bg-slate-700 text-slate-300 rounded px-2 py-1">
                          {[d.device_brand, d.device_model, d.os_name, d.os_version].filter(Boolean).join(' · ')}
                          <span className="text-slate-500 ml-1">
                            · {new Date(d.last_seen_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live session */}
                {runningSession && (
                  <div className="flex items-center gap-2 bg-teal-900/40 border border-teal-700/40 rounded-lg px-3 py-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-xs text-teal-300 font-medium">
                      Sync running — {runningSession.files_done} files uploaded
                    </span>
                    <span className="text-[10px] text-teal-600 ml-auto">{runningSession.platform}</span>
                  </div>
                )}

                {/* Recent sessions */}
                {sessions.filter(s => s.status !== 'running').length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Recent sessions</p>
                    <div className="space-y-1">
                      {sessions.filter(s => s.status !== 'running').slice(0, 3).map(s => (
                        <div key={s.id} className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className={
                            s.status === 'completed' ? 'text-green-400' : 'text-red-400'
                          }>●</span>
                          <span>{s.files_done} files</span>
                          <span>·</span>
                          <span>{new Date(s.started_at).toLocaleString()}</span>
                          <span className="text-slate-600">{s.platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {devices.length === 0 && !diagnostic && sessions.length === 0 && (
                  <p className="text-[10px] text-slate-600 italic">No device activity yet</p>
                )}
              </div>
            )
          })}

          {cards.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm">No active members found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
