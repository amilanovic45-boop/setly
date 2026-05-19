import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'SETLY — Il tuo DJ per eventi indimenticabili',
  description: 'Descrivi il tuo evento, l\'AI crea la setlist perfetta. Poi prenota il tuo DJ professionista in un click.',
  keywords: ['DJ', 'eventi', 'matrimoni', 'feste', 'setlist', 'musica', 'DJ professionista'],
  openGraph: {
    title: 'SETLY — Il tuo DJ per eventi indimenticabili',
    description: 'Descrivi il tuo evento, l\'AI crea la setlist perfetta.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className={inter.variable}>
      <body className="bg-background text-white antialiased">
        {children}
      </body>
    </html>
  )
}
