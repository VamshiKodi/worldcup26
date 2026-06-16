import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const score = z.coerce.number().int().min(0).max(30);

export const matchPredictionBody = z
  .object({
    matchId: objectId,
    outcome: z.enum(['H', 'D', 'A']).optional(),
    homeScore: score.optional(),
    awayScore: score.optional(),
  })
  .refine((b) => b.outcome != null || (b.homeScore != null && b.awayScore != null), {
    message: 'Provide an outcome or a full scoreline',
  });

export const winnerBody = z.object({ teamId: objectId });

export const groupParam = z.object({ groupId: objectId });
export const groupPredictionBody = z.object({
  ranking: z.array(objectId).min(2).max(4),
});

export const bracketBody = z.object({
  qf: z.array(objectId).max(8).optional(),
  sf: z.array(objectId).max(4).optional(),
  final: z.array(objectId).max(2).optional(),
  champion: objectId.nullish(),
  runnerUp: objectId.nullish(),
});

export const idParam = z.object({ id: objectId });
export const matchIdParam = z.object({ matchId: objectId });

export const simulateBody = z.object({
  runs: z.coerce.number().int().min(100).max(2000).default(1000),
});

export const championshipQuery = z.object({
  limit: z.coerce.number().int().min(1).max(48).default(16),
});
