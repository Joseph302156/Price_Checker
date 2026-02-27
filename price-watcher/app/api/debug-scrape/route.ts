import { NextRequest, NextResponse } from 'next/server'
import { scrapeProduct } from '@/lib/scraper'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing ?url=' }, { status: 400 })
  }

  try {
    const result = await scrapeProduct(url)
    return NextResponse.json({ url, result })
  } catch (error) {
    console.error('[debug-scrape] error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

