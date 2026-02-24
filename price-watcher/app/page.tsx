import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="border-b border-cream/10">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <span className="font-display text-xl">Price Watcher</span>
          <nav>
            <Link
              href="/products"
              className="font-body text-sm text-ember hover:underline"
            >
              Products
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-4">
          Price watcher for a few products
        </h1>
        <p className="font-body text-lg text-cream/60 max-w-2xl mb-8">
          Add products by URL, then run the cron endpoint to update their prices.
          Start with the products page.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ember text-ink font-body text-sm font-medium hover:bg-ember/90 transition"
        >
          Go to Products
        </Link>
      </main>
    </div>
  )
}
