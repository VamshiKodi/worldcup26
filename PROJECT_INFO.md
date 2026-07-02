# 🏆 WorldCup26 — Project Info & Build Log

**A complete, production-ready MERN prediction platform for the FIFA World Cup 2026.**

This file is the original overview / build log. For the current top-to-bottom reference see
**[PROJECT_DETAILS.md](./PROJECT_DETAILS.md)** (kept in sync with the latest code).

- **What it is:** a cinematic, real-time prediction game for the 2026 World Cup (48 teams, 12 groups).
- **Stack:** MERN (MongoDB, Express, React, Node) — full TypeScript, front and back.
- **Status:** Phases 1–10 complete. Fully runnable locally; deploy configs included.
- **Last updated:** 2026-07-01.

---

## 1. What the website does

WorldCup26 is a fan platform where users predict the World Cup and compete on leaderboards:

- **Browse the tournament** — all 48 teams, players, 12 groups, fixtures, live standings, stats.
- **Make predictions** — score predictions per match, group standings, full knockout bracket,
  and an overall champion pick. Predictions are scored automatically when matches finish.
- **AI Prediction Lab** — a probability model (FIFA ranking + recent form + strength) estimates
  win/draw/loss odds for any matchup, with visualizations.
- **Tournament Simulator** — Monte Carlo simulation (100 / 1000 runs) producing championship
  probability distributions.
- **Live match updates** — matches tick minute-by-minute in real time (clock, score, event
  timeline) over WebSockets, with goal and full-time toast alerts.
- **Leaderboards** — global ranking of predictors by points earned.
- **Admin dashboard** — CRUD for teams/players/matches, analytics, and comment moderation.
- **Real data option** — optionally import real teams/fixtures/standings/form/scorers from
  football-data.org; real live sync then replaces the built-in simulator.

The experience is built to a high visual bar (Apple / Stripe / Linear / Awwwards class):
smooth scrolling, scroll-driven animations, a 3D hero, and polished UI throughout.

---

## 2. Tech stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS, Framer Motion, GSAP + ScrollTrigger, Lenis (smooth scroll), React Three Fiber + Drei (3D), Zustand (state), Axios |
| **Backend** | Node.js, Express, MongoDB, Mongoose, TypeScript, Zod (validation) |
| **Auth** | JWT (access + refresh w/ rotation), bcrypt, Google OAuth 2.0 |
| **Realtime** | Socket.IO (live matches, standings, leaderboards) |
| **Security/perf** | Helmet, CORS, compression, express-rate-limit, in-memory caching |
| **External data** | football-data.org v4 API (optional, real World Cup data) |
| **Deployment** | Vercel (frontend), Render/Railway (backend), MongoDB Atlas (DB) |

---

## 3. Repository layout

```
worldcup26/
├── frontend/              React 18 + Vite SPA
│   └── src/
│       ├── components/    admin, auth, layout, motion, predict, sections, three, ui
│       ├── pages/         Home, Teams, Players, Matches, MatchDetail, Groups, Bracket,
│       │                  Leaderboard, Predictions, AiLab, Simulator, Admin, Login, NotFound
│       ├── providers/     AuthProvider, LiveProvider, SmoothScrollProvider
│       ├── store/         Zustand slices (auth, live, prediction)
│       ├── hooks/         useApi, useMatchLive, useParallax, useMouseFollow, etc.
│       ├── lib/           api, socket, toast, format, types
│       └── styles/        Tailwind + global CSS (design tokens)
├── backend/               Node + Express + Mongoose API (TypeScript)
│   └── src/
│       ├── models/        12 Mongoose models
│       ├── controllers/   one per resource
│       ├── routes/        REST routes, mounted under /api
│       ├── services/      business logic (scoring, simulator, live engine, sync, AI, etc.)
│       ├── middleware/    auth, validate, cache, error, rateLimiters, asyncHandler
│       ├── validators/    Zod schemas (auth, predictions, admin, queries)
│       ├── sockets/       Socket.IO setup
│       ├── scripts/       seed, importWorldCup, enrichPhotos, matchResults
│       ├── config/        db, env
│       └── utils/         jwt, password, cache, paginate
├── docs/                  SCROLL_STRATEGY.md, DEPLOYMENT.md
├── ARCHITECTURE.md        full system design
├── ROADMAP.md             10-phase delivery plan
├── README.md              quick start
├── render.yaml            Render deploy config
└── PROJECT_INFO.md        ← this file
```

