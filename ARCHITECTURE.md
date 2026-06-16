# Architecture — WorldCup26

This document is the single source of truth for the system design. Every major decision is
recorded with its rationale so future contributors understand the *why*, not just the *what*.

---

## 1. System overview

```
                        ┌──────────────────────────────────────────┐
                        │                Clients                     │
                        │   Desktop · Laptop · Tablet · Mobile        │
                        └───────────────────┬────────────────────────┘
                                            │ HTTPS / WSS
                        ┌───────────────────▼────────────────────────┐
                        │        Frontend (Vercel, static + edge)     │
                        │  React 18 · Vite · Zustand · Framer/GSAP    │
                        │  Lenis smooth scroll · R3F 3D trophy        │
                        └───────────────────┬────────────────────────┘
                                            │ REST (Axios) + Socket.IO
                        ┌───────────────────▼────────────────────────┐
                        │      Backend API (Render/Railway)           │
                        │  Express · JWT · Zod validation · caching   │
                        │  Socket.IO server · rate limiting           │
                        └──────┬───────────────────────┬──────────────┘
                               │                       │
                  ┌────────────▼─────────┐   ┌─────────▼───────────┐
                  │  MongoDB Atlas        │   │  In-memory cache /   │
                  │  (Mongoose ODM)       │   │  Redis (optional)    │
                  └───────────────────────┘   └──────────────────────┘
```

**Decision — Monorepo, two deployables.** Frontend and backend live in one repo for shared
types and atomic commits, but deploy independently (FE→Vercel, BE→Render). This avoids a
heavy monorepo tool while keeping the developer experience simple. A `shared/` types package
is referenced by both via relative path / published types.

**Decision — TypeScript everywhere.** Type safety across the API boundary catches the most
common class of bug in data-heavy apps (mismatched shapes between predictions, matches,
standings). Both sides export/consume shared DTO types.

---

## 2. Database design (MongoDB + Mongoose)

12 collections. IDs are Mongo `ObjectId` unless noted. Timestamps (`createdAt`/`updatedAt`)
on every collection via Mongoose `{ timestamps: true }`.

### 2.1 Collections & key fields

**users**
```
_id, name, email (unique, indexed), passwordHash (nullable for OAuth),
provider: 'local' | 'google', googleId, avatarUrl,
role: 'user' | 'admin', favorites: [teamId],
score: Number (cached leaderboard score), accuracy: Number,
badges: [achievementId], refreshTokenHash, createdAt, updatedAt
```

**teams**
```
_id, name, code (FIFA 3-letter, unique), confederation: 'UEFA'|'CONMEBOL'|'CONCACAF'|'CAF'|'AFC'|'OFC',
flagUrl, fifaRanking, groupId, stats: { played, won, draw, lost, gf, ga },
form: ['W','D','L',...], isHost: Boolean
```

**players**
```
_id, name, teamId (ref teams), position, number, photoUrl, age, club,
stats: { goals, assists, xg, cleanSheets, minutes, appearances }, isTopScorer
```

**groups**
```
_id, name ('A'..'L' for the 12-group / 48-team 2026 format),
teamIds: [teamId], standings: [{ teamId, points, gf, ga, gd, rank }]
```

**matches**
```
_id, stage: 'group'|'r32'|'r16'|'qf'|'sf'|'third'|'final',
groupId (nullable), homeTeamId, awayTeamId, venue, city, kickoff (Date),
status: 'scheduled'|'live'|'finished', score: { home, away },
events: [{ minute, type, teamId, playerId }], round, bracketSlot
```

**predictions** (one per user per match / per target)
```
_id, userId, type: 'match'|'group'|'bracket'|'winner',
matchId (nullable), pick: { outcome: 'H'|'D'|'A', homeScore, awayScore },
groupPrediction: [{ teamId, rank }], bracketId (nullable),
points: Number (awarded after settlement), settled: Boolean
```

