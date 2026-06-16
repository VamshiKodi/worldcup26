import type { Request, Response } from 'express';
import { GroupModel } from '../models/index.js';
import { ApiError } from '../middleware/error.js';

const teamFields = 'name code flagUrl fifaRanking';

/** GET /groups — all groups with populated teams & standings */
export async function listGroups(_req: Request, res: Response) {
  const groups = await GroupModel.find()
    .sort({ name: 1 })
    .populate('teamIds', teamFields)
    .populate('standings.teamId', teamFields)
    .lean();
  res.json({ data: groups });
}

/** GET /groups/:id */
export async function getGroup(req: Request, res: Response) {
  const group = await GroupModel.findById(req.params.id)
    .populate('teamIds', teamFields)
    .populate('standings.teamId', teamFields)
    .lean();
  if (!group) throw new ApiError(404, 'GROUP_NOT_FOUND', 'Group not found');
  res.json({ data: group });
}
