import { apiRequest } from "./client";

export function getAiRecommendation(destination: string): Promise<{ destination: string; recommendation: string }> {
  return apiRequest("/api/ai/recommend", { method: "POST", body: { destination } });
}

export function askMcp(question: string): Promise<{ answer: string }> {
  return apiRequest("/api/mcp/ask", { method: "POST", body: { question } });
}
