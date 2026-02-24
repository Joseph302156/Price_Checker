# Price Watcher

A personal site to **keep track of price changes for products you want to monitor**. It is not tied to companies or jobs—it’s for tracking prices of any products you care about (e.g. from stores, marketplaces, or any site you choose).

**Current status:** The app is set up so you can add products by URL and name and run a sync that updates stored prices. Which products to track and how each product site’s data will look are **not decided yet**—you can add whatever you like later and adjust the sync logic when you know the data shape.

## What this project does

- Lets you **add products** (name + URL) that you might want to track in the future.
- Stores **last known price** and **last checked** time per product.
- Provides a **sync** (cron-style) that updates those prices. Right now it uses placeholder/random values; when you know which sites you’ll use and what their data looks like, you can plug in real fetching (API or scraper).

## What’s in the repo

- **Database:** `products` table (url, name, last_price, last_checked_at). See `lib/db/schema.sql`.
- **API:** `GET/POST /api/products` to list and add products; `GET /api/cron/sync-prices` to run the price sync.
- **UI:** Home page and `/products` page to view your list, add products, and trigger a sync.

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
5. Open [http://localhost:3000](http://localhost:3000) and go to **Products** to start adding products when you’re ready.
