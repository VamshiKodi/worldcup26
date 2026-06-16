/**
 * Static seed data for the 2026 format (48 teams / 12 groups of 4).
 * Team selection/rankings are representative for development, not official.
 */

export interface SeedTeam {
  name: string;
  code: string;
  confederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
  fifaRanking: number;
  isHost?: boolean;
  group: string; // 'A'..'L'
}

// 12 groups (A–L), 4 teams each.
export const SEED_TEAMS: SeedTeam[] = [
  // Group A
  { name: 'Mexico', code: 'MEX', confederation: 'CONCACAF', fifaRanking: 15, isHost: true, group: 'A' },
  { name: 'Croatia', code: 'CRO', confederation: 'UEFA', fifaRanking: 10, group: 'A' },
  { name: 'Ecuador', code: 'ECU', confederation: 'CONMEBOL', fifaRanking: 31, group: 'A' },
  { name: 'Ghana', code: 'GHA', confederation: 'CAF', fifaRanking: 68, group: 'A' },
  // Group B
  { name: 'Canada', code: 'CAN', confederation: 'CONCACAF', fifaRanking: 48, isHost: true, group: 'B' },
  { name: 'Belgium', code: 'BEL', confederation: 'UEFA', fifaRanking: 6, group: 'B' },
  { name: 'Japan', code: 'JPN', confederation: 'AFC', fifaRanking: 18, group: 'B' },
  { name: 'Morocco', code: 'MAR', confederation: 'CAF', fifaRanking: 13, group: 'B' },
  // Group C
  { name: 'United States', code: 'USA', confederation: 'CONCACAF', fifaRanking: 11, isHost: true, group: 'C' },
  { name: 'England', code: 'ENG', confederation: 'UEFA', fifaRanking: 4, group: 'C' },
  { name: 'Senegal', code: 'SEN', confederation: 'CAF', fifaRanking: 17, group: 'C' },
  { name: 'South Korea', code: 'KOR', confederation: 'AFC', fifaRanking: 23, group: 'C' },
  // Group D
  { name: 'Argentina', code: 'ARG', confederation: 'CONMEBOL', fifaRanking: 1, group: 'D' },
  { name: 'Poland', code: 'POL', confederation: 'UEFA', fifaRanking: 28, group: 'D' },
  { name: 'Australia', code: 'AUS', confederation: 'AFC', fifaRanking: 24, group: 'D' },
  { name: 'Nigeria', code: 'NGA', confederation: 'CAF', fifaRanking: 38, group: 'D' },
  // Group E
  { name: 'France', code: 'FRA', confederation: 'UEFA', fifaRanking: 2, group: 'E' },
  { name: 'Uruguay', code: 'URU', confederation: 'CONMEBOL', fifaRanking: 16, group: 'E' },
  { name: 'Iran', code: 'IRN', confederation: 'AFC', fifaRanking: 20, group: 'E' },
  { name: 'Egypt', code: 'EGY', confederation: 'CAF', fifaRanking: 36, group: 'E' },
  // Group F
  { name: 'Brazil', code: 'BRA', confederation: 'CONMEBOL', fifaRanking: 5, group: 'F' },
  { name: 'Netherlands', code: 'NED', confederation: 'UEFA', fifaRanking: 7, group: 'F' },
  { name: 'Saudi Arabia', code: 'KSA', confederation: 'AFC', fifaRanking: 56, group: 'F' },
  { name: 'Ivory Coast', code: 'CIV', confederation: 'CAF', fifaRanking: 40, group: 'F' },
  // Group G
  { name: 'Portugal', code: 'POR', confederation: 'UEFA', fifaRanking: 3, group: 'G' },
  { name: 'Colombia', code: 'COL', confederation: 'CONMEBOL', fifaRanking: 12, group: 'G' },
  { name: 'Qatar', code: 'QAT', confederation: 'AFC', fifaRanking: 35, group: 'G' },
  { name: 'Cameroon', code: 'CMR', confederation: 'CAF', fifaRanking: 42, group: 'G' },
  // Group H
  { name: 'Spain', code: 'ESP', confederation: 'UEFA', fifaRanking: 8, group: 'H' },
  { name: 'Peru', code: 'PER', confederation: 'CONMEBOL', fifaRanking: 33, group: 'H' },
  { name: 'Costa Rica', code: 'CRC', confederation: 'CONCACAF', fifaRanking: 52, group: 'H' },
  { name: 'Tunisia', code: 'TUN', confederation: 'CAF', fifaRanking: 41, group: 'H' },
  // Group I
  { name: 'Germany', code: 'GER', confederation: 'UEFA', fifaRanking: 9, group: 'I' },
  { name: 'Paraguay', code: 'PAR', confederation: 'CONMEBOL', fifaRanking: 54, group: 'I' },
  { name: 'Panama', code: 'PAN', confederation: 'CONCACAF', fifaRanking: 44, group: 'I' },
  { name: 'Algeria', code: 'ALG', confederation: 'CAF', fifaRanking: 43, group: 'I' },
  // Group J
  { name: 'Italy', code: 'ITA', confederation: 'UEFA', fifaRanking: 14, group: 'J' },
  { name: 'Switzerland', code: 'SUI', confederation: 'UEFA', fifaRanking: 19, group: 'J' },
  { name: 'New Zealand', code: 'NZL', confederation: 'OFC', fifaRanking: 95, group: 'J' },
  { name: 'Jamaica', code: 'JAM', confederation: 'CONCACAF', fifaRanking: 55, group: 'J' },
  // Group K
  { name: 'Denmark', code: 'DEN', confederation: 'UEFA', fifaRanking: 21, group: 'K' },
  { name: 'Chile', code: 'CHI', confederation: 'CONMEBOL', fifaRanking: 39, group: 'K' },
  { name: 'United Arab Emirates', code: 'UAE', confederation: 'AFC', fifaRanking: 64, group: 'K' },
  { name: 'South Africa', code: 'RSA', confederation: 'CAF', fifaRanking: 58, group: 'K' },
  // Group L
  { name: 'Austria', code: 'AUT', confederation: 'UEFA', fifaRanking: 22, group: 'L' },
  { name: 'Serbia', code: 'SRB', confederation: 'UEFA', fifaRanking: 27, group: 'L' },
  { name: 'Honduras', code: 'HON', confederation: 'CONCACAF', fifaRanking: 71, group: 'L' },
  { name: 'Mali', code: 'MLI', confederation: 'CAF', fifaRanking: 49, group: 'L' },
];

