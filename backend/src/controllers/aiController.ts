import type { Request, Response } from 'express';
import { predictMatch, championshipOdds } from '../services/aiService.js';

/** GET /ai/match/:matchId — probability breakdown for a single match. */
export async function aiMatch(req: Request, res: Response) {
  const data = await predictMatch(req.params.matchId);
  res.json({ data });
}

/** GET /ai/championship — title probabilities across the field. */
export async function aiChampionship(req: Request, res: Response) {
  const { limit } = req.query as unknown as { limit: number };
  const data = await championshipOdds(limit);
  res.json({ data });
}
