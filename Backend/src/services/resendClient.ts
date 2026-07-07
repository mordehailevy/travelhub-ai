import { Resend } from "resend";
import { env } from "../config/env";

let client: Resend | null = null;

function getResendClient(): Resend {
  if (!env.resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured. Add it to Backend/.env to send password reset emails.");
  }
  if (!client) {
    client = new Resend(env.resendApiKey);
  }
  return client;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to,
    subject: "Reset your TravelHub AI password",
    html: `
      <p>We received a request to reset your TravelHub AI password.</p>
      <p><a href="${resetUrl}">Click here to choose a new password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error("[resend]", error);
    throw new Error("Failed to send password reset email.");
  }
}

export interface BookingConfirmationDetails {
  destination: string;
  startDate: Date;
  endDate: Date;
  travelerCount: number;
  totalPrice: number;
  confirmationCode: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function sendBookingConfirmationEmail(to: string, booking: BookingConfirmationDetails): Promise<void> {
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to,
    subject: `Booking confirmed: ${booking.destination}`,
    html: `
      <p>Your trip to <strong>${booking.destination}</strong> is confirmed. Bon voyage!</p>
      <ul>
        <li><strong>Dates:</strong> ${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}</li>
        <li><strong>Travelers:</strong> ${booking.travelerCount}</li>
        <li><strong>Total paid:</strong> $${booking.totalPrice.toLocaleString()}</li>
        <li><strong>Confirmation code:</strong> ${booking.confirmationCode}</li>
      </ul>
      <p>You can review this booking any time from your TravelHub AI profile.</p>
    `,
  });

  if (error) {
    console.error("[resend]", error);
    throw new Error("Failed to send booking confirmation email.");
  }
}
