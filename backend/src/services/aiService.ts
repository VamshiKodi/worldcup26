import { MatchModel, TeamModel } from '../models/index.js';
import { ApiError } from '../middleware/error.js';
import {
  ratingOf,
  matchProbabilities,
  expectedGoals,
  likelyScoreline,
  HOST_ADVANTAGE,
  type TeamLike,
} from './strength.js';

const TEAM_FIELDS = 'name code flagUrl fifaRanking form isHost stats';

interface PopulatedTeam extends TeamLike {
  _id: unknown;
  name: string;
  code: string;
  flagUrl?: string;
  fifaRanking?: number;
}

function teamCard(t: PopulatedTeam, rating: number) {
  return {
    id: String(t._id),
    name: t.name,
    code: t.code,
    flagUrl: t.flagUrl ?? '',
    fifaRanking: t.fifaRanking ?? 0,
    rating: Math.round(rating),
    form: (t.form ?? []).slice(-5),
  };
}

const pct = (n: number) => Math.round(n * 1000) / 10;

/**
 * Probability breakdown for a single match, plus the factors that drove it.
 * Most finals matches are neutral; we apply a small home edge only to the listed home side.
 */
export async function predictMatch(matchId: string) {
  const match = await MatchModel.findById(matchId)
    .populate('homeTeamId', TEAM_FIELDS)
    .populate('awayTeamId', TEAM_FIELDS)
    .lean();
  if (!match) throw new ApiError(404, 'MATCH_NOT_FOUND', 'Match not found');

  const home = match.homeTeamId as unknown as PopulatedTeam;
  const away = match.awayTeamId as unknown as PopulatedTeam;
  if (!home || !away) throw new ApiError(409, 'MATCH_INCOMPLETE', 'Match is missing teams');

  // World Cup venues are neutral; only an actual host nation gets a modest edge.
  const neutral = true;
  const rHome = ratingOf(home);
  const rAway = ratingOf(away);
  const advantage = home.isHost ? HOST_ADVANTAGE : away.isHost ? -HOST_ADVANTAGE : 0;
  const probs = matchProbabilities(rHome, rAway, advantage, match.stage === 'group');
  const xg = expectedGoals(rHome, rAway, advantage);

  return {
    matchId: String(match._id),
    stage: match.stage,
    neutral,
    home: teamCard(home, rHome),
    away: teamCard(away, rAway),
    probabilities: { home: pct(probs.home), draw: pct(probs.draw), away: pct(probs.away) },
    likelyScore: likelyScoreline(xg.home, xg.away, match.stage === 'group'),
    expectedGoals: { home: Math.round(xg.home * 10) / 10, away: Math.round(xg.away * 10) / 10 },
  };
}

interface FixtureLite {
  stage: string;
  status: string;
  homeTeamId?: unknown;
  awayTeamId?: unknown;
  winner?: string | null;
}

/**
 * Ids of teams that can still lift the trophy: sides with an unfinished match on the title
 * path (the third-place playoff doesn't count), or only the champion once the final is done.
 * Null when fixtures can't tell us (nothing seeded yet) — callers fall back to the full field.
 */
function titleContenders(fixtures: FixtureLite[]): Set<string> | null {
  const final = fixtures.find((m) => m.stage === 'final');
  if (final?.status === 'finished' && final.winner && final.winner !== 'DRAW') {
    const champion = final.winner === 'HOME_TEAM' ? final.homeTeamId : final.awayTeamId;
    return champion ? new Set([String(champion)]) : null;
  }
  const alive = new Set<string>();
  for (const m of fixtures) {
    if (m.stage === 'third' || m.status === 'finished') continue;
    if (m.homeTeamId) alive.add(String(m.homeTeamId));
    if (m.awayTeamId) alive.add(String(m.awayTeamId));
  }
  return alive.size ? alive : null;
}

/**
 * Championship probabilities via a softmax over team ratings, restricted to teams still in
 * title contention. A temperature spreads the distribution so it isn't dominated by the top side.
 */
export async function championshipOdds(limit = 16) {
  const [teams, fixtures] = await Promise.all([
    TeamModel.find().select(TEAM_FIELDS).lean(),
    MatchModel.find().select('stage status homeTeamId awayTeamId winner').lean(),
  ]);

  const contenders = titleContenders(fixtures as FixtureLite[]);
  const pool = contenders ? teams.filter((t) => contenders.has(String(t._id))) : teams;
  const rated = pool.map((t) => ({ team: t as unknown as PopulatedTeam, rating: ratingOf(t) }));

  const TEMPERATURE = 110;
  const max = Math.max(...rated.map((r) => r.rating));
  const exps = rated.map((r) => Math.exp((r.rating - max) / TEMPERATURE));
  const total = exps.reduce((a, b) => a + b, 0);

  return rated
    .map((r, i) => ({ ...teamCard(r.team, r.rating), probability: pct(exps[i] / total) }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, limit);
}
