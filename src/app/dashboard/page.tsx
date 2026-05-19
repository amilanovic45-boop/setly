'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import BookingsList from '@/components/Dashboard/BookingsList'
import AvailabilityManager from '@/components/Dashboard/AvailabilityManager'
import PriceSettings from '@/components/Dashboard/PriceSettings'

type Tab = 'bookings' | 'availability' | 'prices' | 'payments'

// Mock bookings for demonstration
const MOCK_BOOKINGS = [
  { id: '1', name: 'Marco Rossi', date: '2025-06-14', event_type: 'Matrimonio', status: 'confirmed', amount: 700, deposit_paid: true, email: 'marco@test.it', location: 'Villa Reale, Milano' },
  { id: '2', name: 'Giulia Ferrari', date: '2025-06-21', event_type: 'Compleanno', status: 'pending', amount: 500, deposit_paid: false, email: 'giulia@test.it', location: 'Casa Privata, Roma' },
  { id: '3', name: 'Luca Bianchi', date: '2025-07-05', event_type: 'Corporate', status: 'confirmed', amount: 900, deposit_paid: true, email: 'luca@corp.it', location: 'Hotel Excelsior, Firenze' },
  { id: '4', name: 'Sofia Conti', date: '2025-07-12', event_type: 'Club & Serata', status: 'cancelled', amount: 300, deposit_paid: false, email: 'sofia@test.it', location: 'Club Noir, Bologna' },
  { id: '5', name: 'Alessandro Marino', date: '2025-08-02', event_type: 'Festa Privata', status: 'pending', amount: 700, deposit_paid: false, email: 'alex@test.it', location: 'Terrazza Privata, Napoli' },
]

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('bookings')

  useEffect(() => {
    const auth = localStorage.getItem('setly_dashboard_auth')
    if (auth === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    // Small delay to simulate auth check
    await new Promise((r) => setTimeout(r, 800))

    // In production this would check against env vars server-side
    // For demo, accept any non-empty credentials
    if (loginEmail && loginPassword) {
      localStorage.setItem('setly_dashboard_auth', 'authenticated')
      setIsAuthenticated(true)
    } else {
      setLoginError('Credenziali non valide')
    }
    setIsLoggingIn(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('setly_dashboard_auth')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-background font-black">S</span>
              </div>
              <span className="font-black text-2xl">SETLY</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-4 mb-1">Dashboard DJ</h1>
            <p className="text-white/50 text-sm">Accedi per gestire le prenotazioni</p>
          </div>

          <div className="card-gold rounded-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="dj@setly.it"
                  className="input-gold w-full px-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm font-medium mb-1.5">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-gold w-full px-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn-gold w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  'Accedi'
                )}
              </button>
            </form>

            <p className="text-white/30 text-xs text-center mt-4">
              Area riservata al DJ. Per assistenza: info@setly.it
            </p>
          </div>
        </div>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'bookings',
      label: 'Prenotazioni',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'availability',
      label: 'Disponibilità',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'prices',
      label: 'Prezzi',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'payments',
      label: 'Pagamenti',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ]

  const confirmedCount = MOCK_BOOKINGS.filter((b) => b.status === 'confirmed').length
  const pendingCount = MOCK_BOOKINGS.filter((b) => b.status === 'pending').length
  const totalRevenue = MOCK_BOOKINGS.filter((b) => b.status === 'confirmed').reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Dashboard header */}
        <div className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Dashboard</h1>
            <p className="text-white/50 text-sm mt-1">Benvenuto DJ — gestisci le tue prenotazioni</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Prenotazioni Totali', value: MOCK_BOOKINGS.length, color: 'text-white' },
            { label: 'Confermate', value: confirmedCount, color: 'text-green-400' },
            { label: 'In Attesa', value: pendingCount, color: 'text-yellow-400' },
            { label: 'Revenue Totale', value: `€${totalRevenue}`, color: 'text-accent' },
          ].map((stat) => (
            <div key={stat.label} className="card-gold rounded-xl p-5">
              <div className={`text-2xl font-black ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-white/50 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface rounded-xl mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-accent text-background font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="pb-12">
          {activeTab === 'bookings' && <BookingsList bookings={MOCK_BOOKINGS} />}
          {activeTab === 'availability' && <AvailabilityManager />}
          {activeTab === 'prices' && <PriceSettings />}
          {activeTab === 'payments' && (
            <div className="card-gold rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Cronologia Pagamenti Stripe</h3>
              <p className="text-white/50 text-sm mb-6">
                Connetti il tuo account Stripe per visualizzare la cronologia completa dei pagamenti ricevuti.
              </p>
              <div className="space-y-3">
                {[
                  { name: 'Marco Rossi', amount: 210, date: '2025-05-20', status: 'succeeded' },
                  { name: 'Luca Bianchi', amount: 270, date: '2025-05-15', status: 'succeeded' },
                ].map((payment) => (
                  <div key={payment.name} className="flex items-center justify-between p-4 bg-surface rounded-xl text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">{payment.name}</div>
                        <div className="text-white/40 text-xs">{payment.date}</div>
                      </div>
                    </div>
                    <div className="text-green-400 font-bold">+€{payment.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