---

## 4. Backend — data models (12)

All in `backend/src/models/`, with indexes and validation:

1. **User** — auth, role (user/admin), profile, OAuth identity, points.
2. **Team** — 48 nations: name, code, flag, confederation, FIFA ranking, group, form, `apiId`.
3. **Player** — squad members: name, team, position, photo, goals/stats, `apiId`.
4. **Match** — fixtures: teams, stage, group, kickoff, status, score, live state, `apiId`.
5. **Group** — the 12 groups (A–L) and their teams.
6. **Standing / Statistic** — computed group standings and tournament stats.
7. **Prediction** — a user's prediction for a match/group/winner, with scoring fields.
8. **Bracket** — a user's full knockout-bracket prediction.
9. **Leaderboard** — ranked predictor standings.
10. **Comment** — user comments (moderated in admin).
11. **Notification** — user notifications.
12. **Achievement** — badges/achievements.

(`models/index.ts` re-exports all of them.)

---

## 5. Backend — API surface

All routes mounted under `/api` (see `routes/index.ts`), behind a global rate limiter:

| Route | Purpose |
|-------|---------|
| `/api/auth` | register, login, refresh, logout, me, Google OAuth |
| `/api/teams` | list/detail teams |
| `/api/players` | list/detail players |
| `/api/matches` | fixtures, match detail, live |
| `/api/groups` | groups |
| `/api/standings` | computed group standings |
| `/api/leaderboard` | predictor rankings |
| `/api/stats` | tournament statistics |
| `/api/predictions` | prediction CRUD + settlement |
| `/api/brackets` | knockout-bracket predictions |
| `/api/ai` | AI probability model |
| `/api/simulate` | Monte Carlo tournament simulator |
| `/api/admin` | protected admin CRUD + analytics + moderation |

**Key services** (`backend/src/services/`): `scoringService` (award points on finish),
`standingsService` (recompute group tables), `simulatorService` (Monte Carlo),
`aiService` + `strength` (probability model), `liveEngine` (auto-advancing live matches),
`syncService` + `footballData` + `wcMapping` + `fifaRankings` (real-data import & live sync).

---

## 6. Frontend — pages & features

- **Home** — cinematic landing: 3D hero (trophy + particles), scroll-driven sections
  (stats band, teams showcase, top scorers), parallax, reveals.
- **Teams / Players** — browse all 48 nations and squads, with flags, photos, form pips.
- **Matches** — fixtures list with live-ticking scores; **MatchDetail** has live clock,
  event timeline, and your-prediction-vs-live.
- **Groups** — the 12 groups with live standings.
- **Bracket** — interactive knockout-bracket prediction.
- **Predictions** — tabs for match scores, group order, bracket, and champion pick;
  optimistic/draft UI.
- **AiLab** — AI probability lab with visualizations.
- **Simulator** — run Monte Carlo simulations, view probability distributions.
- **Leaderboard** — global predictor rankings.
- **Admin** — protected dashboard: teams/players/matches CRUD, analytics, moderation.
- **Login** — email/password + Google OAuth.
- **NotFound** — 404.

UI kit (`components/ui/`): Button, GlassCard, AnimatedNumber, ProgressRing, ProbabilityBar,
Badge, Flag, FormPips, PlayerAvatar, Pagination, FilterTabs, Skeleton, EmptyState, Toaster, etc.

