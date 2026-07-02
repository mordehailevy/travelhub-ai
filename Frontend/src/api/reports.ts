import { apiRequest, API_URL } from "./client";
import type { LikesReportRow } from "../types";

export function fetchLikesReport(): Promise<LikesReportRow[]> {
  return apiRequest<LikesReportRow[]>("/api/reports/likes");
}

export async function downloadLikesCsv(): Promise<void> {
  const token = localStorage.getItem("travelhub_token");
  const response = await fetch(`${API_URL}/api/reports/likes/csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error("Failed to download CSV report");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "vacation-likes.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
