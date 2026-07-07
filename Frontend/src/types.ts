export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface AdminUser extends User {
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Vacation {
  _id: string;
  destination: string;
  description: string;
  details?: string;
  startDate: string;
  endDate: string;
  price: number;
  imageFileName: string;
  likesCount: number;
  likedByMe?: boolean;
}

export type VacationFilter = "all" | "liked" | "active" | "future";
export type VacationSort = "date_asc" | "date_desc" | "price_asc" | "price_desc";

export interface VacationsPage {
  data: Vacation[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface LikesReportRow {
  destination: string;
  likes: number;
}

export type BookingStatus = "pending" | "confirmed" | "canceled";

export interface Booking {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  unitPrice: number;
  totalPrice: number;
  status: BookingStatus;
  confirmationCode: string;
  createdAt: string;
}

export interface AdminBooking extends Booking {
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}
