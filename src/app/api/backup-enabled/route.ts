// Ensemble Trackr — Backup Enabled Toggle
// LiveViral Media
//
// PATCH /api/backup-enabled
// Updates the calling member's backup_enabled flag.
// Called directly by the Settings → Privacy toggle — not part of the Save All flow.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function PATCH(req: NextRequest) {
  try {
    const { backup_enabled } = await req.json() as { backup_enabled: boolean }

    if (typeof backup_enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization') ?? ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token || token === 'placeholder') {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    // Verify the caller's JWT via anon client, then write with service role
    const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const supabaseAnon   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    const anonClient     = createSupabaseClient(supabaseUrl, supabaseAnon)
    const { data: { user }, error: authErr } = await anonClient.auth.getUser(token)

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createServerClient()
    const { error } = await admin
      .from('members')
      .update({ backup_enabled })
      .eq('auth_user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
