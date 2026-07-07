import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";
import path from "path";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { vacationsRouter } from "./routes/vacations.routes";
import { reportsRouter } from "./routes/reports.routes";
import { aiRouter } from "./routes/ai.routes";
import { mcpRouter } from "./routes/mcp.routes";
import { bookingsRouter } from "./routes/bookings.routes";
import { usersRouter } from "./routes/users.routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

export function createApp(): Express {
  const app = express();

  // Frontend and backend are served from different origins (and always will
  // be once deployed), so vacation images under /uploads must stay loadable
  // cross-origin — helmet's same-origin CORP default would block <img> tags.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: env.clientOrigin }));
  app.use(compression());

  // Stripe's webhook signature check needs the untouched raw body, so this
  // path must be parsed with express.raw() before the global express.json()
  // below would otherwise consume and reformat it.
  app.use("/api/bookings/webhook", express.raw({ type: "application/json" }));
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/api/health", (_req, res) => {
    const mongoConnected = mongoose.connection.readyState === 1;
    if (!mongoConnected) {
      return res.status(503).json({ status: "degraded", mongo: "disconnected" });
    }
    res.json({ status: "ok", mongo: "connected" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/vacations", vacationsRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/mcp", mcpRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/users", usersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
