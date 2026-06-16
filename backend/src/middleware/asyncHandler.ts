import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async route handler so thrown errors reach the central error middleware
 * without try/catch noise in every controller.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
