import http from 'node:http';
import mongoose from 'mongoose';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env, hasRealData } from './config/env.js';
import { corsOrigin } from './config/cors.js';
import { registerSocketHandlers } from './sockets/index.js';
import { startLiveEngine } from './services/liveEngine.js';
import {
  startLiveSync,
  startResultSync,
  startStaticSync,
  importStaticData,
  importScorers,
} from './services/syncService.js';
import { enrichMissingPhotos } from './services/photoService.js';

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  const io = new SocketServer(server, {
    cors: { origin: corsOrigin, credentials: true },
  });
  registerSocketHandlers(io);

  server.listen(env.port, () => {
    console.log(`🚀 API listening on http://localhost:${env.port}/api/v1`);
  });

  // Realtime + real-data updates. When a football-data.org token is configured we:
  //   1) import real teams/fixtures/standings/scorers once on boot (idempotent), so the DB is
  //      correct and the sync loops below have real `apiId` rows to match against; then
  //   2) poll live fixtures for in-play ticks, reconcile finished results (so completed matches
  //      always settle — even ones missed while the server was down), and periodically refresh
  //      the static data (scorers/form/standings) so nothing goes stale without a manual import.
  // Otherwise we fall back to the simulated engine (Phase 9).
  const stops: Array<() => void> = [];
  if (hasRealData) {
    try {
      const s = await importStaticData();
      const p = await importScorers();
      console.log(
        `🌍 Real data imported on boot: ${s.teams} teams · ${s.groups} groups · ${s.matches} fixtures · ${p.players} scorers`,
      );
    } catch (err) {
      console.error('⚠️  Boot import failed — continuing with existing data:', err);
    }
    // Backfill missing player headshots (Wikipedia) in the background so the production DB gets
    // real photos without a manual script run. Only players lacking a photo are resolved, so this
    // is cheap on subsequent boots. Non-blocking — the server is already serving requests.
    void enrichMissingPhotos()
      .then(({ scanned, filled }) => {
        if (scanned > 0) console.log(`🖼️  Player photos: filled ${filled}/${scanned}`);
      })
      .catch((err) => console.error('⚠️  Photo enrichment failed:', err));
    stops.push(startLiveSync(io), startResultSync(io), startStaticSync());
  } else if (env.live.enabled) {
    stops.push(startLiveEngine(io));
  }
  const stopLive = () => stops.forEach((stop) => stop());

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
