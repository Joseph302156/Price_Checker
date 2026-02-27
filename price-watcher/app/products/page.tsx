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
  image_url: string | null
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [savingEditId, setSavingEditId] = useState<string | null>(null)

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

  function startEditing(product: Product) {
    setEditingId(product.id)
    setEditName(product.name)
    setEditCategory(product.category ?? '')
    setError(null)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditName('')
    setEditCategory('')
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) {
      setError('Name is required.')
      return
    }
    try {
      setSavingEditId(id)
      setError(null)
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editName.trim(),
          category: editCategory.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update product')
      }
      cancelEditing()
      await loadProducts()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Could not update product.')
    } finally {
      setSavingEditId((current) => (current === id ? null : current))
    }
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-slate-200 bg-ink text-cream">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Price<span className="text-ember">Watcher</span>
          </Link>
          <Link
            href="/products"
            className="font-body text-base text-cream hover:text-ember transition-colors"
          >
            Products
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-10 sm:py-14 space-y-10">
        <section className="space-y-3">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight text-ink">
            Products you’re watching
          </h1>
          <p className="font-body text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            Add products from Amazon or any other site. We’ll store their details and
            keep prices and availability in sync when you ask.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-12 items-start">
          <div className="space-y-5 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl sm:text-2xl text-ink font-semibold">List</h2>
              <button
                onClick={handleSyncPrices}
                disabled={syncing || loading || products.length === 0}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-ember/80 bg-ember text-ink text-base font-body font-semibold shadow-sm hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-ember transition-colors"
              >
                {syncing ? 'Syncing…' : 'Sync prices'}
              </button>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm p-5 sm:p-6">
              {loading ? (
                <div className="py-12 text-center text-base text-slate-500">Loading…</div>
              ) : products.length === 0 ? (
                <div className="py-12 text-center text-base text-slate-500 max-w-sm mx-auto">
                  No products yet. Add any product you want to track with the form on the right.
                </div>
              ) : (
                <ul className="space-y-4">
                  {products.map((product) => (
                    <li
                      key={product.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300/80 transition-colors overflow-hidden"
                    >
                      <div className="p-5 sm:p-6">
                        {editingId === product.id ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-body font-medium text-slate-700">Name</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-base font-body text-ink focus:outline-none focus:ring-2 focus:ring-pacific/50"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-body font-medium text-slate-700">Category</label>
                              <input
                                type="text"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                placeholder="Optional"
                                className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-base font-body text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pacific/50"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(product.id)}
                                disabled={savingEditId === product.id}
                                className="px-4 py-2 rounded-2xl bg-ember text-ink text-sm font-semibold hover:bg-amber-400 disabled:opacity-50"
                              >
                                {savingEditId === product.id ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                disabled={savingEditId === product.id}
                                className="px-4 py-2 rounded-2xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-200 overflow-hidden">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  width={80}
                                  height={80}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400" aria-hidden>
                                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v2h6v-2zm4-4h1V7h-1v2zM5 7v2H4V7h1z" clipRule="evenodd" /></svg>
                                </div>
                              )}
                            </div>
                            <h3 className="font-body text-lg sm:text-xl font-semibold text-ink leading-snug">
                              {product.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {product.last_price != null ? (
                              <span className="font-body text-xl font-bold text-ink">
                                ${product.last_price.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-base">—</span>
                            )}
                            <button
                              type="button"
                              onClick={() => startEditing(product)}
                              className="font-body text-sm text-slate-500 hover:text-pacific transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deletingId === product.id}
                              className="font-body text-sm text-slate-500 hover:text-red-500 disabled:opacity-40 transition-colors"
                            >
                              {deletingId === product.id ? 'Removing…' : 'Remove'}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-600">
                          {product.category && (
                            <span className="font-body">{product.category}</span>
                          )}
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-body text-pacific hover:underline"
                          >
                            {(() => {
                              try {
                                const u = new URL(product.url)
                                return u.hostname
                              } catch {
                                return product.url.length > 40
                                  ? product.url.slice(0, 37) + '...'
                                  : product.url
                              }
                            })()}
                          </a>
                          {product.on_sale === true && (
                            <span className="font-body text-ember font-medium">On sale</span>
                          )}
                          {product.availability === 'in_stock' && (
                            <span className="font-body text-green-600 font-medium">In stock</span>
                          )}
                          {product.availability === 'out_of_stock' && (
                            <span className="font-body text-amber-600 font-medium">Out of stock</span>
                          )}
                          {product.availability === 'unavailable' && (
                            <span className="font-body text-slate-500">Unavailable</span>
                          )}
                        </div>
                        {product.last_checked_at && (
                          <p className="mt-3 text-sm text-slate-400">
                            Last checked {new Date(product.last_checked_at).toLocaleString()}
                          </p>
                        )}
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="font-display text-xl sm:text-2xl text-ink font-semibold">Add a product</h2>
            <p className="font-body text-base text-slate-600 leading-relaxed">
              Any product from any site—add a name and URL and we’ll track it.
            </p>
            <form onSubmit={handleAddProduct} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-body font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name"
                  className="w-full rounded-2xl bg-white border border-slate-300 px-5 py-3 text-base font-body text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pacific/50 focus:border-pacific/50"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-body font-medium text-slate-700">URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl bg-white border border-slate-300 px-5 py-3 text-base font-body text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pacific/50 focus:border-pacific/50"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-body font-medium text-slate-700">Category (optional)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Electronics, Clothing"
                  className="w-full rounded-2xl bg-white border border-slate-300 px-5 py-3 text-base font-body text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pacific/50 focus:border-pacific/50"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 font-body">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full px-5 py-3.5 rounded-2xl bg-ember text-ink font-body text-base font-semibold shadow-sm hover:bg-amber-400 disabled:opacity-50 transition-colors"
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
