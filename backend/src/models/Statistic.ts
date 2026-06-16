import { Schema, model, type InferSchemaType } from 'mongoose';

/** Denormalized analytics snapshots (tournament/team/player). `data` is intentionally flexible. */
const statisticSchema = new Schema(
  {
    scope: { type: String, enum: ['tournament', 'team', 'player'], required: true, index: true },
    refId: { type: Schema.Types.ObjectId, default: null }, // team/player id, null for tournament
    data: { type: Schema.Types.Mixed, default: {} },
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

statisticSchema.index({ scope: 1, refId: 1 });

export type Statistic = InferSchemaType<typeof statisticSchema>;
export const StatisticModel = model('Statistic', statisticSchema);
