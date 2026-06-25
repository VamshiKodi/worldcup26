import { env } from '../config/env.js';

/**
 * Thin client for the football-data.org v4 API. Auth is the `X-Auth-Token` header
 * (free token from https://www.football-data.org/client/register). Every endpoint returns a
 * plain JSON object; we surface it as-is and throw on transport / quota errors so callers fail
 * loudly. The free tier covers the World Cup (competition code `WC`) with delayed live scores.
 *
 * Docs: https://docs.football-data.org/general/v4/
 */

const COMP = env.footballData.competition; // 'WC'

class FootballDataError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'FootballDataError';
  }
}

/** True when the API rejected the call because the resource isn't on the free tier. */
export function isRestricted(err: unknown): boolean {
  return err instanceof FootballDataError && err.status === 403;
}

async function fd<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  if (!env.footballData.token) {
    throw new FootballDataError('FOOTBALL_DATA_TOKEN is not set — cannot call football-data.org.');
  }
  const url = new URL(path.replace(/^\//, ''), env.footballData.baseUrl.replace(/\/?$/, '/'));
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url, { headers: { 'X-Auth-Token': env.footballData.token } });
  if (res.status === 429) throw new FootballDataError('football-data.org rate limit reached (HTTP 429).', 429);
  if (res.status === 403) throw new FootballDataError(`football-data.org ${path}: restricted on this plan (HTTP 403).`, 403);
  if (!res.ok) throw new FootballDataError(`football-data.org ${path} failed: HTTP ${res.status}`, res.status);

  return (await res.json()) as T;
}

// ── Shared shapes ────────────────────────────────────────────────────────────

export interface FDTeamRef {
  id: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
}

// ── Teams ─────────────────────────────────────────────────────────────────────

export interface FDTeam extends FDTeamRef {
  area: { name: string };
}
export function getTeams(): Promise<{ teams: FDTeam[] }> {
  return fd(`competitions/${COMP}/teams`);
}

// ── Standings ───────────────────────────────────────────────────────────────

export interface FDStandingRow {
  position: number;
  team: FDTeamRef;
  playedGames: number;
  form: string | null; // e.g. 'W,D,L,W,W'
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}
export interface FDStandingTable {
  stage: string;
  type: 'TOTAL' | 'HOME' | 'AWAY';
  group: string | null; // 'GROUP_A'
  table: FDStandingRow[];
}
export function getStandings(): Promise<{ standings: FDStandingTable[] }> {
  return fd(`competitions/${COMP}/standings`);
}

// ── Matches ───────────────────────────────────────────────────────────────────

export interface FDMatch {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | …
  stage: string; // GROUP_STAGE | LAST_16 | …
  group: string | null; // 'GROUP_A'
  matchday: number | null;
  minute?: number | null;
  venue?: string | null;
  homeTeam: FDTeamRef;
  awayTeam: FDTeamRef;
  score: { fullTime: { home: number | null; away: number | null } };
}
export function getMatches(): Promise<{ matches: FDMatch[] }> {
  return fd(`competitions/${COMP}/matches`);
}
/** Live = IN_PLAY + PAUSED, per the API's convenience pseudo-status. */
export function getLiveMatches(): Promise<{ matches: FDMatch[] }> {
  return fd(`competitions/${COMP}/matches`, { status: 'LIVE' });
}

// ── Scorers (real players on the free tier; full squads are not) ──────────────

export interface FDScorer {
  player: {
    id: number;
    name: string;
    position: string | null; // 'Goalkeeper' | 'Defence' | 'Midfield' | 'Offence'
    shirtNumber: number | null;
    dateOfBirth: string | null;
  };
  team: FDTeamRef;
  playedMatches: number | null;
  goals: number | null;
  assists: number | null;
}
export function getScorers(limit = 100): Promise<{ scorers: FDScorer[] }> {
  return fd(`competitions/${COMP}/scorers`, { limit });
}
