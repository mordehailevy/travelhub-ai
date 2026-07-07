import request from "supertest";
import { createApp } from "../src/app";
import { registerUser, createAdmin, loginAs } from "./helpers";

const app = createApp();

describe("GET /api/users", () => {
  it("rejects a non-admin user", async () => {
    const { token } = await registerUser(app);
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("lists every user for an admin", async () => {
    await registerUser(app);
    const { email, password } = await createAdmin();
    const { token } = await loginAs(app, email, password);

    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});

describe("PATCH /api/users/:id/role", () => {
  it("promotes a user to admin", async () => {
    const target = await registerUser(app);
    const { email, password } = await createAdmin();
    const { token } = await loginAs(app, email, password);

    const res = await request(app)
      .patch(`/api/users/${target.user._id}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "admin" });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe("admin");
  });

  it("prevents an admin from changing their own role", async () => {
    const { email, password } = await createAdmin();
    const { token, user } = await loginAs(app, email, password);

    const res = await request(app)
      .patch(`/api/users/${user._id}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "user" });

    expect(res.status).toBe(400);
  });

  it("rejects a non-admin caller", async () => {
    const target = await registerUser(app);
    const { token } = await registerUser(app);

    const res = await request(app)
      .patch(`/api/users/${target.user._id}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "admin" });

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/users/:id", () => {
  it("prevents an admin from deleting their own account", async () => {
    const { email, password } = await createAdmin();
    const { token, user } = await loginAs(app, email, password);

    const res = await request(app).delete(`/api/users/${user._id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("lets an admin delete another user's account", async () => {
    const target = await registerUser(app);
    const { email, password } = await createAdmin();
    const { token } = await loginAs(app, email, password);

    const res = await request(app).delete(`/api/users/${target.user._id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);

    const list = await request(app).get("/api/users").set("Authorization", `Bearer ${token}`);
    expect(list.body.find((u: { _id: string }) => u._id === target.user._id)).toBeUndefined();
  });
});

describe("demo account protection", () => {
  it("blocks changing the shared demo user's role", async () => {
    const demoUser = await registerUser(app, { email: "user@travelhub.ai" });
    const { email, password } = await createAdmin();
    const { token } = await loginAs(app, email, password);

    const res = await request(app)
      .patch(`/api/users/${demoUser.user._id}/role`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "admin" });

    expect(res.status).toBe(403);
  });

  it("blocks deleting the shared demo user account", async () => {
    const demoUser = await registerUser(app, { email: "user@travelhub.ai" });
    const { email, password } = await createAdmin();
    const { token } = await loginAs(app, email, password);

    const res = await request(app)
      .delete(`/api/users/${demoUser.user._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
