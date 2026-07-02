import express, { Express } from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { vacationsRouter } from "./routes/vacations.routes";
import { reportsRouter } from "./routes/reports.routes";
import { aiRouter } from "./routes/ai.routes";
import { mcpRouter } from "./routes/mcp.routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRouter);
  app.use("/api/vacations", vacationsRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/mcp", mcpRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
