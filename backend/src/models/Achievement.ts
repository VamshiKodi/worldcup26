import { Schema, model, type InferSchemaType } from 'mongoose';

const achievementSchema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. 'first_prediction'
    name: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    tier: { type: String, enum: ['bronze', 'silver', 'gold'], default: 'bronze' },
    criteria: {
      type: { type: String, default: '' }, // e.g. 'predictions_count', 'accuracy'
      threshold: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export type Achievement = InferSchemaType<typeof achievementSchema>;
export const AchievementModel = model('Achievement', achievementSchema);
