import OpenAI from "openai";
import { env } from "../config/env";
import { ApiError } from "../middleware/errorHandler";

let client: OpenAI | null = null;

export function getOpenAiClient(): OpenAI {
  if (!env.openaiApiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to Backend/.env to use AI features."
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return client;
}

/**
 * OpenAI SDK errors carry provider-specific wording (key fragments, doc
 * links) that shouldn't leak to the client. Map them to a clean message
 * while the original error is still logged server-side by errorHandler.
 */
export function toCleanAiError(err: unknown): ApiError {
  console.error("[openai]", err);

  if (err instanceof OpenAI.APIError) {
    if (err.status === 401) {
      return new ApiError(503, "AI service is not configured correctly (invalid OPENAI_API_KEY).");
    }
    if (err.status === 429) {
      return new ApiError(503, "AI service is temporarily rate-limited. Please try again shortly.");
    }
    return new ApiError(502, "AI service is currently unavailable. Please try again.");
  }
  if (err instanceof Error && err.message.includes("OPENAI_API_KEY is not configured")) {
    return new ApiError(503, "AI service is not configured (missing OPENAI_API_KEY).");
  }
  return new ApiError(500, "Something went wrong while contacting the AI service.");
}
