import { Schema, model, Document, Types } from "mongoose";

export interface IVacation extends Document {
  _id: Types.ObjectId;
  destination: string;
  description: string;
  startDate: Date;
  endDate: Date;
  price: number;
  imageFileName: string;
}

const vacationSchema = new Schema<IVacation>(
  {
    destination: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0, max: 10000 },
    imageFileName: { type: String, required: true },
  },
  { timestamps: true }
);

vacationSchema.index({ startDate: 1 });

export const Vacation = model<IVacation>("Vacation", vacationSchema);
