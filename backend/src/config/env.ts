import dotenv from 'dotenv';
dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/worldcup26'),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  },
  live: {
    enabled: process.env.LIVE_ENGINE !== 'off', // on by default
    tickMs: Number(process.env.LIVE_TICK_MS ?? 5000), // real ms per match-minute
    maxConcurrent: Number(process.env.LIVE_MAX ?? 8),
    autoKickoff: process.env.LIVE_AUTOKICKOFF === 'on', // promote scheduled→live at kickoff
  },
  // Real World Cup data via football-data.org. When `token` is set the app imports/syncs real
  // fixtures, scores, standings and scorers instead of the simulated engine. Free tier covers
  // the World Cup as competition `WC` (delayed live scores).
  footballData: {
    token: process.env.FOOTBALL_DATA_TOKEN ?? '',
    baseUrl: process.env.FOOTBALL_DATA_URL ?? 'https://api.football-data.org/v4',
    competition: process.env.FOOTBALL_DATA_COMPETITION ?? 'WC', // World Cup
    livePollMs: Number(process.env.FOOTBALL_DATA_POLL_MS ?? 60_000), // live sync cadence (≥30s enforced)
    resultPollMs: Number(process.env.FOOTBALL_DATA_RESULT_POLL_MS ?? 300_000), // finished-result reconcile cadence (≥60s enforced)
  },
} as const;

export const hasRealData = env.footballData.token.length > 0;
