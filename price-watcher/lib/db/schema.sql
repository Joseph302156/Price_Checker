-- Products table: url, name, price, sale, category, availability, image
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  last_price NUMERIC,
  last_checked_at TIMESTAMPTZ,
  on_sale BOOLEAN,
  category TEXT,
  availability TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_url ON products(url);
CREATE INDEX idx_products_last_checked_at ON products(last_checked_at);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_availability ON products(availability);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
