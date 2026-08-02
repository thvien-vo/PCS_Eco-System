---
name: pcs-design-system
description: Design system, UI/UX rules, the 8-module structure, the Vietnamese/English language convention, and the Definition of Done for the PCS Eco-System demo app. Use whenever building or editing any screen/component of the "PCS Recycling Hub" Next.js app.
---

# PCS Design System

## 1. Context & exact naming (PCS = Plastic Circularity Station)
- Project Name: PCS Eco-System (Plastic Circularity Station Recycling Hub).
- Objective: Competitor entry for Dow Circular Economy Innovation Challenge.
- Concept: A digital ecosystem linking smart plastic collection kiosks (PCS Stations), green rewards wallet, social voucher feed, gamification challenge, and enterprise Data-as-a-Service insights for Dow.

## 2. Language convention (100% Vietnamese UI text, English code/ variable names)
- 100% Vietnamese UI Text: Every user-facing text, button label, modal message, error message, notification, and tooltip MUST be in grammatically correct Vietnamese with full accents/diacritics. This applies to every screen, button, and message the end user sees.
- Code Base: English for standard variable names, component files, type definitions, and code comments.

## 3. Required tech stack
- Framework: Next.js 14+ (App Router) + TypeScript strict mode (no `any` allowed).
- UI Kit: TailwindCSS + shadcn/ui components.
- Animation: Framer Motion (reusing standard tokens from `lib/motion-tokens.ts`).
- State Management: Zustand with `persist` middleware (MUST apply hydration safeguards per Skill 3).
- Icons: Lucide Icons.
- Map: Mapbox GL JS (API key via `.env.local`).
- Charts: Recharts (MUST use `'use client'` + `next/dynamic` with `{ ssr: false }`).
- QR Generation: `qrcode.react`.

## 4. The FULL color table
| Variable Name | Hex Code | Usage Role |
| --- | --- | --- |
| `--primary-emerald` | `#059669` | Primary brand green, key CTAs, active states |
| `--emerald-hover` | `#047857` | Hover state for primary buttons |
| `--neon-mint` | `#10B981` | Accent highlights, secondary badges |
| `--bg-light` | `#F8FAFC` | Light mode global background |
| `--bg-dark` | `#0F172A` | Dark mode global background |
| `--card-light` | `#FFFFFF` | Light mode card background |
| `--card-dark` | `#1E293B` | Dark mode card background |
| `--text-primary-light` | `#0F172A` | Light mode primary text |
| `--text-primary-dark` | `#F8FAFC` | Dark mode primary text |
| `--text-muted` | `#64748B` | Secondary text, captions, subtitles |
| `--border-light` | `#E2E8F0` | Light mode subtle borders |
| `--border-dark` | `#334155` | Dark mode subtle borders |
| `--kiosk-pass` | `#22C55E` | SUCCESS state strictly inside Module 7 Kiosk |
| `--warning-amber` | `#F59E0B` | Warning state, medium severity REJECT |
| `--error-rose` | `#EF4444` | High severity REJECT, error messages |

## 5. Layout & Typography rules
- Layout Structure: Simulated mobile phone-frame mockup on desktop view (auto-hidden on real mobile screens <= 480px via CSS media query). Bottom navigation bar fixed at the bottom.
- Typography: Inter or Plus Jakarta Sans font family. Clean hierarchy with heading sizes h1 (24px bold), h2 (18px semibold), body (14px regular), caption (12px muted).

## 6. Mandatory states for any dynamic screen (skeleton/empty/error)
Every screen fetching or persisting data must support 3 distinct UI states:
1. Skeleton State: Clean shimmer placeholder matching the layout.
2. Empty State: Custom illustration/icon + friendly Vietnamese copy + actionable CTA button.
3. Error State: Alert box with descriptive Vietnamese message + "Thử lại" (Retry) button.

