import { apiRequest } from "./client";
import type { Vacation, VacationFilter, VacationSort, VacationsPage } from "../types";

export function fetchVacations(
  page: number,
  filter: VacationFilter,
  search = "",
  sort: VacationSort = "date_asc"
): Promise<VacationsPage> {
  const params = new URLSearchParams({ page: String(page), filter, sort });
  if (search) params.set("search", search);
  return apiRequest<VacationsPage>(`/api/vacations?${params.toString()}`);
}

export function likeVacation(id: string): Promise<void> {
  return apiRequest<void>(`/api/vacations/${id}/like`, { method: "POST" });
}

export function unlikeVacation(id: string): Promise<void> {
  return apiRequest<void>(`/api/vacations/${id}/like`, { method: "DELETE" });
}

export function fetchAllVacationsAdmin(): Promise<Vacation[]> {
  return apiRequest<Vacation[]>("/api/vacations/admin/all");
}

export function fetchVacationById(id: string): Promise<Vacation> {
  return apiRequest<Vacation>(`/api/vacations/${id}`);
}

export function createVacation(formData: FormData): Promise<Vacation> {
  return apiRequest<Vacation>("/api/vacations", { method: "POST", body: formData, isFormData: true });
}

export function updateVacation(id: string, formData: FormData): Promise<Vacation> {
  return apiRequest<Vacation>(`/api/vacations/${id}`, { method: "PUT", body: formData, isFormData: true });
}

export function deleteVacation(id: string): Promise<void> {
  return apiRequest<void>(`/api/vacations/${id}`, { method: "DELETE" });
}
