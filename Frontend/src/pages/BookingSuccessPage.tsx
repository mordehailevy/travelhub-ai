import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { checkSessionStatus } from "@/api/bookings";
import { ApiClientError } from "@/api/client";
import type { Booking } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing checkout session.");
      setLoading(false);
      return;
    }
    checkSessionStatus(sessionId)
      .then(setBooking)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Could not confirm the booking."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Booking confirmation</h1>
      </div>

      <Card className="mx-auto max-w-[640px] p-9">
        <CardContent className="flex flex-col items-center gap-4 px-0 text-center">
          {loading && <Skeleton className="h-40 w-full rounded-xl" />}

          {!loading && error && <p className="text-destructive">{error}</p>}

          {!loading && booking && (
            <>
              <CheckCircle2 className="size-12 text-primary" />
              <h2 className="font-heading text-xl font-extrabold text-foreground">
                {booking.status === "confirmed" ? "Payment received!" : "Payment processing…"}
              </h2>
              <p className="text-muted-foreground">
                {booking.destination} · {formatDate(booking.startDate)} – {formatDate(booking.endDate)} ·{" "}
                {booking.travelerCount} traveler{booking.travelerCount > 1 ? "s" : ""} · $
                {booking.totalPrice.toLocaleString()}
              </p>
              <p className="text-sm">
                Confirmation code: <span className="font-mono font-bold">{booking.confirmationCode}</span>
              </p>
              {booking.status !== "confirmed" && (
                <p className="text-sm text-muted-foreground">
                  Your payment is still being confirmed — refresh the Profil page in a few seconds if it doesn't
                  update automatically.
                </p>
              )}
            </>
          )}

          <Button asChild className="mt-2">
            <Link to="/profil">View in Profil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
