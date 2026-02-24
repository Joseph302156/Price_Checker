# Learning Planner & Tracker: Vibe Coding with Cursor

A step-by-step plan to understand how this project works and what you need to learn so you can use Cursor (and AI) to build similar things. Written for someone with basic Python/Java and little web or “vibe coding” experience.

---

## What is “vibe coding”?

**Vibe coding** = describing what you want in plain language and letting an AI (e.g. Cursor) write most of the code. You still need to:

- Understand the **big picture** (frontend, backend, database, deployment).
- Know **enough vocabulary** to describe features and structure.
- Be able to **read and tweak** code, run the app, and fix obvious errors.

This doc is your roadmap for that.

---

## Phase 1: The basics (start here)

These are the core ideas. You don’t need to master them before touching the project—use this repo as the example while you learn.

### 1.1 Frontend vs backend

| Concept | Meaning | In this project |
|--------|---------|------------------|
| **Frontend** | What users see and click in the browser (pages, forms, buttons). | Landing page (`app/page.tsx`), Jobs list (`app/jobs/page.tsx`), company pages (`app/companies/[slug]/page.tsx`). |
| **Backend** | Logic that runs on the server: APIs, database access, cron jobs. | `app/api/subscribe/route.ts` (email signup), `app/api/cron/sync-jobs/route.ts` (daily job sync). |

- [X] I can explain in one sentence what “frontend” and “backend” mean.
- [X] I can point to one frontend file and one backend file in this repo.

---

### 1.2 Pages and routes (URLs)

**What are URLs and routes? (in simple terms)**

- **URL** = the address you type in the browser (e.g. `workinedtech.com/jobs`). It tells the app *which page* to show.
- **Route** = the rule that connects a URL to a specific piece of code. When someone visits a URL, the route says: “run this file and show what it returns.”
- **Why it matters:** Every page on a website needs a URL. If you want a “Jobs” page, you need a route so that visiting `/jobs` runs the right code and shows the right content. No route = no way to get there.

**In Next.js**, the folder structure under `app/` *is* how you define routes: the path in the folder = the path in the URL.

| URL | File in this project |
|-----|----------------------|
| `/` | `app/page.tsx` |
| `/jobs` | `app/jobs/page.tsx` |
| `/jobs/123` (any id) | `app/jobs/[id]/page.tsx` |
| `/companies/khan-academy` (any slug) | `app/companies/[slug]/page.tsx` |

`[id]` and `[slug]` are **dynamic segments**: one file handles many URLs.

- [X] I understand what a URL and a route are, and why they matter.
- [X] I understand that `app/` folders = routes.
- [X] I know what a “dynamic” route is (`[id]`, `[slug]`).

---

### 1.3 Components and “client” vs “server”

- **Component** = a reusable piece of UI (like a function that returns part of the page).
- **Server component** (default in Next.js): runs on the server, can fetch data directly. Example: `app/jobs/page.tsx` calls `getActiveJobs()` and renders the list.
- **Client component** (`'use client'`): runs in the browser, can use `useState`, `onClick`, etc. Example: `app/page.tsx` (landing) has the email form and animations.
landing page is the first page people see when they open the site's main address

When you see `'use client'` at the top of a file, that file can use React state and event handlers.

- [X] I know what a component is.
- [X] I understand “server” vs “client” component and why the landing page uses `'use client'`.

---

### 1.4 Data: where it lives and how the app gets it

| Idea | In this project |
|------|------------------|
| **Database** | Supabase (Postgres). Tables: `companies`, `jobs`. |
| **Schema** | Defined in `lib/db/schema.sql`. |
| **Reading data** | `lib/db/queries.ts` has functions like `getActiveJobs()`, `getJobById()`. Pages import these and `await` them. |
| **API route** | A URL that runs server code. Example: `POST /api/subscribe` in `app/api/subscribe/route.ts` receives the email and talks to Beehiiv. |

So: **DB ← queries used by pages & API routes ← frontend (pages/components)**.


---

### 1.4a APIs, cron jobs, and database access (quick reference)

**APIs (Application Programming Interfaces)**  
An API is a way for one program to talk to another over the internet: you send a request to a URL (e.g. GET or POST) and get a response (often JSON).  
- **Your app exposes APIs:** e.g. `POST /api/subscribe` (form submits here; code in `app/api/subscribe/route.ts` runs and calls Beehiiv).  
- **Your app calls external APIs:** the cron job calls Greenhouse, Lever, and Ashby APIs to fetch job listings.  
So: *API = a URL that runs server code and returns a response.*

