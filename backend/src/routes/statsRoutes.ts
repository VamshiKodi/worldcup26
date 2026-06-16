import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { cacheRoute } from '../middleware/cache.js';
import { topScorers, tournamentStats } from '../controllers/statsController.js';

export const statsRouter = Router();

statsRouter.get('/tournament', cacheRoute(30), asyncHandler(tournamentStats));
statsRouter.get('/top-scorers', cacheRoute(60), asyncHandler(topScorers));
