import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Price Watcher',
  description: 'Watch prices for a few products. Sync via cron.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="grain">{children}</body>
    </html>
  )
}
