import { GroupModel } from '../models/index.js';
import { HOST_ADVANTAGE, ratingOf, matchProbabilities, winProbability, type TeamLike } from './strength.js';

interface SimTeam {
  id: string;
  name: string;
  code: string;
  flagUrl: string;
  rating: number;
  isHost: boolean;
}

interface PopulatedTeam extends TeamLike {
  _id: unknown;
  name: string;
  code: string;
  flagUrl?: string;
}

interface Counters {
  r16: number;
  qf: number;
  sf: number;
  final: number;
  win: number;
}

const ROUND_ROBIN: Array<[number, number]> = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [0, 3],
  [1, 2],
];

/** Simulate one group's round-robin; return team indices ordered by points (random tie-break). */
function simulateGroup(teams: SimTeam[]): { order: number[]; points: number[] } {
  const points = teams.map(() => 0);
  for (const [i, j] of ROUND_ROBIN) {
    const advantage = teams[i].isHost ? HOST_ADVANTAGE : teams[j].isHost ? -HOST_ADVANTAGE : 0;
    const p = matchProbabilities(teams[i].rating, teams[j].rating, advantage);
    const r = Math.random();
    if (r < p.home) points[i] += 3;
    else if (r < p.home + p.draw) {
      points[i] += 1;
      points[j] += 1;
    } else points[j] += 3;
  }
  const order = teams
    .map((_, idx) => idx)
    .sort((a, b) => points[b] - points[a] || Math.random() - 0.5);
  return { order, points };
}

/** Single knockout tie at a neutral venue; returns the winner. */
function knockout(a: SimTeam, b: SimTeam): SimTeam {
  const advantage = a.isHost ? HOST_ADVANTAGE : b.isHost ? -HOST_ADVANTAGE : 0;
  return Math.random() < winProbability(a.rating + advantage, b.rating) ? a : b;
}

/**
 * Monte-Carlo tournament simulation (2026 format: 12 groups → 32 qualify →
 * R32 → R16 → QF → SF → Final). Returns each team's probability of reaching
 * each stage, averaged over `runs`.
 */
export async function simulateTournament(runs: number) {
  const groups = await GroupModel.find()
    .populate('teamIds', 'name code flagUrl fifaRanking form isHost stats')
    .lean();

  // Build immutable per-team strength records once.
  const groupTeams: SimTeam[][] = groups
    .map((g) =>
      (g.teamIds as unknown as PopulatedTeam[]).map((t) => ({
        id: String(t._id),
        name: t.name,
        code: t.code,
        flagUrl: t.flagUrl ?? '',
        rating: ratingOf(t),
        isHost: Boolean(t.isHost),
      })),
    )
    .filter((g) => g.length === 4);

  const counters = new Map<string, Counters>();
  const meta = new Map<string, SimTeam>();
  for (const g of groupTeams) {
    for (const t of g) {
      meta.set(t.id, t);
      counters.set(t.id, { r16: 0, qf: 0, sf: 0, final: 0, win: 0 });
    }
  }

  const bump = (id: string, key: keyof Counters) => {
    const c = counters.get(id);
    if (c) c[key] += 1;
  };

  for (let run = 0; run < runs; run++) {
    const winners: SimTeam[] = [];
    const runnersUp: SimTeam[] = [];
    const thirds: Array<{ team: SimTeam; points: number }> = [];

    for (const g of groupTeams) {
      const { order, points } = simulateGroup(g);
      winners.push(g[order[0]]);
      runnersUp.push(g[order[1]]);
      thirds.push({ team: g[order[2]], points: points[order[2]] });
    }

    // Best 8 third-placed teams complete the 32-team field.
    thirds.sort((a, b) => b.points - a.points || Math.random() - 0.5);
    const bestThirds = thirds.slice(0, 8).map((t) => t.team);

    // 32 qualifiers (everyone here reached at least R32).
    let bracket: SimTeam[] = [...winners, ...runnersUp, ...bestThirds];

    // R32 → R16
    bracket = reduce(bracket);
    bracket.forEach((t) => bump(t.id, 'r16'));
    // R16 → QF
    bracket = reduce(bracket);
    bracket.forEach((t) => bump(t.id, 'qf'));
    // QF → SF
    bracket = reduce(bracket);
    bracket.forEach((t) => bump(t.id, 'sf'));
    // SF → Final
    bracket = reduce(bracket);
    bracket.forEach((t) => bump(t.id, 'final'));
    // Final → Champion
    bracket = reduce(bracket);
    bracket.forEach((t) => bump(t.id, 'win'));
  }

  const pct = (n: number) => Math.round((n / runs) * 1000) / 10;
  const teams = [...counters.entries()]
    .map(([id, c]) => {
      const t = meta.get(id)!;
      return {
        id,
        name: t.name,
        code: t.code,
        flagUrl: t.flagUrl,
        rating: Math.round(t.rating),
        reachR16: pct(c.r16),
        reachQF: pct(c.qf),
        reachSF: pct(c.sf),
        reachFinal: pct(c.final),
        win: pct(c.win),
      };
    })
    .sort((a, b) => b.win - a.win);

  return { runs, teams };
}

/** Pair adjacent entries and play each tie; returns the winners (half the size). */
function reduce(teams: SimTeam[]): SimTeam[] {
  const out: SimTeam[] = [];
  for (let i = 0; i + 1 < teams.length; i += 2) {
    out.push(knockout(teams[i], teams[i + 1]));
  }
  return out;
}
