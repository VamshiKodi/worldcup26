/**
 * Shared API types — mirror the backend response envelopes (Phase 2 controllers).
 * List endpoints return `ListResponse<T>`; single-resource endpoints return `ItemResponse<T>`.
 */

export interface ListResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ItemResponse<T> {
  data: T;
}

export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
export type Position = 'GK' | 'DF' | 'MF' | 'FW';
export type Stage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';
export type MatchStatus = 'scheduled' | 'live' | 'finished';

/** A team reference as populated on other documents (subset of fields). */
export interface TeamRef {
  _id: string;
  name: string;
  code: string;
  flagUrl?: string;
  fifaRanking?: number;
}

export interface TeamStats {
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
}

export interface Team {
  _id: string;
  name: string;
  code: string;
  confederation: Confederation;
  flagUrl?: string;
  fifaRanking: number;
  groupId?: string | null;
  isHost: boolean;
  stats: TeamStats;
  form: string[];
}

export interface PlayerStats {
  goals: number;
  assists: number;
  xg: number;
  cleanSheets: number;
  minutes: number;
  appearances: number;
}

export interface Player {
  _id: string;
  name: string;
  teamId: TeamRef | string;
  position: Position;
  number?: number;
  photoUrl?: string;
  age?: number;
  club?: string;
  stats: PlayerStats;
  isTopScorer: boolean;
}

export interface MatchScore {
  home: number | null;
  away: number | null;
}

export type MatchEventType = 'goal' | 'own_goal' | 'penalty' | 'yellow' | 'red' | 'sub';

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  teamId?: string;
  playerId?: { _id: string; name: string } | string | null;
}

export interface Match {
  _id: string;
  stage: Stage;
  groupId?: string | null;
  homeTeamId: TeamRef;
  awayTeamId: TeamRef;
  venue?: string;
  city?: string;
  kickoff: string;
  status: MatchStatus;
  score: MatchScore;
  minute?: number;
  events?: MatchEvent[];
  round?: number;
  bracketSlot?: string | null;
}

export interface StandingRow {
  teamId: TeamRef;
  played: number;
  points: number;
  gf: number;
  ga: number;
  gd: number;
  rank: number;
}

export interface Group {
  _id: string;
  name: string;
  teamIds: TeamRef[];
  standings: StandingRow[];
}

export interface LeaderboardEntry {
  rank: number;
  _id: string;
  name: string;
  avatarUrl?: string;
  score: number;
  accuracy: number;
  badges: string[];
}

export interface TournamentStats {
  teams: number;
  matches: number;
  matchesPlayed: number;
  goals: number;
  players: number;
  users: number;
  predictions: number;
  stadiums: number;
  hostCountries: number;
}

/** Narrow a possibly-populated team ref to an object (false when only an id string). */
export function isTeamRef(t: TeamRef | string | undefined | null): t is TeamRef {
  return !!t && typeof t === 'object';
}

// ── Predictions (Phase 6) ───────────────────────────────────────────────

export type PredictionType = 'match' | 'group' | 'bracket' | 'winner';
export type Outcome = 'H' | 'D' | 'A';

export interface MatchPick {
  outcome: Outcome | null;
  homeScore: number | null;
  awayScore: number | null;
}

export interface GroupRank {
  teamId: string;
  rank: number;
}

/** A populated match as embedded in a user's prediction list. */
export interface PredictionMatch {
  _id: string;
  stage: Stage;
  kickoff: string;
  status: MatchStatus;
  score: MatchScore;
  minute?: number;
  homeTeamId: TeamRef;
  awayTeamId: TeamRef;
}

export interface Prediction {
  _id: string;
  userId: string;
  type: PredictionType;
  matchId: PredictionMatch | string | null;
  groupId: { _id: string; name: string } | string | null;
  winnerTeamId: TeamRef | string | null;
  pick: MatchPick;
  groupPrediction: GroupRank[];
  points: number;
  settled: boolean;
  updatedAt: string;
}

// ── AI Lab ──────────────────────────────────────────────────────────────

export interface AiTeamCard {
  id: string;
  name: string;
  code: string;
  flagUrl: string;
  fifaRanking: number;
  rating: number;
  form: string[];
}

export interface AiMatchPrediction {
  matchId: string;
  stage: Stage;
  neutral: boolean;
  home: AiTeamCard;
  away: AiTeamCard;
  probabilities: { home: number; draw: number; away: number };
  likelyScore: { home: number; away: number };
  expectedGoals: { home: number; away: number };
}

export interface ChampionshipOdd extends AiTeamCard {
  probability: number;
}

// ── Simulator ───────────────────────────────────────────────────────────

export interface SimTeamResult {
  id: string;
  name: string;
  code: string;
  flagUrl: string;
  rating: number;
  reachR16: number;
  reachQF: number;
  reachSF: number;
  reachFinal: number;
  win: number;
}

export interface SimulationResult {
  runs: number;
  teams: SimTeamResult[];
}

// ── Admin (Phase 7) ─────────────────────────────────────────────────────

export interface AdminAnalytics {
  totals: {
    users: number;
    teams: number;
    players: number;
    matches: number;
    predictions: number;
    comments: number;
  };
  predictionsByType: Array<{ _id: string; count: number }>;
  settlement: { settled: number; pending: number };
  matchStatus: Array<{ _id: string; count: number }>;
  signups: Array<{ _id: string; count: number }>;
  topPredictors: Array<{ _id: string; name: string; avatarUrl?: string; score: number; accuracy: number }>;
}

export interface AdminComment {
  _id: string;
  body: string;
  status: 'visible' | 'flagged' | 'removed';
  targetType: string;
  userId: { _id: string; name: string; avatarUrl?: string } | string;
  createdAt: string;
}
