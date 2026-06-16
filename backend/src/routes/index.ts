import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimiters.js';
import { authRouter } from './authRoutes.js';
import { teamRouter } from './teamRoutes.js';
import { playerRouter } from './playerRoutes.js';
import { matchRouter } from './matchRoutes.js';
import { groupRouter } from './groupRoutes.js';
import { standingsRouter } from './standingsRoutes.js';
import { leaderboardRouter } from './leaderboardRoutes.js';
import { statsRouter } from './statsRoutes.js';
import { predictionRouter } from './predictionRoutes.js';
import { bracketRouter } from './bracketRoutes.js';
import { aiRouter } from './aiRoutes.js';
import { simulateRouter } from './simulateRoutes.js';
import { adminRouter } from './adminRoutes.js';

/**
 * API v1 router. Phase 2 mounts all read resources.
 * Phase 6 adds /predictions /brackets /ai /simulate; Phase 7 adds /admin.
 */
export const apiRouter = Router();

apiRouter.use(apiLimiter);

apiRouter.use('/auth', authRouter);
apiRouter.use('/teams', teamRouter);
apiRouter.use('/players', playerRouter);
apiRouter.use('/matches', matchRouter);
apiRouter.use('/groups', groupRouter);
apiRouter.use('/standings', standingsRouter);
apiRouter.use('/leaderboard', leaderboardRouter);
apiRouter.use('/stats', statsRouter);
apiRouter.use('/predictions', predictionRouter);
apiRouter.use('/brackets', bracketRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/simulate', simulateRouter);
apiRouter.use('/admin', adminRouter);
