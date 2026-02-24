import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Price Watcher',
  description: 'Keep track of price changes for products you want to monitor.',
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
