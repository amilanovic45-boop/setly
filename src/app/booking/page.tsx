'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BookingCalendar from '@/components/BookingCalendar'

const EVENT_TYPES = [
  'Matrimonio',
  'Festa Privata',
  'Corporate',
  'Compleanno',
  'Club & Serata',
  'University Party',
  'Evento Balkan',
  'Afro House',
  'Altro',
]

const PRICE_TABLE: Record<number, number> = {
  1: 300,
  2: 500,
  3: 700,
  4: 900,
}

function getPrice(hours: number) {
  if (hours >= 4) return PRICE_TABLE[4]
  return PRICE_TABLE[hours] || 300
}

type BookingForm = {
  name: string
  email: string
  phone: string
  eventType: string
  date: string
  location: string
  hours: number
  notes: string
}

type ConfirmationData = {
  id: string
  checkoutUrl?: string
  depositAmount: number
  totalAmount: number
}

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [form, setForm] = useState<BookingForm>({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    date: '',
    location: '',
    hours: 2,
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (selectedDate) {
      setForm((prev) => ({ ...prev, date: selectedDate }))
    }
  }, [selectedDate])

  const totalPrice = getPrice(form.hours)
  const depositAmount = Math.round(totalPrice * 0.3)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.date || !form.eventType) {
      setError('Compila tutti i campi obbligatori')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      // Save booking
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: totalPrice,
        }),
      })

      const bookingData = await bookingRes.json()

      if (!bookingRes.ok) {
        throw new Error(bookingData.error || 'Errore nel salvataggio')
      }

      // Create Stripe checkout
      const checkoutRes = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingData.id,
          amount: depositAmount,
          name: form.name,
          email: form.email,
          eventType: form.eventType,
          date: form.date,
        }),
      })

      const checkoutData = await checkoutRes.json()

      setConfirmation({
        id: bookingData.id,
        checkoutUrl: checkoutData.url,
        depositAmount,
        totalAmount: totalPrice,
      })
    } catch (err) {
      console.error(err)
      setError('Si è verificato un errore. Riprova o contattaci direttamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
          <div className="card-gold rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-black text-white mb-3">Prenotazione ricevuta!</h1>
            <p className="text-white/60 mb-8 leading-relaxed">
              Abbiamo ricevuto la tua richiesta di prenotazione. Per confermarla, paga il 30% di acconto.
            </p>

            <div className="bg-surface-2 rounded-xl p-6 mb-8 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">ID Prenotazione</span>
                <span className="text-white font-mono text-xs">{confirmation.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Totale set</span>
                <span className="text-white font-bold">€{confirmation.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Acconto da pagare (30%)</span>
                <span className="text-accent font-bold text-lg">€{confirmation.depositAmount}</span>
              </div>
            </div>

            <div className="space-y-3">
              {confirmation.checkoutUrl ? (
                <a
                  href={confirmation.checkoutUrl}
                  className="btn-gold w-full py-4 rounded-xl font-bold text-center inline-flex items-center justify-center gap-2"
                >
                  Paga acconto €{confirmation.depositAmount}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              ) : (
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-sm text-accent">
                  Il sistema di pagamento non è attivo in questo momento. Ti contatteremo via email per completare la prenotazione.
                </div>
              )}

              <Link
                href="/"
                className="w-full py-3 rounded-xl font-semibold border border-white/20 hover:border-accent/50 hover:text-accent transition-all text-center block"
              >
                Torna alla home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-accent text-sm font-bold uppercase tracking-widest mb-3 block">Prenotazione</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Prenota il <span className="text-gold-gradient">tuo DJ</span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Scegli la data, compila il form e paga il 30% di acconto per confermare
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Calendar */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold">1</span>
                Scegli la data
              </h2>
              <BookingCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />

              {/* Legend */}
              <div className="flex gap-4 mt-4 text-xs text-white/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" />
                  Disponibile
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
                  Occupato
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-accent/20 border border-accent" />
                  Selezionato
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold">2</span>
                Dettagli evento
              </h2>

              <div className="card-gold rounded-2xl p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Nome e Cognome *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Marco Rossi"
                    className="input-gold w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="marco@esempio.it"
                    className="input-gold w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Telefono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+39 320 123 4567"
                    className="input-gold w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Tipo di evento *</label>
                  <select
                    value={form.eventType}
                    onChange={(e) => setForm((p) => ({ ...p, eventType: e.target.value }))}
                    className="input-gold w-full px-4 py-3 rounded-xl text-sm appearance-none"
                  >
                    <option value="">Seleziona tipo evento</option>
                    {EVENT_TYPES.map((et) => (
                      <option key={et} value={et}>{et}</option>
                    ))}
                  </select>
                </div>

                {/* Date (text if not selected via calendar) */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Data *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, date: e.target.value }))
                      setSelectedDate(e.target.value)
                    }}
                    className="input-gold w-full px-4 py-3 rounded-xl text-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Luogo</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Villa Reale, Milano"
                    className="input-gold w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>

                {/* Hours */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">
                    Ore di set: <span className="text-accent font-bold">{form.hours >= 4 ? '4+' : form.hours}h</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((h) => (
                      <button
                        key={h}
                        onClick={() => setForm((p) => ({ ...p, hours: h }))}
                        className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                          form.hours === h
                            ? 'border-accent bg-accent/15 text-accent'
                            : 'border-white/10 bg-white/5 text-white/70 hover:border-accent/40'
                        }`}
                      >
                        {h >= 4 ? '4+' : h}h
                        <div className="text-xs mt-0.5 font-normal opacity-70">€{PRICE_TABLE[h]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1.5">Note aggiuntive</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Generi preferiti, richieste speciali, dettagli sul venue..."
                    rows={3}
                    className="input-gold w-full px-4 py-3 rounded-xl text-sm resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price summary & CTA */}
          <div className="max-w-2xl mx-auto">
            <div className="card-gold rounded-2xl p-8">
              <h3 className="text-white font-bold text-lg mb-6">Riepilogo prezzo</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Set DJ ({form.hours >= 4 ? '4+' : form.hours} ore)</span>
                  <span className="text-white font-medium">€{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Acconto da pagare (30%)</span>
                  <span className="text-accent font-bold text-xl">€{depositAmount}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                  <span className="text-white/60">Saldo alla serata</span>
                  <span className="text-white font-medium">€{totalPrice - depositAmount}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !form.name || !form.email || !form.date || !form.eventType}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                  !isSubmitting && form.name && form.email && form.date && form.eventType
                    ? 'btn-gold'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Elaborazione...
                  </>
                ) : (
                  <>
                    Paga acconto €{depositAmount} e prenota
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-white/30 text-xs text-center mt-3">
                Pagamento sicuro tramite Stripe • Il saldo viene pagato il giorno dell&apos;evento
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
