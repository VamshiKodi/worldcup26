// Automated Instagram-reel recorder for WorldCup26.
//
// Drives the running site through a 9-shot "AI predicts the 2026 World Cup winner"
// walkthrough and outputs a 1080×1920 vertical video (webm, plus an Instagram-ready
// mp4 if ffmpeg is on PATH).
//
// Usage:
//   # local (frontend on :5173 + backend on :4000 with seeded data):
//   npm run record
//   # against a deployed site (real data, no local backend needed):
//   REEL_BASE_URL=https://your-site.netlify.app npm run record
//
// Env:
//   REEL_BASE_URL   target origin (default http://localhost:5173)
//   REEL_OUT        output dir (default ./output)
//   REEL_HEADLESS=1 run without a visible window (trophy uses software WebGL — the
//                   headed default gives a crisper 3D render on a real GPU)
//
// The shot timings mirror docs/marketing/instagram-reel-ai-winner.md so the captions
// in that file line up with the footage this produces.

import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.REEL_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const OUT_DIR = process.env.REEL_OUT || path.join(__dirname, 'output');
const HEADLESS = process.env.REEL_HEADLESS === '1';

// Mobile-width viewport (<768px) selects the site's low-power path: no MSAA/AO flicker
// on the trophy and no drag-to-orbit controls, so the auto-rotation reads clean.
// Recorded at 2× → a crisp 1080×1920 vertical frame.
const VIEWPORT = { width: 540, height: 960 };
const VIDEO = { width: 1080, height: 1920 };

let t0 = 0;
const timeline = [];
function mark(name) {
  const t = ((Date.now() - t0) / 1000).toFixed(1);
  timeline.push({ t, name });
  console.log(`  ⏱  ${String(t).padStart(5)}s  ${name}`);
}

const hold = (page, ms) => page.waitForTimeout(ms);

// Cinematic wheel scroll — real wheel events so the site's Lenis smooth-scroll drives it.
async function smoothWheel(page, totalY, ms = 1500) {
  const steps = Math.max(8, Math.round(ms / 60));
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, totalY / steps);
    await page.waitForTimeout(ms / steps);
  }
}

// Use domcontentloaded + a fixed settle rather than networkidle: the app polls its API
// (AiLab refetches, sockets stay open), so "network idle" never fires and every nav would
// stall to its timeout — inflating the shot timings. A short settle keeps them deterministic.
async function goto(page, route, settle = 900) {
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(settle);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`\n🎬  Recording reel`);
  console.log(`    source : ${BASE}`);
  console.log(`    frame  : ${VIEWPORT.width}×${VIEWPORT.height} → ${VIDEO.width}×${VIDEO.height}`);
  console.log(`    mode   : ${HEADLESS ? 'headless (software WebGL)' : 'headed (GPU WebGL)'}\n`);

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--hide-scrollbars'],
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    recordVideo: { dir: OUT_DIR, size: VIDEO },
  });
  const page = await context.newPage();

  // Reachability check before we start the take.
  const ok = await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 20000 })
    .then((r) => !!r && r.ok())
    .catch(() => false);
  if (!ok) {
    console.error(`\n❌  Could not load ${BASE}. Start the site first, e.g.:`);
    console.error(`      (backend)  cd backend && npm run dev`);
    console.error(`      (frontend) cd frontend && npm run dev`);
    console.error(`    …or point at a deployed URL:  REEL_BASE_URL=https://your-site npm run record\n`);
    await context.close();
    await browser.close();
    process.exitCode = 1;
    return;
  }
  await page.addStyleTag({ content: '::-webkit-scrollbar{display:none!important}' }).catch(() => {});

  t0 = Date.now();

  // ── Shot 1 · Home hero — the rotating 3D trophy ──────────────────────────
  mark('1 · Home hero (trophy)');
  await hold(page, 4000); // let the trophy mount, render and rotate

  // ── Shot 2 · AI Lab — choose a match, prediction resolves ────────────────
  await goto(page, '/lab');
  mark('2 · AI Lab');
  await hold(page, 800);
  try {
    await page.waitForSelector('select option', { timeout: 5000 });
    await page.selectOption('select', { index: 0 }); // triggers /ai/match/:id
  } catch { /* empty state (backend down) — footage still usable */ }
  await hold(page, 2600);

  // ── Shot 3 · Lab close-up — scroll to the odds ───────────────────────────
  await smoothWheel(page, 260, 1400);
  mark('3 · Lab odds close-up');
  await hold(page, 2200);

  // ── Shot 4 · Simulator — set 1,000 runs and Run ──────────────────────────
  await goto(page, '/simulator');
  mark('4 · Simulator setup');
  await hold(page, 900);
  await page.getByRole('button', { name: '1,000' }).click().catch(() => {});
  await page.getByRole('button', { name: /run simulation/i }).click().catch(() => {});

  // ── Shot 5 · Simulating… ─────────────────────────────────────────────────
  mark('5 · Simulating…');
  await page.getByText('Championship probability', { exact: false })
    .waitFor({ timeout: 20000 }).catch(() => {});
  await hold(page, 1400);

  // ── Shot 6 · Results in ──────────────────────────────────────────────────
  mark('6 · Results in');
  await page.getByText('Championship probability').scrollIntoViewIfNeeded().catch(() => {});
  await hold(page, 2400);

  // ── Shot 7 · Winner reveal — punch-in on the AI's #1 pick ─────────────────
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2')].find((el) =>
      /championship probability/i.test(el.textContent || ''));
    const row = h?.parentElement?.querySelector('.space-y-3 > div');
    if (row instanceof HTMLElement) {
      row.style.transition = 'transform .8s ease';
      row.style.transformOrigin = 'left center';
      row.style.transform = 'scale(1.08)';
    }
  }).catch(() => {});
  mark('7 · Winner reveal');
  await hold(page, 3500);

  // ── Shot 8 · Bracket — road to the final ─────────────────────────────────
  await goto(page, '/bracket');
  mark('8 · Bracket');
  await hold(page, 1200);
  await smoothWheel(page, 700, 2600);
  await hold(page, 800);

  // ── Shot 9 · Back to hero + CTA ──────────────────────────────────────────
  await goto(page, '/');
  mark('9 · Home / CTA');
  await hold(page, 3200);

  const video = page.video();
  await context.close(); // finalizes the .webm
  await browser.close();

  // Name + optionally transcode the output.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const webm = path.join(OUT_DIR, `reel-${stamp}.webm`);
  if (video) fs.renameSync(await video.path(), webm);

  console.log('\n📼  Timeline (use these to cut on the beat):');
  for (const s of timeline) console.log(`      ${String(s.t).padStart(5)}s  ${s.name}`);

  const mp4 = path.join(OUT_DIR, `reel-${stamp}.mp4`);
  const ff = spawnSync('ffmpeg', [
    '-y', '-i', webm,
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-r', '30', '-movflags', '+faststart',
    '-an', mp4,
  ], { stdio: 'inherit' });

  console.log('\n✅  Done.');
  console.log(`    webm : ${webm}`);
  if (ff.status === 0) {
    console.log(`    mp4  : ${mp4}   ← upload this to Instagram`);
  } else {
    console.log('    mp4  : skipped (ffmpeg not found on PATH).');
    console.log('           Install ffmpeg to auto-convert, or drop the .webm into CapCut / IG.');
  }
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
