import http from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { registerSocketHandlers } from './sockets/index.js';

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  const io = new SocketServer(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });
  registerSocketHandlers(io);

  server.listen(env.port, () => {
    console.log(`🚀 API listening on http://localhost:${env.port}/api/v1`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
