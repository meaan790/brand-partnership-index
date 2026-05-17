# Brand Partnership Index — Production App

The independent benchmark for how outdoor, running, and action sports brands support their wholesale retail partners.

## Tech Stack

- **Next.js 14+** (App Router) — React, SSR, API routes
- **TypeScript** — strict mode
- **Tailwind CSS v4** — design tokens in `globals.css`
- **Supabase** — Postgres database, Auth (passwordless magic links), Row Level Security

## Getting Started

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL and anon key from the Supabase dashboard (Settings → API).

### 3. Run the database migration

In the Supabase SQL editor, paste and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

Then optionally run the seed data:

```
supabase/seed.sql
```

### 4. Configure Auth

In Supabase Dashboard → Authentication → Settings:
- Enable **Email** provider with **Magic Link** enabled
- Set the Site URL to your deployment URL (e.g., `https://your-app.vercel.app`)
- Add redirect URLs: `https://your-app.vercel.app/auth/callback`

### 5. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/                  # API routes (reviews, brands)
    auth/                 # Auth callback + confirmation routes
    brands/               # Brand directory + individual profiles
    compare/              # Side-by-side brand comparison
    dashboard/            # Auth-gated dashboards (brand + retailer)
    methodology/          # Scoring methodology (static)
    review/               # Multi-step review submission flow
    signin/               # Passwordless sign-in
  components/             # Reusable React components
  lib/
    constants.ts          # Dimensions, sub-components, icons
    scoring.ts            # Score calculation + tier helpers
    seed-data.ts          # Static demo data (fallback)
    types.ts              # TypeScript interfaces
    supabase/             # Supabase client (browser, server, middleware)
supabase/
  migrations/             # SQL schema migrations
  seed.sql                # Seed data for brands table
```

## Database Schema

- **profiles** — extends Supabase auth.users with role, company, location
- **brands** — brand records with slug, domain, categories
- **reviews** — reviewer → brand, with draft/submitted/published status
- **review_scores** — per sub-component star ratings (1-5)
- **review_comments** — per dimension text comments
- **brand_dim_scores_v** — view: aggregated dimension scores per brand
- **brand_scores_v** — view: overall scores for the leaderboard

## Deployment

Deploy to Vercel:

```bash
npx vercel --prod
```

Required environment variables in Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BRANDFETCH_CLIENT_ID` (optional)

## Demo Site

The original static demo is preserved at tag `v0-demo` and on the `demo` branch.
