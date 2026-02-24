# Price Watcher

A small full-stack app to watch prices for a few products. Uses the same patterns as a reference project: Next.js 14, TypeScript, Tailwind, Supabase, and a cron-style route for syncing.

## What’s in here

- **Table:** `products` (url, name, last_price, last_checked_at)
- **Cron route:** `GET /api/cron/sync-prices` — updates all products (random prices for now; swap in a real API or scraper later)
- **Page:** `/products` — list products, add new ones, and trigger a price sync

## Setup

1. **Create a Supabase project** (or use an existing one).
2. **Run the schema** in the Supabase SQL editor: copy the contents of `lib/db/schema.sql` and run it.  
   If you get an error on `EXECUTE FUNCTION`, try changing it to `EXECUTE PROCEDURE`.
3. **Env vars** — in `price-watcher` create a `.env.local` (see `.env.example`):
   - `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Optional in production: `CRON_SECRET` for protecting `/api/cron/sync-prices`
4. **Install and run:**
   ```bash
   cd price-watcher
   npm install
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) and go to **Products**.

## Reference

This project was built using another app as reference for:

- Supabase client and table design
- Cron route pattern (`dynamic = 'force-dynamic'`, optional `Authorization: Bearer CRON_SECRET`)
- Next.js App Router and API routes

No files in the reference project were modified.
