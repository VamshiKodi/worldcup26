# 🏆 WorldCup26 — Full Project Details

**A production-ready MERN prediction platform for the FIFA World Cup 2026.**

This document is the single-source, top-to-bottom reference for *what this project is*, *how it is
built*, and *how to run it*. It reflects the current state of the codebase (48 teams, 12 groups, live
engine + real-data sync, prediction engine, AI lab, Monte Carlo simulator, admin dashboard).

- **Last updated:** 2026-07-01
- **Repository status:** `main` branch — all 10 delivery phases complete; builds and runs locally.

---

## 1. Overview

WorldCup26 is a cinematic, real-time fan platform where users explore the 2026 World Cup and compete
by predicting results. It pairs a high-end animated frontend (Apple / Stripe / Linear / Awwwards
class) with a fully typed MERN backend.

**What users can do:**

- **Browse the tournament** — all 48 nations, squads, the 12 groups (A–L), fixtures, live standings,
  and tournament statistics.
- **Make predictions** — per-match score predictions, group-order predictions, a full knockout
  bracket, and an overall champion pick. Predictions are **scored automatically** when matches finish.
- **AI Prediction Lab** — a 1X2 probability model (FIFA ranking + recent form + team strength, with
  host advantage) estimates win/draw/loss odds for any matchup, with visualizations.
- **Tournament Simulator** — Monte Carlo simulation (e.g. 100 / 1000 runs) producing championship
  probability distributions.
- **Live match updates** — matches tick minute-by-minute in real time (clock, score, event timeline)
  over WebSockets, with goal and full-time toast alerts.
- **Leaderboards** — global ranking of predictors by points earned.
- **Admin dashboard** — CRUD for teams/players/matches, analytics, and comment moderation.
- **Real data (optional)** — import real teams/fixtures/standings/form/scorers from
  football-data.org; a real live-sync loop then replaces the built-in simulator.

The experience is built to a high visual bar: smooth (Lenis) scrolling, scroll-driven GSAP/Framer
animations, a React-Three-Fiber 3D hero (trophy on a pedestal), parallax, and a polished UI kit —
all with `prefers-reduced-motion` fallbacks.

---

## 2. Tech stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, TypeScript, TailwindCSS, Framer Motion, GSAP + ScrollTrigger, Lenis (smooth scroll), React Three Fiber + Drei + Postprocessing (3D), Zustand (state), React Router, Axios |
| **Backend** | Node.js, Express 4, MongoDB + Mongoose 8, TypeScript (ESM), Zod (validation) |
| **Auth** | JWT (access + refresh with rotation), bcryptjs, Google OAuth 2.0 (`google-auth-library`) |
| **Realtime** | Socket.IO (live matches, standings, leaderboards) |
| **Security / perf** | Helmet, CORS, compression, express-rate-limit, morgan logging, in-memory caching |
| **External data** | football-data.org **v4** API (optional real World Cup data) |
| **Deployment** | Vercel (frontend), Render / Railway (backend), MongoDB Atlas (DB) |

---

## 3. Repository layout

```
worldcup26/
├── frontend/                 React 18 + Vite SPA
│   └── src/
│       ├── App.tsx / main.tsx
│       ├── components/       admin, auth, layout, motion, predict, sections, three, ui
│       │   └── three/hero/   modular 3D hero (Scene, Trophy, Pedestal, Lights, Effects, …)
│       ├── pages/            Home, Teams, Players, Matches, MatchDetail, Groups, Bracket,
│       │                     Leaderboard, Predictions, AiLab, Simulator, Admin, Login, NotFound
│       ├── providers/        AuthProvider, LiveProvider, SmoothScrollProvider
│       ├── store/            Zustand slices (auth, live, prediction)
│       ├── hooks/            useApi, useMatchLive, useParallax, useMouseFollow, …
│       ├── lib/              api, socket, toast, format, types
│       └── styles/           Tailwind + global CSS (design tokens)
├── backend/                  Node + Express + Mongoose API (TypeScript, ESM)
│   └── src/
│       ├── app.ts / server.ts
│       ├── models/           12 Mongoose models (+ index.ts re-export)
│       ├── controllers/      one per resource (13)
│       ├── routes/           REST routes, mounted under /api (index.ts aggregates)
│       ├── services/         scoring, standings, simulator, AI/strength, live engine,
│       │                     match events, real-data sync/mapping/rankings
│       ├── middleware/        auth, validate, cache, error, rate limiters, asyncHandler
│       ├── validators/       Zod schemas
│       ├── sockets/          Socket.IO setup
│       ├── scripts/          seed, importWorldCup, enrichPhotos, matchResults,
│       │                     evaluatePredictions, seedData
│       ├── config/           db, env
│       ├── types/            shared TS types
│       └── utils/            jwt, password, cache, paginate
├── docs/                     SCROLL_STRATEGY.md, DEPLOYMENT.md
├── ARCHITECTURE.md           full system design
├── ROADMAP.md                10-phase delivery plan
├── README.md                 quick start
├── render.yaml               Render deploy config
├── PROJECT_INFO.md           earlier project overview / build log
└── PROJECT_DETAILS.md        ← this file
```

