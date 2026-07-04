# 🎬 WorldCup26 — automated reel recorder

Drives the live site through the 9-shot **"AI predicts the 2026 World Cup winner"**
walkthrough and outputs a **1080×1920** vertical video ready for Instagram Reels.

Shot list + captions + hashtags live in
[`../docs/marketing/instagram-reel-ai-winner.md`](../docs/marketing/instagram-reel-ai-winner.md).
The recorder's timings mirror that storyboard, so the captions line up with the footage.

## One-time setup
```bash
cd reels
npm install
npx playwright install chromium
```

## Record

**Against a deployed site** (real data, nothing to run locally — easiest):
```bash
REEL_BASE_URL=https://your-site.netlify.app npm run record
```

**Against local dev** (needs the backend so the sim/lab show real teams):
```bash
# terminal 1
cd backend && npm run dev
# terminal 2
cd frontend && npm run dev
# terminal 3 — warm the data once, then record
cd reels && npm run record
```
> Tip: open `/simulator` and hit **Run** once before recording so results are warm.

Output lands in `reels/output/`:
- `reel-<timestamp>.mp4` — upload this (created when `ffmpeg` is on PATH)
- `reel-<timestamp>.webm` — always produced; drop into CapCut / IG if there's no mp4

The console prints a **timeline** (e.g. `12.5s · Simulating…`) so you know where each
shot lands when you trim and drop the audio.

## Env vars
| var | default | notes |
|-----|---------|-------|
| `REEL_BASE_URL` | `http://localhost:5173` | target origin |
| `REEL_OUT` | `./output` | output directory |
| `REEL_HEADLESS` | *(unset = headed)* | set `1` for no window; the headed default renders the 3D trophy on your real GPU (crisper) |

## Timings: use a production build, not dev
Against `vite dev` the shot timings inflate — Vite compiles each route chunk (especially
the heavy three.js hero) on first visit, and a missing backend makes the sim wait time out.
For storyboard-accurate ~27s footage, record against the **deployed site** or a local
production preview:
```bash
cd frontend && npm run build && npm run preview   # serves the built app on :4173
REEL_BASE_URL=http://localhost:4173 npm run record
```
The printed **timeline always reflects the actual file**, so you can cut accurately no
matter what — it just reads cleaner off a production build.

## Notes
- Records at a **540×960 mobile viewport** on purpose — that's the site's low-power path,
  so the trophy has **no MSAA/AO flicker** and no drag-to-orbit. Upscaled 2× to 1080×1920.
- This is raw footage. Finish it in **CapCut / Instagram**: hard-cut on the beat, add the
  on-screen captions from the storyboard, and sync trending in-app audio (drop on the
  winner reveal ~shot 7).
- No audio is recorded (`-an`); reels use their own track.
