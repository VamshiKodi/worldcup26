import type { Request, Response } from 'express';
import {
  TeamModel,
  PlayerModel,
  MatchModel,
  UserModel,
  PredictionModel,
  CommentModel,
} from '../models/index.js';
import { ApiError } from '../middleware/error.js';
import { recomputeGroupStandings } from '../services/standingsService.js';
import { settleMatch } from '../services/scoringService.js';

const teamFields = 'name code flagUrl';

// ── Teams ───────────────────────────────────────────────────────────────

export async function createTeam(req: Request, res: Response) {
  const team = await TeamModel.create(req.body);
  res.status(201).json({ data: team });
}

export async function updateTeam(req: Request, res: Response) {
  const team = await TeamModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!team) throw new ApiError(404, 'TEAM_NOT_FOUND', 'Team not found');
  res.json({ data: team });
}

export async function deleteTeam(req: Request, res: Response) {
  const team = await TeamModel.findByIdAndDelete(req.params.id);
  if (!team) throw new ApiError(404, 'TEAM_NOT_FOUND', 'Team not found');
  res.json({ data: { ok: true } });
}

// ── Players ─────────────────────────────────────────────────────────────

export async function createPlayer(req: Request, res: Response) {
  const player = await PlayerModel.create(req.body);
  res.status(201).json({ data: player });
}

export async function updatePlayer(req: Request, res: Response) {
  const player = await PlayerModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!player) throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player not found');
  res.json({ data: player });
}

export async function deletePlayer(req: Request, res: Response) {
  const player = await PlayerModel.findByIdAndDelete(req.params.id);
  if (!player) throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player not found');
  res.json({ data: { ok: true } });
}

// ── Matches ─────────────────────────────────────────────────────────────

export async function createMatch(req: Request, res: Response) {
  const match = await MatchModel.create(req.body);
  res.status(201).json({ data: match });
}

/**
 * Update a match. When it transitions to finished with a final score we recompute
 * the group's standings and settle every prediction for it — the single hook that
 * turns admin score entry into awarded points.
 */
export async function updateMatch(req: Request, res: Response) {
  const match = await MatchModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!match) throw new ApiError(404, 'MATCH_NOT_FOUND', 'Match not found');

  let settled = 0;
  if (match.status === 'finished' && match.score?.home != null && match.score?.away != null) {
    if (match.groupId) await recomputeGroupStandings(String(match.groupId));
    ({ settled } = await settleMatch(String(match._id)));
  }

  const populated = await MatchModel.findById(match._id)
    .populate('homeTeamId', teamFields)
    .populate('awayTeamId', teamFields)
    .lean();
  res.json({ data: populated, meta: { settled } });
}

export async function deleteMatch(req: Request, res: Response) {
  const match = await MatchModel.findByIdAndDelete(req.params.id);
  if (!match) throw new ApiError(404, 'MATCH_NOT_FOUND', 'Match not found');
  res.json({ data: { ok: true } });
}

// ── Analytics ───────────────────────────────────────────────────────────

interface Bucket {
  _id: string;
  count: number;
}

/** Aggregated dashboard metrics: volumes, prediction mix, signups over time. */
export async function analytics(_req: Request, res: Response) {
  const [users, teams, players, matches, predictions, comments] = await Promise.all([
    UserModel.countDocuments(),
    TeamModel.countDocuments(),
    PlayerModel.countDocuments(),
    MatchModel.countDocuments(),
    PredictionModel.countDocuments(),
    CommentModel.countDocuments(),
  ]);

  const [byType, settledAgg, matchStatus, signupsAgg, topPredictors] = await Promise.all([
    PredictionModel.aggregate<Bucket>([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    PredictionModel.aggregate<{ _id: boolean; count: number }>([
      { $group: { _id: '$settled', count: { $sum: 1 } } },
    ]),
    MatchModel.aggregate<Bucket>([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    UserModel.aggregate<Bucket>([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    UserModel.find().sort({ score: -1 }).limit(5).select('name avatarUrl score accuracy').lean(),
  ]);

  const settled = settledAgg.find((s) => s._id === true)?.count ?? 0;
  const pending = settledAgg.find((s) => s._id === false)?.count ?? 0;

  res.json({
    data: {
      totals: { users, teams, players, matches, predictions, comments },
      predictionsByType: byType,
      settlement: { settled, pending },
      matchStatus,
      signups: signupsAgg.slice(-14),
      topPredictors,
    },
  });
}

// ── Comment moderation ──────────────────────────────────────────────────

export async function listComments(req: Request, res: Response) {
  const { status } = req.query as { status?: string };
  const filter = status ? { status } : {};
  const comments = await CommentModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('userId', 'name avatarUrl')
    .lean();
  res.json({ data: comments });
}

export async function setCommentStatus(req: Request, res: Response) {
  const comment = await CommentModel.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true },
  );
  if (!comment) throw new ApiError(404, 'COMMENT_NOT_FOUND', 'Comment not found');
  res.json({ data: comment });
}

export async function deleteComment(req: Request, res: Response) {
  const comment = await CommentModel.findByIdAndDelete(req.params.id);
  if (!comment) throw new ApiError(404, 'COMMENT_NOT_FOUND', 'Comment not found');
  res.json({ data: { ok: true } });
}
