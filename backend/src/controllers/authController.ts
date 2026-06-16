import type { CookieOptions, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../models/index.js';
import { ApiError } from '../middleware/error.js';
import { env } from '../config/env.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword, hashToken, matchToken } from '../utils/password.js';

const REFRESH_COOKIE = 'refreshToken';

const cookieOpts: CookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
};

const googleClient = new OAuth2Client(env.google.clientId);

/** Issues an access token + sets the rotating refresh cookie, persisting its hash. */
async function issueSession(res: Response, user: { id: string; role: 'user' | 'admin' }) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });
  await UserModel.findByIdAndUpdate(user.id, { refreshTokenHash: await hashToken(refreshToken) });
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
  return accessToken;
}

function publicUser(u: { _id: unknown; name: string; email: string; role: string; avatarUrl?: string }) {
  return { id: String(u._id), name: u.name, email: u.email, role: u.role, avatarUrl: u.avatarUrl ?? '' };
}

/** POST /auth/register */
export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (await UserModel.exists({ email })) {
    throw new ApiError(409, 'EMAIL_TAKEN', 'An account with that email already exists');
  }
  const user = await UserModel.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    provider: 'local',
  });
  const accessToken = await issueSession(res, { id: String(user._id), role: user.role });
  res.status(201).json({ data: { user: publicUser(user), accessToken } });
}

/** POST /auth/login */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }).select('+refreshTokenHash');
  if (!user || !user.passwordHash) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }
  const accessToken = await issueSession(res, { id: String(user._id), role: user.role });
  res.json({ data: { user: publicUser(user), accessToken } });
}

/** POST /auth/google — verifies a Google ID token and upserts the user. */
export async function google(req: Request, res: Response) {
  if (!env.google.clientId) throw new ApiError(503, 'OAUTH_DISABLED', 'Google OAuth is not configured');
  const { credential } = req.body;

  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.google.clientId });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new ApiError(401, 'OAUTH_FAILED', 'Could not verify Google account');

  let user = await UserModel.findOne({ email: payload.email });
  if (!user) {
    user = await UserModel.create({
      name: payload.name ?? payload.email.split('@')[0],
      email: payload.email,
      provider: 'google',
      googleId: payload.sub,
      avatarUrl: payload.picture ?? '',
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    user.provider = 'google';
    await user.save();
  }

  const accessToken = await issueSession(res, { id: String(user._id), role: user.role });
  res.json({ data: { user: publicUser(user), accessToken } });
}

/** POST /auth/refresh — validates the refresh cookie, rotates it, returns a new access token. */
export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, 'NO_REFRESH', 'Missing refresh token');

  let sub: string;
  try {
    sub = verifyRefreshToken(token).sub;
  } catch {
    throw new ApiError(401, 'REFRESH_INVALID', 'Invalid refresh token');
  }

  const user = await UserModel.findById(sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash || !(await matchToken(token, user.refreshTokenHash))) {
    throw new ApiError(401, 'REFRESH_REVOKED', 'Refresh token has been revoked');
  }

  const accessToken = await issueSession(res, { id: String(user._id), role: user.role });
  res.json({ data: { user: publicUser(user), accessToken } });
}

/** POST /auth/logout — clears the cookie and invalidates the stored refresh hash. */
export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const { sub } = verifyRefreshToken(token);
      await UserModel.findByIdAndUpdate(sub, { refreshTokenHash: null });
    } catch {
      /* ignore — clearing anyway */
    }
  }
  res.clearCookie(REFRESH_COOKIE, { ...cookieOpts, maxAge: undefined });
  res.json({ data: { ok: true } });
}

/** GET /auth/me — current user (requires access token). */
export async function me(req: Request, res: Response) {
  const user = await UserModel.findById(req.user!.sub).lean();
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  res.json({ data: { user: publicUser(user) } });
}
