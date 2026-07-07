import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  // Pinned instead of "latest": the auto-picked newest release isn't always
  // published yet for every platform, which fails CI with a confusing 403.
  // Generous timeout: a cold run has to download the ~85MB MongoDB binary.
  mongod = await MongoMemoryServer.create({ binary: { version: "7.0.14" } });
  await mongoose.connect(mongod.getUri());
}, 120_000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod?.stop();
});
