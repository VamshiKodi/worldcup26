import { Schema, model, type InferSchemaType } from 'mongoose';

const entrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rank: { type: Number, required: true },
    score: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
  },
  { _id: false },
);

/** Materialized ranking snapshots refreshed on settlement (read-optimized). */
const leaderboardSchema = new Schema(
  {
    scope: { type: String, enum: ['global', 'friends', 'group'], required: true, index: true },
    period: { type: String, default: 'all' }, // 'all' | 'group-stage' | 'r16' ...
    refId: { type: Schema.Types.ObjectId, default: null }, // e.g. group id for 'group' scope
    entries: { type: [entrySchema], default: [] },
  },
  { timestamps: true },
);

leaderboardSchema.index({ scope: 1, period: 1, refId: 1 });

export type Leaderboard = InferSchemaType<typeof leaderboardSchema>;
export const LeaderboardModel = model('Leaderboard', leaderboardSchema);
