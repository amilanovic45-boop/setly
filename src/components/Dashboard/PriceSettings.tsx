'use client'

import { useState } from 'react'

type PriceTier = {
  hours: number
  label: string
  price: number
  description: string
}

const DEFAULT_TIERS: PriceTier[] = [
  { hours: 1, label: '1 ora', price: 300, description: 'Set breve, ideale per aperitivi e cocktail party' },
  { hours: 2, label: '2 ore', price: 500, description: 'Set standard, perfetto per compleanni e feste private' },
  { hours: 3, label: '3 ore', price: 700, description: 'Set completo, ideale per matrimoni e corporate' },
  { hours: 4, label: '4+ ore', price: 900, description: 'Set full night, per club e serate lunghe' },
]

export default function PriceSettings() {
  const [tiers, setTiers] = useState<PriceTier[]>(DEFAULT_TIERS)
  const [depositPercent, setDepositPercent] = useState(30)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const updatePrice = (hours: number, price: number) => {
    setTiers((prev) =>
      prev.map((t) => (t.hours === hours ? { ...t, price } : t))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">Impostazioni Prezzi</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price tiers */}
        <div className="lg:col-span-2">
          <div className="card-gold rounded-2xl p-6">
            <h3 className="text-white font-bold mb-6">Tariffe per durata set</h3>

            <div className="space-y-4">
              {tiers.map((tier) => (
                <div key={tier.hours} className="flex items-center gap-4 p-4 bg-white/3 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent font-black text-sm flex-shrink-0">
                    {tier.hours >= 4 ? '4+h' : `${tier.hours}h`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm">{tier.label}</div>
                    <div className="text-white/45 text-xs mt-0.5">{tier.description}</div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-white/50 text-sm">€</span>
                    <input
                      type="number"
                      value={tier.price}
                      onChange={(e) => updatePrice(tier.hours, parseInt(e.target.value) || 0)}
                      className="input-gold w-24 px-3 py-2 rounded-lg text-right font-bold text-sm"
                      min={0}
                      step={50}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Deposit settings */}
            <div className="mt-6 p-4 bg-white/3 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-semibold text-sm">Percentuale acconto</div>
                  <div className="text-white/45 text-xs">Percentuale da pagare alla prenotazione</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="input-gold w-20 px-3 py-2 rounded-lg text-right font-bold text-sm"
                    min={0}
                    max={100}
                  />
                  <span className="text-white/50 text-sm">%</span>
                </div>
              </div>

              <div className="flex gap-2">
                {[20, 25, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDepositPercent(pct)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      depositPercent === pct
                        ? 'bg-accent/20 border border-accent text-accent'
                        : 'border border-white/15 text-white/50 hover:border-accent/40 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`mt-6 w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                saved ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'btn-gold'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Salvataggio...
                </>
              ) : saved ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvato!
                </>
              ) : (
                'Salva impostazioni'
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="card-gold rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 text-sm">Anteprima prezzi</h3>
            <div className="space-y-3">
              {tiers.map((tier) => {
                const deposit = Math.round(tier.price * (depositPercent / 100))
                return (
                  <div key={tier.hours} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <div>
                      <div className="text-white text-sm font-medium">{tier.label}</div>
                      <div className="text-white/40 text-xs">Acconto: €{deposit}</div>
                    </div>
                    <div className="text-accent font-black">€{tier.price}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card-gold rounded-xl p-5 bg-accent/5 border-accent/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-accent font-bold text-sm mb-1">Come funziona</div>
                <p className="text-white/60 text-xs leading-relaxed">
                  I clienti vedranno questi prezzi sulla pagina di prenotazione e pagheranno il {depositPercent}% di acconto tramite Stripe. Il saldo verrà pagato il giorno dell&apos;evento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
