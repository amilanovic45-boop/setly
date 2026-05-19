'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const eventTypes = [
  { icon: '🎉', label: 'Feste Private', desc: 'L\'atmosfera perfetta per ogni celebrazione' },
  { icon: '💒', label: 'Matrimoni', desc: 'Il giorno più bello, la musica più bella' },
  { icon: '🏢', label: 'Corporate', desc: 'Professionalità e ritmo per ogni evento aziendale' },
  { icon: '🎶', label: 'Club & Serate', desc: 'Set esclusivi per le notti più hot' },
  { icon: '🌍', label: 'Eventi Balkan', desc: 'Ritmi balcanici che fanno esplodere la pista' },
  { icon: '🌊', label: 'Afro House', desc: 'Vibes africane e house music underground' },
  { icon: '🎓', label: 'University Party', desc: 'Energy al massimo per le feste universitarie' },
  { icon: '🎂', label: 'Compleanni', desc: 'Il tuo giorno speciale con la colonna sonora giusta' },
]

const steps = [
  {
    number: '01',
    title: 'Descrivi il tuo evento',
    desc: 'Rispondi a 6 semplici domande: tipo evento, atmosfera, generi preferiti e durata del set.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'L\'AI genera la setlist',
    desc: 'Il nostro DJ virtuale alimentato da Claude AI crea una setlist professionale con progressione emotiva su misura.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Prenota il DJ',
    desc: 'Ti piace la setlist? Prenota il DJ in un click, paga il 30% di acconto con Stripe e il gioco è fatto.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const testimonials = [
  {
    name: 'Giulia M.',
    event: 'Matrimonio — Agosto 2024',
    avatar: 'G',
    rating: 5,
    text: 'Ho usato SETLY per il mio matrimonio e sono rimasta senza parole. La setlist generata dall\'AI era perfettamente calata nel mood romantico ma festoso che volevamo. Il DJ ha suonato esattamente quello che ci aspettavamo. Serata da sogno!',
  },
  {
    name: 'Lorenzo B.',
    event: 'Festa privata — Luglio 2024',
    avatar: 'L',
    rating: 5,
    text: 'Avevo paura che la musica non funzionasse per la mia festa mista di 80 persone, ma la setlist AI ha azzeccato tutto. Mix perfetto tra house, commerciale e qualche hit anni 90. Tutti hanno ballato fino alle 4!',
  },
  {
    name: 'Sara & Dario',
    event: 'Corporate event — Settembre 2024',
    avatar: 'S',
    rating: 5,
    text: 'Organizzare musica per un evento aziendale è sempre uno stress. SETLY ha eliminato ogni dubbio: setlist professionale, elegante e coinvolgente. I nostri 200 ospiti erano entusiasti. Lo riprenoteremo sicuramente.',
  },
]

function ParticlesBackground() {
  return (
    <div className="particles-bg" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            '--duration': `${6 + Math.random() * 8}s`,
            '--delay': `${Math.random() * 8}s`,
            '--drift': `${(Math.random() - 0.5) * 100}px`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function AnimateOnScroll({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-mesh">
        <div className="noise-overlay" />
        <ParticlesBackground />

        {/* Background glow rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="w-[600px] h-[600px] rounded-full border border-accent/5 animate-[spin_30s_linear_infinite]" />
          <div className="absolute w-[400px] h-[400px] rounded-full border border-accent/8 animate-[spin_20s_linear_infinite_reverse]" />
          <div className="absolute w-[200px] h-[200px] rounded-full bg-accent/3 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Powered by Claude AI
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 animate-slide-up">
            Il tuo momento speciale
            <br />
            merita la{' '}
            <span className="text-gold-gradient">colonna sonora</span>
            <br />
            perfetta
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Descrivi il tuo evento, l&apos;AI crea la setlist.
            <br />
            Poi prenota il tuo DJ in un click.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/genera"
              className="btn-gold px-8 py-4 rounded-xl text-lg font-bold inline-flex items-center gap-2 animate-pulse-gold"
            >
              Crea la tua setlist gratis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/booking"
              className="px-8 py-4 rounded-xl text-lg font-semibold border border-white/20 hover:border-accent/50 hover:text-accent transition-all inline-flex items-center gap-2"
            >
              Prenota il DJ
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '500+', label: 'eventi suonati' },
              { value: '10', label: 'anni di esperienza' },
              { value: '98%', label: 'clienti soddisfatti' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-accent">{stat.value}</div>
                <div className="text-white/50 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-xs uppercase tracking-widest">Scopri</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Come Funziona */}
      <section id="come-funziona" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll className="text-center mb-16">
            <span className="text-accent text-sm font-bold uppercase tracking-widest mb-3 block">Il processo</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Come funziona
            </h2>
            <p className="text-white/50 mt-4 text-lg max-w-xl mx-auto">
              Tre semplici passi per l&apos;evento musicale dei tuoi sogni
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

            {steps.map((step, i) => (
              <AnimateOnScroll key={step.number} className="" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="card-gold rounded-2xl p-8 text-center relative group">
                  {/* Step number */}
                  <div className="text-accent/20 font-black text-6xl absolute top-4 right-6 leading-none select-none">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll className="text-center mt-12">
            <Link href="/genera" className="btn-gold px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2">
              Inizia ora — è gratis
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Event Types */}
      <section id="eventi" className="py-24 px-4 sm:px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll className="text-center mb-16">
            <span className="text-accent text-sm font-bold uppercase tracking-widest mb-3 block">Specializzazioni</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Ogni evento, la <span className="text-gold-gradient">musica giusta</span>
            </h2>
            <p className="text-white/50 mt-4 text-lg max-w-xl mx-auto">
              Dalla festa universitaria al matrimonio da sogno, il DJ si adatta al tuo mondo
            </p>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {eventTypes.map((event, i) => (
              <AnimateOnScroll key={event.label} style={{ transitionDelay: `${i * 0.07}s` }}>
                <Link href="/genera">
                  <div className="card-gold rounded-xl p-6 text-center cursor-pointer group h-full">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {event.icon}
                    </div>
                    <h3 className="text-white font-bold text-sm mb-2">{event.label}</h3>
                    <p className="text-white/45 text-xs leading-relaxed">{event.desc}</p>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll className="text-center mb-16">
            <span className="text-accent text-sm font-bold uppercase tracking-widest mb-3 block">Recensioni</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Cosa dicono i nostri clienti
            </h2>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <AnimateOnScroll key={testimonial.name} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={`card-gold rounded-2xl p-8 flex flex-col h-full transition-all duration-300 ${activeTestimonial === i ? 'border-accent/50 shadow-[0_0_30px_rgba(245,166,35,0.1)]' : ''}`}>
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-white/70 text-sm leading-relaxed flex-1 mb-6">
                    &ldquo;{testimonial.text}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{testimonial.name}</div>
                      <div className="text-white/40 text-xs">{testimonial.event}</div>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Testimonial dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`step-dot transition-all ${activeTestimonial === i ? 'active scale-125' : ''}`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 bg-surface">
        <AnimateOnScroll>
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/10 to-transparent p-12 sm:p-16">
              {/* Background glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                <div className="w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                  Pronto a creare
                  <br />
                  <span className="text-gold-gradient">qualcosa di epico?</span>
                </h2>
                <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                  Genera la tua setlist personalizzata gratis in 2 minuti. Nessuna registrazione richiesta.
                </p>
                <Link href="/genera" className="btn-gold px-10 py-4 rounded-xl text-lg font-bold inline-flex items-center gap-2">
                  Crea la tua setlist gratis
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <p className="text-white/30 text-sm mt-4">Gratis • Nessuna carta richiesta • Risultati immediati</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      <Footer />
    </div>
  )
}
