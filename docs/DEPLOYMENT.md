# Deployment Guide

Three independent pieces: **Frontend → Vercel**, **Backend → Render/Railway**, **DB → MongoDB Atlas**.

## 1. MongoDB Atlas
1. Create a free/shared cluster (M0 for dev; M10+ for tournament load).
2. Add a database user + network access (`0.0.0.0/0` for dev; restrict to Render egress IPs in prod).
3. Copy the connection string → backend `MONGODB_URI`.
4. Run the seed: `cd backend && npm run seed` (Phase 2).

## 2. Backend → Render (or Railway)
- **One-click:** the repo ships a `render.yaml` blueprint (root) — point Render at the repo and it
  provisions the `worldcup26-api` web service (rootDir `backend`, health check `/api/v1/health`,
  auto-generated JWT secrets). Fill the `sync: false` vars (`MONGODB_URI`, `CLIENT_URL`, Google keys).
- **Manual:** Build `npm ci && npm run build` · Start `npm run start`.
- **Env vars:** `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`, `PORT` (Render injects).
- CORS `origin` must equal the Vercel domain; cookies need `sameSite=none; secure` in prod.
- `trust proxy` is enabled in production so client IPs (rate limiting) and `secure` cookies work
  behind Render's proxy. SIGTERM/SIGINT trigger a graceful shutdown (drain HTTP, then close Mongo).

## 3. Frontend → Vercel
- **Framework preset:** Vite. **Build:** `npm run build`. **Output:** `dist`.
- **Env vars:** `VITE_API_URL` (Render URL + `/api/v1`), `VITE_SOCKET_URL`, `VITE_GOOGLE_CLIENT_ID`.
- SPA rewrite: `vercel.json` routes all paths to `index.html` (see `frontend/vercel.json`).

## 4. Performance (Phase 8)
Built-in hardening:
- **Code splitting:** every route is `React.lazy` + Suspense; Three.js/R3F load **only** with the
  hero (`HeroCanvas` is lazy) — `three` is its own ~815 kB vendor chunk that never blocks first paint.
- **Vendor chunks:** `react`, `motion` (framer/gsap/lenis) and `three` are split via Vite
  `manualChunks`; sourcemaps off in prod.
- **Caching:** read APIs send `ETag` + `Cache-Control` and serve `304`s (in-memory TTL cache);
  admin writes bust the cache so edits show immediately.
- **Assets:** flags lazy-load with a code fallback; `preconnect` to flagcdn + Google Fonts.
- **Reduced motion:** Lenis/GSAP/R3F disabled under `prefers-reduced-motion`.

> Lighthouse must be measured against a deployed build (`npm run build && npm run preview`) with the
> API reachable — it can't be run in CI here. Target ≥ 90 on Home; the largest lever is the lazy 3D.

## 5. Production checklist
- [ ] Refresh-token cookie: `httpOnly`, `secure`, `sameSite=none`, correct domain
- [ ] CORS locked to the Vercel origin (no `*` with credentials)
- [ ] `trust proxy` on (set by `NODE_ENV=production`)
- [ ] Rate limiting enabled on `/auth` and `/simulate`
- [ ] Atlas IP allowlist restricted; strong DB user password
- [ ] Secrets only in platform env (never committed)
- [ ] Lighthouse ≥ 90 on Home (measure on the deployed build)
- [ ] Error monitoring wired — replace `reportError()` in `middleware/error.ts` with Sentry/Datadog

## 6. CI
`.github/workflows/ci.yml` runs typecheck + build for both `frontend/` and `backend/` on push/PR.
Vercel/Render auto-deploy on merge to `main`.
