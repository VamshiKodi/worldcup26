import { z } from 'zod';

export const registerBody = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const googleBody = z.object({
  credential: z.string().min(10), // Google ID token (JWT) from GIS
});
