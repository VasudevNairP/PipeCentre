import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'Pipe Centre — Plumbing & Electrical Supplies',
  description: 'Quality plumbing and electrical supplies for every project. Browse our catalogue or call us for prices.',
  keywords: 'plumbing supplies, electrical supplies, pipes, fittings, taps, bulbs, fans, Bengaluru',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-white text-gray-900">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
