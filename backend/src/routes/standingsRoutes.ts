import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheRoute } from '../middleware/cache.js';
import { groupIdParam } from '../validators/queries.js';
import { getGroupStandings, listStandings } from '../controllers/standingsController.js';

export const standingsRouter = Router();

standingsRouter.get('/', cacheRoute(30), asyncHandler(listStandings));
standingsRouter.get('/:groupId', validate(groupIdParam, 'params'), asyncHandler(getGroupStandings));
