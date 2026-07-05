import type { Vacation } from "../types";

// Front-end-only "demo" bookings: TravelHub AI's backend has no reservation
// endpoint, so this is pure localStorage CRUD, scoped per user id. Never
// treat this as a real reservation — it's not synced with any server.
export interface Booking {
  id: string;
  vacationId: string;
  destination: string;
  startDate: string;
  endDate: string;
  price: number;
  travelerCount: number;
  totalPrice: number;
  bookedAt: string;
  confirmationCode: string;
}

function storageKey(userId: string): string {
  return `travelhub_bookings_${userId}`;
}

export function getBookings(userId: string): Booking[] {
  const raw = localStorage.getItem(storageKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

export function addBooking(userId: string, vacation: Vacation, travelerCount: number): Booking {
  const booking: Booking = {
    id: crypto.randomUUID(),
    vacationId: vacation._id,
    destination: vacation.destination,
    startDate: vacation.startDate,
    endDate: vacation.endDate,
    price: vacation.price,
    travelerCount,
    totalPrice: vacation.price * travelerCount,
    bookedAt: new Date().toISOString(),
    confirmationCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
  };

  const existing = getBookings(userId);
  localStorage.setItem(storageKey(userId), JSON.stringify([booking, ...existing]));
  return booking;
}

export function removeBooking(userId: string, bookingId: string): void {
  const remaining = getBookings(userId).filter((b) => b.id !== bookingId);
  localStorage.setItem(storageKey(userId), JSON.stringify(remaining));
}
