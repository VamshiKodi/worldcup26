import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '../lib/socket';
import { useLive } from '../store/liveSlice';
import { pushToast } from '../lib/toast';
import type { MatchScore, MatchStatus } from '../lib/types';

interface MatchesUpdate {
  matchId: string;
  minute: number;
  score: MatchScore;
  status: MatchStatus;
  teams?: { home: { name: string; code: string }; away: { name: string; code: string } };
  scoredSide?: 'home' | 'away';
}

/**
 * Global live layer (Phase 9). Mounted once at the root. Subscribes to the `matches:live`
 * channel, mirrors every update into the live store (so any page reflects it in place), and
 * fires a toast on goals / full time. socket.io-client stays lazy so it's out of the initial bundle.
 */
export function LiveProvider({ children }: { children: React.ReactNode }) {
  const applyUpdate = useLive((s) => s.applyUpdate);

  useEffect(() => {
    let socket: Socket | undefined;
    let disposed = false;

    void getSocket().then((s) => {
      if (disposed) {
        s.disconnect();
        return;
      }
      socket = s;
      s.emit('join', 'matches:live');

      s.on('matches:update', (u: MatchesUpdate) => {
        applyUpdate({ matchId: u.matchId, minute: u.minute, score: u.score, status: u.status });

        if (u.scoredSide && u.teams) {
          const scorer = u.teams[u.scoredSide];
          pushToast({
            tone: 'goal',
            title: `GOAL! ${scorer.name}`,
            detail: `${u.teams.home.code} ${u.score.home}–${u.score.away} ${u.teams.away.code} · ${u.minute}'`,
          });
        } else if (u.status === 'finished' && u.teams) {
          pushToast({
            tone: 'success',
            title: 'Full time',
            detail: `${u.teams.home.name} ${u.score.home}–${u.score.away} ${u.teams.away.name}`,
          });
        }
      });
    });

    return () => {
      disposed = true;
      if (socket) {
        socket.emit('leave', 'matches:live');
        socket.off('matches:update');
        socket.disconnect();
      }
    };
  }, [applyUpdate]);

  return <>{children}</>;
}
