import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Work in EdTech — Rebuilding',
  description: 'The future of education is being built. Join the community shaping it.',
  metadataBase: new URL('https://workinedtech.com'),
  openGraph: {
    title: 'Work in EdTech',
    description: 'The future of education is being built. Join the community shaping it.',
    images: ['/icon.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Work in EdTech',
    description: 'The future of education is being built. Join the community shaping it.',
    images: ['/icon.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="grain">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
