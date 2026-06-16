import { MatchModel, PredictionModel, UserModel, GroupModel } from '../models/index.js';
import { ApiError } from '../middleware/error.js';

/** Points awarded for a match prediction. */
export const POINTS = {
  exactScore: 5,
  correctOutcome: 2,
  groupPlacement: 3, // per correctly-placed team in a group prediction
  groupPerfect: 4, // bonus for a fully correct group order
} as const;

type Outcome = 'H' | 'D' | 'A';

function outcomeOf(home: number, away: number): Outcome {
  return home > away ? 'H' : home < away ? 'A' : 'D';
}

/** Score a single match prediction against the final result. */
export function scoreMatchPrediction(
  pick: { outcome?: Outcome | null; homeScore?: number | null; awayScore?: number | null },
  result: { home: number; away: number },
): number {
  const actual = outcomeOf(result.home, result.away);
  const hasScore = pick.homeScore != null && pick.awayScore != null;

  if (hasScore && pick.homeScore === result.home && pick.awayScore === result.away) {
    return POINTS.exactScore;
  }
  const predicted: Outcome | null = pick.outcome ?? (hasScore ? outcomeOf(pick.homeScore!, pick.awayScore!) : null);
  if (predicted && predicted === actual) return POINTS.correctOutcome;
  return 0;
}

/** Recompute a user's cached score and accuracy from their settled predictions. */
async function refreshUserStats(userId: string): Promise<void> {
  const settled = await PredictionModel.find({ userId, settled: true }).select('points').lean();
  const score = settled.reduce((sum, p) => sum + (p.points ?? 0), 0);
  const correct = settled.filter((p) => (p.points ?? 0) > 0).length;
  const accuracy = settled.length ? Math.round((correct / settled.length) * 1000) / 10 : 0;
  await UserModel.findByIdAndUpdate(userId, { score, accuracy });
}

/**
 * Settle every prediction for a finished match: award points, mark settled,
 * then refresh each affected user's cached score/accuracy.
 */
export async function settleMatch(matchId: string): Promise<{ settled: number }> {
  const match = await MatchModel.findById(matchId).lean();
  if (!match) throw new ApiError(404, 'MATCH_NOT_FOUND', 'Match not found');
  if (match.status !== 'finished' || match.score?.home == null || match.score?.away == null) {
    throw new ApiError(409, 'MATCH_NOT_FINISHED', 'Match has no final score to settle against');
  }
  const result = { home: match.score.home, away: match.score.away };

  const predictions = await PredictionModel.find({ matchId, type: 'match', settled: false });
  const affectedUsers = new Set<string>();

  for (const p of predictions) {
    p.points = scoreMatchPrediction(
      { outcome: p.pick?.outcome as Outcome | null, homeScore: p.pick?.homeScore, awayScore: p.pick?.awayScore },
      result,
    );
    p.settled = true;
    await p.save();
    affectedUsers.add(String(p.userId));
  }

  for (const userId of affectedUsers) await refreshUserStats(userId);
  return { settled: predictions.length };
}

/**
 * Settle group-order predictions once all of a group's matches are finished.
 * Awards per correctly-placed team, plus a perfect-order bonus.
 */
export async function settleGroup(groupId: string): Promise<{ settled: number }> {
  const group = await GroupModel.findById(groupId).lean();
  if (!group) throw new ApiError(404, 'GROUP_NOT_FOUND', 'Group not found');

  const remaining = await MatchModel.countDocuments({ groupId, status: { $ne: 'finished' } });
  if (remaining > 0) {
    throw new ApiError(409, 'GROUP_INCOMPLETE', 'Group still has unfinished matches');
  }
  if (!group.standings?.length) {
    throw new ApiError(409, 'NO_STANDINGS', 'Group standings have not been computed');
  }

  // Actual finishing order (rank → teamId).
  const actual = [...group.standings].sort((a, b) => a.rank - b.rank).map((s) => String(s.teamId));

  const predictions = await PredictionModel.find({ groupId, type: 'group', settled: false });
  const affectedUsers = new Set<string>();

  for (const p of predictions) {
    const ranked = [...p.groupPrediction].sort((a, b) => a.rank - b.rank).map((r) => String(r.teamId));
    let points = 0;
    let perfect = ranked.length === actual.length;
    ranked.forEach((teamId, idx) => {
      if (actual[idx] === teamId) points += POINTS.groupPlacement;
      else perfect = false;
    });
    if (perfect) points += POINTS.groupPerfect;

    p.points = points;
    p.settled = true;
    await p.save();
    affectedUsers.add(String(p.userId));
  }

  for (const userId of affectedUsers) await refreshUserStats(userId);
  return { settled: predictions.length };
}
