# PCS Eco-System 🌿

**Plastic Circularity Station Recycling Hub** — a full-stack Next.js demo application for the Dow Circular Economy Innovation Challenge. The app simulates a digital ecosystem linking smart plastic collection kiosks with a green rewards wallet, social voucher feed, gamification challenges, and enterprise Data-as-a-Service insights.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.
<br>
Demo App on Vercel: [PCS_Eco-System](https://pcs-eco-system-git-main-thanh-vien.vercel.app)

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint across the codebase |
| `npm run format` | Format all files with Prettier |

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes (for live map) | Mapbox GL JS public token. Get a free one at [account.mapbox.com](https://account.mapbox.com/). The app will show a placeholder map if left empty. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional (for real auth) | Your Supabase project URL. Found at **Settings → API** in the Supabase dashboard. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional (for real auth) | Your Supabase publishable (anon) key. Found at **Settings → API**. Do NOT use the `service_role` key. |

> **Auth is fully optional.** The app works 100% offline and anonymously without Supabase configured. Setting up Supabase enables real user accounts and cross-device sync.

## Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com/).
2. In **Settings → API**, copy your Project URL and `anon` (publishable) key.
3. Add them to `.env.local`.
4. In **SQL Editor**, run the full DDL + RLS policies from [`supabase_schema.sql`](./supabase_schema.sql).

## Project Structure

```
app/
  (full-width)/     # Landing, Team Profile, B2B Insight, Auth (/auth)
  (kiosk-app)/      # Modules 2–6 wrapped in phone-frame mockup
  actions/          # Server Actions (auth-actions.ts)
components/
  auth/             # AuthForm, MergeDataPrompt
  shared/           # PhoneFrame, BottomNav, AuthProvider, SyncManagerProvider
  ui/               # shadcn/ui components
hooks/
  use-sync-manager.ts  # Online-event listener that flushes IndexedDB queue
lib/
  supabase/         # client.ts (browser), server.ts (server), sync-service.ts
  sync-queue.ts     # IndexedDB offline action queue (idb-keyval)
  mock-data.ts      # All mock data for the demo
  motion-tokens.ts  # Shared Framer Motion duration/easing constants
  i18n/             # dictionaries.ts — bilingual VI/EN strings
middleware.ts       # @supabase/ssr token refresh + PWA-safe matcher
store/              # Zustand stores (wallet, feed, kiosk, locale, profile)
supabase_schema.sql # Full DDL + RLS policies reference
types/              # TypeScript interfaces (auth.ts, etc.)
```
