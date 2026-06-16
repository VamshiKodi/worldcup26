import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheRoute } from '../middleware/cache.js';
import { idParam, playerQuery } from '../validators/queries.js';
import { getPlayer, listPlayers } from '../controllers/playerController.js';

export const playerRouter = Router();

playerRouter.get('/', cacheRoute(120), validate(playerQuery, 'query'), asyncHandler(listPlayers));
playerRouter.get('/:id', validate(idParam, 'params'), asyncHandler(getPlayer));