**brackets** (a user's full knockout prediction)
```
_id, userId, rounds: { r32:[slot], r16:[...], qf:[...], sf:[...], final:[...] },
champion: teamId, runnerUp: teamId, points, locked: Boolean
```

**statistics** (denormalized analytics snapshots)
```
_id, scope: 'tournament'|'team'|'player', refId,
data: { ...flexible metrics }, computedAt
```

**leaderboards** (materialized ranking snapshots for fast reads)
```
_id, scope: 'global'|'friends'|'group', period, entries: [{ userId, rank, score, accuracy }], updatedAt
```

**achievements**
```
_id, key (unique), name, description, icon, criteria: { type, threshold }, tier: 'bronze'|'silver'|'gold'
```

**notifications**
```
_id, userId, type, title, body, read: Boolean, link, createdAt
```

**comments**
```
_id, userId, targetType: 'match'|'prediction'|'team', targetId, body,
parentId (nullable, for threads), likes: [userId], status: 'visible'|'flagged'|'removed'
```

### 2.2 Indexing strategy
- `users.email` unique; `users.googleId` sparse unique; `users.score` desc (leaderboard).
- `teams.code` unique; `teams.confederation`, `teams.groupId` (filters).
- `matches.kickoff` + `matches.stage` (match center queries); `matches.status` (live).
- `predictions` compound: `{ userId, matchId }` unique; `{ matchId, settled }`.
- `leaderboards.scope` + `period`.

**Decision — Denormalize for read-heavy paths.** Standings live both on `groups` and are
recomputed; `leaderboards` are materialized snapshots refreshed on settlement, not computed
per request. During the tournament, reads vastly outnumber writes — we optimize for reads.

---

## 3. API design (REST + WebSocket)

Base path: `/api/v1`. JSON only. All list endpoints support `?page=&limit=&sort=`.

### 3.1 Resource map
```
Auth        POST   /auth/register  /auth/login  /auth/google  /auth/refresh  /auth/logout
            GET    /auth/me
Teams       GET    /teams  /teams/:id            (filters: confederation, group, search)
Players     GET    /players  /players/:id        (filters: team, position, sort by stat)
Matches     GET    /matches  /matches/:id        (filters: stage, group, status, date)
Groups      GET    /groups  /groups/:id
Predictions GET    /predictions/me               POST /predictions   PUT /predictions/:id
Brackets    GET    /brackets/me                  POST/PUT /brackets
Standings   GET    /standings  /standings/:groupId
Leaderboard GET    /leaderboard                  (scope, period, pagination)
Statistics  GET    /stats/tournament  /stats/team/:id  /stats/player/:id
Simulator   POST   /simulate                     (body: runs:100|1000)
Admin       CRUD   /admin/teams /admin/players /admin/matches /admin/users  GET /admin/analytics
```

### 3.2 Cross-cutting concerns
- **Validation:** Zod schemas at the route boundary; reject early with 422 + field errors.
- **Errors:** central error middleware → `{ error: { code, message, details } }`, never leaks stack in prod.
- **Pagination:** cursor-or-offset; responses include `{ data, page, limit, total }`.
- **Rate limiting:** `express-rate-limit` (global + stricter on `/auth`, `/simulate`).
- **Caching:** ETag + `Cache-Control` on static reference data (teams, players, fixtures);
  in-memory LRU for hot reads, swappable for Redis. Settlement events bust caches.
- **Auth guard:** `requireAuth`, `requireAdmin` middleware reading the access token.

### 3.3 Realtime (Socket.IO)
Rooms: `match:{id}` (live score/events), `leaderboard:global`. Server emits `standings:update`,
`leaderboard:update`, `match:event`. Frontend subscribes only on relevant pages.

**Decision — REST + targeted sockets, not GraphQL.** The data is mostly cacheable reference
data plus a few realtime channels. REST + ETag caching + Socket.IO for the truly live bits is
simpler to operate at scale than a GraphQL gateway, and plays better with Vercel/Render.

---

## 4. Frontend architecture

```
src/
├── main.tsx                 App bootstrap (providers)
├── App.tsx                  Router + global layout + Lenis/Smooth provider
├── lib/                     axios client, socket client, gsap setup, query helpers
├── store/                   Zustand slices (auth, predictions, ui, simulator)
├── providers/               SmoothScrollProvider (Lenis), MotionConfig, AuthProvider
├── hooks/                   useScrollReveal, useParallax, useMediaQuery, useReducedMotion, usePredictions
├── components/
│   ├── ui/                  Button, Card, Glass, AnimatedNumber, ProgressRing, Skeleton
│   ├── layout/              Navbar, Footer, ScrollProgress, PageTransition
│   ├── three/               Trophy (R3F), Particles, WorldMap
│   └── sections/            Hero, Intro, Hosts, Teams, Groups, MatchCenter, Bracket,
│                            PredictionLab, Players, Simulator, Community
├── pages/                   Home, Teams, Players, Matches, Bracket, Leaderboard,
│                            Predictions, Admin, Login, NotFound
└── styles/                  index.css (Tailwind layers + design tokens)
```

**State (Zustand).** Slices: `authSlice` (user, tokens, login/logout), `predictionSlice`
(draft picks, optimistic updates), `uiSlice` (modals, theme, reduced-motion), `simulatorSlice`
(run config, results). Server data is fetched via Axios hooks with a thin cache; Zustand holds
*client* state and optimistic mutations. **Decision:** Zustand over Redux for minimal boilerplate
and excellent transient-update performance (important when scroll drives many updates).

**Component hierarchy (Home).**
```
<App>
 └ <SmoothScrollProvider>            // Lenis
    └ <ScrollProgress/>               // top progress bar
    └ <Navbar/>
    └ <main>
       ├ <Hero/>                      // R3F trophy + particles + headline reveal
       ├ <Intro/>                     // animated counters, sticky text reveals
       ├ <Hosts/>                     // parallax USA/Canada/Mexico
       ├ <Teams/>                     // 3D cards, filters, favorites
       ├ <Groups/>                    // animated standings + prediction inputs
       ├ <MatchCenter/>               // fixtures + prediction sliders
       ├ <Bracket/>                   // zoom/pan knockout
       ├ <PredictionLab/>             // charts + progress rings
       ├ <Players/>                   // scroll-animated showcase
       ├ <Simulator/>                 // run 100/1000 sims
       └ <Community/>                 // leaderboard
    └ <Footer/>
```

---

## 5. Authentication flow

```
Local:   register/login → bcrypt verify → issue accessToken (15m, JWT) + refreshToken (7d, httpOnly cookie)
Google:  client gets Google credential → POST /auth/google → verify with Google → upsert user → issue tokens
Refresh: access token expires → 401 → Axios interceptor calls /auth/refresh (cookie) → retries request
Guard:   requireAuth decodes access token; requireAdmin checks role==='admin'
Logout:  clears refresh cookie + invalidates stored refreshTokenHash
```

**Decision — short access token + httpOnly refresh cookie.** Keeps the access token out of
JS-readable storage where practical and limits blast radius if leaked. Refresh rotation
invalidates the previous token hash on each refresh.

---

## 6. Scroll animation strategy (summary)

Lenis drives a single smooth-scroll loop; GSAP ScrollTrigger is synced to Lenis's RAF so
ScrollTrigger and Lenis never fight. Framer Motion handles enter/exit + micro-interactions;
GSAP handles scroll-pinned timelines and horizontal sections; R3F handles the 3D hero.
Full detail in **[docs/SCROLL_STRATEGY.md](./docs/SCROLL_STRATEGY.md)**. Reduced-motion is a
first-class mode that swaps timelines for instant/opacity-only transitions.

---

## 7. Performance & accessibility (targets)

- **Performance:** route-level code splitting (`React.lazy`), lazy 3D (load R3F only on Home),
  image optimization (AVIF/WebP, responsive `srcset`), virtualized long lists (teams/players),
  HTTP caching of reference data, `content-visibility` for offscreen sections. Target Lighthouse 90+.
- **Accessibility:** semantic landmarks, keyboard-navigable bracket & sliders, ARIA labels on
  interactive prediction controls, WCAG AA contrast against `#050505`, `prefers-reduced-motion`
  honored globally via `useReducedMotion` + Framer `MotionConfig`.

---

## 8. Design system tokens

| Token        | Value                    |
|--------------|--------------------------|
| `bg`         | `#050505`                |
| `primary`    | `#00E5FF`                |
| `secondary`  | `#FFB800`                |
| `accent`     | `#00FF88`                |
| `text`       | `#FFFFFF`                |
| `card`       | `rgba(255,255,255,0.08)` |
| blur         | `30px`                   |

Implemented as Tailwind theme extensions + CSS custom properties (see `frontend/tailwind.config.js`
and `src/styles/index.css`). Glassmorphism via a reusable `.glass` utility (bg + backdrop-blur + border).
