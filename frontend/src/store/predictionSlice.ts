import { create } from 'zustand';
import { api } from '../lib/api';
import { isTeamRef, type MatchPick, type Prediction, type PredictionMatch, type TeamRef } from '../lib/types';

interface StoredPick {
  id: string;
  outcome: MatchPick['outcome'];
  homeScore: number | null;
  awayScore: number | null;
  points: number;
  settled: boolean;
}

interface PredictionState {
  matchPicks: Record<string, StoredPick>;
  winnerTeamId: string | null;
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  saveMatch: (matchId: string, pick: MatchPick) => Promise<void>;
  saveWinner: (teamId: string) => Promise<void>;
}

/** Build the request body, omitting null fields so the validator's refine passes. */
function matchBody(matchId: string, pick: MatchPick) {
  const body: Record<string, unknown> = { matchId };
  if (pick.outcome) body.outcome = pick.outcome;
  if (pick.homeScore != null && pick.awayScore != null) {
    body.homeScore = pick.homeScore;
    body.awayScore = pick.awayScore;
  }
  return body;
}

export const usePredictions = create<PredictionState>((set, get) => ({
  matchPicks: {},
  winnerTeamId: null,
  loaded: false,
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get<{ data: Prediction[] }>('/predictions/me');
      const matchPicks: Record<string, StoredPick> = {};
      let winnerTeamId: string | null = null;

      for (const p of data.data) {
        if (p.type === 'match' && p.matchId) {
          const mid = typeof p.matchId === 'string' ? p.matchId : (p.matchId as PredictionMatch)._id;
          matchPicks[mid] = {
            id: p._id,
            outcome: p.pick.outcome,
            homeScore: p.pick.homeScore,
            awayScore: p.pick.awayScore,
            points: p.points,
            settled: p.settled,
          };
        } else if (p.type === 'winner' && p.winnerTeamId) {
          winnerTeamId = isTeamRef(p.winnerTeamId as TeamRef) ? (p.winnerTeamId as TeamRef)._id : (p.winnerTeamId as string);
        }
      }
      set({ matchPicks, winnerTeamId, loaded: true, loading: false });
    } catch {
      set({ loaded: true, loading: false });
    }
  },

  saveMatch: async (matchId, pick) => {
    const prev = get().matchPicks;
    // Optimistic update.
    set({
      matchPicks: {
        ...prev,
        [matchId]: { id: prev[matchId]?.id ?? 'pending', ...pick, points: 0, settled: false },
      },
    });
    try {
      const { data } = await api.post('/predictions/match', matchBody(matchId, pick));
      const saved = data.data;
      set((s) => ({
        matchPicks: {
          ...s.matchPicks,
          [matchId]: {
            id: saved._id,
            outcome: saved.pick.outcome,
            homeScore: saved.pick.homeScore,
            awayScore: saved.pick.awayScore,
            points: 0,
            settled: false,
          },
        },
      }));
    } catch (err) {
      set({ matchPicks: prev }); // rollback
      throw err;
    }
  },

  saveWinner: async (teamId) => {
    const prev = get().winnerTeamId;
    set({ winnerTeamId: teamId });
    try {
      await api.post('/predictions/winner', { teamId });
    } catch (err) {
      set({ winnerTeamId: prev });
      throw err;
    }
  },
}));
