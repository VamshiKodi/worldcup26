import type { Server as SocketServer } from 'socket.io';
import { MatchModel } from '../models/index.js';
import { env } from '../config/env.js';
import { referenceCache } from '../utils/cache.js';
import { ratingOf, expectedGoals } from './strength.js';
import { recomputeGroupStandings } from './standingsService.js';
import { settleMatch } from './scoringService.js';

/**
 * Live match engine — a single-process, in-memory ticker that auto-advances any match in
 * `status: 'live'` minute-by-minute, scoring strength-weighted goals and emitting realtime
 * updates over Socket.io. At full time it reuses the same settlement path as admin score entry
 * (recompute standings + settle predictions + bust the reference cache).
 *
 * Channels:
 *  - `match:{id}`     → `match:tick` (per-minute), `match:final` (full time)
 *  - `matches:live`   → `matches:update` (compact, for the fixtures list)
 *
 * Horizontal scaling would need a shared scheduler + Socket.io Redis adapter — out of scope.
 */

const FULL_TIME = 90;
// Only auto-promote scheduled matches that kicked off within this window, so a seed full of
// past-dated fixtures doesn't all stampede to "live" at once.
const KICKOFF_WINDOW_MS = 3 * 60 * 60 * 1000;

interface LiveState {
  minute: number;
}

interface TickPayload {
  matchId: string;
  minute: number;
  score: { home: number | null; away: number | null };
  status: 'live' | 'finished';
  event?: { minute: number; type: string; teamId: string };
}

/** Per-minute goal probability for one side, derived from its expected goals over 90'. */
function goalChancePerMinute(xg: number): number {
  return Math.max(0, xg) / FULL_TIME;
}

export function startLiveEngine(io: SocketServer): () => void {
  const driven = new Map<string, LiveState>();

  // Resume any matches already live (e.g. after a restart), seeded from their persisted minute.
  void MatchModel.find({ status: 'live' })
    .select('_id minute')
    .lean()
    .then((rows) => {
      for (const m of rows) driven.set(String(m._id), { minute: m.minute ?? 0 });
    })
    .catch((err) => console.error('[liveEngine] resume failed:', err));

  async function promoteDue(): Promise<void> {
    if (!env.live.autoKickoff) return;
    const slots = env.live.maxConcurrent - driven.size;
    if (slots <= 0) return;
    const now = Date.now();
    const due = await MatchModel.find({
      status: 'scheduled',
      kickoff: { $lte: new Date(now), $gte: new Date(now - KICKOFF_WINDOW_MS) },
    })
      .sort({ kickoff: 1 })
      .limit(slots)
      .select('_id')
      .lean();
    for (const m of due) {
      const id = String(m._id);
      if (driven.has(id)) continue;
      await MatchModel.updateOne({ _id: id }, { status: 'live', minute: 0 });
      driven.set(id, { minute: 0 });
      io.to('matches:live').emit('matches:update', {
        matchId: id,
        minute: 0,
        score: { home: 0, away: 0 },
        status: 'live',
      });
    }
  }

  async function advance(matchId: string, state: LiveState): Promise<void> {
    const match = await MatchModel.findById(matchId)
      .populate('homeTeamId', 'name code fifaRanking form')
      .populate('awayTeamId', 'name code fifaRanking form');
    // If the match vanished or was moved off "live" out-of-band, stop driving it.
    // Knockout placeholders (TBD teams) can't be simulated — skip until both sides are set.
    if (!match || match.status !== 'live' || !match.homeTeamId || !match.awayTeamId) {
      driven.delete(matchId);
      return;
    }

    state.minute += 1;
    match.minute = state.minute;
    if (!match.score) match.score = { home: 0, away: 0 };
    const score = match.score;
    if (score.home == null) score.home = 0;
    if (score.away == null) score.away = 0;

    // Roll at most one goal per tick, weighted by each side's strength.
    const home = match.homeTeamId as unknown as { name?: string; code?: string; fifaRanking?: number; form?: string[] };
    const away = match.awayTeamId as unknown as { name?: string; code?: string; fifaRanking?: number; form?: string[] };
    const xg = expectedGoals(ratingOf(home), ratingOf(away)); // neutral venue
    const pHome = goalChancePerMinute(xg.home);
    const pAway = goalChancePerMinute(xg.away);

    let event: TickPayload['event'];
    let scoredSide: 'home' | 'away' | undefined;
    const roll = Math.random();
    if (roll < pHome) {
      score.home += 1;
      scoredSide = 'home';
      match.events.push({ minute: state.minute, type: 'goal', teamId: match.homeTeamId._id });
      event = { minute: state.minute, type: 'goal', teamId: String(match.homeTeamId._id) };
    } else if (roll < pHome + pAway) {
      score.away += 1;
      scoredSide = 'away';
      match.events.push({ minute: state.minute, type: 'goal', teamId: match.awayTeamId._id });
      event = { minute: state.minute, type: 'goal', teamId: String(match.awayTeamId._id) };
    }

    const reachedFullTime = state.minute >= FULL_TIME;
    if (reachedFullTime) match.status = 'finished';
    await match.save();

    const tickScore = { home: score.home, away: score.away };
    const teams = {
      home: { name: home.name ?? 'Home', code: home.code ?? '?' },
      away: { name: away.name ?? 'Away', code: away.code ?? '?' },
    };

    io.to(`match:${matchId}`).emit('match:tick', {
      matchId,
      minute: state.minute,
      score: tickScore,
      status: match.status,
      event,
    } satisfies TickPayload);
    io.to('matches:live').emit('matches:update', {
      matchId,
      minute: state.minute,
      score: tickScore,
      status: match.status,
      teams,
      scoredSide,
    });

    if (reachedFullTime) {
      driven.delete(matchId);
      // Same settlement path as admin score entry.
      if (match.groupId) await recomputeGroupStandings(String(match.groupId));
      const { settled } = await settleMatch(matchId);
      referenceCache.clear();
      io.to(`match:${matchId}`).emit('match:final', { matchId, score: tickScore, settled });
      io.to('matches:live').emit('matches:update', {
        matchId,
        minute: state.minute,
        score: tickScore,
        status: 'finished',
        teams,
      });
    }
  }

  async function tick(): Promise<void> {
    try {
      await promoteDue();
    } catch (err) {
      console.error('[liveEngine] promote error:', err);
    }
    // Snapshot so deletions during iteration are safe.
    for (const [matchId, state] of [...driven]) {
      try {
        await advance(matchId, state);
      } catch (err) {
        console.error(`[liveEngine] advance error for ${matchId}:`, err);
      }
    }
  }

  const interval = setInterval(() => void tick(), env.live.tickMs);
  interval.unref?.();
  console.log(`⚽ Live engine started (tick ${env.live.tickMs}ms, autoKickoff ${env.live.autoKickoff})`);

  return () => clearInterval(interval);
}
