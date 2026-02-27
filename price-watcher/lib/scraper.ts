import { load } from 'cheerio'
import type { Availability } from './db'

export interface ScrapeResult {
  last_price: number | null
  on_sale?: boolean | null
  availability?: Availability | null
  image_url?: string | null
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

function isMusinsaHost(host: string): boolean {
  return host.includes('musinsa.com')
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

  if (isMusinsaHost(hostname)) {
    return scrapeMusinsa(url)
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

  // Try each price selector; use first that yields a valid number (so empty/JS placeholders don't win)
  const priceSelectors = [
    '.product-main__body__info__hero__price',
    'span[class*="sc-n2qm0y-0"]',
    '[class*="hYZtdO"]',
    '[data-test-id="price"]',
    '.price, .product-price, [itemprop="price"]',
  ]
  let last_price: number | null = null
  for (const sel of priceSelectors) {
    const raw = $(sel).first().text().trim()
    const p = parsePrice(raw)
    if (p != null) {
      last_price = p
      break
    }
  }

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

  let image_url: string | null = null
  const ogImage = $('meta[property="og:image"]').attr('content')
  if (ogImage) image_url = ogImage.startsWith('//') ? `https:${ogImage}` : ogImage
  if (!image_url) {
    const img = $('[itemprop="image"]').attr('src') || $('img[itemprop="image"]').first().attr('src')
    if (img) image_url = img.startsWith('//') ? `https:${img}` : img.startsWith('/') ? new URL(url).origin + img : img
  }

  return { last_price, on_sale, availability, image_url }
}

/** Musinsa (global.musinsa.com) is a SPA; price is in JSON-LD and inline script, not in DOM. */
async function scrapeMusinsa(url: string): Promise<ScrapeResult | null> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })

  if (!res.ok) {
    console.warn('[scraper][musinsa] Failed to fetch', url, res.status)
    return null
  }

  const html = await res.text()

  let last_price: number | null = null
  let availability: Availability = 'in_stock'

  // 1) JSON-LD Product: "offers":{"priceCurrency":"USD","price":151.0,"availability":"https://schema.org/InStock"}
  const offersPriceMatch = html.match(/"offers"\s*:\s*\{[\s\S]*?"price"\s*:\s*(\d+(?:\.\d+)?)/)
  if (offersPriceMatch) {
    last_price = parseFloat(offersPriceMatch[1])
  }
  const availabilityMatch = html.match(/"availability"\s*:\s*"https:\/\/schema\.org\/(InStock|OutOfStock|Discontinued)"/i)
  if (availabilityMatch && /OutOfStock|Discontinued/i.test(availabilityMatch[1])) {
    availability = 'out_of_stock'
  }

  // 2) Fallback: inline script "price":151.0 or CURRENCY_PRICE = Number(151.0)
  if (last_price == null) {
    const priceInJson = html.match(/"price"\s*:\s*(\d+(?:\.\d+)?)/)
    if (priceInJson) last_price = parseFloat(priceInJson[1])
  }
  if (last_price == null) {
    const currencyPrice = html.match(/CURRENCY_PRICE\s*=\s*Number\s*\(\s*([\d.]+)\s*\)/)
    if (currencyPrice) last_price = parseFloat(currencyPrice[1])
  }

  let image_url: string | null = null
  const imageMatch = html.match(/"image"\s*:\s*"((?:https?:)?\/\/[^"]+)"/)
  if (imageMatch) image_url = imageMatch[1].startsWith('//') ? `https:${imageMatch[1]}` : imageMatch[1]

  return { last_price, on_sale: undefined, availability, image_url }
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

  let image_url: string | null = null
  const ogImage = $('meta[property="og:image"]').attr('content')
  if (ogImage) image_url = ogImage.startsWith('//') ? `https:${ogImage}` : ogImage
  if (!image_url) {
    const img = $('#landingImage').attr('src') || $('img[data-a-dynamic-image]').first().attr('src')
    if (img) image_url = img.startsWith('//') ? `https:${img}` : img
  }

  return { last_price, on_sale, availability, image_url }
}

