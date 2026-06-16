import type { Request, Response } from 'express';
import { UserModel } from '../models/index.js';
import { buildMeta } from '../utils/paginate.js';

/**
 * GET /leaderboard — global ranking by cached user score.
 * (Materialized Leaderboard snapshots are refreshed on settlement in Phase 6;
 *  this live query is the source of truth and fallback.)
 */
export async function getLeaderboard(req: Request, res: Response) {
  const { page = 1, limit = 50 } = req.query as Record<string, string>;
  const p = Number(page);
  const l = Number(limit);

  const [users, total] = await Promise.all([
    UserModel.find()
      .sort({ score: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .select('name avatarUrl score accuracy badges')
      .lean(),
    UserModel.countDocuments(),
  ]);

  const data = users.map((u, i) => ({ rank: (p - 1) * l + i + 1, ...u }));
  res.json({ data, ...buildMeta(p, l, total) });
}
