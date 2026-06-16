import { Schema, model, type InferSchemaType } from 'mongoose';

const groupRankSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    rank: { type: Number, required: true },
  },
  { _id: false },
);

const predictionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['match', 'group', 'bracket', 'winner'], required: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', default: null },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
    bracketId: { type: Schema.Types.ObjectId, ref: 'Bracket', default: null },
    winnerTeamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    pick: {
      outcome: { type: String, enum: ['H', 'D', 'A', null], default: null },
      homeScore: { type: Number, default: null },
      awayScore: { type: Number, default: null },
    },
    groupPrediction: { type: [groupRankSchema], default: [] },
    points: { type: Number, default: 0 }, // awarded on settlement
    settled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// One match prediction per user; supports settlement sweeps.
predictionSchema.index({ userId: 1, matchId: 1 }, { unique: true, sparse: true });
predictionSchema.index({ matchId: 1, settled: 1 });

export type Prediction = InferSchemaType<typeof predictionSchema>;
export const PredictionModel = model('Prediction', predictionSchema);
