import bcrypt from 'bcryptjs';

const ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Hash a refresh token before storing (so a DB leak doesn't expose live tokens). */
export function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export function matchToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
