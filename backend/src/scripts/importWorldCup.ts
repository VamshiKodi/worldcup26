/**
 * Import real FIFA World Cup 2026 data from football-data.org into MongoDB.
 *
 *   npm run import:wc              # teams + groups + fixtures + standings + form
 *   npm run import:wc -- --players # also import top scorers as players (extra request)
 *
 * Idempotent — upserts by external id, so safe to re-run as results come in.
 * Requires FOOTBALL_DATA_TOKEN in backend/.env.
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { importStaticData, importScorers } from '../services/syncService.js';

async function run() {
  if (!env.footballData.token) {
    console.error(
      '❌ FOOTBALL_DATA_TOKEN is not set in backend/.env — get a free token at ' +
        'https://www.football-data.org/client/register',
    );
    process.exit(1);
  }

  await connectDB();
  console.log(`🌍 Importing World Cup (competition ${env.footballData.competition}) from football-data.org…`);

  const { teams, groups, matches } = await importStaticData();
  console.log(`✅ ${teams} teams · ${groups} groups · ${matches} fixtures`);

  if (process.argv.includes('--players')) {
    console.log('👥 Importing top scorers as players…');
    const { players } = await importScorers();
    console.log(`✅ ${players} players (real scorers)`);
  } else {
    console.log('ℹ️  Skipped players. Re-run with `-- --players` to import top scorers.');
  }

  if (teams === 0) {
    console.warn(
      '⚠️  No teams returned. football-data.org may not have published this competition yet, ' +
        'or your plan lacks access. Check FOOTBALL_DATA_COMPETITION.',
    );
  }

  console.log('🏁 Import complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
