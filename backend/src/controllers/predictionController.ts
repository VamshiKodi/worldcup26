import type { Request, Response } from 'express';
import { MatchModel, PredictionModel } from '../models/index.js';
import { ApiError } from '../middleware/error.js';
import { settleMatch, settleGroup } from '../services/scoringService.js';

const uid = (req: Request) => req.user!.sub;

/** POST /predictions/match — create or update a match prediction (locked once kickoff passes). */
export async function upsertMatchPrediction(req: Request, res: Response) {
  const userId = uid(req);
  const { matchId, outcome, homeScore, awayScore } = req.body;

  const match = await MatchModel.findById(matchId).select('status').lean();
  if (!match) throw new ApiError(404, 'MATCH_NOT_FOUND', 'Match not found');
  if (match.status !== 'scheduled') {
    throw new ApiError(409, 'PREDICTION_LOCKED', 'This match is locked for predictions');
  }

  const prediction = await PredictionModel.findOneAndUpdate(
    { userId, matchId },
    {
      userId,
      matchId,
      type: 'match',
      pick: { outcome: outcome ?? null, homeScore: homeScore ?? null, awayScore: awayScore ?? null },
      points: 0,
      settled: false,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({ data: prediction });
}

/** POST /predictions/winner — pick the tournament champion. */
export async function upsertWinnerPrediction(req: Request, res: Response) {
  const userId = uid(req);
  const { teamId } = req.body;

  const prediction = await PredictionModel.findOneAndUpdate(
    { userId, type: 'winner' },
    { userId, type: 'winner', winnerTeamId: teamId, points: 0, settled: false },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({ data: prediction });
}

/** PUT /predictions/group/:groupId — predicted finishing order for a group. */
export async function upsertGroupPrediction(req: Request, res: Response) {
  const userId = uid(req);
  const { groupId } = req.params;
  const { ranking } = req.body as { ranking: string[] };

  const started = await MatchModel.countDocuments({ groupId, status: { $ne: 'scheduled' } });
  if (started > 0) {
    throw new ApiError(409, 'GROUP_LOCKED', 'This group has already kicked off');
  }

  const groupPrediction = ranking.map((teamId, i) => ({ teamId, rank: i + 1 }));
  const prediction = await PredictionModel.findOneAndUpdate(
    { userId, type: 'group', groupId },
    { userId, type: 'group', groupId, groupPrediction, points: 0, settled: false },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.json({ data: prediction });
}

/** GET /predictions/me — all of the current user's predictions, populated for display. */
export async function listMyPredictions(req: Request, res: Response) {
  const userId = uid(req);
  const teamFields = 'name code flagUrl';

  const predictions = await PredictionModel.find({ userId })
    .sort({ updatedAt: -1 })
    .populate({
      path: 'matchId',
      select: 'stage kickoff status score homeTeamId awayTeamId',
      populate: [
        { path: 'homeTeamId', select: teamFields },
        { path: 'awayTeamId', select: teamFields },
      ],
    })
    .populate('winnerTeamId', teamFields)
    .populate('groupId', 'name')
    .lean();

  res.json({ data: predictions });
}

/** DELETE /predictions/:id — remove one of the current user's predictions. */
export async function deletePrediction(req: Request, res: Response) {
  const userId = uid(req);
  const deleted = await PredictionModel.findOneAndDelete({ _id: req.params.id, userId });
  if (!deleted) throw new ApiError(404, 'PREDICTION_NOT_FOUND', 'Prediction not found');
  res.json({ data: { ok: true } });
}

/** POST /predictions/settle/match/:matchId — admin: settle a finished match. */
export async function settleMatchHandler(req: Request, res: Response) {
  const result = await settleMatch(req.params.matchId);
  res.json({ data: result });
}

/** POST /predictions/settle/group/:groupId — admin: settle a completed group. */
export async function settleGroupHandler(req: Request, res: Response) {
  const result = await settleGroup(req.params.groupId);
  res.json({ data: result });
}
