import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getTeam, listTeams } from '../controllers/teamController.js';

export const teamRouter = Router();

teamRouter.get('/', asyncHandler(listTeams));
teamRouter.get('/:id', asyncHandler(getTeam));
