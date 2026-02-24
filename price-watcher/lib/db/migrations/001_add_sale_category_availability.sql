-- Run this if you already have the products table (adds sale, category, availability).
-- For new installs, use schema.sql which includes these columns.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS on_sale BOOLEAN,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS availability TEXT;

COMMENT ON COLUMN products.on_sale IS 'Whether the product is on sale on the website';
COMMENT ON COLUMN products.category IS 'Product category (e.g. Electronics, Clothing)';
COMMENT ON COLUMN products.availability IS 'in_stock | out_of_stock | unavailable';
