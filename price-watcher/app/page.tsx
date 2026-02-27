import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-slate-200 bg-ink text-cream">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between">
          <span className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Price<span className="text-ember">Watcher</span>
          </span>
          <nav>
            <Link
              href="/products"
              className="font-body text-base text-cream hover:text-ember transition-colors"
            >
              Products
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-14 sm:py-20">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/80 px-8 py-12 sm:px-12 sm:py-16">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight mb-5 text-ink leading-tight">
            Keep track of price changes
          </h1>
          <p className="font-body text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed">
            Track products across the web like your own watchlist. Add items by URL and
            we’ll keep an eye on price, sale status, and availability.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-ember text-ink font-body text-base font-semibold shadow-sm hover:bg-amber-400 transition-colors"
          >
            Go to Products
          </Link>
        </div>
      </main>
    </div>
  )
}
