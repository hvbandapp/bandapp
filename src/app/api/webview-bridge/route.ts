// Ensemble Trackr — WebView Bridge
// LiveViral Media
//
// POST /api/webview-bridge
// Receives RUN_BACKUP_NOW commands from the dev dashboard and broadcasts
// them to any connected native shells via a Supabase realtime channel.
// The native shell subscribes to the 'dev-triggers' channel and calls
// runBackup(session, true) when it receives a RUN_BACKUP_NOW event.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

interface BridgePayload {
  type: 'RUN_BACKUP_NOW'
  user_id: string
  override_backup_enabled: true
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json() as BridgePayload

    if (payload.type !== 'RUN_BACKUP_NOW') {
      return NextResponse.json({ error: 'Unknown message type' }, { status: 400 })
    }

    // Verify caller is the dev account
    const authHeader = req.headers.get('authorization') ?? ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token || token === 'placeholder') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    const anonClient   = createSupabaseClient(supabaseUrl, supabaseAnon)
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(token)

    if (authErr || !user || user.email !== 'dan@liveviralmedia.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Broadcast via realtime so native shells subscribed to dev-triggers fire immediately
    const admin = createServerClient()
    await admin.channel('dev-triggers').send({
      type: 'broadcast',
      event: 'RUN_BACKUP_NOW',
      payload: { user_id: payload.user_id, override_backup_enabled: true },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
