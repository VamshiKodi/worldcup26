import type { CorsOptions } from 'cors';
import { env } from './env.js';

/**
 * CORS origin check shared by Express (app.ts) and Socket.IO (server.ts).
 *
 * The browser's `Origin` header never has a trailing slash, so we compare against the
 * already-normalized `env.clientUrls` allow-list (see env.ts). Requests with no Origin
 * (curl, same-origin, server-to-server, health checks) are allowed through.
 */
export const corsOrigin: CorsOptions['origin'] = (origin, callback) => {
  if (!origin || env.clientUrls.includes(origin)) {
    callback(null, true);
    return;
  }
  callback(new Error(`Origin not allowed by CORS: ${origin}`));
};
