/**
 * Team-strength model shared by the AI lab and the Monte-Carlo simulator.
 * Ratings are Elo-like, derived from FIFA ranking and recent form.
 */

const HOME_ADVANTAGE = 55; // most 2026 matches are neutral; applied only to the listed "home" side

export interface TeamLike {
  fifaRanking?: number | null;
  form?: string[];
}

/** Convert a FIFA ranking position (1 = best) + form into an Elo-style rating. */
export function ratingOf(team: TeamLike): number {
  const rank = team.fifaRanking && team.fifaRanking > 0 ? team.fifaRanking : 100;
  // Rank 1 ≈ 1600, rank 16 ≈ 1160, rank 64 ≈ 940 — diminishing penalty for lower ranks.
  let rating = 1600 - Math.log2(rank) * 110;
  for (const r of (team.form ?? []).slice(-5)) {
    rating += r === 'W' ? 15 : r === 'D' ? 4 : r === 'L' ? -12 : 0;
  }
  return rating;
}

/** Logistic win expectancy of A over B (0..1). */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export interface Probabilities {
  home: number;
  draw: number;
  away: number;
}

/**
 * 1X2 probabilities for a single match. The draw share shrinks as the rating
 * gap widens; home advantage is omitted for neutral-venue (knockout) ties.
 */
export function matchProbabilities(ratingHome: number, ratingAway: number, neutral = false): Probabilities {
  const adv = neutral ? 0 : HOME_ADVANTAGE;
  const eHome = expectedScore(ratingHome + adv, ratingAway);
  const gap = Math.abs(ratingHome + adv - ratingAway);
  const draw = Math.max(0.08, 0.3 - gap / 1600);
  const home = eHome * (1 - draw);
  const away = (1 - eHome) * (1 - draw);
  const sum = home + draw + away;
  return { home: home / sum, draw: draw / sum, away: away / sum };
}

/** Knockout (no-draw) win probability of A over B at a neutral venue. */
export function winProbability(ratingA: number, ratingB: number): number {
  return expectedScore(ratingA, ratingB);
}

/** Expected goals for each side, from rating gap. Used for a "likely scoreline" hint. */
export function expectedGoals(ratingHome: number, ratingAway: number, neutral = false): { home: number; away: number } {
  const adv = neutral ? 0 : HOME_ADVANTAGE;
  const diff = ratingHome + adv - ratingAway;
  const home = Math.max(0.2, 1.35 + diff / 250);
  const away = Math.max(0.2, 1.35 - diff / 250);
  return { home, away };
}
