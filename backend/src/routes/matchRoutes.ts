import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheRoute } from '../middleware/cache.js';
import { idParam, matchQuery } from '../validators/queries.js';
import { getMatch, listMatches } from '../controllers/matchController.js';

export const matchRouter = Router();

// Short cache: fixtures change during live play.
matchRouter.get('/', cacheRoute(30), validate(matchQuery, 'query'), asyncHandler(listMatches));
matchRouter.get('/:id', validate(idParam, 'params'), asyncHandler(getMatch));
