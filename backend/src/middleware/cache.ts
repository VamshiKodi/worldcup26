import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { referenceCache } from '../utils/cache.js';

/**
 * Caches GET JSON responses in-memory and sets ETag + Cache-Control.
 * On a cached hit, serves instantly and honors If-None-Match → 304.
 *
 * @param maxAge seconds for the browser/CDN Cache-Control header
 */
export function cacheRoute(maxAge = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();

    const key = `${req.baseUrl}${req.path}?${new URLSearchParams(req.query as Record<string, string>).toString()}`;
    const cached = referenceCache.get(key) as { body: unknown; etag: string } | undefined;

    if (cached) {
      res.setHeader('ETag', cached.etag);
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
      res.setHeader('X-Cache', 'HIT');
      if (req.headers['if-none-match'] === cached.etag) return res.status(304).end();
      return res.json(cached.body);
    }

    // Intercept res.json to populate the cache once on a miss.
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode === 200) {
        const etag = `"${crypto.createHash('sha1').update(JSON.stringify(body)).digest('hex')}"`;
        referenceCache.set(key, { body, etag });
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
        res.setHeader('X-Cache', 'MISS');
      }
      return originalJson(body);
    };

    next();
  };
}
