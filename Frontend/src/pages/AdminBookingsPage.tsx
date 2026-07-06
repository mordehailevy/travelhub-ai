import { useEffect, useState } from "react";
import { fetchAllBookingsAdmin } from "../api/bookings";
import type { AdminBooking } from "../types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const statusVariant: Record<AdminBooking["status"], "default" | "outline" | "secondary"> = {
  confirmed: "default",
  pending: "secondary",
  canceled: "outline",
};

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllBookingsAdmin()
      .then(setBookings)
      .catch(() => setError("Could not load bookings."))
      .finally(() => setLoading(false));
  }, []);

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const totalPaid = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bookings</h1>
        <p className="page-subtitle">Every reservation made across all travelers, and who has actually paid.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && bookings.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4">
          <Card className="px-5 py-3">
            <p className="text-xs font-bold text-muted-foreground">Total bookings</p>
            <p className="font-heading text-xl font-extrabold text-foreground">{bookings.length}</p>
          </Card>
          <Card className="px-5 py-3">
            <p className="text-xs font-bold text-muted-foreground">Confirmed &amp; paid</p>
            <p className="font-heading text-xl font-extrabold text-foreground">{confirmedCount}</p>
          </Card>
          <Card className="px-5 py-3">
            <p className="text-xs font-bold text-muted-foreground">Total revenue</p>
            <p className="font-heading text-xl font-extrabold text-foreground">${totalPaid.toLocaleString()}</p>
          </Card>
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <p className="py-10 text-center italic text-muted-foreground">No bookings yet.</p>
      )}

      {!loading && bookings.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-bold text-muted-foreground">
                <th className="px-4 py-3">Traveler</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Travelers</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Confirmation</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {booking.userId ? (
                      <>
                        <div className="font-bold text-foreground">
                          {booking.userId.firstName} {booking.userId.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{booking.userId.email}</div>
                      </>
                    ) : (
                      <span className="italic text-muted-foreground">Deleted user</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{booking.destination}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                  </td>
                  <td className="px-4 py-3">{booking.travelerCount}</td>
                  <td className="px-4 py-3 font-bold">${booking.totalPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{booking.confirmationCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