---

## 4. Backend — data models (12)

All in `backend/src/models/`, with indexes and validation; `models/index.ts` re-exports them.

1. **User** — auth, role (`user` / `admin`), profile, OAuth identity, accumulated points.
2. **Team** — 48 nations: name, code, flag, confederation, FIFA ranking, group, recent form, `apiId`.
3. **Player** — squad members: name, team, position, photo, goals/stats, top-scorer flag, `apiId`.
4. **Match** — fixtures: teams, stage, group, kickoff, status, score, live state, `apiId`.
5. **Group** — the 12 groups (A–L) and their member teams.
6. **Standing / Statistic** — computed group standings and tournament statistics.
7. **Prediction** — a user's per-match / group / winner prediction, with scoring fields.
8. **Bracket** — a user's full knockout-bracket prediction.
9. **Leaderboard** — ranked predictor standings.
10. **Comment** — user comments (moderated in admin).
11. **Notification** — user notifications.
12. **Achievement** — badges / achievements.

---

## 5. Backend — API surface

All routes mounted under `/api` (`routes/index.ts`), behind a global rate limiter:

| Route | Purpose |
|-------|---------|
| `/api/auth` | register, login, refresh (rotation), logout, me, Google OAuth |
| `/api/teams` | list / detail teams |
| `/api/players` | list / detail players |
| `/api/matches` | fixtures, match detail, live state |
| `/api/groups` | groups |
| `/api/standings` | computed group standings |
| `/api/leaderboard` | predictor rankings |
| `/api/stats` | tournament statistics |
| `/api/predictions` | prediction CRUD + settlement |
| `/api/brackets` | knockout-bracket predictions |
| `/api/ai` | AI 1X2 probability model |
| `/api/simulate` | Monte Carlo tournament simulator |
| `/api/admin` | protected admin CRUD + analytics + moderation |

**Key services** (`backend/src/services/`):

- `scoringService` — awards points when matches finish (settlement).
- `standingsService` — recomputes group tables.
- `simulatorService` — Monte Carlo tournament simulation.
- `aiService` + `strength` — the 1X2 probability model (rating from FIFA rank + form + strength,
  host advantage, and derived win/draw/loss probabilities).
- `liveEngine` — in-memory engine that auto-advances live matches minute-by-minute and emits updates.
- `matchEvents` — synthesizes a plausible goal/card timeline from a scoreline and real squad players
  (the football-data.org free tier gives scores but not scorers/cards); events are persisted so they
  stay stable across reloads.
- `syncService` + `footballData` + `wcMapping` + `fifaRankings` — typed football-data.org v4 client,
  pure mapping layer, curated FIFA rankings, and the real-data import + live-sync loop.

---

## 6. Frontend — pages & features

- **Home** — cinematic landing: 3D hero (trophy + pedestal + effects), scroll-driven sections
  (stats band, teams showcase, top scorers), parallax and reveals.
- **Teams / Players** — browse all 48 nations and squads, with flags, photos, and form pips.
- **Matches** — fixtures list with live-ticking scores.
- **MatchDetail** — live clock, event timeline, and your-prediction-vs-live comparison.
- **Groups** — the 12 groups with live standings.
- **Bracket** — interactive knockout-bracket prediction.
- **Predictions** — tabs for match scores, group order, bracket, and champion pick; optimistic/draft UI.
- **AiLab** — AI probability lab with visualizations.
- **Simulator** — run Monte Carlo simulations and view probability distributions.
- **Leaderboard** — global predictor rankings.
- **Admin** — protected dashboard: teams/players/matches CRUD, analytics, comment moderation.
- **Login** — email/password + Google OAuth.
- **NotFound** — 404.

**3D hero** (`components/three/hero/`) is modular: `Scene`, `Trophy` / `TrophyModel` /
`ProceduralTrophy`, `Pedestal`, `Lights`, `Environment`, `Effects`, `Loading`, `useAutoRotate`, plus
`constants.ts`. Loaded lazily via `HeroCanvas` for performance.

**UI kit** (`components/ui/`): Button, GlassCard, AnimatedNumber, ProgressRing, ProbabilityBar,
Badge, Flag, FormPips, PlayerAvatar, Pagination, FilterTabs, Skeleton, EmptyState, Toaster, etc.

**State & realtime:** Zustand store with `auth`, `live`, and `prediction` slices. Realtime via a
lazy-loaded `LiveProvider` + Socket.IO client. Smooth scroll via `SmoothScrollProvider` (Lenis ↔ GSAP).

---

## 7. Configuration (backend env)

