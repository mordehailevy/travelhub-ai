import { apiRequest } from "./client";
import type { AdminUser, UserRole } from "../types";

export function fetchUsersAdmin(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/api/users");
}

export function updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/api/users/${id}/role`, { method: "PATCH", body: { role } });
}

export function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(`/api/users/${id}`, { method: "DELETE" });
}
