import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheRoute } from '../middleware/cache.js';
import { matchIdParam, championshipQuery } from '../validators/predictions.js';
import { aiMatch, aiChampionship } from '../controllers/aiController.js';

export const aiRouter = Router();

aiRouter.get('/match/:matchId', validate(matchIdParam, 'params'), asyncHandler(aiMatch));
aiRouter.get(
  '/championship',
  cacheRoute(120),
  validate(championshipQuery, 'query'),
  asyncHandler(aiChampionship),
);
