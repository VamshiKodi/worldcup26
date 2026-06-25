import { Schema, model, type InferSchemaType } from 'mongoose';

const playerSchema = new Schema(
  {
    apiId: { type: Number, index: true, sparse: true }, // external id (football-data.org) for idempotent sync
    name: { type: String, required: true, trim: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    position: { type: String, enum: ['GK', 'DF', 'MF', 'FW'], required: true },
    number: { type: Number, min: 1, max: 99 },
    photoUrl: { type: String, default: '' },
    age: { type: Number },
    club: { type: String, default: '' },
    stats: {
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      xg: { type: Number, default: 0 },
      cleanSheets: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
      appearances: { type: Number, default: 0 },
    },
    isTopScorer: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Common sort paths for the player showcase / golden boot race.
playerSchema.index({ 'stats.goals': -1 });
playerSchema.index({ 'stats.assists': -1 });

export type Player = InferSchemaType<typeof playerSchema>;
export const PlayerModel = model('Player', playerSchema);
