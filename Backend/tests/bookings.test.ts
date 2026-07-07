import request from "supertest";
import { createApp } from "../src/app";
import { Vacation } from "../src/models/Vacation";
import { Booking } from "../src/models/Booking";
import { registerUser, createAdmin, loginAs } from "./helpers";

const app = createApp();

const DAY = 24 * 60 * 60 * 1000;
function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * DAY);
}

describe("POST /api/bookings/checkout", () => {
  it("requires authentication", async () => {
    const res = await request(app).post("/api/bookings/checkout").send({ vacationId: "000000000000000000000000", travelerCount: 1 });
    expect(res.status).toBe(401);
  });

  it("returns 404 for a vacation that doesn't exist", async () => {
    const { token } = await registerUser(app);
    const res = await request(app)
      .post("/api/bookings/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ vacationId: "000000000000000000000000", travelerCount: 1 });
    expect(res.status).toBe(404);
  });

  it("rejects an invalid traveler count", async () => {
    const { token } = await registerUser(app);
    const vacation = await Vacation.create({
      destination: "Test City",
      description: "desc",
      startDate: daysFromNow(1),
      endDate: daysFromNow(2),
      price: 100,
      imageFileName: "test.jpg",
    });

    const res = await request(app)
      .post("/api/bookings/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ vacationId: vacation._id, travelerCount: 0 });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/bookings", () => {
  it("only returns the caller's own bookings", async () => {
    const { token, user } = await registerUser(app);
    const other = await registerUser(app);

    await Booking.create([
      {
        userId: user._id,
        vacationId: "000000000000000000000000",
        destination: "Mine",
        startDate: daysFromNow(1),
        endDate: daysFromNow(2),
        travelerCount: 1,
        unitPrice: 100,
        totalPrice: 100,
        status: "confirmed",
        confirmationCode: "MINE0001",
      },
      {
        userId: other.user._id,
        vacationId: "000000000000000000000000",
        destination: "Not mine",
        startDate: daysFromNow(1),
        endDate: daysFromNow(2),
        travelerCount: 1,
        unitPrice: 100,
        totalPrice: 100,
        status: "confirmed",
        confirmationCode: "OTHR0001",
      },
    ]);

    const res = await request(app).get("/api/bookings").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].destination).toBe("Mine");
  });
});

describe("DELETE /api/bookings/:id", () => {
  it("lets a user cancel their own booking", async () => {
    const { token, user } = await registerUser(app);
    const booking = await Booking.create({
      userId: user._id,
      vacationId: "000000000000000000000000",
      destination: "Mine",
      startDate: daysFromNow(1),
      endDate: daysFromNow(2),
      travelerCount: 1,
      unitPrice: 100,
      totalPrice: 100,
      status: "pending",
      confirmationCode: "MINE0002",
    });

    const res = await request(app).delete(`/api/bookings/${booking._id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it("returns 404 when trying to cancel someone else's booking", async () => {
    const { token } = await registerUser(app);
    const other = await registerUser(app);
    const booking = await Booking.create({
      userId: other.user._id,
      vacationId: "000000000000000000000000",
      destination: "Not mine",
      startDate: daysFromNow(1),
      endDate: daysFromNow(2),
      travelerCount: 1,
      unitPrice: 100,
      totalPrice: 100,
      status: "pending",
      confirmationCode: "OTHR0002",
    });

    const res = await request(app).delete(`/api/bookings/${booking._id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe("admin bookings", () => {
  it("rejects GET /api/bookings/admin/all for a non-admin", async () => {
    const { token } = await registerUser(app);
    const res = await request(app).get("/api/bookings/admin/all").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("lets an admin cancel a pending booking without touching Stripe", async () => {
    const traveler = await registerUser(app);
    const { email, password } = await createAdmin();
    const { token } = await loginAs(app, email, password);

    const booking = await Booking.create({
      userId: traveler.user._id,
      vacationId: "000000000000000000000000",
      destination: "Pending Trip",
      startDate: daysFromNow(1),
      endDate: daysFromNow(2),
      travelerCount: 1,
      unitPrice: 100,
      totalPrice: 100,
      status: "pending",
      confirmationCode: "PEND0001",
    });

    const res = await request(app)
      .patch(`/api/bookings/admin/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("canceled");
  });

  it("rejects canceling an already-canceled booking", async () => {
    const traveler = await registerUser(app);
    const { email, password } = await createAdmin();
    const { token } = await loginAs(app, email, password);

    const booking = await Booking.create({
      userId: traveler.user._id,
      vacationId: "000000000000000000000000",
      destination: "Already canceled",
      startDate: daysFromNow(1),
      endDate: daysFromNow(2),
      travelerCount: 1,
      unitPrice: 100,
      totalPrice: 100,
      status: "canceled",
      confirmationCode: "CANC0001",
    });

    const res = await request(app)
      .patch(`/api/bookings/admin/${booking._id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
