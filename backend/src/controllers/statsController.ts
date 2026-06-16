import type { Request, Response } from 'express';
import { MatchModel, PlayerModel, TeamModel, UserModel, PredictionModel } from '../models/index.js';

/** GET /stats/tournament — headline counters for the intro section */
export async function tournamentStats(_req: Request, res: Response) {
  const [teams, matches, finished, players, users, predictions] = await Promise.all([
    TeamModel.countDocuments(),
    MatchModel.countDocuments(),
    MatchModel.find({ status: 'finished' }).select('score').lean(),
    PlayerModel.countDocuments(),
    UserModel.countDocuments(),
    PredictionModel.countDocuments(),
  ]);

  const goals = finished.reduce(
    (sum, m) => sum + (m.score?.home ?? 0) + (m.score?.away ?? 0),
    0,
  );

  res.json({
    data: {
      teams,
      matches,
      matchesPlayed: finished.length,
      goals,
      players,
      users,
      predictions,
      stadiums: 16, // 2026 venue count
      hostCountries: 3,
    },
  });
}

/** GET /stats/top-scorers — golden boot race */
export async function topScorers(_req: Request, res: Response) {
  const players = await PlayerModel.find({ 'stats.goals': { $gt: 0 } })
    .sort({ 'stats.goals': -1, 'stats.assists': -1 })
    .limit(20)
    .populate('teamId', 'name code flagUrl')
    .lean();
  res.json({ data: players });
}
