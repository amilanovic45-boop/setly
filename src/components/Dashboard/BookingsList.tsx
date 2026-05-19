'use client'

type Booking = {
  id: string
  name: string
  email: string
  date: string
  event_type: string
  status: string
  amount: number
  deposit_paid: boolean
  location: string
}

type Props = {
  bookings: Booking[]
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    pending: { label: 'In Attesa', className: 'badge-pending' },
    confirmed: { label: 'Confermata', className: 'badge-confirmed' },
    cancelled: { label: 'Annullata', className: 'badge-cancelled' },
  }
  const config = configs[status] || { label: status, className: 'badge-pending' }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export default function BookingsList({ bookings }: Props) {
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">Prenotazioni</h2>
        <span className="text-white/50 text-sm">{bookings.length} totali</span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card-gold rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-white/50 text-xs font-bold uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-4 text-white/50 text-xs font-bold uppercase tracking-wider">Data</th>
                <th className="text-left px-6 py-4 text-white/50 text-xs font-bold uppercase tracking-wider">Evento</th>
                <th className="text-left px-6 py-4 text-white/50 text-xs font-bold uppercase tracking-wider">Luogo</th>
                <th className="text-left px-6 py-4 text-white/50 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-white/50 text-xs font-bold uppercase tracking-wider">Importo</th>
                <th className="text-left px-6 py-4 text-white/50 text-xs font-bold uppercase tracking-wider">Acconto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium text-sm">{booking.name}</div>
                    <div className="text-white/40 text-xs">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white text-sm">
                      {new Date(booking.date + 'T12:00:00').toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-white/40 text-xs">
                      {new Date(booking.date + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white/80 text-sm">{booking.event_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white/60 text-sm">{booking.location}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-white font-bold text-sm">€{booking.amount}</div>
                    <div className="text-white/40 text-xs">+€{Math.round(booking.amount * 0.3)} dep.</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${booking.deposit_paid ? 'text-green-400' : 'text-white/40'}`}>
                      {booking.deposit_paid ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Pagato
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          In attesa
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sortedBookings.map((booking) => (
          <div key={booking.id} className="card-gold rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-white font-bold">{booking.name}</div>
                <div className="text-white/50 text-xs">{booking.email}</div>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-white/40 text-xs mb-0.5">Data</div>
                <div className="text-white">
                  {new Date(booking.date + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div>
                <div className="text-white/40 text-xs mb-0.5">Evento</div>
                <div className="text-white">{booking.event_type}</div>
              </div>
              <div>
                <div className="text-white/40 text-xs mb-0.5">Importo</div>
                <div className="text-accent font-bold">€{booking.amount}</div>
              </div>
              <div>
                <div className="text-white/40 text-xs mb-0.5">Acconto</div>
                <div className={booking.deposit_paid ? 'text-green-400' : 'text-white/40'}>
                  {booking.deposit_paid ? '✓ Pagato' : 'In attesa'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming events calendar mini */}
      <div className="mt-8">
        <h3 className="text-white font-bold text-lg mb-4">Prossimi eventi confermati</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBookings
            .filter((b) => b.status === 'confirmed')
            .slice(0, 3)
            .map((booking) => (
              <div key={booking.id} className="card-gold rounded-xl p-5 border-green-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{booking.event_type}</div>
                    <div className="text-accent text-xs font-medium">
                      {new Date(booking.date + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                </div>
                <div className="text-white/60 text-xs">{booking.name}</div>
                <div className="text-white/40 text-xs">{booking.location}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
