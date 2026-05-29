// Demo mode — always uses mock auth regardless of env vars.

export interface MockSession {
  email: string
  role: 'admin' | 'dev'
  name: string
}

const MOCK_CREDENTIALS: Record<string, MockSession> = {
  'contact@liveviralmedia.com': {
    email: 'contact@liveviralmedia.com',
    role:  'admin',
    name:  'LiveViral Media',
  },
}

const MOCK_PASSWORDS: Record<string, string> = {
  'contact@liveviralmedia.com': 'LiveViral2026!',
}

export function mockSignIn(email: string, password: string): MockSession | null {
  const session  = MOCK_CREDENTIALS[email.toLowerCase()]
  const expected = MOCK_PASSWORDS[email.toLowerCase()]
  if (session && expected && password === expected) return session
  return null
}

// Demo branch always uses mock mode — Supabase is never called.
export function isSupabaseConfigured(): boolean {
  return false
}
