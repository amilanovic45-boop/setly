'use client'

import { useState } from 'react'

const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]
const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Initial mock — weekends occupied
function generateInitialState() {
  const unavailable = new Set<string>()
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  // Mark some Saturdays as occupied
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d)
    if (date.getMonth() !== month) break
    const dow = date.getDay()
    // Some Saturdays
    if (dow === 6 && (d === 7 || d === 14 || d === 28)) {
      unavailable.add(formatDate(year, month, d))
    }
  }
  return unavailable
}

export default function AvailabilityManager() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [unavailable, setUnavailable] = useState<Set<string>>(generateInitialState)
  const [saving, setSaving] = useState<string | null>(null)

  const firstDay = new Date(viewYear, viewMonth, 1)
  const startDayOfWeek = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()
  const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7

  const cells = Array.from({ length: totalCells }, (_, idx) => {
    const dayNum = idx - startDayOfWeek + 1
    if (dayNum <= 0) {
      return { day: daysInPrevMonth + dayNum, month: viewMonth - 1, year: viewMonth === 0 ? viewYear - 1 : viewYear, currentMonth: false }
    } else if (dayNum > daysInMonth) {
      return { day: dayNum - daysInMonth, month: viewMonth + 1, year: viewMonth === 11 ? viewYear + 1 : viewYear, currentMonth: false }
    }
    return { day: dayNum, month: viewMonth, year: viewYear, currentMonth: true }
  })

  const toggleDate = async (dateStr: string) => {
    setSaving(dateStr)
    const isCurrentlyUnavailable = unavailable.has(dateStr)
    const newUnavailable = new Set(unavailable)

    if (isCurrentlyUnavailable) {
      newUnavailable.delete(dateStr)
    } else {
      newUnavailable.add(dateStr)
    }
    setUnavailable(newUnavailable)

    // Try to save to API
    try {
      await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          is_available: isCurrentlyUnavailable, // toggling
        }),
      })
    } catch {
      // Silently fail — local state updated
    } finally {
      setSaving(null)
    }
  }

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const isPast = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day)
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return d < t
  }

  const unavailableCount = cells.filter(c => c.currentMonth && unavailable.has(formatDate(c.year, c.month, c.day))).length
  const availableCount = daysInMonth - unavailableCount

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">Gestione Disponibilità</h2>
        <p className="text-white/50 text-sm">Clicca su un giorno per cambiarne la disponibilità</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card-gold rounded-2xl p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPrevMonth}
              className="w-9 h-9 rounded-lg border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-accent/50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-white font-bold">{MONTHS[viewMonth]} {viewYear}</h3>
            <button
              onClick={goToNextMonth}
              className="w-9 h-9 rounded-lg border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-accent/50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-white/40 text-xs font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              const dateStr = formatDate(cell.year, cell.month, cell.day)
              const isCellUnavailable = unavailable.has(dateStr)
              const isCellPast = isPast(cell.year, cell.month, cell.day)
              const isSaving = saving === dateStr

              let className = 'calendar-day relative '
              if (!cell.currentMonth) {
                className += 'other-month cursor-default'
              } else if (isCellPast) {
                className += 'opacity-30 cursor-default'
              } else if (isCellUnavailable) {
                className += 'unavailable cursor-pointer hover:opacity-80'
              } else {
                className += 'available cursor-pointer hover:opacity-80'
              }

              return (
                <button
                  key={idx}
                  className={className}
                  onClick={() => {
                    if (cell.currentMonth && !isCellPast) toggleDate(dateStr)
                  }}
                  disabled={!cell.currentMonth || isCellPast}
                  title={cell.currentMonth ? (isCellUnavailable ? 'Occupato — clicca per liberare' : 'Libero — clicca per occupare') : ''}
                >
                  {isSaving ? (
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    cell.day
                  )}
                </button>
              )
            })}
          </div>

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
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card-gold rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Riepilogo {MONTHS[viewMonth]}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Giorni disponibili</span>
                <span className="text-green-400 font-bold">{availableCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Giorni occupati</span>
                <span className="text-red-400 font-bold">{unavailableCount}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <span className="text-white/60 text-sm">Totale giorni</span>
                <span className="text-white font-bold">{daysInMonth}</span>
              </div>
            </div>
          </div>

          <div className="card-gold rounded-xl p-6">
            <h3 className="text-white font-bold mb-3 text-sm">Come usare</h3>
            <ul className="space-y-2 text-white/50 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">●</span>
                Giorni <span className="text-green-400 font-medium mx-1">verdi</span> = disponibili per prenotazioni
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">●</span>
                Giorni <span className="text-red-400 font-medium mx-1">rossi</span> = occupati o bloccati
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">●</span>
                Clicca su qualsiasi giorno per cambiarne lo stato
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/30 mt-0.5">●</span>
                I giorni passati non sono modificabili
              </li>
            </ul>
          </div>

          {/* Quick block weekends */}
          <button
            onClick={() => {
              const newUnavailable = new Set(unavailable)
              for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(viewYear, viewMonth, d)
                if (date.getDay() === 6 || date.getDay() === 0) {
                  // Saturdays and Sundays
                }
              }
              // Just add next 4 Saturdays as example
              for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(viewYear, viewMonth, d)
                if (date.getDay() === 6) {
                  newUnavailable.add(formatDate(viewYear, viewMonth, d))
                }
              }
              setUnavailable(newUnavailable)
            }}
            className="w-full py-3 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-accent/40 transition-all text-sm font-medium"
          >
            Blocca tutti i sabati
          </button>
        </div>
      </div>
    </div>
  )
}
