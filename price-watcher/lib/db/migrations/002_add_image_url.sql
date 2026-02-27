-- Add product image URL (filled when we scrape the page).
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
