import { NextResponse } from 'next/server'
import { createProduct, deleteProduct, getAllProducts } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await getAllProducts()
    return NextResponse.json({ products })
  } catch (error) {
    console.error('[products] GET error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body.url !== 'string' || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "url" or "name"' },
        { status: 400 }
      )
    }
    const url = body.url.trim()
    const name = body.name.trim()
    const category = typeof body.category === 'string' ? body.category.trim() || null : null
    if (!url || !name) {
      return NextResponse.json(
        { error: '"url" and "name" are required' },
        { status: 400 }
      )
    }
    const product = await createProduct({ url, name, category })
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('[products] POST error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing "id" query param' }, { status: 400 })
    }

    await deleteProduct(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[products] DELETE error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

