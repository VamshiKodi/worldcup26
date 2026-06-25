import http from 'node:http';
import mongoose from 'mongoose';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env, hasRealData } from './config/env.js';
import { registerSocketHandlers } from './sockets/index.js';
import { startLiveEngine } from './services/liveEngine.js';
import { startLiveSync } from './services/syncService.js';

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  const io = new SocketServer(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });
  registerSocketHandlers(io);

  // Realtime updates. When a football-data.org token is configured, poll live fixtures and
  // broadcast real scores; otherwise fall back to the simulated engine (Phase 9).
  const stopLive = hasRealData
    ? startLiveSync(io)
    : env.live.enabled
      ? startLiveEngine(io)
      : () => {};

  server.listen(env.port, () => {
    console.log(`🚀 API listening on http://localhost:${env.port}/api/v1`);
  });

  // Graceful shutdown: stop accepting connections, then close the DB, so the
  // platform (Render/Railway) can recycle the instance without dropped requests.
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down…`);
    stopLive();
    server.close(() => {
      void mongoose.connection.close(false).then(() => process.exit(0));
    });
    // Force-exit if connections linger.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
