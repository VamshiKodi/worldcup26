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
} from '../models/index.js';
import { SEED_TEAMS, GROUP_NAMES, SEED_PLAYERS, SEED_ACHIEVEMENTS } from './seedData.js';

const FLAG = (code: string) => `https://flagcdn.com/w320/${code.toLowerCase().slice(0, 2)}.png`;

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

  // 1) Teams
  const teams = await TeamModel.insertMany(
    SEED_TEAMS.map((t) => ({
      name: t.name,
      code: t.code,
      confederation: t.confederation,
      fifaRanking: t.fifaRanking,
      isHost: !!t.isHost,
      flagUrl: FLAG(t.code),
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
  const baseDate = new Date('2026-06-11T16:00:00Z');
  const matches: Record<string, unknown>[] = [];
  let venueIdx = 0;
  groups.forEach(({ group, members }) => {
    RR_PAIRS.forEach(([h, a], i) => {
      const [venue, city] = VENUES[venueIdx++ % VENUES.length];
      const kickoff = new Date(baseDate.getTime() + (RR_ROUND[i] - 1) * 4 * 86_400_000 + venueIdx * 3 * 3_600_000);
      matches.push({
        stage: 'group',
        groupId: group._id,
        homeTeamId: members[h]._id,
        awayTeamId: members[a]._id,
        venue,
        city,
        kickoff,
        status: 'scheduled',
        round: RR_ROUND[i],
        score: { home: null, away: null },
      });
    });
  });
  await MatchModel.insertMany(matches);
  console.log(`✅ ${matches.length} group fixtures`);

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
      photoUrl: '',
      stats: { goals: p.goals, assists: p.assists, xg: p.xg, cleanSheets: 0, minutes: 0, appearances: 0 },
      isTopScorer: p.goals >= 4,
    };
  });
  await PlayerModel.insertMany(players);
  console.log(`✅ ${players.length} players`);

  // 5) Achievements
  await AchievementModel.insertMany(SEED_ACHIEVEMENTS);
  console.log(`✅ ${SEED_ACHIEVEMENTS.length} achievements`);

  console.log('🌱 Seed complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
