# Roadmap — WorldCup26

Phased delivery. Each phase ends in something runnable and reviewable. Phases map 1:1 to the
commands you can give me next.

| Phase | Title | Outcome | Status |
|------:|-------|---------|--------|
| 1 | **Architecture & scaffold** | Docs + runnable FE/BE skeleton, design tokens, git | ✅ Done |
| 2 | **DB schemas & backend APIs** | All 12 Mongoose models, REST controllers/routes, validation, pagination, seed data | ✅ Done |
| 3 | **Auth & authorization** | JWT access/refresh, Google OAuth, guards, FE auth flow | ✅ Done |
| 4 | **Frontend pages** | All pages + sections wired to API, responsive layouts, UI kit | ⬜ Next |
| 5 | **Scroll animations** | Lenis + GSAP ScrollTrigger + Framer + R3F hero, reduced-motion | ⬜ |
| 6 | **Prediction engine** | Match/group/bracket/winner prediction + scoring + AI lab + simulator | ⬜ |
| 7 | **Admin dashboard** | CRUD for teams/players/matches, analytics, moderation | ⬜ |
| 8 | **Production hardening** | Code splitting, caching, Lighthouse 90+, deploy configs | ⬜ |

---

## Phase 1 — Architecture & scaffold ✅
- `README.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `docs/SCROLL_STRATEGY.md`, `docs/DEPLOYMENT.md`
- `backend/` skeleton: Express app, config, model/controller/route/middleware/service/socket stubs, `.env.example`
- `frontend/` skeleton: Vite + React 18 + TS + Tailwind (design tokens), providers, store, hooks, UI stubs
- Root tooling: `.gitignore`, `.editorconfig`, prettier; `git init`

## Phase 2 — DB schemas & backend APIs
- Implement all 12 Mongoose models with indexes & validation
- Controllers + routes for teams, players, matches, groups, standings, leaderboard, stats
- Zod validation middleware, central error handler, pagination util, rate limiter, caching layer
- Seed script (2026 format: 48 teams, 12 groups, host data) + sample fixtures

## Phase 3 — Auth & authorization
- `authController` (register/login/refresh/logout/me), bcrypt, JWT util, refresh rotation
- Google OAuth verification endpoint
- `requireAuth` / `requireAdmin` middleware
- Frontend: `authSlice`, Axios interceptors (refresh-on-401), login/register UI, Google button

## Phase 4 — Frontend pages
- Build every page (Home, Teams, Players, Matches, Bracket, Leaderboard, Predictions, Admin, Login)
- Responsive layouts (mobile→desktop), UI kit (Button, Glass card, AnimatedNumber, ProgressRing)
- Wire to API via hooks; loading/skeleton/error states

## Phase 5 — Scroll animations
- `SmoothScrollProvider` (Lenis) synced to GSAP ScrollTrigger
- Section animations: parallax, text reveals, masks, sticky, horizontal scroll, scroll timelines
- R3F hero (3D trophy, particles), mouse-follow, page transitions
- `prefers-reduced-motion` fallbacks throughout

## Phase 6 — Prediction engine
- Prediction CRUD + draft/optimistic UI; group & bracket prediction flows
- Scoring/settlement service (award points on match finish)
- AI Prediction Lab (probability model from ranking/form/xG/H2H) + visualizations
- Tournament simulator (Monte Carlo 100/1000 runs) + probability distribution charts

## Phase 7 — Admin dashboard
- Protected admin routes; CRUD UIs for teams/players/matches/tournament data
- Analytics dashboard (prediction stats, user growth), content moderation (comments)

## Phase 8 — Production hardening
- Route-level code splitting, lazy 3D, image optimization, list virtualization
- Caching headers, rate-limit tuning, error monitoring hooks
- Lighthouse pass (90+), Vercel/Render/Atlas deploy configs + CI notes

---

### How to drive the build
After this phase, just say e.g. **"Do Phase 2"** and I'll implement it end-to-end, or point me
at a specific section/feature. Each phase is self-contained and leaves the repo runnable.
