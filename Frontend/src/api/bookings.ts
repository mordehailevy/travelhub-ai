import { apiRequest } from "./client";
import type { AdminBooking, Booking } from "../types";

export function createCheckoutSession(vacationId: string, travelerCount: number): Promise<{ url: string }> {
  return apiRequest<{ url: string }>("/api/bookings/checkout", {
    method: "POST",
    body: { vacationId, travelerCount },
  });
}

export function fetchMyBookings(): Promise<Booking[]> {
  return apiRequest<Booking[]>("/api/bookings");
}

export function cancelBooking(id: string): Promise<void> {
  return apiRequest<void>(`/api/bookings/${id}`, { method: "DELETE" });
}

export function checkSessionStatus(sessionId: string): Promise<Booking> {
  return apiRequest<Booking>(`/api/bookings/session/${sessionId}`);
}

export function fetchAllBookingsAdmin(): Promise<AdminBooking[]> {
  return apiRequest<AdminBooking[]>("/api/bookings/admin/all");
}

export function cancelBookingAdmin(id: string): Promise<AdminBooking> {
  return apiRequest<AdminBooking>(`/api/bookings/admin/${id}/cancel`, { method: "PATCH" });
}
