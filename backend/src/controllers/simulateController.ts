import type { Request, Response } from 'express';
import { simulateTournament } from '../services/simulatorService.js';

/** POST /simulate — run an N-iteration Monte-Carlo of the tournament. */
export async function runSimulation(req: Request, res: Response) {
  const { runs } = req.body as { runs: number };
  const data = await simulateTournament(runs);
  res.json({ data });
}
