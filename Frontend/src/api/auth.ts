import { apiRequest } from "./client";
import type { AuthResponse } from "../types";

export function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/register", { method: "POST", body: input });
}

export function login(input: { email: string; password: string }): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: input });
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", { method: "POST", body: { email } });
}

export function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}

export function updateProfile(input: { firstName: string; lastName: string; email: string }): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/me", { method: "PATCH", body: input });
}

export function changePassword(input: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/me/password", { method: "PATCH", body: input });
}
