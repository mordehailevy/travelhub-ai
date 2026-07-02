import { Schema, model, Document, Types } from "mongoose";

export interface ILike extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  vacationId: Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vacationId: { type: Schema.Types.ObjectId, ref: "Vacation", required: true },
  },
  { timestamps: true }
);

likeSchema.index({ userId: 1, vacationId: 1 }, { unique: true });

export const Like = model<ILike>("Like", likeSchema);
