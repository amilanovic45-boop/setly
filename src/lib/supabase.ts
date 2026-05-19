import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export type Booking = {
  id: string
  name: string
  email: string
  phone: string | null
  event_type: string | null
  date: string | null
  location: string | null
  hours: number | null
  amount: number | null
  deposit_paid: boolean
  status: 'pending' | 'confirmed' | 'cancelled'
  notes: string | null
  stripe_session_id: string | null
  created_at: string
}

export type Availability = {
  id: string
  date: string
  is_available: boolean
}

export type SetlistRequest = {
  id: string
  email: string | null
  event_data: Record<string, unknown> | null
  generated_setlist: string | null
  created_at: string
}
