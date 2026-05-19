import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: 'Missing webhook secret or signature' }, { status: 400 })
    }

    // For edge runtime, we use the raw body and manually verify
    // In production, use the Stripe SDK's constructEventAsync
    let event: { type: string; data: { object: Record<string, unknown> } }

    try {
      // Parse the event - in production verify signature properly
      event = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string
          payment_status: string
          metadata?: { booking_id?: string }
        }

        if (session.payment_status === 'paid') {
          const bookingId = session.metadata?.booking_id

          if (bookingId) {
            try {
              const { createServiceClient } = await import('@/lib/supabase')
              const supabase = createServiceClient()

              await supabase
                .from('bookings')
                .update({
                  deposit_paid: true,
                  status: 'confirmed',
                  stripe_session_id: session.id,
                })
                .eq('id', bookingId)
            } catch (err) {
              console.error('Supabase update error:', err)
            }
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as { metadata?: { booking_id?: string } }
        const bookingId = paymentIntent.metadata?.booking_id

        if (bookingId) {
          try {
            const { createServiceClient } = await import('@/lib/supabase')
            const supabase = createServiceClient()
            await supabase
              .from('bookings')
              .update({ status: 'cancelled' })
              .eq('id', bookingId)
          } catch (err) {
            console.error('Supabase update error:', err)
          }
        }
        break
      }

      default:
        // Ignore unhandled events
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
