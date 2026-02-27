import { NextResponse } from 'next/server'
import { getAllProducts, updateProductSync } from '@/lib/db'
import { scrapeProduct } from '@/lib/scraper'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const products = await getAllProducts()
    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        updated: 0,
        message: 'No products to sync',
      })
    }

    let updated = 0
    for (const product of products) {
      const result = await scrapeProduct(product.url)

      if (!result || result.last_price == null) {
        continue
      }

      await updateProductSync(product.id, {
        last_price: result.last_price,
        on_sale: result.on_sale ?? undefined,
        availability: result.availability ?? undefined,
      })
      updated++
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      updated,
    })
  } catch (error) {
    console.error('[sync-prices] Fatal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
