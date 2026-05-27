// Ensemble Trackr — Member Notification Sender
// LiveViral Media
//
// Sends absence warnings, final notices, announcements, and event reminders.
// Silently BCCs app-logs@liveviralmedia.com on all outgoing mail.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const LOG_EMAIL        = Deno.env.get('LOG_EMAIL') ?? 'app-logs@liveviralmedia.com'

interface NotificationPayload {
  type:         'warning' | 'final_notice' | 'announcement' | 'event_reminder'
  member_id?:   string
  section?:     string
  to_all?:      boolean
  subject:      string
  message:      string
  triggered_by: 'auto' | 'manual'
  sent_by?:     string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE)
  const payload: NotificationPayload = await req.json()

  let recipients: { id: string; name: string; email: string }[] = []

  if (payload.to_all) {
    const { data } = await supabase
      .from('members')
      .select('id, first_name, last_name, email')
      .eq('active', true)
    recipients = (data ?? []).map((m: { id: string; first_name: string; last_name: string; email: string }) => ({
      id:    m.id,
      name:  `${m.first_name} ${m.last_name}`,
      email: m.email,
    }))
  } else if (payload.section) {
    const { data } = await supabase
      .from('members')
      .select('id, first_name, last_name, email')
      .eq('section', payload.section)
      .eq('active', true)
    recipients = (data ?? []).map((m: { id: string; first_name: string; last_name: string; email: string }) => ({
      id:    m.id,
      name:  `${m.first_name} ${m.last_name}`,
      email: m.email,
    }))
  } else if (payload.member_id) {
    const { data } = await supabase
      .from('members')
      .select('id, first_name, last_name, email')
      .eq('id', payload.member_id)
      .single()
    if (data) recipients = [{ id: data.id, name: `${data.first_name} ${data.last_name}`, email: data.email }]
  }

  const results = await Promise.allSettled(
    recipients.map(async (recipient) => {
      const html = buildEmailHtml(payload.type, recipient.name, payload.message)

      const res = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    'Ensemble Trackr <noreply@liveviralmedia.com>',
          to:      [recipient.email],
          bcc:     [LOG_EMAIL],
          subject: payload.subject,
          html,
        }),
      })

      const delivered = res.ok
      const resendData = await res.json().catch(() => ({}))

      await supabase.from('notification_log').insert({
        member_id:    recipient.id,
        member_name:  recipient.name,
        member_email: recipient.email,
        type:         payload.type,
        subject:      payload.subject,
        message:      payload.message,
        triggered_by: payload.triggered_by,
        sent_by:      payload.sent_by ?? null,
        resend_id:    resendData?.id ?? null,
        delivered,
      })

      return { recipient: recipient.email, delivered }
    })
  )

  return new Response(JSON.stringify({ ok: true, results: results.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

function buildEmailHtml(type: string, name: string, message: string): string {
  const typeColors: Record<string, string> = {
    warning:        '#f59e0b',
    final_notice:   '#ef4444',
    announcement:   '#0d9488',
    event_reminder: '#6366f1',
  }
  const typeLabels: Record<string, string> = {
    warning:        'Attendance Warning',
    final_notice:   'Final Notice',
    announcement:   'Announcement',
    event_reminder: 'Event Reminder',
  }
  const color = typeColors[type] ?? '#0d9488'
  const label = typeLabels[type] ?? 'Notification'

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:${color};padding:20px 24px;">
          <p style="margin:0;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Ensemble Trackr</p>
          <h1 style="margin:4px 0 0;color:#fff;font-size:20px;font-weight:700;">${label}</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;color:#475569;font-size:15px;">Hi ${name},</p>
          <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">${message.replace(/\n/g, '<br>')}</p>
          <p style="margin:0;color:#94a3b8;font-size:12px;">If you have questions, please contact your director or section leader.</p>
        </div>
        <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">
            App created by <a href="https://liveviralmedia.com" style="color:#0d9488;">LiveViral Media</a>
            &copy; ${new Date().getFullYear()} — Happy Valley Brass Band
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
