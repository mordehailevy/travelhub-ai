import request from "supertest";
import { createApp } from "../src/app";
import { registerUser, createAdmin, loginAs } from "./helpers";

const app = createApp();

describe("POST /api/auth/register", () => {
  it("creates a new account and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Sam",
      lastName: "Traveler",
      email: "sam@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe("sam@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects a password shorter than 8 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Sam",
      lastName: "Traveler",
      email: "shortpw@example.com",
      password: "abc123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 8 characters/i);
  });

  it("rejects a duplicate email", async () => {
    await registerUser(app, { email: "dupe@example.com" });
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Other",
      lastName: "Person",
      email: "dupe@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    const { email, password } = await registerUser(app);
    const res = await loginAs(app, email, password);

    expect(res.res.status).toBe(200);
    expect(res.token).toEqual(expect.any(String));
  });

  it("rejects an incorrect password", async () => {
    const { email } = await registerUser(app);
    const res = await request(app).post("/api/auth/login").send({ email, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("rejects an unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/auth/me", () => {
  it("updates the current user's profile", async () => {
    const { token } = await registerUser(app);
    const res = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Updated", lastName: "Name", email: "updated@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe("Updated");
    expect(res.body.user.email).toBe("updated@example.com");
  });

  it("rejects switching to an email already used by another account", async () => {
    await registerUser(app, { email: "taken@example.com" });
    const { token } = await registerUser(app);

    const res = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "A", lastName: "B", email: "taken@example.com" });

    expect(res.status).toBe(409);
  });

  it("requires authentication", async () => {
    const res = await request(app)
      .patch("/api/auth/me")
      .send({ firstName: "A", lastName: "B", email: "noauth@example.com" });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/auth/me/password", () => {
  it("changes the password when the current password is correct", async () => {
    const { token, password } = await registerUser(app);
    const res = await request(app)
      .patch("/api/auth/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: password, newPassword: "newpassword123" });

    expect(res.status).toBe(200);
  });

  it("rejects an incorrect current password", async () => {
    const { token } = await registerUser(app);
    const res = await request(app)
      .patch("/api/auth/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "wrongpassword", newPassword: "newpassword123" });

    expect(res.status).toBe(401);
  });

  it("rejects a new password shorter than 8 characters", async () => {
    const { token, password } = await registerUser(app);
    const res = await request(app)
      .patch("/api/auth/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: password, newPassword: "short" });

    expect(res.status).toBe(400);
  });
});

// Sanity check that createAdmin actually produces an admin that can log in —
// exercised properly in users.test.ts and vacations.test.ts.
describe("createAdmin helper", () => {
  it("produces a user that can log in with the admin role", async () => {
    const { email, password } = await createAdmin();
    const { user, res } = await loginAs(app, email, password);
    expect(res.status).toBe(200);
    expect(user.role).toBe("admin");
  });
});

describe("demo account protection", () => {
  it("blocks profile edits on the shared demo user account", async () => {
    const { token } = await registerUser(app, { email: "user@travelhub.ai" });
    const res = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Hijacked", lastName: "Name", email: "hijacked@example.com" });

    expect(res.status).toBe(403);
  });

  it("blocks password changes on the shared demo user account", async () => {
    const { token, password } = await registerUser(app, { email: "user@travelhub.ai" });
    const res = await request(app)
      .patch("/api/auth/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: password, newPassword: "newpassword123" });

    expect(res.status).toBe(403);
  });
});
