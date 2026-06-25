# 🏆 WorldCup26 — FIFA World Cup 2026 Prediction Platform

A premium, production-ready MERN-stack prediction experience for the FIFA World Cup 2026.
Cinematic scroll storytelling, 3D, real-time leaderboards, and a full prediction engine.

> **Benchmark quality:** Apple · Stripe · Linear · Vercel · Awwwards · FIFA Digital

---

## Monorepo layout

```
worldcup26/
├── frontend/        React 18 + Vite + Tailwind + Framer Motion + GSAP + Lenis + R3F
├── backend/         Node + Express + MongoDB + Mongoose (TypeScript)
├── docs/            Architecture, roadmap, deployment
├── ARCHITECTURE.md  System / DB / API / FE / state / auth / scroll strategy
├── ROADMAP.md       8-phase implementation plan
└── README.md        You are here
```

## Tech stack

| Layer        | Tech |
|--------------|------|
| Frontend     | React 18, Vite, TypeScript, TailwindCSS, Framer Motion, GSAP + ScrollTrigger, Lenis, React Three Fiber, Drei, Zustand, Axios |
| Backend      | Node.js, Express, MongoDB, Mongoose, TypeScript |
| Auth         | JWT (access + refresh), Google OAuth 2.0 |
| Realtime     | Socket.IO (live standings & leaderboards) |
| Deployment   | Vercel (FE), Render/Railway (BE), MongoDB Atlas |

## Quick start

```bash
# Backend
cd backend
cp .env.example .env        # fill in values
npm install
npm run dev                 # http://localhost:4000

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — full system design & every major decision
- **[ROADMAP.md](./ROADMAP.md)** — phased delivery plan (Phases 1–8)
- **[docs/SCROLL_STRATEGY.md](./docs/SCROLL_STRATEGY.md)** — the award-winning scroll animation system
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — deploy to Vercel + Render + Atlas

## Status

**Phases 1–10 complete** — full prediction platform with real-time updates and optional real
World Cup data via API-Football (set `API_FOOTBALL_KEY` and run `npm run import:wc`).
See [ROADMAP.md](./ROADMAP.md) for the full phase breakdown.
