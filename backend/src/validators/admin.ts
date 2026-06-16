import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const confederation = z.enum(['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC']);
const position = z.enum(['GK', 'DF', 'MF', 'FW']);
const stage = z.enum(['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final']);
const status = z.enum(['scheduled', 'live', 'finished']);

export const idParam = z.object({ id: objectId });

// ── Teams ──
export const teamCreateBody = z.object({
  name: z.string().min(2).max(60),
  code: z.string().length(3),
  confederation,
  fifaRanking: z.coerce.number().int().min(0).max(250).default(0),
  flagUrl: z.string().url().optional(),
  groupId: objectId.nullish(),
  isHost: z.coerce.boolean().optional(),
});
export const teamUpdateBody = teamCreateBody.partial();

// ── Players ──
const playerStats = z
  .object({
    goals: z.coerce.number().int().min(0),
    assists: z.coerce.number().int().min(0),
    xg: z.coerce.number().min(0),
    cleanSheets: z.coerce.number().int().min(0),
    minutes: z.coerce.number().int().min(0),
    appearances: z.coerce.number().int().min(0),
  })
  .partial();

export const playerCreateBody = z.object({
  name: z.string().min(2).max(60),
  teamId: objectId,
  position,
  number: z.coerce.number().int().min(1).max(99).optional(),
  club: z.string().max(60).optional(),
  age: z.coerce.number().int().min(15).max(50).optional(),
  photoUrl: z.string().url().optional(),
  stats: playerStats.optional(),
});
export const playerUpdateBody = playerCreateBody.partial();

// ── Matches ──
const score = z.object({
  home: z.coerce.number().int().min(0).max(30).nullable(),
  away: z.coerce.number().int().min(0).max(30).nullable(),
});

export const matchCreateBody = z.object({
  stage,
  homeTeamId: objectId,
  awayTeamId: objectId,
  kickoff: z.coerce.date(),
  groupId: objectId.nullish(),
  venue: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  round: z.coerce.number().int().min(1).max(7).optional(),
  status: status.optional(),
});
export const matchUpdateBody = z
  .object({
    stage,
    homeTeamId: objectId,
    awayTeamId: objectId,
    kickoff: z.coerce.date(),
    groupId: objectId.nullable(),
    venue: z.string().max(80),
    city: z.string().max(80),
    round: z.coerce.number().int().min(1).max(7),
    status,
    score,
  })
  .partial();

// ── Moderation ──
export const commentStatusBody = z.object({
  status: z.enum(['visible', 'flagged', 'removed']),
});
export const commentListQuery = z.object({
  status: z.enum(['visible', 'flagged', 'removed']).optional(),
});
