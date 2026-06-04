import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Verify this is called by Vercel Cron (not a random external request)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, reason: 'Supabase not configured' })
  }

  // Lightest possible query — just pings the DB with no data returned
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      apikey:        supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  })

  return NextResponse.json({
    ok:     res.ok,
    status: res.status,
    ts:     new Date().toISOString(),
  })
}