State: Zustand store with `auth`, `live`, and `prediction` slices. Realtime via a lazy-loaded
`LiveProvider` + Socket.IO client. Smooth scroll via `SmoothScrollProvider` (Lenis ↔ GSAP).

---

## 7. Build history — the 10 phases (all ✅ complete)

| Phase | Title | What shipped |
|------:|-------|--------------|
| **1** | Architecture & scaffold | Docs (ARCHITECTURE/ROADMAP/scroll/deploy), runnable FE/BE skeleton, design tokens, tooling, git |
| **2** | DB schemas & backend APIs | All 12 Mongoose models, REST controllers/routes, Zod validation, pagination, caching, rate limiting, seed (48 teams / 12 groups) |
| **3** | Auth & authorization | JWT access/refresh with rotation, bcrypt, Google OAuth, `requireAuth`/`requireAdmin`, FE auth flow + Axios refresh-on-401 |
| **4** | Frontend pages | Every page wired to the API, responsive layouts, full UI kit, loading/skeleton/error states |
| **5** | Scroll animations | Lenis + GSAP ScrollTrigger + Framer Motion + R3F 3D hero, parallax/reveals/sticky, `prefers-reduced-motion` fallbacks |
| **6** | Prediction engine | Match/group/bracket/winner predictions + scoring/settlement + AI Prediction Lab + Monte Carlo simulator |
| **7** | Admin dashboard | Protected CRUD for teams/players/matches, analytics dashboard, comment moderation |
| **8** | Production hardening | Route code-splitting, lazy 3D, image optimization, caching headers, rate-limit tuning, Lighthouse 90+, Vercel/Render/Atlas configs + CI |
| **9** | Live match updates | In-memory live engine auto-advancing matches minute-by-minute, Socket.IO realtime (clock/score/timeline), goal & full-time toasts, resumes on boot |
| **10** | Real data (football-data.org) | Typed football-data.org v4 client, pure mapping layer, curated FIFA rankings, idempotent import (teams/fixtures/standings/form/scorers) + real live sync that replaces the simulator |

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

**Useful backend scripts:**

- `npm run seed` — seed teams, groups, base data.
- `npm run import:wc` — import real World Cup data (needs `FOOTBALL_DATA_TOKEN`).
- `npm run import:wc:players` — also import real top scorers as players.
- `npm run enrich:photos` — enrich player photos.
- `npm run typecheck` / `npm run lint` — quality gates (both FE and BE).

**Live demo mode:** set `LIVE_AUTOKICKOFF=on` with a low `LIVE_TICK_MS` for a hands-off,
auto-advancing live tournament.

**Real-data mode:** set `FOOTBALL_DATA_TOKEN` (+ `FOOTBALL_DATA_*` config) and run
`npm run import:wc`. Real live sync then replaces the simulated engine. On the free tier,
live scores are delayed (not tick-by-tick) and the seed never fabricates results.

---

## 9. Reference docs

- **[README.md](./README.md)** — quick start.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — full system, DB, API, FE, state, auth & scroll design.
- **[ROADMAP.md](./ROADMAP.md)** — the 10-phase plan with per-phase detail.
- **[docs/SCROLL_STRATEGY.md](./docs/SCROLL_STRATEGY.md)** — the scroll-animation system.
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — deploy to Vercel + Render + Atlas.

---

## 10. Current working state (git)

Branch `main`, 10 phases committed. Ongoing local work since the last snapshot: a new
`matchEvents` service (synthesizes goal/card timelines from scorelines + real squads), the
`matchResults.ts` (actual WC 2026 results) and `evaluatePredictions.ts` (1X2 model diagnostic)
scripts, and a modularized 3D hero under `frontend/src/components/three/hero/`. Everything
builds and runs. See **[PROJECT_DETAILS.md](./PROJECT_DETAILS.md)** for the current details.