## 7. Accessibility rules (contrast, 44x44px touch target, font scaling)
- Text/Background contrast ratio >= 4.5:1.
- Tappable targets (buttons, icons, menu items) MUST be >= 44x44px.
- Support browser font scaling without clipping text.

## 8. The shared particle-burst component rule (only 3 allowed usage spots)
The `particle-burst` component is a shared visual feedback element. It is STRICTLY allowed in ONLY 3 spots across the entire app:
1. Module 7 Kiosk: Upon receiving a PASS result.
2. Module 3 Green Feed: Upon clicking "Lưu mã" (Save Code) on a sponsor voucher card.
3. Module 6 Marketplace: Upon successful voucher redemption using Green Points.
*Do NOT trigger particle-burst anywhere else.*

## 9. Detailed description of every Module 1–8
- Module 1 (Landing & Team Profile): Brand overview, stats counter, Instagram-bio style cards for 1 advisor + 4 team members with clear placeholders.
- Module 2 (PCS Station Map): Interactive Mapbox GL JS map with glowing station pins, Grab/Uber style popups (distance, 3-level green/yellow/red status without sensor jargon, directions CTA).
- Module 3 (Voucher Social Network & Green Feed): Quick Action Carousel, Green Stories, real-time Flash Sale countdown, newsfeed with sponsor vouchers, 1-click Save Code, Like/Comment with Zustand persistence.
- Module 4 (Green Wallet & Carbon Report): Total Green Points sync, voucher inventory, transaction history, Activity Rings (CO2 reduced + trees planted computed from transactions), weekly trend Recharts line chart (SSR safe).
- Module 5 (Swipe Challenge & Gamification): Framer Motion drag gestures (Swipe Right -> confirm modal, Swipe Left -> skip to back of queue at N=5), weekly/monthly Leaderboard with top-3 podium and fake 3D CSS badges.
- Module 6 (Green Rewards Marketplace): Voucher/gift redemption grid synced with Green Wallet points, blurred overlay for "Not enough points" cards.
- Module 7 (Kiosk Simulation - CRITICAL): Kiosk Modal with 90s QR countdown (`qrcode.react`), laser-scan effect, PASS/REJECT debug controls (PET/confidence score for PASS, 4 distinct FTIR domain REJECT reasons), "Simulation Mode" badge, strict cleanup/race-condition guards.
- Module 8 (B2B Insight Snapshot - OPTIONAL): Dedicated enterprise route `/b2b-insight` showing weekly sorted plastic bar chart, PASS/REJECT breakdown pie chart, active station heatmap, and Dow value proposition statement.

## 10. The Hardware & Pitching Strategy Note
"The software demo simulates the Kiosk UI/UX and session token flow. The QrDisplayModule architecture is modularized so that once real FTIR optical hardware and classification APIs are integrated, the frontend components remain 100% reusable without rewriting UI logic."

## 11. All 10 items of the "Definition of Done"
1. 100% of UI-facing text is in natural Vietnamese with correct spelling and diacritics.
2. All 8 modules render cleanly in both Light Mode and Dark Mode without unstyled background spots.
3. The app is wrapped in a phone-frame mockup on desktop view and auto-hides gracefully on mobile screens.
4. Module 7 Kiosk Modal correctly runs the 90-second QR countdown and auto-regenerates session tokens upon expiry.
5. Module 7 Kiosk handles PASS (with particle burst + points award) and all 4 REJECT reasons cleanly.
6. Module 3 Feed "Save Code" action correctly saves vouchers into the Module 4 Green Wallet via Zustand store.
7. Module 4 Activity Rings show numbers strictly computed from transaction history, and Recharts renders with zero SSR errors.
8. Module 5 Swipe Challenge cards return to the queue properly on Swipe Left (at position N=5) and on modal cancellation.
9. Module 6 Marketplace deducts points immediately in the shared Zustand store upon redemption, firing particle burst.
10. The codebase compiles clean (`npm run dev` and `npm run lint` pass with zero fatal errors).
