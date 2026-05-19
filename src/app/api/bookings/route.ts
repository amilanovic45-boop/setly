import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Return mock data if DB not configured
      return NextResponse.json([
        {
          id: 'mock-1',
          name: 'Marco Rossi',
          email: 'marco@test.it',
          event_type: 'Matrimonio',
          date: '2025-06-14',
          status: 'confirmed',
          amount: 700,
          deposit_paid: true,
        },
      ])
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, eventType, date, location, hours, notes, amount } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome ed email sono obbligatori' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        name,
        email,
        phone: phone || null,
        event_type: eventType || null,
        date: date || null,
        location: location || null,
        hours: hours || null,
        amount: amount || null,
        notes: notes || null,
        status: 'pending',
        deposit_paid: false,
      })
      .select()
      .single()

    if (error) {
      // If DB not configured, return a mock booking ID
      console.error('Supabase error:', error)
      return NextResponse.json({
        id: `mock-${Date.now()}`,
        name,
        email,
        status: 'pending',
        message: 'Prenotazione ricevuta (modalità offline)',
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
