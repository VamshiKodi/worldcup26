import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheRoute } from '../middleware/cache.js';
import { leaderboardQuery } from '../validators/queries.js';
import { getLeaderboard } from '../controllers/leaderboardController.js';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', cacheRoute(15), validate(leaderboardQuery, 'query'), asyncHandler(getLeaderboard));
