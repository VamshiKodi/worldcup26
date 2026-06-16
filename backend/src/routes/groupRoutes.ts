import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { cacheRoute } from '../middleware/cache.js';
import { idParam } from '../validators/queries.js';
import { getGroup, listGroups } from '../controllers/groupController.js';

export const groupRouter = Router();

groupRouter.get('/', cacheRoute(60), asyncHandler(listGroups));
groupRouter.get('/:id', validate(idParam, 'params'), asyncHandler(getGroup));
