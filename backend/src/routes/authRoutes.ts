import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { requireAuth } from '../middleware/auth.js';
import { registerBody, loginBody, googleBody } from '../validators/auth.js';
import { register, login, google, refresh, logout, me } from '../controllers/authController.js';

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.post('/register', validate(registerBody), asyncHandler(register));
authRouter.post('/login', validate(loginBody), asyncHandler(login));
authRouter.post('/google', validate(googleBody), asyncHandler(google));
authRouter.post('/refresh', asyncHandler(refresh));
authRouter.post('/logout', asyncHandler(logout));
authRouter.get('/me', requireAuth, asyncHandler(me));
