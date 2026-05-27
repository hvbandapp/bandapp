import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder'
  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
