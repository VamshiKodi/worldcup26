import type { Server as SocketServer } from 'socket.io';

/**
 * Realtime channels:
 *  - `match:{id}`     live score & events — `match:tick`, `match:final` (live engine, Phase 9)
 *  - `matches:live`   compact fixtures-list updates — `matches:update`
 *  - `leaderboard:global` (reserved)
 *
 * Clients subscribe by emitting `join`/`leave` with the room name; the live engine
 * (see services/liveEngine.ts) is the only emitter.
 */
export function registerSocketHandlers(io: SocketServer): void {
  io.on('connection', (socket) => {
    socket.on('join', (room: string) => socket.join(room));
    socket.on('leave', (room: string) => socket.leave(room));
  });
}
