import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'edge'

const SYSTEM_PROMPT = `Sei un DJ professionista con 10 anni di esperienza. In base alle informazioni sull'evento, crea una setlist dettagliata con progressione emotiva. Per ogni fase del set (apertura, costruzione, peak, chiusura) suggerisci 5-6 brani reali con artista e titolo. Spiega brevemente perché quella scelta funziona per quell'evento specifico. Tono professionale ma caldo e coinvolgente.

Struttura la risposta così:
- Titolo della sezione in maiuscolo (es: "🎵 APERTURA — Benvenuto in pista")
- Lista numerata dei brani: numero. Artista — Titolo
- Breve nota del DJ che spiega le scelte
- Separatore tra le sezioni

Usa 4 sezioni: APERTURA, BUILD UP, PEAK TIME, CHIUSURA`

function buildUserPrompt(data: {
  eventType: string
  atmosphere: string
  ageRange: string
  duration: string
  genres: string[]
  name: string
}): string {
  const eventLabels: Record<string, string> = {
    matrimonio: 'Matrimonio',
    festa_privata: 'Festa Privata',
    club: 'Club & Serata',
    corporate: 'Corporate Event',
    compleanno: 'Compleanno',
    altro: 'Evento speciale',
  }

  const atmosphereLabels: Record<string, string> = {
    romantica: 'Romantica e sognante',
    euforica: 'Euforica e festosa',
    elegante: 'Elegante e sofisticata',
    selvaggia: 'Selvaggia e scatenata',
    rilassata: 'Rilassata e lounge',
    progressiva: 'Progressiva, che cresce',
  }

  const ageLabels: Record<string, string> = {
    under25: 'Under 25 (giovani)',
    '25-35': '25-35 anni',
    '35-50': '35-50 anni',
    mista: 'Età mista, tutte le generazioni',
  }

  const genreLabels: Record<string, string> = {
    house: 'House',
    afro_house: 'Afro House',
    balkan: 'Balkan',
    hip_hop: 'Hip Hop',
    rnb: 'R&B',
    commerciale: 'Commerciale',
    anni_80_90: 'Anni 80/90',
    tech_house: 'Tech House',
    deep_house: 'Deep House',
    latin: 'Latin',
  }

  const genreList = data.genres.map((g) => genreLabels[g] || g).join(', ')

  return `Crea una setlist professionale per il seguente evento:

📅 TIPO EVENTO: ${eventLabels[data.eventType] || data.eventType}
🎭 ATMOSFERA: ${atmosphereLabels[data.atmosphere] || data.atmosphere}
👥 ETÀ PUBBLICO: ${ageLabels[data.ageRange] || data.ageRange}
⏱️ DURATA SET: ${data.duration}
🎵 GENERI PREFERITI: ${genreList}

Il cliente si chiama ${data.name}. Crea una setlist personalizzata che rispetti questi parametri, con brani reali e attuali (o classici se appropriato). Ogni brano deve essere scelto strategicamente per costruire la progressione emotiva giusta.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Return mock streaming response when no API key
      const mockSetlist = `🎵 APERTURA — Benvenuto in pista

1. Fisher — Losing It
2. Chris Lake — Operator (ft. Matt Ossentjuk)
3. Black Coffee — You Need Me (ft. David Guetta)
4. Themba — Ingoma
5. Peggy Gou — (It Goes Like) Nanana

🎵 Note del DJ: Per un ${body.eventType || 'evento'} con atmosfera ${body.atmosphere || 'euforica'}, partiamo morbidi ma con groove. Questi brani creano attesa e fanno scaldare il dancefloor gradualmente.

---

⬆️ BUILD UP — La tensione sale

1. Innellea — Arsia
2. Ben Böhmer — Breathing (Original Mix)
3. ARTBAT — Upperground
4. Tale Of Us — Talisman
5. Anyma — Running

🎵 Note del DJ: Entriamo nel vivo. La progressione melodica aumenta l'energia mantenendo eleganza. Perfetto per portare gli ospiti al picco emotivo.

---

🔥 PEAK TIME — Il momento magico

1. Afterlife — Anyma & Chris Avantgarde
2. Reinier Zonneveld — X
3. HardComplex — Panta Rei
4. Dj T. — The Game
5. Solomun — Home (ft. Tom Smith)
6. Adam Port — Move (ft. Monolink)

🎵 Note del DJ: Siamo al massimo. Questi brani creano un'esperienza emotiva unica, il dancefloor è in trance. Energia alle stelle senza mai perdere l'anima musicale.

---

🌅 CHIUSURA — La dolce conclusione

1. Gui Boratto — Beautiful Life
2. Pachanga Boys — We Are Really Sorry
3. Four Tet — Baby
4. Jon Hopkins — Open Eye Signal
5. Bonobo — Kong

🎵 Note del DJ: Scendiamo lentamente, lasciando un ricordo indelebile. Questi brani portano a casa gli ospiti con il sorriso e la voglia di tornare.`

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          const words = mockSetlist.split('')
          for (let i = 0; i < words.length; i++) {
            const chunk = `data: ${JSON.stringify({ text: words[i] })}\n\n`
            controller.enqueue(encoder.encode(chunk))
            if (i % 5 === 0) {
              await new Promise((r) => setTimeout(r, 5))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    const client = new Anthropic({ apiKey })
    const userPrompt = buildUserPrompt(body)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userPrompt }],
          })

          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
              controller.enqueue(encoder.encode(chunk))
            }
          }

          // Optionally save to Supabase here
          try {
            const { createServiceClient } = await import('@/lib/supabase')
            const supabase = createServiceClient()
            const fullText = await anthropicStream.finalMessage()
            await supabase.from('setlist_requests').insert({
              email: body.email,
              event_data: body,
              generated_setlist: fullText.content[0]?.type === 'text' ? fullText.content[0].text : '',
            })
          } catch {
            // Supabase might not be configured, ignore
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: `\n\nErrore: ${errMsg}` })}\n\n`))
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Errore interno del server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
