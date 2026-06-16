import { Schema, model, type InferSchemaType } from 'mongoose';

const standingRowSchema = new Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    played: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    gf: { type: Number, default: 0 },
    ga: { type: Number, default: 0 },
    gd: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  },
  { _id: false },
);

const groupSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // 'A'..'L' (2026: 12 groups)
    teamIds: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    standings: { type: [standingRowSchema], default: [] },
  },
  { timestamps: true },
);

export type Group = InferSchemaType<typeof groupSchema>;
export const GroupModel = model('Group', groupSchema);
