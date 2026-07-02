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
import { ACTUAL_MATCH_RESULTS } from './matchResults.js';
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

const VENUES = [
  ['BC Place', 'Vancouver'],
  ['Lumen Field', 'Seattle'],
  ['Levi\'s Stadium', 'San Francisco Bay Area'],
  ['SoFi Stadium', 'Los Angeles'],
  ['Arrowhead Stadium', 'Kansas City'],
  ['AT&T Stadium', 'Dallas'],
  ['NRG Stadium', 'Houston'],
  ['Estadio BBVA', 'Monterrey'],
  ['Estadio Akron', 'Guadalajara'],
  ['Estadio Banorte', 'Mexico City'],
  ['BMO Field', 'Toronto'],
  ['Gillette Stadium', 'Boston'],
  ['MetLife Stadium', 'New York/New Jersey'],
  ['Lincoln Financial Field', 'Philadelphia'],
  ['Mercedes-Benz Stadium', 'Atlanta'],
  ['Hard Rock Stadium', 'Miami'],
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
  
  // Drop the users collection so any stale index from a previous schema
  // (e.g. the old sparse-unique googleId index) is cleared on reseed. The model
  // now declares a partial-filter unique index that Mongoose rebuilds on connect.
  try {
    await UserModel.collection.drop();
  } catch (e) {
    // Collection might not exist yet — nothing to drop.
  }
  await UserModel.createCollection();
  await UserModel.syncIndexes();

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

  // 3) Group-stage fixtures using actual World Cup 2026 match results
  const matches: Record<string, unknown>[] = [];
  
  // Create a map of team name to team ID
  const teamNameToId = new Map<string, string>();
  teams.forEach((team) => {
    teamNameToId.set(team.name, String(team._id));
  });
  
  // Map group name to group ID
  const groupNameToId = new Map<string, string>();
  groups.forEach(({ group }) => {
    groupNameToId.set(group.name, String(group._id));
  });
  
  // Insert actual match results
  for (const match of ACTUAL_MATCH_RESULTS) {
    const homeTeamId = teamNameToId.get(match.homeTeam);
    const awayTeamId = teamNameToId.get(match.awayTeam);
    const groupId = groupNameToId.get(match.group);
    
    if (!homeTeamId || !awayTeamId || !groupId) {
      console.warn(`Skipping match: ${match.homeTeam} vs ${match.awayTeam} - team/group not found`);
      continue;
    }
    
    const kickoff = new Date(match.date);
    const score = match.status === 'finished' 
      ? { home: match.homeScore, away: match.awayScore }
      : { home: null, away: null };
    
    const minute = match.status === 'finished' ? 90 : undefined;
    
    // Generate goal events for finished matches
    const events = match.status === 'finished' && (match.homeScore > 0 || match.awayScore > 0) ? [
      ...(Array.from({ length: match.homeScore }, (_, i) => ({ 
        minute: Math.floor(Math.random() * 45) + 1 + (i * 20), 
        type: 'goal', 
        teamId: homeTeamId 
      }))),
      ...(Array.from({ length: match.awayScore }, (_, i) => ({ 
        minute: Math.floor(Math.random() * 45) + 46 + (i * 20), 
        type: 'goal', 
        teamId: awayTeamId 
      })))
    ] : [];
    
    matches.push({
      stage: 'group',
      groupId,
      homeTeamId,
      awayTeamId,
      venue: match.venue,
      city: match.city,
      kickoff,
      status: match.status,
      round: 1, // Simplified - actual round info would need to be added
      score,
      minute,
      events,
    });
  }
  
  await MatchModel.insertMany(matches);
  console.log(`✅ ${matches.length} group fixtures (actual World Cup 2026 results)`);

  // Recompute standings for all groups after seeding matches
  for (const { group } of groups) {
    await recomputeGroupStandings(String(group._id));
  }
  console.log(`✅ Group standings computed`);

  // 3b) Knockout bracket placeholders. The 2026 format advances 32 teams:
  // R32(16) → R16(8) → QF(4) → SF(2) → 3rd place(1) + Final(1) = 32 knockout fixtures.
  // Teams are TBD (null) until the group draw resolves — the frontend renders them as "TBD" and
  // real pairings/results arrive via `npm run import:wc`. 72 group + 32 knockout = 104 total.
  // Actual World Cup 2026 knockout dates (from June 11 start):
  // R32: June 29-July 2 (dayOffset 18-21)
  // R16: July 4-7 (dayOffset 23-26)
  // QF: July 9-10 (dayOffset 28-29)
  // SF: July 14-15 (dayOffset 33-34)
  // Third: July 18 (dayOffset 37)
  // Final: July 19 (dayOffset 38)
  const tournamentStart = new Date('2026-06-11T13:00:00-05:00');
  const oneDayMs = 24 * 60 * 60 * 1000;
  const KO_ROUNDS: Array<{ stage: string; count: number; dayOffset: number }> = [
    { stage: 'r32', count: 16, dayOffset: 18 },
    { stage: 'r16', count: 8, dayOffset: 23 },
    { stage: 'qf', count: 4, dayOffset: 28 },
    { stage: 'sf', count: 2, dayOffset: 33 },
    { stage: 'third', count: 1, dayOffset: 37 },
    { stage: 'final', count: 1, dayOffset: 38 },
  ];
  let venueIdx = 0;
  const knockouts: Record<string, unknown>[] = [];
  KO_ROUNDS.forEach(({ stage, count, dayOffset }) => {
    for (let n = 0; n < count; n++) {
      const [venue, city] = VENUES[venueIdx++ % VENUES.length];
      // Spread knockout matches across their respective date ranges
      const daysIntoRound = Math.floor(n / (count / 4)); // Spread over 4 days per round
      const kickoff = new Date(tournamentStart.getTime() + (dayOffset + daysIntoRound) * oneDayMs + (n % 4) * 6 * 60 * 60 * 1000);
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
    googleId: null,
  });

  // 7) Test users for login testing
  await UserModel.create({
    name: 'Test User One',
    email: 'user1@test.com',
    passwordHash: await hashPassword('password123'),
    provider: 'local',
    role: 'user',
    googleId: null,
  });

  await UserModel.create({
    name: 'Test User Two',
    email: 'user2@test.com',
    passwordHash: await hashPassword('password123'),
    provider: 'local',
    role: 'user',
    googleId: null,
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
