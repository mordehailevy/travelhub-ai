import bcrypt from "bcryptjs";
import request from "supertest";
import type { Express } from "express";
import { User } from "../src/models/User";

let counter = 0;
function uniqueEmail(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}@example.com`;
}

export async function registerUser(app: Express, overrides: Partial<{ email: string; password: string }> = {}) {
  const email = overrides.email ?? uniqueEmail("user");
  const password = overrides.password ?? "password123";

  const res = await request(app).post("/api/auth/register").send({
    firstName: "Test",
    lastName: "User",
    email,
    password,
  });

  return { token: res.body.token as string, user: res.body.user, email, password, res };
}

export async function createAdmin(overrides: Partial<{ email: string; password: string }> = {}) {
  const email = overrides.email ?? uniqueEmail("admin");
  const password = overrides.password ?? "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName: "Admin",
    lastName: "User",
    email,
    password: hashedPassword,
    role: "admin",
  });

  return { user, email, password };
}

export async function loginAs(app: Express, email: string, password: string) {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return { token: res.body.token as string, user: res.body.user, res };
}
