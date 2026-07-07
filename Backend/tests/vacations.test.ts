import request from "supertest";
import { createApp } from "../src/app";
import { Vacation } from "../src/models/Vacation";
import { registerUser, createAdmin, loginAs } from "./helpers";

jest.mock("../src/services/cloudinaryClient", () => ({
  uploadImageBuffer: jest.fn().mockResolvedValue("https://res.cloudinary.com/demo/travelhub-vacations/fake.jpg"),
  deleteImageByUrl: jest.fn().mockResolvedValue(undefined),
  isCloudinaryUrl: (value: string) => value.startsWith("http://") || value.startsWith("https://"),
}));

const app = createApp();

const DAY = 24 * 60 * 60 * 1000;
function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * DAY);
}

async function seedVacations() {
  await Vacation.create([
    {
      destination: "Rome, Italy",
      description: "Roman Forum and Trevi Fountain.",
      startDate: daysFromNow(10),
      endDate: daysFromNow(20),
      price: 1931,
      imageFileName: "rome.jpg",
    },
    {
      destination: "Rhodes, Greece",
      description: "Beaches and medieval Old Town.",
      startDate: daysFromNow(-10),
      endDate: daysFromNow(-1),
      price: 462,
      imageFileName: "rhodes.jpg",
    },
    {
      destination: "Kyoto, Japan",
      description: "Temples and gardens.",
      startDate: daysFromNow(-5),
      endDate: daysFromNow(5),
      price: 2200,
      imageFileName: "kyoto.jpg",
    },
  ]);
}

describe("GET /api/vacations", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/vacations");
    expect(res.status).toBe(401);
  });

  it("lists vacations sorted by date ascending by default", async () => {
    await seedVacations();
    const { token } = await registerUser(app);

    const res = await request(app).get("/api/vacations").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalCount).toBe(3);
    expect(res.body.data.map((v: { destination: string }) => v.destination)).toEqual([
      "Rhodes, Greece",
      "Kyoto, Japan",
      "Rome, Italy",
    ]);
  });

  it("sorts by price descending when requested", async () => {
    await seedVacations();
    const { token } = await registerUser(app);

    const res = await request(app)
      .get("/api/vacations?sort=price_desc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.data.map((v: { destination: string }) => v.destination)).toEqual([
      "Kyoto, Japan",
      "Rome, Italy",
      "Rhodes, Greece",
    ]);
  });

  it("filters by active and future", async () => {
    await seedVacations();
    const { token } = await registerUser(app);

    const active = await request(app).get("/api/vacations?filter=active").set("Authorization", `Bearer ${token}`);
    expect(active.body.data.map((v: { destination: string }) => v.destination)).toEqual(["Kyoto, Japan"]);

    const future = await request(app).get("/api/vacations?filter=future").set("Authorization", `Bearer ${token}`);
    expect(future.body.data.map((v: { destination: string }) => v.destination)).toEqual(["Rome, Italy"]);
  });

  it("searches by destination, case-insensitively", async () => {
    await seedVacations();
    const { token } = await registerUser(app);

    const res = await request(app).get("/api/vacations?search=rOmE").set("Authorization", `Bearer ${token}`);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].destination).toBe("Rome, Italy");
  });

  it("treats regex special characters in search as literal text", async () => {
    await seedVacations();
    const { token } = await registerUser(app);

    const res = await request(app).get("/api/vacations?search=(((").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe("like / unlike", () => {
  it("lets a user like and unlike a vacation", async () => {
    await seedVacations();
    const { token } = await registerUser(app);
    const vacation = await Vacation.findOne({ destination: "Rome, Italy" });

    const like = await request(app)
      .post(`/api/vacations/${vacation!._id}/like`)
      .set("Authorization", `Bearer ${token}`);
    expect(like.status).toBe(204);

    const list = await request(app).get("/api/vacations").set("Authorization", `Bearer ${token}`);
    const found = list.body.data.find((v: { _id: string }) => v._id === vacation!._id.toString());
    expect(found.likesCount).toBe(1);
    expect(found.likedByMe).toBe(true);

    const unlike = await request(app)
      .delete(`/api/vacations/${vacation!._id}/like`)
      .set("Authorization", `Bearer ${token}`);
    expect(unlike.status).toBe(204);
  });
});

describe("admin-only vacation management", () => {
  it("rejects create/update/delete for a non-admin user", async () => {
    const { token } = await registerUser(app);
    const vacation = await Vacation.create({
      destination: "Test City",
      description: "desc",
      startDate: daysFromNow(1),
      endDate: daysFromNow(2),
      price: 100,
      imageFileName: "test.jpg",
    });

    const create = await request(app)
      .post("/api/vacations")
      .set("Authorization", `Bearer ${token}`)
      .field("destination", "Nowhere")
      .field("description", "desc")
      .field("startDate", daysFromNow(1).toISOString())
      .field("endDate", daysFromNow(2).toISOString())
      .field("price", "100")
      .attach("image", Buffer.from("fake"), "test.jpg");
    expect(create.status).toBe(403);

    const del = await request(app).delete(`/api/vacations/${vacation._id}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(403);
  });

  it("lets an admin create, update and delete a vacation", async () => {
    const { email, password } = await createAdmin();
    const { token } = await loginAs(app, email, password);

    const create = await request(app)
      .post("/api/vacations")
      .set("Authorization", `Bearer ${token}`)
      .field("destination", "New City")
      .field("description", "desc")
      .field("startDate", daysFromNow(1).toISOString())
      .field("endDate", daysFromNow(2).toISOString())
      .field("price", "100")
      .attach("image", Buffer.from("fake"), "test.jpg");
    expect(create.status).toBe(201);

    const id = create.body._id;
    const update = await request(app)
      .put(`/api/vacations/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .field("destination", "Updated City")
      .field("description", "desc")
      .field("startDate", daysFromNow(1).toISOString())
      .field("endDate", daysFromNow(2).toISOString())
      .field("price", "150");
    expect(update.status).toBe(200);
    expect(update.body.destination).toBe("Updated City");

    const del = await request(app).delete(`/api/vacations/${id}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);
  });

  it("rejects a price outside the allowed range", async () => {
    const { email, password } = await createAdmin();
    const { token } = await loginAs(app, email, password);

    const res = await request(app)
      .post("/api/vacations")
      .set("Authorization", `Bearer ${token}`)
      .field("destination", "Too Expensive")
      .field("description", "desc")
      .field("startDate", daysFromNow(1).toISOString())
      .field("endDate", daysFromNow(2).toISOString())
      .field("price", "999999")
      .attach("image", Buffer.from("fake"), "test.jpg");

    expect(res.status).toBe(400);
  });
});
