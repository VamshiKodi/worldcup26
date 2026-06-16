import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  matchPredictionBody,
  winnerBody,
  groupParam,
  groupPredictionBody,
  idParam,
  matchIdParam,
} from '../validators/predictions.js';
import { groupIdParam } from '../validators/queries.js';
import {
  upsertMatchPrediction,
  upsertWinnerPrediction,
  upsertGroupPrediction,
  listMyPredictions,
  deletePrediction,
  settleMatchHandler,
  settleGroupHandler,
} from '../controllers/predictionController.js';

export const predictionRouter = Router();

// Everything here requires a signed-in user.
predictionRouter.use(requireAuth);

predictionRouter.get('/me', asyncHandler(listMyPredictions));
predictionRouter.post('/match', validate(matchPredictionBody), asyncHandler(upsertMatchPrediction));
predictionRouter.post('/winner', validate(winnerBody), asyncHandler(upsertWinnerPrediction));
predictionRouter.put(
  '/group/:groupId',
  validate(groupParam, 'params'),
  validate(groupPredictionBody),
  asyncHandler(upsertGroupPrediction),
);
predictionRouter.delete('/:id', validate(idParam, 'params'), asyncHandler(deletePrediction));

// Settlement — admin only.
predictionRouter.post(
  '/settle/match/:matchId',
  requireAdmin,
  validate(matchIdParam, 'params'),
  asyncHandler(settleMatchHandler),
);
predictionRouter.post(
  '/settle/group/:groupId',
  requireAdmin,
  validate(groupIdParam, 'params'),
  asyncHandler(settleGroupHandler),
);
