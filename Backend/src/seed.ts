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
    details:
      "Rome rewards slow travel: every alley opens onto something two thousand years old standing next to something that opened last week. This trip blends the headline sights with the neighborhood life that makes the city feel lived-in rather than roped-off.\n\n" +
      "## Highlights\n" +
      "- **Colosseum & Roman Forum**: Walk the same ground gladiators and senators did — go early to beat both the heat and the crowds.\n" +
      "- **Trevi Fountain, after dark**: The crowds thin out at night and the floodlit marble is worth the later hour.\n" +
      "- **Trastevere by evening**: Cobblestone streets, ivy-covered facades, and some of the best cacio e pepe in the city.\n" +
      "- **Vatican Museums & Sistine Chapel**: Book a timed entry in advance — this is the one thing worth planning ahead for.\n\n" +
      "## Good to know\n" +
      "Rome is very walkable, but its cobblestones are unforgiving — pack shoes you've already broken in. Most museums close on Mondays, so plan around that if your trip is short.",
    startDate: daysFromNow(-30),
    endDate: daysFromNow(-20),
    price: 1931,
    imageFileName: "rome.jpg",
  },
  {
    destination: "Rhodes, Greece",
    description:
      "Relax on Pefkos Beach, explore the medieval Old Town's cobblestone streets, and enjoy fresh seafood by the Aegean Sea.",
    details:
      "Rhodes pairs beach time with one of the best-preserved medieval towns in Europe — a rare combination that makes it easy to alternate lazy mornings with genuine sightseeing.\n\n" +
      "## Highlights\n" +
      "- **Old Town of Rhodes**: A UNESCO World Heritage walled city — the Street of the Knights is especially striking at golden hour.\n" +
      "- **Lindos Acropolis**: A steep but short climb rewards you with ancient ruins perched above a postcard bay.\n" +
      "- **Pefkos & Anthony Quinn Bay**: Clear water, dramatic cliffs, and far fewer crowds than the main tourist beaches.\n" +
      "- **Seafood tavernas by the harbor**: Grilled octopus and ouzo while the fishing boats come in — a nightly ritual worth keeping.\n\n" +
      "## Good to know\n" +
      "A rental scooter or small car opens up the island beyond the Old Town — Lindos and the west coast beaches are easiest to reach that way.",
    startDate: daysFromNow(-10),
    endDate: daysFromNow(4),
    price: 462,
    imageFileName: "rhodes.jpg",
  },
  {
    destination: "Lahaina, Hawaii",
    description:
      "Snorkel off Kaanapali Beach, watch the sunset from Black Rock, and unwind in one of Maui's most laid-back beach towns.",
    details:
      "Lahaina is Maui at its most unhurried — a former whaling port turned easygoing beach town where the biggest decision of the day is which sunset spot to claim.\n\n" +
      "## Highlights\n" +
      "- **Kaanapali Beach snorkeling**: Sea turtles are a near-daily sighting just off the sand, no boat required.\n" +
      "- **Black Rock at sunset**: Locals cliff-dive here at dusk as part of a nightly torch-lighting ceremony.\n" +
      "- **Front Street**: Galleries, shave ice, and ocean views strung along the old town's main strip.\n" +
      "- **Whale watching (in season)**: Humpbacks migrate through the channel between Maui and Lanai from roughly December to April.\n\n" +
      "## Good to know\n" +
      "Trade winds pick up most afternoons, so mornings tend to be calmer for swimming and snorkeling.",
    startDate: daysFromNow(-3),
    endDate: daysFromNow(12),
    price: 1049,
    imageFileName: "lahaina.jpg",
  },
  {
    destination: "Corfu, Greece",
    description:
      "Discover turquoise coves, Venetian-era architecture in Corfu Town, and olive-grove hikes on this lush Ionian island.",
    details:
      "Greener and wetter than the classic Cycladic islands, Corfu's centuries under Venetian, French, and British rule left it with an architectural character unlike anywhere else in Greece.\n\n" +
      "## Highlights\n" +
      "- **Corfu Old Town**: Venetian fortresses, French arcades, and a UNESCO-listed old quarter built for aimless wandering.\n" +
      "- **Paleokastritsa coves**: Turquoise inlets backed by cliffs — best seen by renting a small boat for a couple of hours.\n" +
      "- **Olive grove trails**: The island has over three million olive trees; several marked hiking routes wind straight through them.\n" +
      "- **Achilleion Palace**: A 19th-century palace built for an Austrian empress, with gardens overlooking the coast.\n\n" +
      "## Good to know\n" +
      "Corfu is lusher and rainier than the Cyclades — pack for the possibility of a passing shower even in shoulder season.",
    startDate: daysFromNow(15),
    endDate: daysFromNow(29),
    price: 799,
    imageFileName: "corfu.jpg",
  },
  {
    destination: "Hilo, Hawaii",
    description:
      "Chase waterfalls in the rainforest, visit Hawaii Volcanoes National Park, and browse the farmers market in downtown Hilo.",
    details:
      "Hilo is the Big Island's quieter, rainier, more local side — the base camp for volcano country rather than a resort strip.\n\n" +
      "## Highlights\n" +
      "- **Hawaii Volcanoes National Park**: Walk across a crater floor and, conditions permitting, see glowing lava at Kilauea.\n" +
      "- **Rainbow Falls & Akaka Falls**: Two waterfalls a short drive apart, both an easy walk from the parking lot.\n" +
      "- **Hilo Farmers Market**: Over 200 vendors selling tropical fruit you won't find on the mainland — go early for the best selection.\n" +
      "- **Wailuku River State Park**: Boiling Pots and Peʻepeʻe Falls, right at the edge of town.\n\n" +
      "## Good to know\n" +
      "Hilo is one of the rainiest cities in the US — bring a light rain jacket and treat a passing shower as background noise, not a reason to change plans.",
    startDate: daysFromNow(20),
    endDate: daysFromNow(34),
    price: 1120,
    imageFileName: "hilo.jpg",
  },
  {
    destination: "Montego Bay, Jamaica",
    description:
      "White-sand beaches, reggae nights, and reef diving make Montego Bay a favorite Caribbean escape year-round.",
    details:
      "Montego Bay is Jamaica's tourism hub, but it's also a real, working city — the trick is mixing the resort beaches with the reggae clubs and jerk shacks just outside the hotel gates.\n\n" +
      "## Highlights\n" +
      "- **Doctor's Cave Beach**: Calm, clear water that's been drawing visitors since the 1900s for its supposed healing properties.\n" +
      "- **Reef diving & snorkeling**: Montego Bay Marine Park protects coral reefs just offshore, accessible on half-day trips.\n" +
      "- **Jerk chicken at a roadside shack**: Skip the hotel buffet at least once — the real thing is smokier and spicier.\n" +
      "- **Live reggae**: Small clubs around town host live bands most weekend nights, no cover charge required at several.\n\n" +
      "## Good to know\n" +
      "Hurricane season runs roughly June to November — outside that window, weather is reliably warm and dry.",
    startDate: daysFromNow(40),
    endDate: daysFromNow(54),
    price: 1049,
    imageFileName: "montego-bay.jpg",
  },
  {
    destination: "Barcelona, Spain",
    description:
      "Marvel at Gaudi's Sagrada Familia, stroll Las Ramblas, and feast on tapas in the Gothic Quarter.",
    details:
      "Barcelona manages to be a beach city, an architecture city, and a food city all at once — few places pack this much variety into a walkable downtown.\n\n" +
      "## Highlights\n" +
      "- **Sagrada Familia**: Still unfinished after more than a century of construction, and more astonishing in person than in photos. Book tickets ahead.\n" +
      "- **Park Güell**: Gaudi's mosaic-covered park, best visited early morning before tour groups arrive.\n" +
      "- **Gothic Quarter tapas crawl**: Narrow medieval streets packed with small bars — order a little at each, move on.\n" +
      "- **La Boqueria market**: Just off Las Ramblas, a food market worth visiting even if you're not buying anything.\n\n" +
      "## Good to know\n" +
      "Dinner in Barcelona rarely starts before 9pm — showing up at 7 will often mean an empty restaurant and a confused waiter.",
    startDate: daysFromNow(55),
    endDate: daysFromNow(63),
    price: 890,
    imageFileName: "barcelona.jpg",
  },
  {
    destination: "Paris, France",
    description:
      "Climb the Eiffel Tower at dusk, cruise the Seine, and spend a lazy afternoon in the Louvre's endless galleries.",
    details:
      "Paris rewards a slower pace than its landmark checklist suggests — the city is as much about the cafés between the sights as the sights themselves.\n\n" +
      "## Highlights\n" +
      "- **Eiffel Tower at dusk**: The tower sparkles for five minutes every hour after dark — worth timing a picnic at Champ de Mars around it.\n" +
      "- **The Louvre**: Too big to see in one visit — pick two or three wings rather than trying to cover everything.\n" +
      "- **Seine river cruise**: An hour-long boat ride passes most of the major landmarks and is easiest on tired feet.\n" +
      "- **Montmartre**: Steep streets, the Sacré-Cœur basilica, and some of the best people-watching in the city.\n\n" +
      "## Good to know\n" +
      "Many museums are closed on either Monday or Tuesday depending on the venue — check before building your itinerary around one.",
    startDate: daysFromNow(65),
    endDate: daysFromNow(72),
    price: 1250,
    imageFileName: "paris.jpg",
  },
  {
    destination: "Kyoto, Japan",
    description:
      "Walk beneath thousands of torii gates at Fushimi Inari, visit serene bamboo groves, and sip matcha in a centuries-old teahouse.",
    details:
      "Kyoto was Japan's capital for over a thousand years, and it shows — this is the country's best-preserved concentration of temples, shrines, and traditional wooden machiya houses.\n\n" +
      "## Highlights\n" +
      "- **Fushimi Inari Taisha**: Thousands of vermilion torii gates climbing the mountain — arrive at sunrise to have the upper paths nearly to yourself.\n" +
      "- **Arashiyama Bamboo Grove**: A short, otherworldly walk best done early before the tour buses arrive.\n" +
      "- **Gion district**: Kyoto's historic geisha quarter, atmospheric at dusk when the lanterns come on.\n" +
      "- **Kinkaku-ji (Golden Pavilion)**: A gold-leafed Zen temple reflected in its own pond — one of the most photographed sights in Japan for good reason.\n\n" +
      "## Good to know\n" +
      "A Kyoto City Bus one-day pass covers most of the major sights cheaply and saves the hassle of individual fares.",
    startDate: daysFromNow(80),
    endDate: daysFromNow(92),
    price: 2400,
    imageFileName: "kyoto.jpg",
  },
  {
    destination: "Puerto Rico Island",
    description:
      "Explore the colorful streets of Old San Juan, hike the El Yunque rainforest, and kayak through a bioluminescent bay.",
    details:
      "Puerto Rico packs a 500-year-old colonial city, a rainforest, and glowing water into one easy island — no passport required for US travelers, which makes it an easy first stop in the Caribbean.\n\n" +
      "## Highlights\n" +
      "- **Old San Juan**: Pastel-colored colonial buildings, centuries-old fortresses, and cobblestone streets you can spend a full day wandering.\n" +
      "- **El Yunque National Forest**: The only tropical rainforest in the US National Forest system — waterfalls and hiking trails an hour from San Juan.\n" +
      "- **Bioluminescent bay kayaking**: Paddle through water that glows blue with every stroke, best on a moonless night.\n" +
      "- **Flamenco Beach (Culebra)**: A short ferry ride away and consistently ranked among the best beaches in the Caribbean.\n\n" +
      "## Good to know\n" +
      "The bio bay tours book out days in advance in peak season — reserve as soon as your dates are set.",
    startDate: daysFromNow(6),
    endDate: daysFromNow(16),
    price: 980,
    imageFileName: "puerto-rico.jpg",
  },
  {
    destination: "Las Vegas, Nevada",
    description:
      "Catch a world-class show, wander the Strip's dazzling casinos, and day-trip to the Hoover Dam and Red Rock Canyon.",
    details:
      "Vegas is often sold as just casinos, but the Strip is also home to some of the best live entertainment in the country, and the desert scenery just outside the city is dramatic in its own right.\n\n" +
      "## Highlights\n" +
      "- **The Strip at night**: Fountain shows, neon, and people-watching — best experienced on foot rather than by car.\n" +
      "- **A resident headline show**: Cirque du Soleil and long-running residencies are worth booking well in advance.\n" +
      "- **Red Rock Canyon**: A 20-minute drive from the Strip into striking sandstone formations, with an easy scenic loop drive.\n" +
      "- **Hoover Dam**: A half-day trip that pairs an engineering marvel with views over Lake Mead.\n\n" +
      "## Good to know\n" +
      "Daytime desert heat is intense for much of the year — outdoor excursions like Red Rock are best done in the morning.",
    startDate: daysFromNow(100),
    endDate: daysFromNow(105),
    price: 650,
    imageFileName: "las-vegas.jpg",
  },
  {
    destination: "Kailua-Kona, Hawaii",
    description:
      "Snorkel with manta rays at night, tour a Kona coffee farm, and watch the sunset from Ali'i Drive.",
    details:
      "Kailua-Kona is the Big Island's sunny west side — drier and calmer than Hilo, and the launch point for two of Hawaii's more unusual experiences.\n\n" +
      "## Highlights\n" +
      "- **Night manta ray snorkel**: Lights attract plankton, plankton attracts manta rays with wingspans up to 12 feet gliding just beneath you.\n" +
      "- **Kona coffee farm tour**: The only place in the US where coffee is commercially grown — most farms offer tastings alongside the tour.\n" +
      "- **Ali'i Drive at sunset**: A walkable oceanfront strip of cafés and shops, best timed for golden hour.\n" +
      "- **Kealakekua Bay**: A marine sanctuary with some of the clearest snorkeling water on the island.\n\n" +
      "## Good to know\n" +
      "Book the manta ray tour a few days ahead — sightings aren't guaranteed, but the operators track the rays' regular feeding spots closely.",
    startDate: daysFromNow(-60),
    endDate: daysFromNow(-48),
    price: 1340,
    imageFileName: "kailua-kona.jpg",
  },
  {
    destination: "Honolulu, Hawaii",
    description:
      "Surf at Waikiki Beach, visit the Pearl Harbor memorial, and hike up Diamond Head for a sweeping coastline view.",
    details:
      "Honolulu is Hawaii's only real city — high-rises and a lively urban core sitting right alongside the beach, with history and hiking both within a short drive.\n\n" +
      "## Highlights\n" +
      "- **Waikiki Beach**: Learn to surf where the sport was popularized for modern tourism, with beginner lessons available right on the sand.\n" +
      "- **Pearl Harbor & USS Arizona Memorial**: A sobering, well-run historical site — reserve free timed tickets in advance.\n" +
      "- **Diamond Head hike**: A steep but short trail up an extinct volcanic crater, ending in a panoramic view of the coastline.\n" +
      "- **Chinatown Honolulu**: Historic markets and some of the city's best, least touristy food, a short bus ride from Waikiki.\n\n" +
      "## Good to know\n" +
      "Pearl Harbor timed tickets are released online in advance and free — they sell out, so grab a slot before your trip rather than on arrival.",
    startDate: daysFromNow(35),
    endDate: daysFromNow(45),
    price: 1180,
    imageFileName: "honolulu.jpg",
  },
  {
    destination: "Port Antonio, Jamaica",
    description:
      "Raft down the Rio Grande, swim in the Blue Lagoon, and enjoy the quiet, untouristy charm of Jamaica's north-east coast.",
    details:
      "Port Antonio is Jamaica before the resorts — lush, quiet, and largely unbothered by the crowds that fill Montego Bay and Negril.\n\n" +
      "## Highlights\n" +
      "- **Rio Grande bamboo rafting**: A two-hour float down the river on a hand-poled bamboo raft, a tradition dating back to the banana-export era.\n" +
      "- **Blue Lagoon**: A mineral-blue, spring-fed lagoon made famous by the 1980 film of the same name — swimmable and startlingly clear.\n" +
      "- **Frenchman's Cove**: A river meets the sea at this quiet beach, consistently rated one of the most beautiful in Jamaica.\n" +
      "- **Reach Falls**: A less-visited waterfall with natural pools and slides, well off the main tourist circuit.\n\n" +
      "## Good to know\n" +
      "This is Jamaica's least developed tourist region — expect fewer amenities than Montego Bay, and rent a car or arrange transport ahead of time.",
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
