import type { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Error-monitoring sink. Defaults to stderr; swap the body for Sentry/Datadog
 * (`Sentry.captureException(err)`) without touching the handler below.
 */
export function reportError(err: unknown): void {
  console.error(err);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const isApiError = err instanceof ApiError;
  const status = isApiError ? err.status : 500;
  const code = isApiError ? err.code : 'INTERNAL_ERROR';
  const message = isApiError ? err.message : 'Something went wrong';
  const details = isApiError ? err.details : undefined;

  if (status >= 500) reportError(err);

  res.status(status).json({ error: { code, message, details } });
}
