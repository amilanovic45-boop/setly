'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

type StepOption = {
  value: string
  label: string
  icon?: string
}

const STEPS = [
  {
    id: 1,
    question: 'Che tipo di evento stai organizzando?',
    subtitle: 'Scegli la categoria che descrive meglio il tuo evento',
    field: 'eventType',
    type: 'single',
    options: [
      { value: 'matrimonio', label: 'Matrimonio', icon: '💒' },
      { value: 'festa_privata', label: 'Festa Privata', icon: '🎉' },
      { value: 'club', label: 'Club & Serate', icon: '🎶' },
      { value: 'corporate', label: 'Corporate', icon: '🏢' },
      { value: 'compleanno', label: 'Compleanno', icon: '🎂' },
      { value: 'altro', label: 'Altro', icon: '✨' },
    ] as StepOption[],
  },
  {
    id: 2,
    question: 'Che atmosfera vuoi creare?',
    subtitle: 'L\'atmosfera guida la progressione emotiva della serata',
    field: 'atmosphere',
    type: 'single',
    options: [
      { value: 'romantica', label: 'Romantica', icon: '💫' },
      { value: 'euforica', label: 'Euforica', icon: '🔥' },
      { value: 'elegante', label: 'Elegante', icon: '✨' },
      { value: 'selvaggia', label: 'Selvaggia', icon: '🐆' },
      { value: 'rilassata', label: 'Rilassata', icon: '🌊' },
      { value: 'progressiva', label: 'Progressiva', icon: '📈' },
    ] as StepOption[],
  },
  {
    id: 3,
    question: 'Qual è la fascia d\'età dei tuoi ospiti?',
    subtitle: 'Questo influenza molto la selezione musicale',
    field: 'ageRange',
    type: 'single',
    options: [
      { value: 'under25', label: 'Under 25', icon: '🎓' },
      { value: '25-35', label: '25 — 35', icon: '🎯' },
      { value: '35-50', label: '35 — 50', icon: '🥂' },
      { value: 'mista', label: 'Età Mista', icon: '👨‍👩‍👧‍👦' },
    ] as StepOption[],
  },
  {
    id: 4,
    question: 'Quanto dura il tuo set?',
    subtitle: 'La durata determina la struttura e il numero di brani',
    field: 'duration',
    type: 'single',
    options: [
      { value: '1h', label: '1 ora', icon: '⚡' },
      { value: '2h', label: '2 ore', icon: '🎵' },
      { value: '3h', label: '3 ore', icon: '🎧' },
      { value: '4h+', label: '4+ ore', icon: '🏆' },
    ] as StepOption[],
  },
  {
    id: 5,
    question: 'Quali generi preferisci?',
    subtitle: 'Puoi selezionare più generi — il DJ li mixerà perfettamente',
    field: 'genres',
    type: 'multi',
    options: [
      { value: 'house', label: 'House', icon: '🏠' },
      { value: 'afro_house', label: 'Afro House', icon: '🌍' },
      { value: 'balkan', label: 'Balkan', icon: '🎺' },
      { value: 'hip_hop', label: 'Hip Hop', icon: '🎤' },
      { value: 'rnb', label: 'R&B', icon: '🎷' },
      { value: 'commerciale', label: 'Commerciale', icon: '📻' },
      { value: 'anni_80_90', label: 'Anni 80/90', icon: '📼' },
      { value: 'tech_house', label: 'Tech House', icon: '⚙️' },
      { value: 'deep_house', label: 'Deep House', icon: '🌊' },
      { value: 'latin', label: 'Latin', icon: '💃' },
    ] as StepOption[],
  },
  {
    id: 6,
    question: 'Quasi fatto! Come ti chiami?',
    subtitle: 'Inserisci il tuo nome e email per ricevere la setlist',
    field: 'contact',
    type: 'contact',
    options: [] as StepOption[],
  },
]

type FormData = {
  eventType: string
  atmosphere: string
  ageRange: string
  duration: string
  genres: string[]
  name: string
  email: string
}

