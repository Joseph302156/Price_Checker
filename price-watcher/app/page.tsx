import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-slate-200 bg-ink text-cream">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <span className="font-display text-2xl font-semibold tracking-tight">
            Price<span className="text-ember">Watcher</span>
          </span>
          <nav>
            <Link
              href="/products"
              className="font-body text-sm text-cream hover:text-ember transition-colors"
            >
              Products
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 px-8 py-10 md:px-10 md:py-12">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-4 text-ink">
          Keep track of price changes
          </h1>
          <p className="font-body text-base text-slate-600 max-w-2xl mb-8">
            Track products across the web like your own Amazon watchlist. Add items by
            URL and we’ll keep an eye on price, sale status, and availability.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ember text-ink font-body text-sm font-medium shadow-sm hover:bg-amber-400 transition-colors"
          >
            Go to Products
          </Link>
        </div>
      </main>
    </div>
  )
}
