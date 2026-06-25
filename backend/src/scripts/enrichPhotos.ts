/**
 * Backfill player headshots from Wikipedia. football-data.org gives real players + stats but no
 * photos, so we resolve each player's Wikipedia thumbnail by name and store it on `photoUrl`.
 * Idempotent and re-runnable; skips players that already have a photo unless --force is passed.
 *
 *   npm run enrich:photos            # fill missing photos
 *   npm run enrich:photos -- --force # re-resolve everyone
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { PlayerModel } from '../models/index.js';

const UA = 'worldcup26-app/1.0 (educational project; player headshot lookup)';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Resolve a Wikipedia REST summary thumbnail for a title; '' when none/!ok. Retries on 429. */
async function thumbFor(title: string): Promise<string> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, accept: 'application/json' } });
      if (r.status === 429) { await sleep(800 * (attempt + 1)); continue; }
      if (!r.ok) return '';
      const j = (await r.json()) as { thumbnail?: { source?: string }; type?: string };
      if (j.type === 'disambiguation') return '';
      return j.thumbnail?.source ?? '';
    } catch {
      await sleep(400);
    }
  }
  return '';
}

/** Try the plain name, then a couple of footballer-disambiguated titles. */
async function photoForName(name: string): Promise<string> {
  const candidates = [name, `${name} (footballer)`, `${name} (soccer)`];
  for (const c of candidates) {
    const t = await thumbFor(c);
    if (t) return t;
    await sleep(120);
  }
  return '';
}

async function run() {
  await connectDB();
  const force = process.argv.includes('--force');
  const filter = force ? {} : { $or: [{ photoUrl: '' }, { photoUrl: { $exists: false } }] };
  const players = await PlayerModel.find(filter).select('_id name photoUrl').lean();
  console.log(`🖼️  Enriching ${players.length} player photo(s)${force ? ' (force)' : ''}…`);

  let filled = 0;
  for (const p of players) {
    const url = await photoForName(p.name);
    if (url) {
      await PlayerModel.updateOne({ _id: p._id }, { photoUrl: url });
      filled++;
    } else {
      console.warn(`  · no photo: ${p.name}`);
    }
    await sleep(120); // be gentle on the API
  }

  console.log(`✅ Filled ${filled}/${players.length} photos (rest fall back to initials).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
