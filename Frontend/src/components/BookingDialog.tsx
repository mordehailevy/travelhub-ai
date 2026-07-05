import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import type { Vacation } from "../types";
import { useAuth } from "../context/AuthContext";
import { addBooking, type Booking } from "@/lib/bookings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface BookingDialogProps {
  vacation: Vacation | null;
  onOpenChange: (open: boolean) => void;
}

export function BookingDialog({ vacation, onOpenChange }: BookingDialogProps) {
  const { user } = useAuth();
  const [travelerCount, setTravelerCount] = useState(1);
  const [confirmation, setConfirmation] = useState<Booking | null>(null);

  useEffect(() => {
    if (vacation) {
      setTravelerCount(1);
      setConfirmation(null);
    }
  }, [vacation]);

  if (!vacation || !user) return null;

  const totalPrice = vacation.price * travelerCount;

  const handleConfirm = () => {
    const booking = addBooking(user._id, vacation, travelerCount);
    setConfirmation(booking);
    toast.success("Demo booking confirmed", { description: `Confirmation ${booking.confirmationCode}` });
  };

  return (
    <Dialog open={!!vacation} onOpenChange={onOpenChange}>
      <DialogContent>
        {!confirmation ? (
          <>
            <DialogHeader>
              <DialogTitle>Book {vacation.destination}</DialogTitle>
              <DialogDescription>
                {formatDate(vacation.startDate)} – {formatDate(vacation.endDate)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="text-sm font-bold">Travelers</span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setTravelerCount((c) => Math.max(1, c - 1))}
                  disabled={travelerCount <= 1}
                  aria-label="Fewer travelers"
                >
                  <Minus />
                </Button>
                <span className="w-4 text-center font-bold">{travelerCount}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setTravelerCount((c) => Math.min(6, c + 1))}
                  disabled={travelerCount >= 6}
                  aria-label="More travelers"
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-heading text-lg font-extrabold text-foreground">
                ${totalPrice.toLocaleString()}
              </span>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm booking (demo)</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Booking confirmed</DialogTitle>
              <DialogDescription>
                This is a demo booking — stored only on this device. No payment was taken and no reservation was
                made with the vacation provider.
              </DialogDescription>
            </DialogHeader>

            <p className="px-1 text-sm">
              Confirmation code: <span className="font-mono font-bold">{confirmation.confirmationCode}</span>
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button asChild>
                <Link to="/profil" onClick={() => onOpenChange(false)}>
                  View in Profil
                </Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
