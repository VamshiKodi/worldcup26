import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, default: null }, // null for OAuth-only accounts
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, default: null },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    score: { type: Number, default: 0, index: true }, // cached leaderboard score
    accuracy: { type: Number, default: 0 }, // % correct predictions
    badges: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }],
    refreshTokenHash: { type: String, default: null, select: false },
  },
  { timestamps: true },
);

// Sparse unique so multiple local users (googleId: null) don't collide.
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ score: -1 });

// Never leak sensitive fields when serialized.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    return ret;
  },
});

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
