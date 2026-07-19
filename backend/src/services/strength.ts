/**
 * Team-strength model shared by the AI lab and Monte-Carlo simulator.
 * FIFA ranking is the stable prior; recent form and results provide bounded adjustments.
 */

/** Host-country crowd/travel edge. Merely being listed first gives no World Cup advantage. */
export const HOST_ADVANTAGE = 35;

const RANK_POINTS = 5;
const POINTS_PER_GAME_WEIGHT = 100;
const GOAL_DIFFERENCE_WEIGHT = 50;
const BASE_GOALS = 1.2;
const RATING_GOAL_SCALE = 650;
const DRAW_CALIBRATION = 1.45;

export interface TeamLike {
  fifaRanking?: number | null;
  form?: string[];
  isHost?: boolean | null;
  stats?: {
    played?: number | null;
    won?: number | null;
    draw?: number | null;
    lost?: number | null;
    gf?: number | null;
    ga?: number | null;
  } | null;
}

/** Convert ranking, recency-weighted form, and results into an Elo-style rating. */
export function ratingOf(team: TeamLike): number {
  const rank = team.fifaRanking && team.fifaRanking > 0 ? team.fifaRanking : 100;
  let rating = 2050 - RANK_POINTS * Math.min(rank, 150);

  const form = (team.form ?? []).slice(-8);
  for (let i = 0; i < form.length; i += 1) {
    const weight = 0.55 + (0.45 * (i + 1)) / Math.max(1, form.length);
    rating += (form[i] === 'W' ? 18 : form[i] === 'D' ? 2 : form[i] === 'L' ? -16 : 0) * weight;
  }

  const stats = team.stats;
  const played = Math.max(0, stats?.played ?? 0);
  if (played > 0) {
    // Shrink small samples toward average so a single result cannot dominate.
    const sampleWeight = Math.min(1, played / 10);
    const pointsPerGame = ((stats?.won ?? 0) * 3 + (stats?.draw ?? 0)) / played;
    const goalDifferencePerGame = ((stats?.gf ?? 0) - (stats?.ga ?? 0)) / played;
    const boundedGoalDifference = Math.max(-2, Math.min(2, goalDifferencePerGame));
    rating +=
      sampleWeight *
      ((pointsPerGame - 1.35) * POINTS_PER_GAME_WEIGHT +
        boundedGoalDifference * GOAL_DIFFERENCE_WEIGHT);
  }

  return rating;
}

/** Logistic no-draw expectancy of A over B. */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export interface Probabilities {
  home: number;
  draw: number;
  away: number;
}

/**
 * Derive 1X2 probabilities from two Poisson goal distributions.
 * `advantage` is an Elo-point adjustment, normally zero or +/- HOST_ADVANTAGE.
 */
export function matchProbabilities(
  ratingHome: number,
  ratingAway: number,
  advantage = 0,
  allowDraw = true,
): Probabilities {
  const xg = expectedGoals(ratingHome, ratingAway, advantage);
  const homeGoals = poissonDistribution(xg.home);
  const awayGoals = poissonDistribution(xg.away);
  let home = 0;
  let draw = 0;
  let away = 0;

  for (let h = 0; h < homeGoals.length; h += 1) {
    for (let a = 0; a < awayGoals.length; a += 1) {
      const probability = homeGoals[h] * awayGoals[a];
      if (h > a) home += probability;
      else if (h === a) draw += probability;
      else away += probability;
    }
  }

  const calibratedDraw = draw * DRAW_CALIBRATION;
  const sum = home + calibratedDraw + away;
  const probabilities = {
    home: home / sum,
    draw: calibratedDraw / sum,
    away: away / sum,
  };

  if (!allowDraw) {
    const decisive = probabilities.home + probabilities.away;
    return {
      home: probabilities.home / decisive,
      draw: 0,
      away: probabilities.away / decisive,
    };
  }

  return probabilities;
}

/** Knockout (no-draw) win probability of A over B at a neutral venue. */
export function winProbability(ratingA: number, ratingB: number): number {
  return expectedScore(ratingA, ratingB);
}

/** Expected goals for each side from the bounded rating gap. */
export function expectedGoals(
  ratingHome: number,
  ratingAway: number,
  advantage = 0,
): { home: number; away: number } {
  const difference = Math.max(-500, Math.min(500, ratingHome + advantage - ratingAway));
  const home = Math.max(0.18, Math.min(4.2, BASE_GOALS * Math.exp(difference / RATING_GOAL_SCALE)));
  const away = Math.max(0.18, Math.min(4.2, BASE_GOALS * Math.exp(-difference / RATING_GOAL_SCALE)));
  return { home, away };
}

/**
 * Most probable scoreline from the two Poisson goal distributions.
 * With `allowDraw` off (knockouts), level scorelines are skipped so the favourite is shown winning.
 */
export function likelyScoreline(
  xgHome: number,
  xgAway: number,
  allowDraw = true,
): { home: number; away: number } {
  const homeGoals = poissonDistribution(xgHome);
  const awayGoals = poissonDistribution(xgAway);
  let best = { home: 0, away: allowDraw ? 0 : 1 };
  let bestProbability = -1;
  for (let h = 0; h < homeGoals.length; h += 1) {
    for (let a = 0; a < awayGoals.length; a += 1) {
      if (!allowDraw && h === a) continue;
      const probability = homeGoals[h] * awayGoals[a];
      if (probability > bestProbability) {
        bestProbability = probability;
        best = { home: h, away: a };
      }
    }
  }
  return best;
}

function poissonDistribution(lambda: number, maxGoals = 10): number[] {
  const probabilities = [Math.exp(-lambda)];
  for (let goals = 1; goals <= maxGoals; goals += 1) {
    probabilities.push((probabilities[goals - 1] * lambda) / goals);
  }
  return probabilities;
}