**Cron jobs**  
A cron job is a task that runs **on a schedule** (e.g. every day at 6am), not when a user clicks.  
- In this project, **Vercel Cron** calls `https://your-site.com/api/cron/sync-jobs` on a schedule (see `vercel.json`).  
- The handler in `app/api/cron/sync-jobs/route.ts` fetches from each ATS API and updates the database.  
So: *Cron job = "scheduled task" = something calls this API on a schedule.*

**Database access**  
Database access means your app **reading** from and **writing** to a database (here, Postgres via Supabase): run a query → get or change rows (companies, jobs).  
- **Where:** Supabase; schema in `lib/db/schema.sql`.  
- **How:** `lib/db/index.ts` creates the client; `lib/db/queries.ts` has functions like `getActiveJobs()`, `getJobById()`. Pages and the cron route use these to read/write.  
So: *Database access = your server code using the Supabase client and query helpers to read/write the `companies` and `jobs` tables.*

| Concept | One-line idea | In this project |
|--------|----------------|------------------|
| **APIs** | A URL that runs code and returns data | `/api/subscribe`, `/api/cron/sync-jobs`; calling Beehiiv, Greenhouse, etc. |
| **Cron jobs** | A task that runs on a schedule | Vercel calls `/api/cron/sync-jobs` daily |
| **Database access** | Code reading/writing the DB | `lib/db/queries.ts` + Supabase; used by pages and cron |

**How it works when a user uses the site (step by step)**

1. **User visits the Jobs page (`/jobs`)**  
   User goes to the URL → server runs `getActiveJobs()` → **database access** (Supabase returns job rows) → page renders with that data → user sees the list. No API call from the user here; the page reads from the DB directly.

2. **User submits their email on the landing page**  
   User clicks submit → browser sends POST to **`/api/subscribe`** (your API) → that route runs and calls **Beehiiv’s API** to add the email → your API sends a response back → user sees success or error. Your API talks to an external API; no database for the email (Beehiiv stores it).

3. **Cron job (runs in the background, no user)**  
   Vercel calls **`/api/cron/sync-jobs`** every day → that route calls **external APIs** (Greenhouse, Lever, Ashby) for latest jobs → **database access**: it inserts/updates rows in Supabase → when users visit `/jobs` later, they see fresh data.

**Put together:** Cron keeps the database updated; when users visit the site, pages read from the database and show that data. APIs are either routes your app exposes (subscribe, cron) or external services your app calls (Beehiiv, job boards).

- [X] I can explain in one sentence what an API, a cron job, and database access are.
- [X] I can explain step by step what happens when a user visits /jobs, submits the email form, and what the cron does.
- [X] I can say where the list of jobs comes from (DB → queries → jobs page).
- [X] I know what an “API route” is and can name one in this project.

---

### 1.5 Styling (CSS) and utility classes

This project uses **Tailwind CSS**: you style by adding **class names** to elements, not by writing separate CSS files for every button.

Examples from the repo:

- `className="font-display text-5xl"` → typography and size.
- `className="bg-ink text-cream"` → background and text color (custom theme).
- `className="flex flex-col gap-6"` → layout (flexbox).

You don’t need to memorize Tailwind; you need to know that **class names = styling** and that you can ask Cursor to “make this a big heading” or “add spacing below.”

- [ ] I understand that Tailwind = utility classes on elements.
- [ ] I can change a class in a file and see the visual change in the browser.

---

### 1.6 Environment variables and secrets

Secrets (API keys, DB URL) are not committed to git. They live in **environment variables**, e.g. in `.env.local` (local) or in Vercel (production).

