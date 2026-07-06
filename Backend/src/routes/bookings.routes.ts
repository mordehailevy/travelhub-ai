import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { Vacation } from "../models/Vacation";
import { Booking } from "../models/Booking";
import { authGuard, AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { getStripeClient, toCleanStripeError } from "../services/stripeClient";
import { env } from "../config/env";

export const bookingsRouter = Router();

const checkoutSchema = z.object({
  vacationId: z.string().min(1, "vacationId is required"),
  travelerCount: z.number().int().min(1).max(6),
});

function generateConfirmationCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

bookingsRouter.post("/checkout", authGuard, async (req: AuthRequest, res, next) => {
  try {
    const { vacationId, travelerCount } = checkoutSchema.parse(req.body);

    const vacation = await Vacation.findById(vacationId);
    if (!vacation) throw new ApiError(404, "Vacation not found");

    // Total is always computed server-side from the stored price — a
    // client-submitted price is never trusted.
    const totalPrice = vacation.price * travelerCount;

    const booking = await Booking.create({
      userId: req.user!.userId,
      vacationId: vacation._id,
      destination: vacation.destination,
      startDate: vacation.startDate,
      endDate: vacation.endDate,
      travelerCount,
      unitPrice: vacation.price,
      totalPrice,
      status: "pending",
      confirmationCode: generateConfirmationCode(),
    });

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(totalPrice * 100),
            product_data: {
              name: `${vacation.destination} — ${travelerCount} traveler${travelerCount > 1 ? "s" : ""}`,
            },
          },
        },
      ],
      success_url: `${env.clientOrigin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.clientOrigin}/booking/cancel`,
      metadata: { bookingId: booking._id.toString() },
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new ApiError(400, err.issues[0]?.message ?? "Invalid input"));
    }
    next(toCleanStripeError(err));
  }
});

// Mounted with express.raw() in app.ts, ahead of the global JSON parser —
// Stripe's signature verification needs the untouched raw request body.
bookingsRouter.post("/webhook", async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature || !env.stripeWebhookSecret) {
    res.status(400).send("Missing signature or webhook secret");
    return;
  }

  let event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    res.status(400).send("Invalid signature");
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; payment_intent?: string | null };
    await Booking.updateOne(
      { stripeSessionId: session.id },
      { status: "confirmed", stripePaymentIntentId: session.payment_intent ?? undefined }
    );
  }

  res.json({ received: true });
});

bookingsRouter.get("/session/:sessionId", authGuard, async (req: AuthRequest, res, next) => {
  try {
    const booking = await Booking.findOne({
      stripeSessionId: req.params.sessionId,
      userId: req.user!.userId,
    });
    if (!booking) throw new ApiError(404, "Booking not found");

    // Fast optimistic path for the success page: the webhook remains the
    // real source of truth, this just avoids showing "pending" for a few
    // extra seconds while the webhook is still in flight.
    if (booking.status === "pending") {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
      if (session.payment_status === "paid") {
        booking.status = "confirmed";
        booking.stripePaymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : undefined;
        await booking.save();
      }
    }

    res.json(booking);
  } catch (err) {
    next(toCleanStripeError(err));
  }
});

bookingsRouter.get("/", authGuard, async (req: AuthRequest, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

bookingsRouter.delete("/:id", authGuard, async (req: AuthRequest, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!booking) throw new ApiError(404, "Booking not found");

    booking.status = "canceled";
    await booking.save();

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
