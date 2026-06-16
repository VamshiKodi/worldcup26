import type { NextFunction, Request, Response } from 'express';
import { ApiError } from './error.js';
import { verifyAccessToken } from '../utils/jwt.js';

/** Requires a valid access token in the Authorization: Bearer <token> header. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Missing access token'));
  }
  try {
    req.user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    next(new ApiError(401, 'TOKEN_INVALID', 'Invalid or expired access token'));
  }
}

/** Requires the authenticated user to have the admin role. Use after requireAuth. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return next(new ApiError(403, 'FORBIDDEN', 'Admin access required'));
  }
  next();
}
