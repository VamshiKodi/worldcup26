/**
 * Evaluate the current 1X2 model against finished database matches.
 *
 * This is a diagnostic, not a clean historical backtest: team form/stats are current snapshots.
 * A trustworthy benchmark requires storing the features that were known before each kickoff.
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { MatchModel } from '../models/index.js';
import {
  HOST_ADVANTAGE,
  matchProbabilities,
  ratingOf,
  type Probabilities,
  type TeamLike,
} from '../services/strength.js';

interface EvaluationTeam extends TeamLike {
  name: string;
}

const outcome = (home: number, away: number): keyof Probabilities =>
  home > away ? 'home' : home < away ? 'away' : 'draw';

const predictedOutcome = (probabilities: Probabilities): keyof Probabilities =>
  (Object.entries(probabilities) as Array<[keyof Probabilities, number]>)
    .sort((a, b) => b[1] - a[1])[0][0];

async function main() {
  await connectDB();
  const matches = await MatchModel.find({
    status: 'finished',
    'score.home': { $ne: null },
    'score.away': { $ne: null },
  })
    .populate('homeTeamId', 'name fifaRanking form isHost stats')
    .populate('awayTeamId', 'name fifaRanking form isHost stats')
    .lean();

  let correct = 0;
  let brierTotal = 0;
  let logLossTotal = 0;
  const confusion = { home: 0, draw: 0, away: 0 };

  for (const match of matches) {
    const home = match.homeTeamId as unknown as EvaluationTeam;
    const away = match.awayTeamId as unknown as EvaluationTeam;
    const score = match.score;
    if (!home || !away || score?.home == null || score.away == null) continue;

    const actual = outcome(score.home, score.away);
    const advantage = home.isHost ? HOST_ADVANTAGE : away.isHost ? -HOST_ADVANTAGE : 0;
    const probabilities = matchProbabilities(
      ratingOf(home),
      ratingOf(away),
      advantage,
      match.stage === 'group',
    );
    const prediction = predictedOutcome(probabilities);
    if (prediction === actual) correct += 1;
    confusion[prediction] += 1;

    for (const label of ['home', 'draw', 'away'] as const) {
      brierTotal += Math.pow(probabilities[label] - (label === actual ? 1 : 0), 2);
    }
    logLossTotal += -Math.log(Math.max(1e-15, probabilities[actual]));
  }

  const count = matches.length;
  if (!count) {
    console.log('No finished matches found.');
    return;
  }

  console.log({
    matches: count,
    accuracy: `${((correct / count) * 100).toFixed(1)}%`,
    brierScore: (brierTotal / count).toFixed(4),
    logLoss: (logLossTotal / count).toFixed(4),
    predictedClassCounts: confusion,
    warning: 'Uses current team snapshots; use pre-kickoff snapshots for a trustworthy backtest.',
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
