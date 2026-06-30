// Mock authentication for wireframe/demo — used when Supabase is not yet connected.
// Replace with real Supabase auth once keys are configured.

export interface MockSession {
  id:    string
  email: string
  role:  'admin' | 'dev'
  name:  string
}

const MOCK_CREDENTIALS: Record<string, MockSession> = {
  'bgiurgiu7@gmail.com': {
    id:    'mock-brandon',
    email: 'bgiurgiu7@gmail.com',
    role:  'admin',
    name:  'Brandon Giurgiu',
    // password: HappyValleyIsNumberOne101
  },
  'dan@liveviralmedia.com': {
    id:    'mock-dan',
    email: 'dan@liveviralmedia.com',
    role:  'dev',
    name:  'Dan Weecks',
    // password: AdmiNpassword2026!
  },
}

const MOCK_PASSWORDS: Record<string, string> = {
  'bgiurgiu7@gmail.com':  'HappyValleyIsNumberOne101',
  'dan@liveviralmedia.com': 'AdmiNpassword2026!',
}

export function mockSignIn(email: string, password: string): MockSession | null {
  const session  = MOCK_CREDENTIALS[email.toLowerCase()]
  const expected = MOCK_PASSWORDS[email.toLowerCase()]
  if (session && expected && password === expected) return session
  return null
}

export function getSessionForEmail(email: string): MockSession {
  const lower = email.toLowerCase()
  return MOCK_CREDENTIALS[lower] ?? {
    id:    `mock-${lower.split('@')[0]}`,
    email: lower,
    role:  'admin',
    name:  lower.split('@')[0],
  }
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url !== '' && !url.includes('placeholder')
}
