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
    apiId: { type: Number, index: true, sparse: true }, // external id (football-data.org) for idempotent sync
    stage: {
      type: String,
      enum: ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'],
      required: true,
      index: true,
    },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
    // Knockout fixtures exist on the schedule before the draw is known, so teams are nullable
    // (TBD). Group-stage matches always carry both. The frontend renders missing teams as "TBD".
    homeTeamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    awayTeamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    venue: { type: String, default: '' },
    city: { type: String, default: '' },
    kickoff: { type: Date, required: true, index: true },
    status: { type: String, enum: ['scheduled', 'live', 'finished'], default: 'scheduled', index: true },
    score: {
      home: { type: Number, default: null },
      away: { type: Number, default: null },
    },
    // Half-time score (real data from football-data.org); null until the first half is played.
    halfTime: {
      home: { type: Number, default: null },
      away: { type: Number, default: null },
    },
    referee: { type: String, default: '' }, // main referee name (real data)
    winner: { type: String, default: null }, // HOME_TEAM | AWAY_TEAM | DRAW (real data)
    duration: { type: String, default: 'REGULAR' }, // REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT
    minute: { type: Number, default: 0 }, // live match clock, driven by the live engine
    events: { type: [matchEventSchema], default: [] },
    round: { type: Number, default: 1 }, // matchday within group stage
    bracketSlot: { type: String, default: null }, // e.g. 'QF1' for knockout wiring
  },
  { timestamps: true },
);

matchSchema.index({ kickoff: 1, stage: 1 });

export type Match = InferSchemaType<typeof matchSchema>;
export const MatchModel = model('Match', matchSchema);
