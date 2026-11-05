// Vercel serverless entry point. Each cold start builds the Express app once;
// warm invocations reuse it along with the open MongoDB connection, so only
// the very first request after a quiet period pays the connection cost.
import type { IncomingMessage, ServerResponse } from "http";
import mongoose from "mongoose";
import { createApp } from "../src/app";
import { connectDb } from "../src/config/db";
import { seedIfEmpty } from "../src/seedData";

const app = createApp();
let connecting: Promise<void> | null = null;

function ensureDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connecting) {
    connecting = connectDb()
      .then(async () => {
        await seedIfEmpty();
      })
      .catch((err) => {
      connecting = null;
      throw err;
    });
  }
  return connecting;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Static demo images don't need the database.
  if (req.url?.startsWith("/uploads/")) {
    app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
    return;
  }
  try {
    await ensureDb();
  } catch (err) {
    console.error("[api] database connection failed", err);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Database unavailable" }));
    return;
  }
  app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