type SetlistSection = {
  phase: string
  tracks: { number: number; artist: string; title: string }[]
  note?: string
}

export default function GeneraPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    eventType: '',
    atmosphere: '',
    ageRange: '',
    duration: '',
    genres: [],
    name: '',
    email: '',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [animating, setAnimating] = useState(false)
  const streamRef = useRef<string>('')
  const setlistRef = useRef<HTMLDivElement>(null)

  const step = STEPS[currentStep]
  const progress = ((currentStep) / STEPS.length) * 100

  const getFieldValue = (field: string): string | string[] => {
    if (field === 'genres') return formData.genres
    return formData[field as keyof FormData] as string
  }

  const handleSingleSelect = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Auto-advance after a brief delay
    setTimeout(() => goNext(), 350)
  }

  const handleMultiSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(value)
        ? prev.genres.filter((g) => g !== value)
        : [...prev.genres, value],
    }))
  }

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setAnimating(true)
      setTimeout(() => {
        setCurrentStep((s) => s + 1)
        setAnimating(false)
      }, 300)
    }
  }

  const goPrev = () => {
    if (currentStep > 0) {
      setAnimating(true)
      setTimeout(() => {
        setCurrentStep((s) => s - 1)
        setAnimating(false)
      }, 300)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return

    setIsGenerating(true)
    streamRef.current = ''
    setStreamedText('')

    try {
      const response = await fetch('/api/generate-setlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok || !response.body) {
        throw new Error('Errore nella generazione')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                streamRef.current += parsed.text
                setStreamedText(streamRef.current)
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }

      setIsComplete(true)
      setTimeout(() => {
        setlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (error) {
      console.error(error)
      setStreamedText('Si è verificato un errore. Riprova tra qualche momento.')
      setIsComplete(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const eventTypeLabel = STEPS[0].options.find((o) => o.value === formData.eventType)?.label || formData.eventType

  const canProceedStep5 = formData.genres.length > 0

  if (isGenerating || isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
          {isGenerating && !isComplete && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Sto creando la tua setlist...</h2>
              <p className="text-white/50">L&apos;AI sta analizzando le tue preferenze</p>
            </div>
          )}

          {streamedText && (
            <div ref={setlistRef}>
              <div className="mb-8 text-center">
                <span className="text-accent text-sm font-bold uppercase tracking-widest mb-2 block">La tua setlist personalizzata</span>
                <h1 className="text-3xl sm:text-4xl font-black text-white">
                  La tua setlist per{' '}
                  <span className="text-gold-gradient">{eventTypeLabel}</span>
                </h1>
              </div>

              <div className="card-gold rounded-2xl p-6 sm:p-8 mb-8">
                <div
                  className={`text-white/80 leading-relaxed whitespace-pre-wrap font-mono text-sm ${!isComplete ? 'streaming-cursor' : ''}`}
                >
                  {streamedText}
                </div>
              </div>

              {isComplete && (
                <div className="text-center animate-fade-in">
                  <div className="card-gold rounded-2xl p-8 mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Ti piace la setlist?</h3>
                    <p className="text-white/60 mb-6">Prenota il DJ e porta questa musica al tuo evento</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        href="/booking"
                        className="btn-gold px-8 py-4 rounded-xl font-bold inline-flex items-center justify-center gap-2"
                      >
                        Prenota il DJ ora
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => {
                          setIsComplete(false)
                          setIsGenerating(false)
                          setStreamedText('')
                          setCurrentStep(0)
                          setFormData({ eventType: '', atmosphere: '', ageRange: '', duration: '', genres: [], name: '', email: '' })
                        }}
                        className="px-8 py-4 rounded-xl font-semibold border border-white/20 hover:border-accent/50 hover:text-accent transition-all"
                      >
                        Crea una nuova setlist
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-accent text-sm font-bold uppercase tracking-widest mb-2 block">Generatore AI</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Crea la tua setlist
            </h1>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-sm">
                Passo {currentStep + 1} di {STEPS.length}
              </span>
              <span className="text-accent text-sm font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Step dots */}
            <div className="flex justify-center gap-2 mt-4">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`step-dot ${i === currentStep ? 'active' : i < currentStep ? 'completed' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Step content */}
          <div
            className={`transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
          >
            <div className="card-gold rounded-2xl p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{step.question}</h2>
              <p className="text-white/50 text-sm mb-8">{step.subtitle}</p>

              {/* Single select */}
              {step.type === 'single' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {step.options.map((opt) => {
                    const isSelected = getFieldValue(step.field) === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSingleSelect(step.field, opt.value)}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-accent bg-accent/15 shadow-[0_0_20px_rgba(245,166,35,0.15)]'
                            : 'border-white/10 bg-white/5 hover:border-accent/40 hover:bg-accent/5'
                        }`}
                      >
                        <div className="text-2xl mb-2">{opt.icon}</div>
                        <div className={`text-sm font-semibold ${isSelected ? 'text-accent' : 'text-white'}`}>
                          {opt.label}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Multi select */}
              {step.type === 'multi' && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {step.options.map((opt) => {
                      const isSelected = formData.genres.includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleMultiSelect(opt.value)}
                          className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-accent bg-accent/15 shadow-[0_0_20px_rgba(245,166,35,0.15)]'
                              : 'border-white/10 bg-white/5 hover:border-accent/40 hover:bg-accent/5'
                          }`}
                        >
                          <div className="text-2xl mb-2">{opt.icon}</div>
                          <div className={`text-sm font-semibold ${isSelected ? 'text-accent' : 'text-white'}`}>
                            {opt.label}
                          </div>
                          {isSelected && (
                            <div className="mt-1">
                              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={goNext}
                    disabled={!canProceedStep5}
                    className={`w-full py-4 rounded-xl font-bold transition-all ${
                      canProceedStep5
                        ? 'btn-gold'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {canProceedStep5
                      ? `Continua con ${formData.genres.length} ${formData.genres.length === 1 ? 'genere' : 'generi'} →`
                      : 'Seleziona almeno un genere'}
                  </button>
                </>
              )}

              {/* Contact form */}
              {step.type === 'contact' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">Il tuo nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Es. Marco Rossi"
                      className="input-gold w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">La tua email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="marco@esempio.it"
                      className="input-gold w-full px-4 py-3 rounded-xl text-sm"
                    />
                  </div>

                  <div className="mt-2 p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <h4 className="text-accent font-bold text-sm mb-2">Riepilogo del tuo evento:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                      <div>Evento: <span className="text-white">{STEPS[0].options.find(o => o.value === formData.eventType)?.label}</span></div>
                      <div>Atmosfera: <span className="text-white">{STEPS[1].options.find(o => o.value === formData.atmosphere)?.label}</span></div>
                      <div>Età: <span className="text-white">{STEPS[2].options.find(o => o.value === formData.ageRange)?.label}</span></div>
                      <div>Durata: <span className="text-white">{STEPS[3].options.find(o => o.value === formData.duration)?.label}</span></div>
                      <div className="col-span-2">Generi: <span className="text-white">{formData.genres.join(', ')}</span></div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.email}
                    className={`w-full py-4 rounded-xl font-bold transition-all text-base ${
                      formData.name && formData.email
                        ? 'btn-gold'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    ✨ Genera la mia setlist
                  </button>

                  <p className="text-white/30 text-xs text-center">
                    Gratis • Nessuna spam • Puoi disiscriverti in qualsiasi momento
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          {step.type !== 'contact' && step.type !== 'multi' && (
            <div className="flex justify-between mt-6">
              <button
                onClick={goPrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentStep === 0
                    ? 'text-white/20 cursor-not-allowed'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Indietro
              </button>
              <span className="text-white/30 text-sm flex items-center">
                Seleziona un&apos;opzione per continuare
              </span>
            </div>
          )}

          {step.type === 'multi' && (
            <div className="flex justify-start mt-6">
              <button
                onClick={goPrev}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Indietro
              </button>
            </div>
          )}

          {step.type === 'contact' && (
            <div className="flex justify-start mt-6">
              <button
                onClick={goPrev}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Indietro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
