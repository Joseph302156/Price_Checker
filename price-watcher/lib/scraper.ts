import { load } from 'cheerio'
import type { Availability } from './db'

export interface ScrapeResult {
  last_price: number | null
  on_sale?: boolean | null
  availability?: Availability | null
}

function parsePrice(raw?: string | null): number | null {
  if (!raw) return null
  const normalized = raw.replace(/[^0-9.,]/g, '').replace(',', '.')
  const value = parseFloat(normalized)
  if (!Number.isFinite(value)) return null
  return value
}

export async function scrapeProduct(url: string): Promise<ScrapeResult | null> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  })

  if (!res.ok) {
    console.warn('[scraper] Failed to fetch', url, res.status)
    return null
  }

  const html = await res.text()
  const $ = load(html)

  // NOTE: selectors here are speculative and should be adapted
  const priceText =
    $('[data-test-id="price"]').first().text().trim() ||
    $('.price, .product-price, [itemprop="price"]').first().text().trim()

  const last_price = parsePrice(priceText)

  const priceBlockText = $('.price, .product-price').text()
  const on_sale =
    $('.badge-sale, .label-sale, .sale-price').length > 0 ||
    /sale|discount|save/i.test(priceBlockText)

  let availability: Availability | null = null
  const availabilityText = $('button.add-to-cart, button#add-to-cart, .stock-status')
    .first()
    .text()
    .toLowerCase()

  if (/out of stock|sold out|unavailable/.test(availabilityText)) {
    availability = 'out_of_stock'
  } else if (/in stock|available|ships/.test(availabilityText)) {
    availability = 'in_stock'
  }

  return { last_price, on_sale, availability }
}

