# Price Watcher

A personal site to **keep track of price changes for products you want to monitor**. It is not tied to companies or jobs—it’s for tracking prices of any products you care about (e.g. from stores, marketplaces, or any site you choose).

**Current status:** The app is set up so you can add products by URL and name and run a sync that updates stored prices. Which products to track and how each product site’s data will look are **not decided yet**—you can add whatever you like later and adjust the sync logic when you know the data shape.

## What this project does

- Lets you **add products** (name, URL, optional category) that you want to track.
- Stores **last price**, **last checked** time, **on sale** (yes/no), **category**, and **availability** (in stock / out of stock / unavailable) per product.
- Provides a **sync** (cron-style) that updates price, sale status, and availability. Right now it uses placeholder/random values; when you know which sites you’ll use and what their data looks like, you can plug in real fetching (API or scraper).

## What’s in the repo

- **Database:** `products` table with: `url`, `name`, `last_price`, `last_checked_at`, `on_sale`, `category`, `availability`. See `lib/db/schema.sql`. If you already ran the original schema, run `lib/db/migrations/001_add_sale_category_availability.sql` to add the new columns.
- **API:** `GET/POST /api/products` to list and add products; `GET /api/cron/sync-prices` to run the price/sale/availability sync.
- **UI:** Home page and `/products` page to view your list (including category, sale, stock), add products (with optional category), and trigger a sync.

## Setup

1. Create a **Supabase** project (or use an existing one).
2. In the Supabase SQL editor, run the contents of `lib/db/schema.sql`.  
   If you get an error on `EXECUTE FUNCTION`, try `EXECUTE PROCEDURE` instead.
3. In the `price-watcher` folder, create `.env.local` (see `.env.example`):
   - `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Optional in production: `CRON_SECRET` for securing `/api/cron/sync-prices`
4. Install and run:
   ```bash
   cd price-watcher
   npm install
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) and go to **Products**.

## Next steps: adding products and tracking prices

1. **Add products**  
   On the **Products** page, use the form to add items: name, URL, and optionally a category (e.g. Electronics, Clothing). You can add anything you might want to track later—you don’t have to decide everything now.

2. **Run a sync**  
   Click **Sync prices** to run the sync job. It will update each product’s stored price, whether it’s on sale, and availability (in stock / out of stock / unavailable). Until you connect real site data, these values are placeholders so you can see the flow.

3. **Connect real data later**  
   When you know which product sites you’ll use and how their pages/APIs look, update `app/api/cron/sync-prices/route.ts` to fetch real price, sale, and stock info per URL and pass it into the DB. The table already has `on_sale`, `category`, and `availability` ready for that.
