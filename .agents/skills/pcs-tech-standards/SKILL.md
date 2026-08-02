---
name: pcs-tech-standards
description: Technical standards, folder structure, coding conventions, Design Tokens, Motion Tokens, Next.js App Router safeguards, git workflow, and deploy process for the PCS project. Use when setting up the project, writing services/stores, configuring Tailwind, building any chart/data-viz component, committing to git, or deploying.
---

# PCS Technical Standards

## 1. Standard Next.js App Router Folder Structure
- `app/`
- `components/ui`
- `components/shared`
- `services/`
- `store/`
- `lib/`
- `types/`

## 2. TypeScript Rules
- Strict mode must be enabled.
- No `any` type allowed.
- Every mock service must have a clearly typed interface in `types/`.

## 3. Design Tokens
- The color table MUST be implemented as CSS variables in `app/globals.css` and referenced in `tailwind.config.ts`.
- There should be no scattered hardcoded hex codes inside components.

## 4. Motion Tokens
- Defined once in `lib/motion-tokens.ts`.
- Must include standard durations: fast=150ms, base=250ms, slow=400ms.
- Must include standard easing (one consistent cubic-bezier) and standard Framer Motion spring config (fixed stiffness/damping).
- Every animated component must import from here; never define its own numbers.

## 5. Assets / Images
- Use `https://picsum.photos/seed/{name}/w/h` as placeholder photos.
- Use Lucide icons or hand-drawn SVG for illustrations.
- NEVER use a real, unlicensed brand logo — use a text chip + generic icon instead.

## 6. Environment Variables
- Any API key (Mapbox/Google Maps) must live in `.env.local`.
- Must include a matching `.env.example` template.
- NEVER hardcode API keys in code.
- `.env.local` must be listed in `.gitignore`.

## 7. Code Quality
- Configure ESLint + Prettier from day one.
- The agent must run lint before declaring any module "complete".

## 8. Git Workflow
- Use one branch per module: `feature/module-N-module-name`.
- Commit messages in the format: `feat(module-N): short description`.
- Only merge into `main` after a module has passed its own QA review.

## 9. Root README.md
- Must include a project description.
- Must include `npm install` / `npm run dev` instructions.
- Must include a list of required environment variables.

## 10. NEXT.JS APP ROUTER SAFEGUARDS
a. Zustand Persist Hydration: any component reading from a Zustand store that uses the `persist` middleware (Green Wallet points, Rewards, Like/Comment state, etc.) MUST guard against React Hydration Mismatch. The server renders with the store's default initial state; the client then reads localStorage, which usually differs, causing "Text content does not match server-rendered HTML" errors.
Required pattern: either (a) create the store with `persist(..., { skipHydration: true })` and manually call `useStore.persist.rehydrate()` inside a `useEffect` on mount, or (b) gate any UI that reads persisted values behind a `hasMounted` state that starts `false` and flips to `true` inside `useEffect`, rendering a skeleton/loading state until then. Every component reading Green Wallet points, voucher inventory, or Like/Comment state must use one of these two patterns — never read persisted store values directly during the first render.

b. Chart Libraries (Recharts or equivalent): any file in `app/` is a Server Component by default and cannot run Recharts, which depends on client-only hooks and DOM measurement (`window`, `ResizeObserver`). Any component using Recharts MUST:
  - start with `'use client';` as the first line, AND
  - when the chart is wrapped by `ResponsiveContainer` and rendered on a route where initial layout width matters (Module 4 Green Wallet, Module 8 B2B Insight), import it via `next/dynamic` with `{ ssr: false }` to avoid a 0-width flash on first paint — this is a rendering-quality fix, not a crash-prevention fix; the `'use client'` directive alone is what prevents the hard crash, the dynamic import only prevents the visual flicker.
