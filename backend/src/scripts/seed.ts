/**
 * Seed script — 2026 format.
 * Populates: 48 teams, 12 groups (A–L), round-robin group fixtures (72 matches),
 * marquee players, and achievements.
 *
 * Run: npm run seed
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import {
  TeamModel,
  GroupModel,
  MatchModel,
  PlayerModel,
  AchievementModel,
  UserModel,
} from '../models/index.js';
import { hashPassword } from '../utils/password.js';
import { SEED_TEAMS, GROUP_NAMES, SEED_PLAYERS, SEED_ACHIEVEMENTS } from './seedData.js';
import { recomputeGroupStandings } from '../services/standingsService.js';

const FLAG = (code: string) => `https://flagcdn.com/w320/${code.toLowerCase().slice(0, 2)}.png`;

// Generate random form (last 5 matches: W/D/L)
function generateRandomForm(): string[] {
  const results = ['W', 'D', 'L'];
  const form: string[] = [];
  for (let i = 0; i < 5; i++) {
    form.push(results[Math.floor(Math.random() * results.length)]);
  }
  return form;
}

// Round-robin pairings for a group of 4 (indices into the group's team array).
const RR_PAIRS: Array<[number, number]> = [
  [0, 1], [2, 3], // matchday 1
  [0, 2], [1, 3], // matchday 2
  [0, 3], [1, 2], // matchday 3
];
const RR_ROUND = [1, 1, 2, 2, 3, 3];

const VENUES = [
  ['MetLife Stadium', 'New York/New Jersey'],
  ['SoFi Stadium', 'Los Angeles'],
  ['AT&T Stadium', 'Dallas'],
  ['Mercedes-Benz Stadium', 'Atlanta'],
  ['BMO Field', 'Toronto'],
  ['Estadio Azteca', 'Mexico City'],
];

async function run() {
  await connectDB();

  console.log('🧹 Clearing collections…');
  await Promise.all([
    TeamModel.deleteMany({}),
    GroupModel.deleteMany({}),
    MatchModel.deleteMany({}),
    PlayerModel.deleteMany({}),
    AchievementModel.deleteMany({}),
  ]);
  
  // Drop users collection to fix corrupted index
  await UserModel.collection.drop().catch(() => {});

  // 1) Teams
  const teams = await TeamModel.insertMany(
    SEED_TEAMS.map((t) => ({
      name: t.name,
      code: t.code,
      confederation: t.confederation,
      fifaRanking: t.fifaRanking,
      isHost: !!t.isHost,
      flagUrl: FLAG(t.code),
      form: generateRandomForm(),
    })),
  );
  const teamByCode = new Map(teams.map((t) => [t.code, t]));
  console.log(`✅ ${teams.length} teams`);

  // 2) Groups (+ back-reference groupId onto teams)
  const groups = [];
  for (const name of GROUP_NAMES) {
    const members = SEED_TEAMS.filter((t) => t.group === name).map((t) => teamByCode.get(t.code)!);
    const group = await GroupModel.create({ name, teamIds: members.map((m) => m._id), standings: [] });
    await TeamModel.updateMany({ _id: { $in: members.map((m) => m._id) } }, { groupId: group._id });
    groups.push({ group, members });
  }
  console.log(`✅ ${groups.length} groups`);

  // 3) Group-stage fixtures (round-robin, 6 per group)
  // Use relative dates for testing: some past (finished), some recent (live), some future (upcoming)
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const matches: Record<string, unknown>[] = [];
  let venueIdx = 0;
  let matchIdx = 0;
  groups.forEach(({ group, members }) => {
    RR_PAIRS.forEach(([h, a], i) => {
      const [venue, city] = VENUES[venueIdx++ % VENUES.length];
      const round = RR_ROUND[i];
      
      // Stagger dates: first 24 matches finished (2-3 days ago), next 24 live (started today), rest upcoming (future)
      let kickoff: Date;
      let status: 'scheduled' | 'live' | 'finished';
      let score: { home: number | null; away: number | null };
      let minute: number | undefined;
      
      if (matchIdx < 24) {
        // Finished matches (2-3 days ago)
        kickoff = new Date(now.getTime() - (2 + Math.floor(matchIdx / 12)) * oneDayMs + matchIdx * 2 * 60 * 60 * 1000);
        status = 'finished';
        // Random scores for finished matches
        const homeScore = Math.floor(Math.random() * 4);
        const awayScore = Math.floor(Math.random() * 4);
        score = { home: homeScore, away: awayScore };
        minute = 90;
      } else if (matchIdx < 48) {
        // Live matches (started 30-90 mins ago)
        kickoff = new Date(now.getTime() - (30 + Math.floor((matchIdx - 24) / 8) * 15) * 60 * 1000);
        status = 'live';
        const homeScore = Math.floor(Math.random() * 3);
        const awayScore = Math.floor(Math.random() * 3);
        score = { home: homeScore, away: awayScore };
        minute = 30 + Math.floor((matchIdx - 24) / 8) * 15;
      } else {
        // Upcoming matches (starting in next few days)
        kickoff = new Date(now.getTime() + (matchIdx - 48 + 1) * 4 * 60 * 60 * 1000);
        status = 'scheduled';
        score = { home: null, away: null };
      }
      
      matches.push({
        stage: 'group',
        groupId: group._id,
        homeTeamId: members[h]._id,
        awayTeamId: members[a]._id,
        venue,
        city,
        kickoff,
        status,
        round,
        score,
        minute,
        events: status !== 'scheduled' ? [
          ...(score.home && score.home > 0 ? [{ minute: Math.floor(Math.random() * 45) + 1, type: 'goal', teamId: members[h]._id }] : []),
          ...(score.away && score.away > 0 ? [{ minute: Math.floor(Math.random() * 45) + 46, type: 'goal', teamId: members[a]._id }] : []),
        ] : [],
      });
      matchIdx++;
    });
  });
  await MatchModel.insertMany(matches);
  console.log(`✅ ${matches.length} group fixtures`);

  // Recompute standings for all groups after seeding matches
  for (const { group } of groups) {
    await recomputeGroupStandings(String(group._id));
  }
  console.log(`✅ Group standings computed`);

  // 3b) Knockout bracket placeholders. The 2026 format advances 32 teams:
  // R32(16) → R16(8) → QF(4) → SF(2) → 3rd place(1) + Final(1) = 32 knockout fixtures.
  // Teams are TBD (null) until the group draw resolves — the frontend renders them as "TBD" and
  // real pairings/results arrive via `npm run import:wc`. 72 group + 32 knockout = 104 total.
  const KO_ROUNDS: Array<{ stage: string; count: number; dayOffset: number }> = [
    { stage: 'r32', count: 16, dayOffset: 18 },
    { stage: 'r16', count: 8, dayOffset: 24 },
    { stage: 'qf', count: 4, dayOffset: 28 },
    { stage: 'sf', count: 2, dayOffset: 32 },
    { stage: 'third', count: 1, dayOffset: 35 },
    { stage: 'final', count: 1, dayOffset: 36 },
  ];
  const knockouts: Record<string, unknown>[] = [];
  KO_ROUNDS.forEach(({ stage, count, dayOffset }) => {
    for (let n = 0; n < count; n++) {
      const [venue, city] = VENUES[venueIdx++ % VENUES.length];
      const kickoff = new Date(baseDate.getTime() + dayOffset * 86_400_000 + n * 4 * 3_600_000);
      knockouts.push({
        stage,
        homeTeamId: null,
        awayTeamId: null,
        venue,
        city,
        kickoff,
        status: 'scheduled',
        score: { home: null, away: null },
        bracketSlot: `${stage.toUpperCase()}-${n + 1}`,
      });
    }
  });
  await MatchModel.insertMany(knockouts);
  console.log(`✅ ${knockouts.length} knockout fixtures (TBD)`);

  // 4) Players
  const players = SEED_PLAYERS.map((p) => {
    const team = teamByCode.get(p.code);
    return {
      name: p.name,
      teamId: team?._id,
      position: p.position,
      number: p.number,
      club: p.club,
      age: p.age,
      photoUrl: p.photo ?? '',
      stats: { goals: p.goals, assists: p.assists, xg: p.xg, cleanSheets: 0, minutes: 0, appearances: 0 },
      isTopScorer: p.goals >= 4,
    };
  });
  await PlayerModel.insertMany(players);
  console.log(`✅ ${players.length} players`);

  // 5) Achievements
  await AchievementModel.insertMany(SEED_ACHIEVEMENTS);
  console.log(`✅ ${SEED_ACHIEVEMENTS.length} achievements`);

  // 6) Dev admin (for the Phase 7 dashboard). Override via SEED_ADMIN_EMAIL/PASSWORD.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@worldcup26.dev';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';
  await UserModel.create({
    name: 'Tournament Admin',
    email: adminEmail,
    passwordHash: await hashPassword(adminPassword),
    provider: 'local',
    role: 'admin',
  });

  // 7) Test users for login testing
  await UserModel.create({
    name: 'Test User One',
    email: 'user1@test.com',
    passwordHash: await hashPassword('password123'),
    provider: 'local',
    role: 'user',
  });

  await UserModel.create({
    name: 'Test User Two',
    email: 'user2@test.com',
    passwordHash: await hashPassword('password123'),
    provider: 'local',
    role: 'user',
  });

  console.log(`✅ admin user: ${adminEmail} / ${adminPassword}`);
  console.log(`✅ test user 1: user1@test.com / password123`);
  console.log(`✅ test user 2: user2@test.com / password123`);

  console.log('🌱 Seed complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
