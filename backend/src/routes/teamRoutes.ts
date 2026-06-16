import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheRoute } from '../middleware/cache.js';
import { idParam, teamQuery } from '../validators/queries.js';
import { getTeam, listTeams } from '../controllers/teamController.js';

export const teamRouter = Router();

teamRouter.get('/', cacheRoute(120), validate(teamQuery, 'query'), asyncHandler(listTeams));
teamRouter.get('/:id', validate(idParam, 'params'), asyncHandler(getTeam));
