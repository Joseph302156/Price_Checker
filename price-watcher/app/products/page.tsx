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
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-slate-200 bg-ink text-cream">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
            Price<span className="text-ember">Watcher</span>
          </Link>
          <Link
            href="/products"
            className="font-body text-sm text-cream hover:text-ember transition-colors"
          >
            Products
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10 space-y-8">
        <section className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl tracking-tight text-ink">
            Products you’re watching
          </h1>
          <p className="font-body text-sm text-slate-600 max-w-2xl">
            Add products from Amazon or any other site. We’ll store their details and
            keep prices and availability in sync when you ask.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-8 md:gap-10 items-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl text-ink">List</h2>
              <button
                onClick={handleSyncPrices}
                disabled={syncing || loading || products.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ember/80 bg-ember text-ink text-sm font-body font-medium shadow-sm hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-ember transition-colors"
              >
                {syncing ? 'Syncing…' : 'Sync prices'}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-6 text-sm text-slate-500">Loading…</div>
              ) : products.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  No products yet. When you’re ready, add any product you want to
                  track with the form on the right.
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm font-body">
                  <thead className="bg-slate-50 text-slate-600">
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
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-5 py-3 text-ink">{product.name}</td>
                        <td className="px-5 py-3 text-slate-700">
                          {product.category || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-pacific text-xs hover:underline"
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
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {product.on_sale === true ? (
                            <span className="text-ember text-xs font-medium">Yes</span>
                          ) : product.on_sale === false ? (
                            <span className="text-slate-500 text-xs">No</span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center text-xs">
                          {product.availability === 'in_stock' ? (
                            <span className="text-green-600 font-medium">In stock</span>
                          ) : product.availability === 'out_of_stock' ? (
                            <span className="text-amber-600 font-medium">Out of stock</span>
                          ) : product.availability === 'unavailable' ? (
                            <span className="text-slate-500">Unavailable</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-xs text-slate-500">
                          {product.last_checked_at
                            ? new Date(product.last_checked_at).toLocaleString()
                            : '—'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingId === product.id}
                            className="text-xs text-slate-500 hover:text-red-500 disabled:opacity-40"
                          >
                            {deletingId === product.id ? 'Removing…' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <h2 className="font-display text-lg text-ink">Add a product</h2>
            <p className="font-body text-xs text-slate-600">
              Any product from any site—you decide what to track. Data shape and
              which sites to support can be figured out later.
            </p>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-body text-slate-600">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name (whatever you want to call it)"
                  className="w-full rounded-full bg-white border border-slate-300 px-4 py-2.5 text-sm font-body text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pacific/60"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-body text-slate-600">URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-full bg-white border border-slate-300 px-4 py-2.5 text-sm font-body text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pacific/60"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-body text-slate-600">Category (optional)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Electronics, Clothing"
                  className="w-full rounded-full bg-white border border-slate-300 px-4 py-2.5 text-sm font-body text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pacific/60"
                />
              </div>
              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl px-3 py-2">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-full bg-ember text-ink font-body text-sm font-medium shadow-sm hover:bg-amber-400 disabled:opacity-50"
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
