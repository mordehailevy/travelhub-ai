import bcrypt from "bcryptjs";
import { connectDb } from "./config/db";
import { User } from "./models/User";
import { Vacation } from "./models/Vacation";
import { Like } from "./models/Like";
import mongoose from "mongoose";

// Dates are computed relative to "today" so the seed always contains a mix
// of past, active and future vacations regardless of when it is run.
const DAY = 24 * 60 * 60 * 1000;
const today = new Date();
const daysFromNow = (n: number) => new Date(today.getTime() + n * DAY);

const vacations = [
  {
    destination: "Rome, Italy",
    description:
      "Wander through the Roman Forum, toss a coin in the Trevi Fountain and eat your way through Trastevere's trattorias on this classic Roman getaway.",
    startDate: daysFromNow(-30),
    endDate: daysFromNow(-20),
    price: 1931,
    imageFileName: "rome.jpg",
  },
  {
    destination: "Rhodes, Greece",
    description:
      "Relax on Pefkos Beach, explore the medieval Old Town's cobblestone streets, and enjoy fresh seafood by the Aegean Sea.",
    startDate: daysFromNow(-10),
    endDate: daysFromNow(4),
    price: 462,
    imageFileName: "rhodes.jpg",
  },
  {
    destination: "Lahaina, Hawaii",
    description:
      "Snorkel off Kaanapali Beach, watch the sunset from Black Rock, and unwind in one of Maui's most laid-back beach towns.",
    startDate: daysFromNow(-3),
    endDate: daysFromNow(12),
    price: 1049,
    imageFileName: "lahaina.jpg",
  },
  {
    destination: "Corfu, Greece",
    description:
      "Discover turquoise coves, Venetian-era architecture in Corfu Town, and olive-grove hikes on this lush Ionian island.",
    startDate: daysFromNow(15),
    endDate: daysFromNow(29),
    price: 799,
    imageFileName: "corfu.jpg",
  },
  {
    destination: "Hilo, Hawaii",
    description:
      "Chase waterfalls in the rainforest, visit Hawaii Volcanoes National Park, and browse the farmers market in downtown Hilo.",
    startDate: daysFromNow(20),
    endDate: daysFromNow(34),
    price: 1120,
    imageFileName: "hilo.jpg",
  },
  {
    destination: "Montego Bay, Jamaica",
    description:
      "White-sand beaches, reggae nights, and reef diving make Montego Bay a favorite Caribbean escape year-round.",
    startDate: daysFromNow(40),
    endDate: daysFromNow(54),
    price: 1049,
    imageFileName: "montego-bay.jpg",
  },
  {
    destination: "Barcelona, Spain",
    description:
      "Marvel at Gaudi's Sagrada Familia, stroll Las Ramblas, and feast on tapas in the Gothic Quarter.",
    startDate: daysFromNow(55),
    endDate: daysFromNow(63),
    price: 890,
    imageFileName: "barcelona.jpg",
  },
  {
    destination: "Paris, France",
    description:
      "Climb the Eiffel Tower at dusk, cruise the Seine, and spend a lazy afternoon in the Louvre's endless galleries.",
    startDate: daysFromNow(65),
    endDate: daysFromNow(72),
    price: 1250,
    imageFileName: "paris.jpg",
  },
  {
    destination: "Kyoto, Japan",
    description:
      "Walk beneath thousands of torii gates at Fushimi Inari, visit serene bamboo groves, and sip matcha in a centuries-old teahouse.",
    startDate: daysFromNow(80),
    endDate: daysFromNow(92),
    price: 2400,
    imageFileName: "kyoto.jpg",
  },
  {
    destination: "Puerto Rico Island",
    description:
      "Explore the colorful streets of Old San Juan, hike the El Yunque rainforest, and kayak through a bioluminescent bay.",
    startDate: daysFromNow(6),
    endDate: daysFromNow(16),
    price: 980,
    imageFileName: "puerto-rico.jpg",
  },
  {
    destination: "Las Vegas, Nevada",
    description:
      "Catch a world-class show, wander the Strip's dazzling casinos, and day-trip to the Hoover Dam and Red Rock Canyon.",
    startDate: daysFromNow(100),
    endDate: daysFromNow(105),
    price: 650,
    imageFileName: "las-vegas.jpg",
  },
  {
    destination: "Kailua-Kona, Hawaii",
    description:
      "Snorkel with manta rays at night, tour a Kona coffee farm, and watch the sunset from Ali'i Drive.",
    startDate: daysFromNow(-60),
    endDate: daysFromNow(-48),
    price: 1340,
    imageFileName: "kailua-kona.jpg",
  },
  {
    destination: "Honolulu, Hawaii",
    description:
      "Surf at Waikiki Beach, visit the Pearl Harbor memorial, and hike up Diamond Head for a sweeping coastline view.",
    startDate: daysFromNow(35),
    endDate: daysFromNow(45),
    price: 1180,
    imageFileName: "honolulu.jpg",
  },
  {
    destination: "Port Antonio, Jamaica",
    description:
      "Raft down the Rio Grande, swim in the Blue Lagoon, and enjoy the quiet, untouristy charm of Jamaica's north-east coast.",
    startDate: daysFromNow(110),
    endDate: daysFromNow(120),
    price: 940,
    imageFileName: "port-antonio.jpg",
  },
];

async function seed(): Promise<void> {
  await connectDb();

  await Promise.all([User.deleteMany({}), Vacation.deleteMany({}), Like.deleteMany({})]);

  const adminPassword = await bcrypt.hash("admin1234", 10);
  const userPassword = await bcrypt.hash("user1234", 10);

  const admin = await User.create({
    firstName: "Ava",
    lastName: "Admin",
    email: "admin@travelhub.ai",
    password: adminPassword,
    role: "admin",
  });

  const user = await User.create({
    firstName: "Sam",
    lastName: "Traveler",
    email: "user@travelhub.ai",
    password: userPassword,
    role: "user",
  });

  const createdVacations = await Vacation.insertMany(vacations);

  const likeSeeds = createdVacations.slice(0, 6).map((vacation) => ({
    userId: user._id,
    vacationId: vacation._id,
  }));
  await Like.insertMany(likeSeeds);

  console.log(`[seed] created ${createdVacations.length} vacations`);
  console.log(`[seed] admin login: ${admin.email} / admin1234`);
  console.log(`[seed] user login:  ${user.email} / user1234`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
