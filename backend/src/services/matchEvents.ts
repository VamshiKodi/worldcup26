import { PlayerModel } from '../models/index.js';

/**
 * Simulated match-event generation. The football-data.org free tier exposes final/half-time
 * scores but NOT goal scorers, cards or substitutions, so we synthesise a plausible timeline
 * from the scoreline and each team's real players (top scorers imported via `import:wc`). Events
 * are generated once and persisted, so they stay stable across reloads. Scorers fall back to the
 * team name when we have no players for that side (the frontend handles a missing playerId).
 */

export type SimEventType = 'goal' | 'penalty' | 'yellow' | 'red';

export interface SimEvent {
  minute: number;
  type: SimEventType;
  teamId: string;
  playerId?: string;
}

interface PoolPlayer {
  _id: string;
  position?: string;
  isTopScorer?: boolean;
  name?: string;
  photoUrl?: string;
}

async function loadPool(teamId: string): Promise<PoolPlayer[]> {
  const players = await PlayerModel.find({ teamId })
    .select('_id position isTopScorer name photoUrl')
    .lean();
  return players.map((p) => ({
    _id: String(p._id),
    position: p.position,
    isTopScorer: p.isTopScorer,
    name: p.name,
    photoUrl: p.photoUrl,
  }));
}

/** Weighted pick — forwards and known top scorers are likelier to be on the scoresheet. */
function pickScorer(pool: PoolPlayer[]): PoolPlayer | undefined {
  if (!pool.length) return undefined;
  const weighted: PoolPlayer[] = [];
  for (const p of pool) {
    let w = 1;
    if (p.position === 'FW') w += 3;
    else if (p.position === 'MF') w += 1;
    if (p.isTopScorer) w += 3;
    for (let i = 0; i < w; i++) weighted.push(p);
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function pickAny(pool: PoolPlayer[]): PoolPlayer | undefined {
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : undefined;
}

/** `n` distinct, sorted minutes in 3..88. */
function spreadMinutes(n: number): number[] {
  const mins = new Set<number>();
  let guard = 0;
  while (mins.size < n && guard++ < 500) mins.add(3 + Math.floor(Math.random() * 86));
  return [...mins].sort((a, b) => a - b);
}

/**
 * Full event list for a finished match: one event per goal (occasionally a penalty), plus a
 * couple of cards. Returns events sorted by minute, ready to store on `match.events`.
 */
export async function buildFinishedEvents(
  homeId: string,
  awayId: string,
  homeScore: number,
  awayScore: number,
): Promise<SimEvent[]> {
  const [home, away] = await Promise.all([loadPool(homeId), loadPool(awayId)]);
  const goals = Math.max(0, homeScore) + Math.max(0, awayScore);
  const cards = 1 + Math.floor(Math.random() * 3); // 1–3 cards
  const minutes = spreadMinutes(goals + cards);
  const goalMinutes = minutes.slice(0, goals);
  const cardMinutes = minutes.slice(goals);

  // One marker per goal, then shuffled so home/away goals interleave on the timeline.
  const sides: Array<'home' | 'away'> = [
    ...Array(Math.max(0, homeScore)).fill('home'),
    ...Array(Math.max(0, awayScore)).fill('away'),
  ];
  for (let i = sides.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sides[i], sides[j]] = [sides[j], sides[i]];
  }

  const events: SimEvent[] = [];
  goalMinutes.forEach((minute, i) => {
    const side = sides[i];
    const teamId = side === 'home' ? homeId : awayId;
    const scorer = pickScorer(side === 'home' ? home : away);
    const type: SimEventType = Math.random() < 0.15 ? 'penalty' : 'goal';
    events.push({ minute, type, teamId, playerId: scorer?._id });
  });
  cardMinutes.forEach((minute) => {
    const side = Math.random() < 0.5 ? 'home' : 'away';
    const teamId = side === 'home' ? homeId : awayId;
    const booked = pickAny(side === 'home' ? home : away);
    const type: SimEventType = Math.random() < 0.12 ? 'red' : 'yellow';
    events.push({ minute, type, teamId, playerId: booked?._id });
  });

  return events.sort((a, b) => a.minute - b.minute);
}

/**
 * One goal event for a team that just scored in a live match. Returns the stored event plus the
 * resolved player (so the live socket tick can show the scorer's name/photo without a re-fetch).
 */
export async function buildLiveGoal(
  teamId: string,
  minute: number,
): Promise<{ event: SimEvent; player: { _id: string; name: string; photoUrl?: string } | null }> {
  const pool = await loadPool(teamId);
  const scorer = pickScorer(pool);
  const type: SimEventType = Math.random() < 0.15 ? 'penalty' : 'goal';
  return {
    event: { minute, type, teamId, playerId: scorer?._id },
    player: scorer ? { _id: scorer._id, name: scorer.name ?? 'Scorer', photoUrl: scorer.photoUrl } : null,
  };
}
