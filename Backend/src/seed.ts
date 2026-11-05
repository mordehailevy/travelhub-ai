import mongoose from "mongoose";
import { connectDb } from "./config/db";
import { User } from "./models/User";
import { Vacation } from "./models/Vacation";
import { Like } from "./models/Like";
import { insertDemoData } from "./seedData";

async function seed(): Promise<void> {
  await connectDb();
  await Promise.all([User.deleteMany({}), Vacation.deleteMany({}), Like.deleteMany({})]);
  const count = await insertDemoData();
  console.log(`[seed] created ${count} vacations`);
  console.log("[seed] admin login: admin@travelhub.ai / admin1234");
  console.log("[seed] user login:  user@travelhub.ai / user1234");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
