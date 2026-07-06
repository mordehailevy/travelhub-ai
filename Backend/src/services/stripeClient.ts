import Stripe from "stripe";
import { env } from "../config/env";
import { ApiError } from "../middleware/errorHandler";

let client: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!env.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Add it to Backend/.env to use bookings.");
  }
  if (!client) {
    client = new Stripe(env.stripeSecretKey);
  }
  return client;
}

/**
 * Stripe SDK errors carry provider-specific wording that shouldn't leak to
 * the client. Map them to a clean message while the original error is still
 * logged server-side by errorHandler.
 */
export function toCleanStripeError(err: unknown): ApiError {
  console.error("[stripe]", err);

  if (err instanceof Stripe.errors.StripeError) {
    if (err.type === "StripeAuthenticationError") {
      return new ApiError(503, "Payment service is not configured correctly (invalid STRIPE_SECRET_KEY).");
    }
    if (err.type === "StripeRateLimitError") {
      return new ApiError(503, "Payment service is temporarily rate-limited. Please try again shortly.");
    }
    return new ApiError(502, "Payment service is currently unavailable. Please try again.");
  }
  if (err instanceof Error && err.message.includes("STRIPE_SECRET_KEY is not configured")) {
    return new ApiError(503, "Payment service is not configured (missing STRIPE_SECRET_KEY).");
  }
  return new ApiError(500, "Something went wrong while contacting the payment service.");
}
