import type { Metadata, Viewport } from 'next'
import { Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { DevSwCleanup } from '@/components/DevSwCleanup'
// import { DevBanner } from '@/components/DevBanner'
import './globals.css'

const interTight = Inter_Tight({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '700', '800', '900'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Protest Pilot — Fair Appraisal. One Tap Away.',
  description:
    'Texas Taxes Are High. Your Bill Doesn’t Have to Be. Generate a filed-ready Form 50-132 with comparable-sales evidence in minutes.',
}

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <DevSwCleanup />
        {children}
        {/* <DevBanner /> */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
