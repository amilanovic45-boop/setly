import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

// Mock unavailable dates for when DB is not configured
const MOCK_UNAVAILABLE = [
  { id: '1', date: '2025-06-07', is_available: false },
  { id: '2', date: '2025-06-14', is_available: false },
  { id: '3', date: '2025-06-21', is_available: false },
  { id: '4', date: '2025-06-28', is_available: false },
  { id: '5', date: '2025-07-05', is_available: false },
  { id: '6', date: '2025-07-12', is_available: false },
  { id: '7', date: '2025-07-19', is_available: false },
]

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      return NextResponse.json(MOCK_UNAVAILABLE)
    }

    return NextResponse.json(data || MOCK_UNAVAILABLE)
  } catch {
    return NextResponse.json(MOCK_UNAVAILABLE)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, is_available } = body

    if (!date) {
      return NextResponse.json({ error: 'Data obbligatoria' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Upsert availability
    const { data, error } = await supabase
      .from('availability')
      .upsert(
        { date, is_available: is_available ?? true },
        { onConflict: 'date' }
      )
      .select()
      .single()

    if (error) {
      // DB not configured, return success anyway
      return NextResponse.json({ date, is_available, message: 'Aggiornato (modalità offline)' })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Availability error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
