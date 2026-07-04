# Go live: Netlify (frontend) + Render (backend) + MongoDB Atlas (database)

> **Live site:** https://fifaworldcup26predictor.netlify.app/
> **Backend API:** https://worldcup26-api.onrender.com (health: `/api/v1/health`)

The app has two halves. The React/Vite **frontend** is static → **Netlify**. The Express +
Socket.IO + real-data-sync **backend** is a long-running server → **Render** (Netlify can't host
it). The database moves from local MongoDB → **MongoDB Atlas**. All three have free tiers.

Do the steps in order — the backend URL is needed by the frontend, so the backend goes first.

---

## 1. MongoDB Atlas (database)

1. Create a free account at https://www.mongodb.com/cloud/atlas and create a **free M0 cluster**.
2. **Database Access** → add a user (username + password). Save them.
3. **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`).
4. **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/worldcup26?retryWrites=true&w=majority`
   Replace `<user>`/`<password>` and add the db name `worldcup26` before the `?`.

## 2. Render (backend)

1. Create an account at https://render.com and connect your GitHub.
2. **New → Blueprint**, pick the `VamshiKodi/worldcup26` repo. Render reads `render.yaml`.
3. When prompted for the `sync: false` env vars, fill in:
   - `MONGODB_URI` → the Atlas string from step 1.
   - `FOOTBALL_DATA_TOKEN` → your football-data.org token.
   - `CLIENT_URL` → leave a placeholder for now (e.g. `https://example.netlify.app`); update it
     after step 3 once you know the Netlify URL. It must match the Netlify origin (CORS/cookies).
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` → only if using Google login (optional).
   - `JWT_*` secrets are auto-generated.
4. Deploy. When it's live, copy the service URL, e.g. `https://worldcup26-api.onrender.com`.
5. Sanity check: open `https://<your-render-url>/api/v1/health` — should return `ok`.

> Free plan sleeps after ~15 min idle and cold-starts (~30s) on the next request; the auto-update
> loops pause while asleep and resume on wake. Bump `plan: free` → `starter` in render.yaml for
> always-on.

## 3. Netlify (frontend)

1. Create an account at https://www.netlify.com and connect GitHub.
2. **Add new site → Import an existing project** → pick `VamshiKodi/worldcup26`.
   `netlify.toml` sets base=`frontend`, build=`npm run build`, publish=`frontend/dist` automatically.
3. Before/after first deploy, **Site settings → Environment variables** → add:
   - `VITE_API_URL` = `https://<your-render-url>/api/v1`
   - `VITE_SOCKET_URL` = `https://<your-render-url>`
   - `VITE_GOOGLE_CLIENT_ID` = (optional) your Google OAuth client id
4. Trigger a redeploy so the env vars are baked into the build. Copy your Netlify URL,
   e.g. `https://worldcup26.netlify.app`.

## 4. Connect the two

1. In **Render**, set `CLIENT_URL` to your real Netlify URL and redeploy (fixes CORS + cookies).
2. (If using Google OAuth) add the Netlify URL to the Google Cloud console authorized origins.
3. Open the Netlify URL — the site is live with real, auto-updating World Cup data.

## Seeding data in production

The backend **auto-imports real data on boot** (and refreshes on an interval) when
`FOOTBALL_DATA_TOKEN` is set — no manual seed needed. To force a one-off import you can run
`npm run import:wc:players` locally against the Atlas `MONGODB_URI`.

---

Auto-deploy is on: every `git push` to `main` redeploys both Netlify and Render.
