import type { Request, Response } from 'express';
import { MatchModel } from '../models/index.js';
import { ApiError } from '../middleware/error.js';
import { buildMeta } from '../utils/paginate.js';

/** GET /matches — filter by stage/group/status/date, sorted by kickoff */
export async function listMatches(req: Request, res: Response) {
  const { page = 1, limit = 20, stage, group, status, from, to } = req.query as Record<string, string>;
  const p = Number(page);
  const l = Number(limit);

  const filter: Record<string, unknown> = {};
  if (stage) filter.stage = stage;
  if (group) filter.groupId = group;
  if (status) filter.status = status;
  if (from || to) {
    filter.kickoff = {} as Record<string, Date>;
    if (from) (filter.kickoff as Record<string, Date>).$gte = new Date(from);
    if (to) (filter.kickoff as Record<string, Date>).$lte = new Date(to);
  }

  const teamFields = 'name code flagUrl';
  const [data, total] = await Promise.all([
    MatchModel.find(filter)
      .sort({ kickoff: 1 })
      .skip((p - 1) * l)
      .limit(l)
      .populate('homeTeamId', teamFields)
      .populate('awayTeamId', teamFields)
      .lean(),
    MatchModel.countDocuments(filter),
  ]);

  res.json({ data, ...buildMeta(p, l, total) });
}

/** GET /matches/:id */
export async function getMatch(req: Request, res: Response) {
  const teamFields = 'name code flagUrl';
  const match = await MatchModel.findById(req.params.id)
    .populate('homeTeamId', teamFields)
    .populate('awayTeamId', teamFields)
    .populate('events.playerId', 'name')
    .lean();
  if (!match) throw new ApiError(404, 'MATCH_NOT_FOUND', 'Match not found');
  res.json({ data: match });
}
