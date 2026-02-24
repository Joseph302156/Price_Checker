# Basics one-pager: mental model for vibe coding

Keep this in mind when reading the repo or talking to Cursor.

---

## 1. What you’re building

- **Frontend** = pages and UI (what users see).
- **Backend** = APIs and database (where data lives and how it’s updated).
- **Routes** = URLs. In Next.js, `app/` folder structure = routes (e.g. `app/jobs/page.tsx` → `/jobs`).

---

## 2. Where things are in this repo

| You want to…              | Look here                          |
|---------------------------|------------------------------------|
| Change a page / URL       | `app/` (e.g. `app/jobs/page.tsx`)  |
| Add or change an API      | `app/api/`                         |
| Change how data is read   | `lib/db/queries.ts`                |
| Change DB structure       | `lib/db/schema.sql`                |
| Tell Cursor the project   | `.cursor/rules/project.mdc`        |

---

## 3. How data flows

```
Database (Supabase)
    ↓
lib/db/queries.ts  (e.g. getActiveJobs)
    ↓
Pages in app/  (e.g. app/jobs/page.tsx)
    ↓
User’s browser
```

Forms and actions often go: **Browser → API route in `app/api/` → external service or database.**

---

## 4. What to tell Cursor when you want something new

- New **page**: “Add a page at `/xyz` that shows …”
- New **API**: “Add an API route POST `/api/xyz` that …”
- New **data**: “Add a table/query for X and use it on page Y.”
- **Style**: “Make this look like the jobs page” or “Use Tailwind and match the rest of the site.”

---

## 5. Stack (in one line)

Next.js 14 + TypeScript + Tailwind + Supabase + Vercel.

Use this one-pager plus **LEARNING-PLAN.md** as your baseline; go deeper in the plan when you’re ready.