export const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// A few marquee players for the showcase / golden-boot race.
export const SEED_PLAYERS = [
  { name: 'Lionel Messi', code: 'ARG', position: 'FW', number: 10, club: 'Inter Miami', age: 38, goals: 4, assists: 3, xg: 3.6 },
  { name: 'Kylian Mbappé', code: 'FRA', position: 'FW', number: 10, club: 'Real Madrid', age: 27, goals: 5, assists: 2, xg: 4.9 },
  { name: 'Erling Haaland', code: 'POL', position: 'FW', number: 9, club: 'Man City', age: 25, goals: 0, assists: 0, xg: 0 },
  { name: 'Vinícius Júnior', code: 'BRA', position: 'FW', number: 7, club: 'Real Madrid', age: 25, goals: 3, assists: 4, xg: 2.8 },
  { name: 'Jude Bellingham', code: 'ENG', position: 'MF', number: 10, club: 'Real Madrid', age: 22, goals: 2, assists: 2, xg: 1.9 },
  { name: 'Cristiano Ronaldo', code: 'POR', position: 'FW', number: 7, club: 'Al-Nassr', age: 41, goals: 3, assists: 1, xg: 3.1 },
  { name: 'Lautaro Martínez', code: 'ARG', position: 'FW', number: 22, club: 'Inter', age: 28, goals: 4, assists: 0, xg: 3.4 },
  { name: 'Christian Pulisic', code: 'USA', position: 'FW', number: 10, club: 'AC Milan', age: 27, goals: 2, assists: 3, xg: 1.7 },
];

export const SEED_ACHIEVEMENTS = [
  { key: 'first_prediction', name: 'First Steps', description: 'Make your first prediction', tier: 'bronze', criteria: { type: 'predictions_count', threshold: 1 } },
  { key: 'sharp_eye', name: 'Sharp Eye', description: 'Reach 60% prediction accuracy', tier: 'silver', criteria: { type: 'accuracy', threshold: 60 } },
  { key: 'oracle', name: 'The Oracle', description: 'Reach 80% prediction accuracy', tier: 'gold', criteria: { type: 'accuracy', threshold: 80 } },
  { key: 'centurion', name: 'Centurion', description: 'Make 100 predictions', tier: 'silver', criteria: { type: 'predictions_count', threshold: 100 } },
  { key: 'champion_caller', name: 'Champion Caller', description: 'Correctly predict the tournament winner', tier: 'gold', criteria: { type: 'winner_correct', threshold: 1 } },
];
