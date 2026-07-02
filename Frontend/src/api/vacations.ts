import { apiRequest } from "./client";
import type { Vacation, VacationFilter, VacationsPage } from "../types";

export function fetchVacations(page: number, filter: VacationFilter): Promise<VacationsPage> {
  return apiRequest<VacationsPage>(`/api/vacations?page=${page}&filter=${filter}`);
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
