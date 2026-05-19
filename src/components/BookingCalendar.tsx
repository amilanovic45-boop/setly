'use client'

import { useState, useEffect } from 'react'

type Props = {
  selectedDate: string
  onSelectDate: (date: string) => void
}

// Mock unavailable dates (would come from DB in production)
const MOCK_UNAVAILABLE = new Set([
  '2025-06-07',
  '2025-06-14',
  '2025-06-21',
  '2025-06-28',
  '2025-07-05',
  '2025-07-12',
  '2025-07-19',
  '2025-07-26',
])

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function BookingCalendar({ selectedDate, onSelectDate }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(MOCK_UNAVAILABLE)

  useEffect(() => {
    // Fetch availability from API
    const fetchAvailability = async () => {
      try {
        const res = await fetch('/api/availability')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            const unavailable = new Set<string>(
              data
                .filter((d: { is_available: boolean; date: string }) => !d.is_available)
                .map((d: { date: string }) => d.date)
            )
            if (unavailable.size > 0) {
              setUnavailableDates(unavailable)
            }
          }
        }
      } catch {
        // Use mock data as fallback
      }
    }
    fetchAvailability()
  }, [])

  const firstDay = new Date(viewYear, viewMonth, 1)
  // Monday-based: 0=Mon, 6=Sun
  const startDayOfWeek = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

  const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const isToday = (year: number, month: number, day: number) => {
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
  }

  const isPast = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day)
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return d < t
  }

  const cells = Array.from({ length: totalCells }, (_, idx) => {
    const dayNum = idx - startDayOfWeek + 1
    if (dayNum <= 0) {
      // Previous month
      return {
        day: daysInPrevMonth + dayNum,
        month: viewMonth - 1,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        currentMonth: false,
      }
    } else if (dayNum > daysInMonth) {
      // Next month
      return {
        day: dayNum - daysInMonth,
        month: viewMonth + 1,
        year: viewMonth === 11 ? viewYear + 1 : viewYear,
        currentMonth: false,
      }
    } else {
      return {
        day: dayNum,
        month: viewMonth,
        year: viewYear,
        currentMonth: true,
      }
    }
  })

  return (
    <div className="card-gold rounded-2xl p-6">
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

        <h3 className="text-white font-bold">
          {MONTHS[viewMonth]} {viewYear}
        </h3>

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
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="text-center text-white/40 text-xs font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          const dateStr = formatDate(cell.year, cell.month, cell.day)
          const isUnavailable = unavailableDates.has(dateStr)
          const isPastDate = isPast(cell.year, cell.month, cell.day)
          const isTodayDate = cell.currentMonth && isToday(cell.year, cell.month, cell.day)
          const isSelected = dateStr === selectedDate

          let className = 'calendar-day '

          if (!cell.currentMonth) {
            className += 'other-month'
          } else if (isSelected) {
            className += 'selected'
          } else if (isPastDate || isUnavailable) {
            className += 'unavailable'
          } else {
            className += 'available'
          }

          if (isTodayDate && !isSelected) {
            className += ' today'
          }

          return (
            <button
              key={idx}
              className={className}
              onClick={() => {
                if (cell.currentMonth && !isPastDate && !isUnavailable) {
                  onSelectDate(dateStr)
                }
              }}
              disabled={!cell.currentMonth || isPastDate || isUnavailable}
              title={dateStr}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-xl text-center">
          <span className="text-accent text-sm font-medium">
            ✓ Selezionato: {new Date(selectedDate + 'T12:00:00').toLocaleDateString('it-IT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  )
}
