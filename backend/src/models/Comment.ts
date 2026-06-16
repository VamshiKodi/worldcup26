import { Schema, model, type InferSchemaType } from 'mongoose';

const commentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['match', 'prediction', 'team'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // threaded replies
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['visible', 'flagged', 'removed'], default: 'visible' },
  },
  { timestamps: true },
);

commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export type Comment = InferSchemaType<typeof commentSchema>;
export const CommentModel = model('Comment', commentSchema);
