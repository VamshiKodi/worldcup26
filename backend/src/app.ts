import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  if (!env.isProd) app.use(morgan('dev'));

  // Global rate limit (tighter limits applied per-router in Phase 2/3)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 600,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), env: env.nodeEnv });
  });

  app.use('/api/v1', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
