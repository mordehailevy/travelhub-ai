import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err instanceof Error ? err.message : "Internal server error";
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ message });
}
