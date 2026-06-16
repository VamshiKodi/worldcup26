import type { Request, Response } from 'express';
import { TeamModel } from '../models/index.js';
import { ApiError } from '../middleware/error.js';
import { buildMeta } from '../utils/paginate.js';

/** GET /teams — list with filters + pagination */
export async function listTeams(req: Request, res: Response) {
  const { page = 1, limit = 20, confederation, group, search } = req.query as Record<string, string>;
  const p = Number(page);
  const l = Number(limit);

  const filter: Record<string, unknown> = {};
  if (confederation) filter.confederation = confederation;
  if (group) filter.groupId = group;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const [data, total] = await Promise.all([
    TeamModel.find(filter)
      .sort({ fifaRanking: 1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    TeamModel.countDocuments(filter),
  ]);

  res.json({ data, ...buildMeta(p, l, total) });
}

/** GET /teams/:id */
export async function getTeam(req: Request, res: Response) {
  const team = await TeamModel.findById(req.params.id).lean();
  if (!team) throw new ApiError(404, 'TEAM_NOT_FOUND', 'Team not found');
  res.json({ data: team });
}
