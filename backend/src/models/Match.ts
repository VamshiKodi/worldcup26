import { Schema, model, type InferSchemaType } from 'mongoose';

const matchEventSchema = new Schema(
  {
    minute: { type: Number, required: true },
    type: { type: String, enum: ['goal', 'own_goal', 'penalty', 'yellow', 'red', 'sub'], required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    playerId: { type: Schema.Types.ObjectId, ref: 'Player' },
  },
  { _id: false },
);

const matchSchema = new Schema(
  {
    stage: {
      type: String,
      enum: ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'],
      required: true,
      index: true,
    },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
    homeTeamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    awayTeamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    venue: { type: String, default: '' },
    city: { type: String, default: '' },
    kickoff: { type: Date, required: true, index: true },
    status: { type: String, enum: ['scheduled', 'live', 'finished'], default: 'scheduled', index: true },
    score: {
      home: { type: Number, default: null },
      away: { type: Number, default: null },
    },
    events: { type: [matchEventSchema], default: [] },
    round: { type: Number, default: 1 }, // matchday within group stage
    bracketSlot: { type: String, default: null }, // e.g. 'QF1' for knockout wiring
  },
  { timestamps: true },
);

matchSchema.index({ kickoff: 1, stage: 1 });

export type Match = InferSchemaType<typeof matchSchema>;
export const MatchModel = model('Match', matchSchema);