This project uses things like:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`, `LOGO_DEV_TOKEN`, `BEEHIIV_API_KEY`

- [ ] I know that secrets go in env vars, not in code.
- [ ] I know where to set them locally (`.env.local`) and that production uses the host’s dashboard (e.g. Vercel).

---

### 1.7 Running the project locally

From the project root:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).  
You should see the landing page; use the nav to open Jobs, then a job detail and a company page.

- [ ] I have run `npm install` and `npm run dev` and opened the app in the browser.
- [ ] I have clicked through at least: Home → Jobs → one job → one company.

---

## Phase 2: How this project is structured

Use this as a map. You don’t need to memorize it; use it when you ask Cursor to change something or add a feature.

### 2.1 High-level flow

1. **Landing** (`app/page.tsx`): marketing + email signup. Form submits to `POST /api/subscribe`.
2. **Jobs** (`app/jobs/page.tsx`): server component that fetches jobs via `getActiveJobs()`, renders list; `JobListings.tsx` is the client part (view toggle, etc.).
3. **Job detail** (`app/jobs/[id]/page.tsx`): one job by ID from `getJobById(id)`.
4. **Company page** (`app/companies/[slug]/page.tsx`): jobs for one company via `getJobsByCompany(slug)`.
5. **Cron** (`app/api/cron/sync-jobs/route.ts`): called daily by Vercel; fetches from external job APIs (Greenhouse, Lever, Ashby), updates Supabase.

### 2.2 Key folders (cheat sheet)

| Folder / file | Purpose |
|---------------|--------|
| `app/` | All routes and pages (URLs and UI). |
| `app/api/` | Backend API routes (subscribe, cron). |
| `lib/db/` | Supabase client, types, and query functions. |
| `lib/scrapers/` | Fetching jobs from external ATS APIs. |
| `.cursor/rules/project.mdc` | Cursor rules: stack, DB schema, file structure (so AI knows the project). |

- [ ] I have opened at least one file in `app/`, one in `lib/db/`, and one in `app/api/`.
- [ ] I know that `.cursor/rules/` helps Cursor understand this repo.

---

## Phase 3: How to “tell AI” to build something like this

Once the basics and project map make sense, you can direct Cursor with clear, high-level instructions.

### 3.1 Useful phrases (vocabulary for vibe coding)

- **“Add a new page at `/about` that shows …”** → Cursor will add `app/about/page.tsx` (or the right path).
- **“Add an API route that accepts POST at `/api/contact` and sends an email”** → Cursor will add `app/api/contact/route.ts`.
- **“On the jobs page, add a filter by department”** → Cursor will work in `app/jobs/` and likely `lib/db/queries.ts`.
- **“Create a new table for X and a query to list them”** → Schema in `lib/db/schema.sql`, query in `lib/db/queries.ts`, then use in a page.
- **“Use the same layout as the jobs page but for Y”** → Referencing existing patterns (e.g. `app/jobs/page.tsx`) helps Cursor stay consistent.

### 3.2 Minimal “spec” you can give for a project like this

You don’t need to write code yourself. You need to be able to say:

1. **What it is**: “A job board for EdTech companies.”
2. **Main pages**: “Landing page, list of jobs, job detail, company page.”
3. **Data**: “Companies and jobs in a database; jobs synced from external APIs.”
4. **Stack**: “Next.js, TypeScript, Tailwind, Supabase, deploy on Vercel.”

From that, Cursor (and the rules in `.cursor/rules/project.mdc`) can generate structure and code. Your job is to refine prompts, run the app, and fix small issues (e.g. “this link is wrong,” “this should say X”).

- [ ] I can write 3–5 sentences describing “what this project is” and “main user flows.”
- [ ] I have tried one small Cursor request (e.g. “change the title of the jobs page” or “add a link in the header”).

---

## Phase 4: Tracker — your progress

Copy this into your notes or check off as you go.

| Phase | Focus | Done |
|-------|--------|------|
| 1.1 | Frontend vs backend | [ ] |
| 1.2 | Pages and routes | [ ] |
| 1.3 | Components, client vs server | [ ] |
| 1.4 | Data: DB, queries, API routes | [ ] |
| 1.4a | APIs, cron jobs, database access | [ ] |
| 1.5 | Styling (Tailwind) | [ ] |
| 1.6 | Environment variables | [ ] |
| 1.7 | Run app locally | [ ] |
| 2.1 | Understand high-level flow | [ ] |
| 2.2 | Know where things live (folders) | [ ] |
| 3.1 | Use “tell AI” phrases | [ ] |
| 3.2 | Write a short spec and try one Cursor edit | [ ] |

---

## Suggested order (step by step)

1. **Day 1:** Run the app (Phase 1.7), click through every page, then read Phase 1.1 and 1.2. Open `app/page.tsx`, `app/jobs/page.tsx`, and see how the URL matches the file path.
2. **Day 2:** Read 1.3 and 1.4. Open `lib/db/queries.ts` and see how `getActiveJobs` is used in `app/jobs/page.tsx`. Open `app/api/subscribe/route.ts` and see how the form on the landing page hits this API.
3. **Day 3:** Skim 1.5 and 1.6. Change a Tailwind class on the landing page and refresh. Glance at Phase 2 and use it as a map when you’re lost.
4. **Later:** Use Phase 3 when you’re ready to ask Cursor to add or change a feature. Start with one small change, then try something bigger.

---

## Quick reference: tech stack (for when you talk to Cursor)

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Database:** Supabase (Postgres)
- **Hosting:** Vercel
- **Cron:** Vercel Cron → `/api/cron/sync-jobs`

Keeping this doc open while you explore the repo and try small Cursor edits will give you the basic framework you need to “vibe code” projects like this one.
