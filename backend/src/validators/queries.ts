import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const idParam = z.object({ id: objectId });
export const groupIdParam = z.object({ groupId: objectId });

export const teamQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  confederation: z.enum(['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC']).optional(),
  group: objectId.optional(),
  search: z.string().max(50).optional(),
});

export const playerQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  team: objectId.optional(),
  position: z.enum(['GK', 'DF', 'MF', 'FW']).optional(),
  sort: z.enum(['goals', 'assists', 'xg', 'cleanSheets']).default('goals'),
  search: z.string().max(50).optional(),
});

export const matchQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  // 2026 has 104 fixtures; cap must allow fetching the full schedule in one page.
  limit: z.coerce.number().int().min(1).max(150).default(20),
  stage: z.enum(['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final']).optional(),
  group: objectId.optional(),
  status: z.enum(['scheduled', 'live', 'finished']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const leaderboardQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
