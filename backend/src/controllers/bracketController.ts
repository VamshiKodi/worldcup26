import type { Request, Response } from 'express';
import { BracketModel } from '../models/index.js';
import { ApiError } from '../middleware/error.js';

const uid = (req: Request) => req.user!.sub;
const teamFields = 'name code flagUrl';

function slots(ids?: (string | null)[] | null, prefix = 'S') {
  return (ids ?? []).map((teamId, i) => ({ slot: `${prefix}-${i + 1}`, teamId: teamId ?? null }));
}

/** GET /brackets/me — the current user's knockout bracket (populated). */
export async function getMyBracket(req: Request, res: Response) {
  const bracket = await BracketModel.findOne({ userId: uid(req) })
    .populate('rounds.qf.teamId', teamFields)
    .populate('rounds.sf.teamId', teamFields)
    .populate('rounds.final.teamId', teamFields)
    .populate('champion', teamFields)
    .populate('runnerUp', teamFields)
    .lean();

  res.json({ data: bracket });
}

/** PUT /brackets/me — create or replace the bracket (rejected once locked). */
export async function upsertMyBracket(req: Request, res: Response) {
  const userId = uid(req);
  const { qf, sf, final, champion, runnerUp } = req.body;

  const existing = await BracketModel.findOne({ userId }).select('locked').lean();
  if (existing?.locked) {
    throw new ApiError(409, 'BRACKET_LOCKED', 'The bracket is locked now the knockouts have begun');
  }

  const bracket = await BracketModel.findOneAndUpdate(
    { userId },
    {
      userId,
      rounds: {
        r32: [],
        r16: [],
        qf: slots(qf, 'QF'),
        sf: slots(sf, 'SF'),
        final: slots(final, 'F'),
      },
      champion: champion ?? null,
      runnerUp: runnerUp ?? null,
      points: 0,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  res.json({ data: bracket });
}
