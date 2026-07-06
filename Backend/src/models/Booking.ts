import { Schema, model, Document, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "canceled";

export interface IBooking extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  vacationId: Types.ObjectId;
  destination: string;
  startDate: Date;
  endDate: Date;
  travelerCount: number;
  unitPrice: number;
  totalPrice: number;
  status: BookingStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  confirmationCode: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vacationId: { type: Schema.Types.ObjectId, ref: "Vacation", required: true },
    // Destination/dates/price are snapshotted at booking time rather than
    // joined live — a later edit to the vacation must not retroactively
    // change what a traveler already paid for.
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    travelerCount: { type: Number, required: true, min: 1, max: 6 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "confirmed", "canceled"], default: "pending" },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    confirmationCode: { type: String, required: true },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1 });
bookingSchema.index({ stripeSessionId: 1 }, { unique: true, sparse: true });

export const Booking = model<IBooking>("Booking", bookingSchema);
