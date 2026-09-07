# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**PCS Eco-System** (Plastic Circularity Station Recycling Hub) — a Next.js 16 (App Router, Turbopack) demo built for the Dow Circular Economy Innovation Challenge. It simulates a digital ecosystem linking smart plastic-collection kiosks with a green rewards wallet, a social voucher feed, gamification, and a B2B analytics dashboard.

Detailed product/design/domain rules live in `.agents/skills/` (auto-loaded by the agent when relevant — do not duplicate their content here):
- `pcs-tech-standards` — folder structure, TS rules, design/motion tokens, hydration safeguards, dev-server execution rules, drag-scroll pattern, i18n convention, git workflow.
- `pcs-design-system` — 8-module spec, Mint Pop color palette, Vietnamese-first language convention, Definition of Done.
- `pcs-domain-knowledge` — FTIR/plastic-identification background used to write scientifically plausible Module 7/8 copy.

Read the relevant skill before touching its area — several rules there are non-obvious and easy to violate silently (e.g. hydration guards, `ssr: false` placement, particle-burst usage limits).

## Workflow

- Never treat your own analysis or a completed plan as approval to implement or commit — always wait for an explicit separate "approved" message from the user first.
- Never claim a command succeeded or a check passed without pasting the actual raw terminal output as proof.
- Git: commit messages follow `feat(module-N): description` or `fix(module-N): description`; push directly to `main` (no feature branches for this solo project); never use `--force` push unless there's an explicit, explained reason.

## Commands

```bash
npm run dev      # start dev server (Turbopack) — see "Dev server" below before running
npm run build    # production build
npm run start    # start production server
npm run lint     # eslint over app components hooks lib store types
npm run format   # prettier --write .
```

There is no test suite configured in this repo.

### Dev server
`npm run dev` never exits. Never run it as a blocking foreground call. Start it detached/backgrounded, poll `http://localhost:3000` with a bounded number of attempts to confirm readiness, and kill it explicitly when done — full procedure and exact commands are in `pcs-tech-standards` §11. Always check port 3000 is free first.

## Architecture

- **Not stock Next.js.** This project pins Next.js 16.2.12, which has specific API changes vs. training data. Before writing Next.js-specific code, check `node_modules/next/dist/docs/` — a key breaking change: `next/dynamic({ ssr: false })` is **not allowed directly inside a Server Component** under Turbopack; it must be isolated inside a dedicated `'use client'` wrapper file and imported into the server page.

- **Route groups**: `app/(full-width)/` holds Landing, Team, B2B Insight, and Auth (`/auth`) — normal full-width pages. `app/(kiosk-app)/` holds Modules 2–7 (map, feed, wallet, marketplace, challenge, kiosk, settings), all rendered inside a simulated phone-frame mockup (auto-hides on real mobile ≤480px).

- **State**: Zustand stores in `store/` (one per domain: `wallet-store`, `feed-store`, `kiosk-store`, `challenge-store`, `locale-store`, `profile-store`). Stores that persist to `localStorage` use `persist(..., { skipHydration: true })` and are rehydrated once, manually, by `components/store-hydration-provider.tsx` (mounted in root layout). Any component reading a persisted store's value must gate rendering behind a "has mounted" check first, or it will hit a server/client hydration mismatch — see `pcs-tech-standards` §10a. `kiosk-store` is intentionally not persisted (ephemeral state machine — `IDLE → QR_DISPLAY → SIMULATED_SCAN → RESULT_PASS|RESULT_REJECT → IDLE`).

- **i18n**: custom Zustand-based system, not `next-intl`. `store/locale-store.ts` holds the current locale (`'vi' | 'en'`, defaults to `'vi'`, no browser auto-detection), dictionaries live in `lib/i18n/dictionaries.ts`, and components consume them via the `useTranslation` hook (`hooks/use-translation.ts`). Nav/tab labels and full display labels are **separate dictionary keys** (`walletShort` vs `wallet`) because EN strings often overflow the fixed-width bottom nav — see `pcs-tech-standards` §13. Migration from hardcoded Vietnamese strings to this system is in progress and tracked module-by-module in `I18N_MIGRATION_STATUS.md`; check that file before assuming a module is fully migrated.

- **Auth & sync (offline-first)**: Auth is fully optional — the app works anonymously offline without Supabase configured. `components/shared/auth-provider.tsx` exposes the Supabase session via context; `lib/supabase/client.ts` / `server.ts` are the browser/server Supabase clients (`@supabase/ssr`), `lib/supabase/db.ts` is the typed data-access layer, and `middleware.ts` refreshes the auth token on matched routes (its matcher deliberately excludes static assets and PWA files to avoid redirect loops on mobile). When offline, mutating actions (points, likes, saved vouchers, profile updates) are queued to IndexedDB via `lib/sync-queue.ts` (`idb-keyval`) instead of hitting Supabase directly. `hooks/use-sync-manager.ts` listens for the browser `online` event and replays the queue through `lib/supabase/sync-service.ts` once a user is authenticated; anonymous users never touch this path. `supabase_schema.sql` is the canonical DDL/RLS reference — keep it in sync with any schema-affecting change.

- **Services vs. stores**: `services/*-service.ts` are the mock-data-backed data layer per module (mirrors what a real backend call would look like); `store/*-store.ts` holds client state and calls into services/DAL. `lib/mock-data.ts` is the single source of demo data.

- **Motion**: all animation durations/easing come from `lib/motion-tokens.ts` — never inline new timing constants in a component.

- **Horizontal scroll strips** (carousels, story rings, voucher grids, leaderboard chips) must use `hooks/use-drag-scroll.ts` for desktop mouse-drag support rather than custom pointer logic — plain `overflow-x: auto` does not respond to mouse click-drag.
</content>
