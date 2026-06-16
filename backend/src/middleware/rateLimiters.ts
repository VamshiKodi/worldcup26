import rateLimit from 'express-rate-limit';

const opts = { standardHeaders: true, legacyHeaders: false } as const;

/** Default read limiter for public API routes. */
export const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 600, ...opts });

/** Stricter limiter for auth endpoints (Phase 3) — brute-force protection. */
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, ...opts });

/** Expensive compute (Monte-Carlo simulation, Phase 6). */
export const simulateLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, ...opts });
