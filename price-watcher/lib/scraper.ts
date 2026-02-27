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

function isAmazonHost(host: string): boolean {
  return host.includes('amazon.')
}

export async function scrapeProduct(url: string): Promise<ScrapeResult | null> {
  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    console.warn('[scraper] Invalid URL', url)
    return null
  }

  if (isAmazonHost(hostname)) {
    return scrapeAmazon(url)
  }

  return genericScrape(url)
}

async function genericScrape(url: string): Promise<ScrapeResult | null> {
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

  const priceText =
    $('.product-main__body__info__hero__price').first().text().trim() ||
    $('[data-test-id="price"]').first().text().trim() ||
    $('.price, .product-price, [itemprop="price"]').first().text().trim()

  const last_price = parsePrice(priceText)

  const priceBlockText = $('.price, .product-price').text()
  const on_sale =
    $('.badge-sale, .label-sale, .sale-price').length > 0 ||
    /sale|discount|save/i.test(priceBlockText)

  let availability: Availability = 'in_stock'
  const availabilityText = $('button.add-to-cart, button#add-to-cart, .stock-status, [class*="availability"], [class*="stock"]')
    .first()
    .text()
    .toLowerCase()

  // Only mark out of stock when we see explicit phrasing in stock-related elements (no body scan)
  if (/out of stock|sold out\b/.test(availabilityText)) {
    availability = 'out_of_stock'
  }

  return { last_price, on_sale, availability }
}

async function scrapeAmazon(url: string): Promise<ScrapeResult | null> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })

  if (!res.ok) {
    console.warn('[scraper][amazon] Failed to fetch', url, res.status)
    return null
  }

  const html = await res.text()
  const $ = load(html)

  // Price: common Amazon patterns (speculative, may need tweaking)
  let priceText =
    $('#corePrice_desktop span.a-price span.a-offscreen').first().text().trim() ||
    $('#corePrice_feature_div span.a-price span.a-offscreen').first().text().trim() ||
    $('.a-price .a-offscreen').first().text().trim()

  // Fallback for structure like:
  // <span class="a-price-whole">57<span class="a-price-decimal">.</span></span>
  if (!priceText) {
    const whole = $('.a-price-whole').first().clone()
    // remove nested decimal/fraction spans so we just get the digits
    whole.find('.a-price-decimal, .a-price-fraction').remove()
    const wholeText = whole.text().trim()
    const fractionText =
      $('.a-price-fraction').first().text().trim() ||
      $('.a-price-decimal + .a-price-fraction').first().text().trim()

    if (wholeText) {
      priceText = fractionText ? `${wholeText}.${fractionText}` : wholeText
    }
  }

  const last_price = parsePrice(priceText)

  // Availability: assume in_stock; only out_of_stock when #availability explicitly says so (no body scan)
  const availabilityRaw =
    $('#availability').first().text().toLowerCase()

  let availability: Availability = 'in_stock'
  if (/out of stock|sold out\b|temporarily unavailable/.test(availabilityRaw)) {
    availability = 'out_of_stock'
  }

  // On sale: look for deal/discount hints
  const badgeText =
    $('#corePrice_feature_div').text() +
    $('#regularprice_savings span.a-color-price').text() +
    $('#regularprice_savings .a-color-success').text()

  const on_sale =
    /deal|save|% off|coupon|discount/i.test(badgeText) ||
    undefined

  return { last_price, on_sale, availability }
}

