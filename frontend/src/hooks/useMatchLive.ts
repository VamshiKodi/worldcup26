import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '../lib/socket';
import type { Match, MatchEvent, MatchScore, MatchStatus } from '../lib/types';

interface MatchTick {
  matchId: string;
  minute: number;
  score: MatchScore;
  status: MatchStatus;
  event?: MatchEvent;
}

export interface LiveOverlay {
  minute: number;
  score: MatchScore;
  status: MatchStatus;
  events: MatchEvent[];
}

/**
 * Per-match live overlay (Phase 9). Joins the `match:{id}` room and merges incoming ticks over
 * the REST-fetched base match. Returns null until the first tick (callers fall back to the base).
 */
export function useMatchLive(matchId: string | undefined, base: Match | null): LiveOverlay | null {
  const [overlay, setOverlay] = useState<LiveOverlay | null>(null);

  // Reset when navigating between matches.
  useEffect(() => setOverlay(null), [matchId]);

  useEffect(() => {
    if (!matchId) return;
    let socket: Socket | undefined;
    let disposed = false;
    const room = `match:${matchId}`;

    void getSocket().then((s) => {
      if (disposed) {
        s.disconnect();
        return;
      }
      socket = s;
      s.emit('join', room);

      s.on('match:tick', (t: MatchTick) => {
        if (t.matchId !== matchId) return;
        setOverlay((prev) => {
          const events = prev?.events ?? base?.events ?? [];
          return {
            minute: t.minute,
            score: t.score,
            status: t.status,
            events: t.event ? [...events, t.event] : events,
          };
        });
      });

      s.on('match:final', (f: { matchId: string; score: MatchScore }) => {
        if (f.matchId !== matchId) return;
        setOverlay((prev) =>
          prev ? { ...prev, score: f.score, status: 'finished' } : prev,
        );
      });
    });

    return () => {
      disposed = true;
      if (socket) {
        socket.emit('leave', room);
        socket.off('match:tick');
        socket.off('match:final');
        socket.disconnect();
      }
    };
    // base.events is only used to seed the first tick; intentionally not a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  return overlay;
}
