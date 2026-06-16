/**
 * Seed script — Phase 1 stub.
 * Phase 2 populates: 48 teams, 12 groups, host countries (USA/Canada/Mexico),
 * sample fixtures, players, and demo users.
 *
 * Run: npm run seed
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { TeamModel } from '../models/index.js';

const SAMPLE_TEAMS = [
  { name: 'United States', code: 'USA', confederation: 'CONCACAF', isHost: true, fifaRanking: 11 },
  { name: 'Canada', code: 'CAN', confederation: 'CONCACAF', isHost: true, fifaRanking: 48 },
  { name: 'Mexico', code: 'MEX', confederation: 'CONCACAF', isHost: true, fifaRanking: 15 },
  { name: 'Argentina', code: 'ARG', confederation: 'CONMEBOL', fifaRanking: 1 },
  { name: 'France', code: 'FRA', confederation: 'UEFA', fifaRanking: 2 },
  { name: 'Brazil', code: 'BRA', confederation: 'CONMEBOL', fifaRanking: 5 },
];

async function run() {
  await connectDB();
  await TeamModel.deleteMany({});
  await TeamModel.insertMany(SAMPLE_TEAMS);
  console.log(`✅ Seeded ${SAMPLE_TEAMS.length} sample teams (Phase 1 stub)`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
