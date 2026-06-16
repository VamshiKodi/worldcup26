import { Schema, model, type InferSchemaType } from 'mongoose';

const teamSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, minlength: 3, maxlength: 3 },
    confederation: {
      type: String,
      enum: ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'],
      required: true,
      index: true,
    },
    flagUrl: { type: String, default: '' },
    fifaRanking: { type: Number, default: 0 },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', index: true },
    isHost: { type: Boolean, default: false },
    stats: {
      played: { type: Number, default: 0 },
      won: { type: Number, default: 0 },
      draw: { type: Number, default: 0 },
      lost: { type: Number, default: 0 },
      gf: { type: Number, default: 0 },
      ga: { type: Number, default: 0 },
    },
    form: { type: [String], default: [] }, // ['W','D','L']
  },
  { timestamps: true },
);

export type Team = InferSchemaType<typeof teamSchema>;
export const TeamModel = model('Team', teamSchema);
