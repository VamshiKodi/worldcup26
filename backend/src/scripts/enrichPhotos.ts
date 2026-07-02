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

interface Summary {
  type?: string;
  description?: string;
  extract?: string;
  thumbnail?: { source?: string };
}

/** Fetch a Wikipedia REST summary for a title; null when missing/!ok. Retries on 429. */
async function summaryFor(title: string): Promise<Summary | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, accept: 'application/json' } });
      if (r.status === 429) { await sleep(800 * (attempt + 1)); continue; }
      if (!r.ok) return null;
      return (await r.json()) as Summary;
    } catch {
      await sleep(400);
    }
  }
  return null;
}

const thumbOf = (s: Summary | null): string =>
  s && s.type !== 'disambiguation' ? (s.thumbnail?.source ?? '') : '';

/** Guard against grabbing the wrong person: the article must read like a footballer. */
const looksLikeFootballer = (s: Summary): boolean =>
  /footballer|soccer|football/i.test(`${s.description ?? ''} ${s.extract ?? ''}`);

/** Resolve the canonical article title via the search API (handles name-order,
 * disambiguation and spelling variants). Biased toward footballers. Retries on 429. */
async function searchTitles(name: string): Promise<string[]> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=5` +
    `&srsearch=${encodeURIComponent(`${name} footballer`)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, accept: 'application/json' } });
      if (r.status === 429) { await sleep(800 * (attempt + 1)); continue; }
      if (!r.ok) return [];
      const j = (await r.json()) as { query?: { search?: Array<{ title?: string }> } };
      return (j.query?.search ?? []).map((s) => s.title).filter((t): t is string => !!t);
    } catch {
      await sleep(400);
    }
  }
  return [];
}

/** Try exact/disambiguated titles first (high confidence), then fall back to a
 * search that resolves name-order/disambiguation/spelling variants. */
async function photoForName(name: string): Promise<string> {
  for (const c of [name, `${name} (footballer)`, `${name} (soccer)`]) {
    const t = thumbOf(await summaryFor(c));
    if (t) return t;
    await sleep(120);
  }
  for (const title of await searchTitles(name)) {
    const s = await summaryFor(title);
    await sleep(120);
    if (!s || s.type === 'disambiguation') continue;
    const t = thumbOf(s);
    if (t && looksLikeFootballer(s)) return t;
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
