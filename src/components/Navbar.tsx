'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-md border-b border-gold-border shadow-lg shadow-black/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-background font-black text-sm">S</span>
            </div>
            <span className="font-black text-xl tracking-tight text-white">SETLY</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#come-funziona" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Come Funziona
            </Link>
            <Link href="/#eventi" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Eventi
            </Link>
            <Link href="/booking" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Prenota
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/genera"
              className="btn-gold px-5 py-2 rounded-lg text-sm font-bold"
            >
              Crea Setlist Gratis
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-md border-b border-gold-border">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/#come-funziona"
              className="block text-white/70 hover:text-white text-sm font-medium transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              Come Funziona
            </Link>
            <Link
              href="/#eventi"
              className="block text-white/70 hover:text-white text-sm font-medium transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              Eventi
            </Link>
            <Link
              href="/booking"
              className="block text-white/70 hover:text-white text-sm font-medium transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              Prenota
            </Link>
            <Link
              href="/genera"
              className="block btn-gold px-5 py-3 rounded-lg text-sm font-bold text-center"
              onClick={() => setMenuOpen(false)}
            >
              Crea Setlist Gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
