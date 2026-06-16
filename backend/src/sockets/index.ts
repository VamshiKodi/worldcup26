import type { Server as SocketServer } from 'socket.io';

/**
 * Realtime channels. Expanded in later phases:
 *  - match:{id}        live score & events
 *  - leaderboard:global
 */
export function registerSocketHandlers(io: SocketServer): void {
  io.on('connection', (socket) => {
    socket.on('join', (room: string) => socket.join(room));
    socket.on('leave', (room: string) => socket.leave(room));
  });
}
