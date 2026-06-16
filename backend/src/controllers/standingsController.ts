import type { Request, Response } from 'express';
import { GroupModel } from '../models/index.js';
import { ApiError } from '../middleware/error.js';

const teamFields = 'name code flagUrl';

/** GET /standings — every group's standings table */
export async function listStandings(_req: Request, res: Response) {
  const groups = await GroupModel.find()
    .sort({ name: 1 })
    .populate('standings.teamId', teamFields)
    .select('name standings')
    .lean();
  res.json({ data: groups });
}

/** GET /standings/:groupId — one group's table */
export async function getGroupStandings(req: Request, res: Response) {
  const group = await GroupModel.findById(req.params.groupId)
    .populate('standings.teamId', teamFields)
    .select('name standings')
    .lean();
  if (!group) throw new ApiError(404, 'GROUP_NOT_FOUND', 'Group not found');
  res.json({ data: group });
}
