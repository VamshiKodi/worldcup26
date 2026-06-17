import { create } from 'zustand';
import type { MatchScore, MatchStatus } from '../lib/types';

/**
 * Live overrides pushed by the socket (Phase 9). Pages read these on top of their
 * REST-fetched matches so a row/score updates in place without a refetch.
 */
export interface LiveMatch {
  minute: number;
  score: MatchScore;
  status: MatchStatus;
}

interface LiveUpdate {
  matchId: string;
  minute: number;
  score: MatchScore;
  status: MatchStatus;
}

interface LiveState {
  live: Record<string, LiveMatch>;
  applyUpdate: (u: LiveUpdate) => void;
}

export const useLive = create<LiveState>((set) => ({
  live: {},
  applyUpdate: ({ matchId, minute, score, status }) =>
    set((s) => ({ live: { ...s.live, [matchId]: { minute, score, status } } })),
}));
