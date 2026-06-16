import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  idParam,
  teamCreateBody,
  teamUpdateBody,
  playerCreateBody,
  playerUpdateBody,
  matchCreateBody,
  matchUpdateBody,
  commentStatusBody,
  commentListQuery,
} from '../validators/admin.js';
import {
  createTeam,
  updateTeam,
  deleteTeam,
  createPlayer,
  updatePlayer,
  deletePlayer,
  createMatch,
  updateMatch,
  deleteMatch,
  analytics,
  listComments,
  setCommentStatus,
  deleteComment,
} from '../controllers/adminController.js';

export const adminRouter = Router();

// Every admin route requires an authenticated admin.
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/analytics', asyncHandler(analytics));

adminRouter.post('/teams', validate(teamCreateBody), asyncHandler(createTeam));
adminRouter.put('/teams/:id', validate(idParam, 'params'), validate(teamUpdateBody), asyncHandler(updateTeam));
adminRouter.delete('/teams/:id', validate(idParam, 'params'), asyncHandler(deleteTeam));

adminRouter.post('/players', validate(playerCreateBody), asyncHandler(createPlayer));
adminRouter.put('/players/:id', validate(idParam, 'params'), validate(playerUpdateBody), asyncHandler(updatePlayer));
adminRouter.delete('/players/:id', validate(idParam, 'params'), asyncHandler(deletePlayer));

adminRouter.post('/matches', validate(matchCreateBody), asyncHandler(createMatch));
adminRouter.put('/matches/:id', validate(idParam, 'params'), validate(matchUpdateBody), asyncHandler(updateMatch));
adminRouter.delete('/matches/:id', validate(idParam, 'params'), asyncHandler(deleteMatch));

adminRouter.get('/comments', validate(commentListQuery, 'query'), asyncHandler(listComments));
adminRouter.patch('/comments/:id', validate(idParam, 'params'), validate(commentStatusBody), asyncHandler(setCommentStatus));
adminRouter.delete('/comments/:id', validate(idParam, 'params'), asyncHandler(deleteComment));
