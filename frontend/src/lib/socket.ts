// Socket.IO client — initialized lazily on pages that need realtime (Phase 5/6).
// Kept as a thin factory so the heavy dependency isn't pulled into the initial bundle.
export async function getSocket() {
  const { io } = await import('socket.io-client');
  const url = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';
  return io(url, { withCredentials: true, autoConnect: true });
}
