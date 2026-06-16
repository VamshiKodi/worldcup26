import { Schema, model, type InferSchemaType } from 'mongoose';

// A slot holds the team a user predicts to occupy a knockout position.
const slotSchema = new Schema(
  {
    slot: { type: String, required: true }, // e.g. 'R16-1', 'QF-3', 'SF-2'
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
  },
  { _id: false },
);

const bracketSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rounds: {
      r32: { type: [slotSchema], default: [] },
      r16: { type: [slotSchema], default: [] },
      qf: { type: [slotSchema], default: [] },
      sf: { type: [slotSchema], default: [] },
      final: { type: [slotSchema], default: [] },
    },
    champion: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    runnerUp: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    points: { type: Number, default: 0 },
    locked: { type: Boolean, default: false }, // locked once knockout begins
  },
  { timestamps: true },
);

bracketSchema.index({ userId: 1 }, { unique: true });

export type Bracket = InferSchemaType<typeof bracketSchema>;
export const BracketModel = model('Bracket', bracketSchema);
