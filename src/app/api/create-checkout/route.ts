import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, amount, name, email, eventType, date } = body

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!stripeSecretKey || stripeSecretKey === 'sk_test_placeholder') {
      // Return placeholder when Stripe not configured
      return NextResponse.json({
        url: null,
        message: 'Stripe non configurato. La prenotazione è stata salvata, ti contatteremo per il pagamento.',
      })
    }

    // Create Stripe checkout session via fetch (edge-compatible)
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][unit_amount]': String(amount * 100),
        'line_items[0][price_data][product_data][name]': `Acconto DJ — ${eventType}`,
        'line_items[0][price_data][product_data][description]': `Prenotazione del ${date} — Acconto 30%`,
        'line_items[0][quantity]': '1',
        mode: 'payment',
        customer_email: email,
        success_url: `${appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
        cancel_url: `${appUrl}/booking?cancelled=true`,
        'metadata[booking_id]': bookingId,
        'metadata[event_type]': eventType,
        'metadata[date]': date,
        'metadata[customer_name]': name,
      }),
    })

    if (!stripeResponse.ok) {
      const stripeError = await stripeResponse.json()
      console.error('Stripe error:', stripeError)
      return NextResponse.json(
        { error: 'Errore nella creazione del pagamento', url: null },
        { status: 200 }
      )
    }

    const session = await stripeResponse.json()

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Errore interno', url: null },
      { status: 200 }
    )
  }
}
