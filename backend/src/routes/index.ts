import { Router } from 'express';
import { teamRouter } from './teamRoutes.js';

/**
 * API v1 router. Phase 1 mounts /teams as the reference resource.
 * Phase 2+ mount: players, matches, groups, standings, predictions,
 * brackets, leaderboard, stats, simulate, auth, admin.
 */
export const apiRouter = Router();

apiRouter.use('/teams', teamRouter);
