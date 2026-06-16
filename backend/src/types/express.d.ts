import type { AccessPayload } from '../utils/jwt.js';

// Augment Express Request with the authenticated user (set by requireAuth).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessPayload;
    }
  }
}

export {};
