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
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes (for live map) | Mapbox GL JS public token. Get a free one at [account.mapbox.com](https://account.mapbox.com/). The app will show a placeholder map if this is left empty. |

## Project Structure

```
app/
  (full-width)/     # Landing + Team Profile (no phone-frame)
  (kiosk-app)/      # Modules 2–6 wrapped in phone-frame mockup
components/
  shared/           # PhoneFrame, BottomNav, ParticleBurst, etc.
  ui/               # shadcn/ui components
lib/
  mock-data.ts      # All mock data for the demo
  motion-tokens.ts  # Shared Framer Motion duration/easing constants
store/              # Zustand stores (wallet, feed, kiosk)
types/              # TypeScript interfaces
```
