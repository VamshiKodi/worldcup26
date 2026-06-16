import type { Request, Response } from 'express';
import { PlayerModel } from '../models/index.js';
import { ApiError } from '../middleware/error.js';
import { buildMeta } from '../utils/paginate.js';

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  goals: { 'stats.goals': -1 },
  assists: { 'stats.assists': -1 },
  xg: { 'stats.xg': -1 },
  cleanSheets: { 'stats.cleanSheets': -1 },
};

/** GET /players — filter by team/position, sort by stat, paginated */
export async function listPlayers(req: Request, res: Response) {
  const { page = 1, limit = 20, team, position, sort = 'goals', search } = req.query as Record<string, string>;
  const p = Number(page);
  const l = Number(limit);

  const filter: Record<string, unknown> = {};
  if (team) filter.teamId = team;
  if (position) filter.position = position;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const [data, total] = await Promise.all([
    PlayerModel.find(filter)
      .sort(SORT_MAP[sort] ?? SORT_MAP.goals)
      .skip((p - 1) * l)
      .limit(l)
      .populate('teamId', 'name code flagUrl')
      .lean(),
    PlayerModel.countDocuments(filter),
  ]);

  res.json({ data, ...buildMeta(p, l, total) });
}

/** GET /players/:id */
export async function getPlayer(req: Request, res: Response) {
  const player = await PlayerModel.findById(req.params.id).populate('teamId', 'name code flagUrl').lean();
  if (!player) throw new ApiError(404, 'PLAYER_NOT_FOUND', 'Player not found');
  res.json({ data: player });
}
