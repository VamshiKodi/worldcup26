/**
 * Backfill player headshots from Wikipedia into `photoUrl`. Idempotent and re-runnable; skips
 * players that already have a photo unless --force is passed. The shared logic lives in
 * services/photoService.ts (also run automatically on server boot).
 *
 *   npm run enrich:photos            # fill missing photos
 *   npm run enrich:photos -- --force # re-resolve everyone
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { enrichMissingPhotos } from '../services/photoService.js';

async function run() {
  await connectDB();
  const force = process.argv.includes('--force');
  console.log(`🖼️  Enriching player photos${force ? ' (force)' : ''}…`);

  const { scanned, filled } = await enrichMissingPhotos({
    force,
    onMissing: (name) => console.warn(`  · no photo: ${name}`),
  });

  console.log(`✅ Filled ${filled}/${scanned} photos (rest fall back to generated avatars).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
