# Deployment Guide

Three independent pieces: **Frontend → Vercel**, **Backend → Render/Railway**, **DB → MongoDB Atlas**.

## 1. MongoDB Atlas
1. Create a free/shared cluster (M0 for dev; M10+ for tournament load).
2. Add a database user + network access (`0.0.0.0/0` for dev; restrict to Render egress IPs in prod).
3. Copy the connection string → backend `MONGODB_URI`.
4. Run the seed: `cd backend && npm run seed` (Phase 2).

## 2. Backend → Render (or Railway)
- **Build:** `npm install && npm run build`
- **Start:** `npm run start`
- **Env vars:** `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`, `PORT` (Render injects).
- Enable health check at `/api/v1/health`.
- CORS `origin` must equal the Vercel domain; cookies need `sameSite=none; secure` in prod.

## 3. Frontend → Vercel
- **Framework preset:** Vite. **Build:** `npm run build`. **Output:** `dist`.
- **Env vars:** `VITE_API_URL` (Render URL + `/api/v1`), `VITE_SOCKET_URL`, `VITE_GOOGLE_CLIENT_ID`.
- SPA rewrite: `vercel.json` routes all paths to `index.html` (see `frontend/vercel.json`).

## 4. Production checklist
- [ ] Refresh-token cookie: `httpOnly`, `secure`, `sameSite=none`, correct domain
- [ ] CORS locked to the Vercel origin (no `*` with credentials)
- [ ] Rate limiting enabled on `/auth` and `/simulate`
- [ ] Atlas IP allowlist restricted; strong DB user password
- [ ] Secrets only in platform env (never committed)
- [ ] Lighthouse ≥ 90 on Home (Phase 8)
- [ ] Error monitoring hook wired (Sentry or platform logs)

## 5. CI (suggested)
GitHub Actions: lint + typecheck + build on PR for both `frontend/` and `backend/`.
Vercel/Render auto-deploy on merge to `main`.
