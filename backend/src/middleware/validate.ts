import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { ApiError } from './error.js';

type Source = 'body' | 'query' | 'params';

/**
 * Validates a request part against a Zod schema. On success, replaces the request
 * part with the parsed (typed/coerced) value. On failure → 422 with field details.
 */
export function validate(schema: ZodTypeAny, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new ApiError(422, 'VALIDATION_ERROR', 'Invalid request', result.error.flatten()),
      );
    }
    // Overwrite with parsed (typed/coerced) value.
    (req as Record<Source, unknown>)[source] = result.data;
    next();
  };
}
