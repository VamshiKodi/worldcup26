import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { bracketBody } from '../validators/predictions.js';
import { getMyBracket, upsertMyBracket } from '../controllers/bracketController.js';

export const bracketRouter = Router();

bracketRouter.use(requireAuth);
bracketRouter.get('/me', asyncHandler(getMyBracket));
bracketRouter.put('/me', validate(bracketBody), asyncHandler(upsertMyBracket));
