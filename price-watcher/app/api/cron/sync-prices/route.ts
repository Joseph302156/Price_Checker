import { NextResponse } from 'next/server'
import { getAllProducts, updateProductSync, type Availability } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function randomPrice(current?: number | null): number {
  const base = typeof current === 'number' ? current : Math.random() * 100 + 10
  const delta = (Math.random() - 0.5) * 5
  return Math.round(Math.max(1, base + delta) * 100) / 100
}

const AVAILABILITY_OPTIONS: Availability[] = ['in_stock', 'out_of_stock', 'unavailable']
function randomAvailability(): Availability {
  return AVAILABILITY_OPTIONS[Math.floor(Math.random() * AVAILABILITY_OPTIONS.length)]
}

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
      await updateProductSync(product.id, {
        last_price: randomPrice(product.last_price),
        on_sale: Math.random() > 0.6,
        availability: randomAvailability(),
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
