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
- CONFIRMATION RULE: If a new prompt's instructions conflict with a previously approved plan or an established rule, ask for confirmation before proceeding, rather than silently complying and explaining only when questioned. This applies symmetrically — whether the deviation originates from you or from the user.

## 8. Git Workflow
- Commit messages in the format: `feat(module-N): short description`.
- For this solo project, push directly to `main` and skip feature branches.
- IMMEDIATELY after a module commit instruction says `feat(module-N): ...`, the agent MUST run `git push origin main` to sync the work to the remote repository.

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

## 11. DEV SERVER EXECUTION RULES (CRITICAL — NEVER VIOLATE)

`npm run dev` is a long-running, non-terminating process. It will NEVER exit on its own. Invoking it as a blocking terminal call causes an infinite hang. The following rules are MANDATORY for every session:

### 11a. Always check the port is free first
Before starting the dev server, always run:
```powershell
netstat -ano | findstr :3000
```
- If the output is empty (exit code 1 / no matches): port is free, proceed.
- If any PID is listed as LISTENING: report the PID and STOP — do not start until the user confirms it is cleared.

### 11b. Start the server in background (non-blocking) mode
OPTION 1 — PREFERRED: Use the terminal tool's native `IsDaemon: true` flag. This returns control immediately and keeps the process running in the background:
```
run_command(CommandLine="npm run dev", IsDaemon=true, WaitMsBeforeAsync=3000)
```
The tool returns a background task ID. Use `manage_task(Action="kill", TaskId=...)` to terminate it when done.

OPTION 2 — FALLBACK (only if IsDaemon is unavailable): Start as a detached Windows process:
```powershell
$proc = Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev" `
  -RedirectStandardOutput "dev.log" -RedirectStandardError "dev-error.log" `
  -WindowStyle Hidden -PassThru
$proc.Id | Out-File "dev-server.pid"
```
This returns immediately. Kill later with: `taskkill /PID (Get-Content dev-server.pid) /F`

### 11c. Verify readiness with bounded polling (never open-ended)
After starting the server, verify it is ready using at most 5 attempts with a timeout per attempt:
```powershell
$maxAttempts = 5; $attempt = 0; $success = $false
while ($attempt -lt $maxAttempts -and -not $success) {
    $attempt++
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        Write-Host "Attempt ${attempt} - HTTP $($res.StatusCode) - UP"; $success = $true
    } catch {
        Write-Host "Attempt ${attempt} - Not ready - $($_.Exception.Message)"
        if ($attempt -lt $maxAttempts) { Start-Sleep -Seconds 4 }
    }
}
if (-not $success) { Write-Host "FAILED — report log contents and stop." }
```
- Only proceed once a successful HTTP response is received.
- If still failing after 5 attempts (~25-30s total): STOP and report the log. Do not retry indefinitely.

### 11d. Always clean up the background server
When verification work for a turn is complete, explicitly kill the background server:
- IsDaemon approach: `manage_task(Action="kill", TaskId="<task-id>")`
- Detached process approach: `taskkill /PID (Get-Content dev-server.pid) /F`

Exception: leave the server running only when the user explicitly says "leave it running for me to test."

## 12. Horizontal Carousel / Drag-Scroll Pattern (MANDATORY)

Any component rendering a horizontal scrollable strip (e.g., quick-action carousels, story rings, voucher grids, leaderboard chips) MUST use the `useDragScroll` hook from `hooks/use-drag-scroll.ts` to support desktop mouse-drag navigation.

**Why:** `overflow-x: auto` containers respond to trackpad two-finger swipe and sometimes Shift+scroll-wheel, but NEVER to mouse click-drag on desktop. Without this hook, items that overflow off-screen are unreachable with a standard mouse.

**Required pattern:**
```tsx
import { useDragScroll } from '@/hooks/use-drag-scroll';

const drag = useDragScroll();

<div
  ref={drag.ref as React.RefObject<HTMLDivElement>}
  onMouseDown={drag.onMouseDown}
  onMouseMove={drag.onMouseMove}
  onMouseUp={drag.onMouseUp}
  onMouseLeave={drag.onMouseLeave}
  onClickCapture={drag.onClickCapture}
  className="flex gap-3 overflow-x-auto scrollbar-hide cursor-grab pb-1"
>
  {/* items with their own onClick handlers still work correctly */}
</div>
```

**Click/drag disambiguation rules (built into the hook):**
- A gesture is a **click** if total horizontal movement < 5 px.
- A gesture is a **drag** if movement ≥ 5 px — child `onClick` events are suppressed via capture-phase interception so accidental navigation/overlay-open doesn't occur.
- `cursor: grabbing` applies during the drag for visual affordance; the consumer sets `cursor-grab` at rest via className.

**DO NOT** add custom pointer/touch drag logic in individual components — always import and use the shared hook.
