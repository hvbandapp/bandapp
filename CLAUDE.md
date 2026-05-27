# Ensemble Trackr

Attendance and member management app for Happy Valley Brass Band.

**Built by:** LiveViral Media (liveviralmedia.com)
**Client:** Brandon Giurgiu — Happy Valley Brass Band, Phoenix AZ

## Stack
- Next.js 15 App Router, TypeScript, Tailwind CSS v4
- Supabase (auth + database)
- Resend (email notifications)
- Deployed on Vercel

## Key rules
- Author everywhere is **LiveViral Media** — no Claude/Anthropic attribution
- `dan@liveviralmedia.com` has full dev access but **never appears** in the user dashboard, logs, or any UI
- `app-logs@liveviralmedia.com` is a silent BCC on all outgoing email — **not shown** in the notification log or user list
- Brandon Giurgiu (`bgiurgiu7@gmail.com`) is admin with full UI permissions

## Dev
```
npm run dev    # start at localhost:3000
npm run build  # check for TS/build errors
```

## Env
Copy `.env.example` to `.env.local` and fill in Supabase + Resend keys.
