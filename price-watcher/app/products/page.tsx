'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  url: string
  name: string
  last_price: number | null
  last_checked_at: string | null
  on_sale: boolean | null
  category: string | null
  availability: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadProducts() {
    try {
      setLoading(true)
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to load products')
      const data = await res.json()
      setProducts(data.products || [])
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Could not load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  async function handleDeleteProduct(id: string) {
    try {
      setDeletingId(id)
      setError(null)
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete product')
      }
      await loadProducts()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Could not delete product.')
    } finally {
      setDeletingId((current) => (current === id ? null : current))
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !url.trim()) {
      setError('Please enter a name and URL.')
      return
    }
    try {
      setSaving(true)
      setError(null)
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, category: category || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to add product')
      }
      setName('')
      setUrl('')
      setCategory('')
      await loadProducts()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Could not add product.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSyncPrices() {
    try {
      setSyncing(true)
      setError(null)
      const res = await fetch('/api/cron/sync-prices')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to sync prices')
      }
      await loadProducts()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Could not sync prices.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="border-b border-cream/10">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link href="/" className="font-display text-xl">
            Price Watcher
          </Link>
          <Link href="/products" className="font-body text-sm text-ember">
            Products
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12 space-y-10">
        <section className="space-y-4">
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">
            Products you’re watching
          </h1>
          <p className="font-body text-sm text-cream/60 max-w-2xl">
            Add any product by name and URL. Sync updates stored prices (placeholder
            data for now until you decide which sites to use and how their data looks).
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-8 md:gap-12 items-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl">List</h2>
              <button
                onClick={handleSyncPrices}
                disabled={syncing || loading || products.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ember/60 text-sm font-body text-ember hover:bg-ember hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ember transition"
              >
                {syncing ? 'Syncing…' : 'Sync prices'}
              </button>
            </div>

            <div className="rounded-3xl border border-cream/10 bg-ink/60 overflow-hidden">
              {loading ? (
                <div className="p-6 text-sm text-cream/50">Loading…</div>
              ) : products.length === 0 ? (
                <div className="p-6 text-sm text-cream/50">
                  No products yet. When you’re ready, add any product you want to
                  track with the form on the right.
                </div>
              ) : (
                <table className="w-full text-sm font-body">
                  <thead className="bg-cream/5 text-cream/70">
                    <tr>
                      <th className="text-left px-5 py-3 font-normal">Name</th>
                      <th className="text-left px-5 py-3 font-normal">Category</th>
                      <th className="text-left px-5 py-3 font-normal">URL</th>
                      <th className="text-right px-5 py-3 font-normal">Price</th>
                      <th className="text-center px-5 py-3 font-normal">Sale</th>
                      <th className="text-center px-5 py-3 font-normal">Stock</th>
                      <th className="text-right px-5 py-3 font-normal">Last checked</th>
                      <th className="text-right px-5 py-3 font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-cream/10 hover:bg-cream/5"
                      >
                        <td className="px-5 py-3 text-cream">{product.name}</td>
                        <td className="px-5 py-3 text-cream/80">
                          {product.category || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 text-xs hover:underline"
                          >
                            {(() => {
                              try {
                                const u = new URL(product.url)
                                return u.hostname
                              } catch {
                                return product.url.length > 32
                                  ? product.url.slice(0, 29) + '...'
                                  : product.url
                              }
                            })()}
                          </a>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {product.last_price != null ? (
                            <span className="font-mono">
                              ${product.last_price.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-cream/40 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {product.on_sale === true ? (
                            <span className="text-ember text-xs">Yes</span>
                          ) : product.on_sale === false ? (
                            <span className="text-cream/50 text-xs">No</span>
                          ) : (
                            <span className="text-cream/40 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center text-xs">
                          {product.availability === 'in_stock' ? (
                            <span className="text-green-400/90">In stock</span>
                          ) : product.availability === 'out_of_stock' ? (
                            <span className="text-amber-400/90">Out of stock</span>
                          ) : product.availability === 'unavailable' ? (
                            <span className="text-cream/50">Unavailable</span>
                          ) : (
                            <span className="text-cream/40">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-xs text-cream/50">
                          {product.last_checked_at
                            ? new Date(product.last_checked_at).toLocaleString()
                            : '—'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingId === product.id}
                            className="text-xs text-cream/60 hover:text-red-400 disabled:opacity-40"
                          >
                            {deletingId === product.id ? 'Removing…' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-cream/10 bg-cream/[0.02] p-6 space-y-4">
            <h2 className="font-display text-lg">Add a product</h2>
            <p className="font-body text-xs text-cream/60">
              Any product from any site—you decide what to track. Data shape and
              which sites to support can be figured out later.
            </p>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-body text-cream/60">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name (whatever you want to call it)"
                  className="w-full rounded-full bg-ink border border-cream/15 px-4 py-2.5 text-sm font-body text-cream placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-ember/70"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-body text-cream/60">URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-full bg-ink border border-cream/15 px-4 py-2.5 text-sm font-body text-cream placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-ember/70"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-body text-cream/60">Category (optional)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Electronics, Clothing"
                  className="w-full rounded-full bg-ink border border-cream/15 px-4 py-2.5 text-sm font-body text-cream placeholder:text-cream/30 focus:outline-none focus:ring-2 focus:ring-ember/70"
                />
              </div>
              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl px-3 py-2">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-full bg-ember text-ink font-body text-sm font-medium hover:bg-ember/90 disabled:opacity-50"
              >
                {saving ? 'Adding…' : 'Add product'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}