Configured in `backend/src/config/env.ts` (loaded from `.env`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `4000` | API port |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin |
| `MONGODB_URI` | local mongo | database connection |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | dev fallbacks | token signing |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | `15m` / `7d` | token lifetimes |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Google OAuth |
| `LIVE_ENGINE` | on (unless `off`) | enable the live simulation engine |
| `LIVE_TICK_MS` | `5000` | real ms per match-minute |
| `LIVE_MAX` | `8` | max concurrent live matches |
| `LIVE_AUTOKICKOFF` | off (`on` to enable) | auto-promote scheduled → live at kickoff |
| `FOOTBALL_DATA_TOKEN` | — | enables **real-data mode** when set |
| `FOOTBALL_DATA_URL` | `…/v4` | football-data.org base URL |
| `FOOTBALL_DATA_COMPETITION` | `WC` | competition code (World Cup) |
| `FOOTBALL_DATA_POLL_MS` | `60000` | live-sync cadence (≥30s enforced) |
| `FOOTBALL_DATA_RESULT_POLL_MS` | `300000` | finished-result reconcile cadence (≥60s enforced) |

When `FOOTBALL_DATA_TOKEN` is present, `hasRealData` is true and the real sync loop takes over from
the simulator.

---

## 8. Running the project

```bash
# Backend
cd backend
cp .env.example .env        # fill in MONGODB_URI, JWT secrets, etc.
npm install
npm run seed                # seed 48 teams + 12 groups (no fabricated results)
npm run dev                 # http://localhost:4000

# Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

**Backend scripts** (`backend/package.json`):

- `npm run dev` — run API with hot reload (tsx watch).
- `npm run build` / `npm start` — compile TS and run the built server.
- `npm run seed` — seed teams, groups, base data (no fabricated results).
- `npm run import:wc` — import real World Cup data (needs `FOOTBALL_DATA_TOKEN`).
- `npm run import:wc:players` — also import real top scorers as players.
- `npm run enrich:photos` — enrich player photos.
- `npm run evaluate:predictions` — diagnostic: evaluate the 1X2 model against finished DB matches.
- `npm run typecheck` / `npm run lint` — quality gates.

`scripts/matchResults.ts` holds the actual World Cup 2026 results dataset used for seeding/settlement.

**Frontend scripts** (`frontend/package.json`): `dev`, `build` (`tsc -b && vite build`), `preview`,
`lint`, `typecheck`.

**Live demo mode:** set `LIVE_AUTOKICKOFF=on` with a low `LIVE_TICK_MS` for a hands-off,
auto-advancing live tournament.

**Real-data mode:** set `FOOTBALL_DATA_TOKEN` (+ `FOOTBALL_DATA_*`) and run `npm run import:wc`.
On the free tier, live scores are delayed (not tick-by-tick), and the seed never fabricates results.

---

## 9. Build history — the 10 phases (all ✅ complete)

| Phase | Title | What shipped |
|------:|-------|--------------|
| **1** | Architecture & scaffold | Docs (ARCHITECTURE / ROADMAP / scroll / deploy), runnable FE/BE skeleton, design tokens, tooling, git |
| **2** | DB schemas & backend APIs | 12 Mongoose models, REST controllers/routes, Zod validation, pagination, caching, rate limiting, seed (48 teams / 12 groups) |
| **3** | Auth & authorization | JWT access/refresh with rotation, bcrypt, Google OAuth, `requireAuth`/`requireAdmin`, FE auth flow + Axios refresh-on-401 |
| **4** | Frontend pages | Every page wired to the API, responsive layouts, full UI kit, loading/skeleton/error states |
| **5** | Scroll animations | Lenis + GSAP ScrollTrigger + Framer Motion + R3F 3D hero, parallax/reveals/sticky, reduced-motion fallbacks |
| **6** | Prediction engine | Match/group/bracket/winner predictions + scoring/settlement + AI Prediction Lab + Monte Carlo simulator |
| **7** | Admin dashboard | Protected CRUD for teams/players/matches, analytics dashboard, comment moderation |
| **8** | Production hardening | Route code-splitting, lazy 3D, image optimization, caching headers, rate-limit tuning, Vercel/Render/Atlas configs + CI |
| **9** | Live match updates | In-memory live engine auto-advancing matches minute-by-minute, Socket.IO realtime (clock/score/timeline), goal & full-time toasts, resumes on boot |
| **10** | Real data (football-data.org) | Typed v4 client, pure mapping layer, curated FIFA rankings, idempotent import (teams/fixtures/standings/form/scorers) + real live sync that replaces the simulator |

---

## 10. Reference docs

- **[README.md](./README.md)** — quick start.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — full system, DB, API, FE, state, auth & scroll design.
- **[ROADMAP.md](./ROADMAP.md)** — the 10-phase plan with per-phase detail.
- **[docs/SCROLL_STRATEGY.md](./docs/SCROLL_STRATEGY.md)** — the scroll-animation system.
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — deploy to Vercel + Render + Atlas.
- **[PROJECT_INFO.md](./PROJECT_INFO.md)** — earlier overview / build log.
</content>
</invoke>
