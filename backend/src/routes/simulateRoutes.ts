import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { simulateLimiter } from '../middleware/rateLimiters.js';
import { simulateBody } from '../validators/predictions.js';
import { runSimulation } from '../controllers/simulateController.js';

export const simulateRouter = Router();

// Compute-heavy: tight per-minute limit (see rateLimiters).
simulateRouter.post('/', simulateLimiter, validate(simulateBody), asyncHandler(runSimulation));
