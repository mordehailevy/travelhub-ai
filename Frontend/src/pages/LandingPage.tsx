import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";
import { MapPin, Sparkles, MessageSquare, BarChart3 } from "lucide-react";
import { imageUrl } from "../api/client";
import { Marquee } from "@/components/ui/marquee";
import { AuroraText } from "@/components/ui/aurora-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";

// Static marketing content — mirrors Backend/src/seed.ts (14 seeded destinations).
// Landing is public/anonymous, and GET /api/vacations requires a JWT, so this
// list is hardcoded rather than fetched.
const DESTINATIONS = [
  { destination: "Rome, Italy", imageFileName: "rome.jpg" },
  { destination: "Rhodes, Greece", imageFileName: "rhodes.jpg" },
  { destination: "Lahaina, Hawaii", imageFileName: "lahaina.jpg" },
  { destination: "Corfu, Greece", imageFileName: "corfu.jpg" },
  { destination: "Hilo, Hawaii", imageFileName: "hilo.jpg" },
  { destination: "Montego Bay, Jamaica", imageFileName: "montego-bay.jpg" },
  { destination: "Barcelona, Spain", imageFileName: "barcelona.jpg" },
  { destination: "Paris, France", imageFileName: "paris.jpg" },
  { destination: "Kyoto, Japan", imageFileName: "kyoto.jpg" },
  { destination: "Puerto Rico Island", imageFileName: "puerto-rico.jpg" },
  { destination: "Las Vegas, Nevada", imageFileName: "las-vegas.jpg" },
  { destination: "Kailua-Kona, Hawaii", imageFileName: "kailua-kona.jpg" },
  { destination: "Honolulu, Hawaii", imageFileName: "honolulu.jpg" },
  { destination: "Port Antonio, Jamaica", imageFileName: "port-antonio.jpg" },
];

const FEATURES = [
  {
    name: "Browse & like vacations",
    description: "Filter by active, upcoming or liked trips and save the ones you love.",
    Icon: MapPin,
  },
  {
    name: "AI recommendations",
    description: "Get a quick AI-generated itinerary for any destination you're considering.",
    Icon: Sparkles,
  },
  {
    name: "Ask the data",
    description: "Chat with our MCP assistant to query the live vacations database in plain English.",
    Icon: MessageSquare,
  },
  {
    name: "Admin analytics",
    description: "Admins get a live likes report per destination, exportable as CSV.",
    Icon: BarChart3,
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis();
    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center gap-6 pt-8 pb-4 text-center">
        <h1 className="max-w-2xl text-balance font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
          Where to <AuroraText colors={["#0ea5e9", "#38bdf8", "#ea580c", "#0ea5e9"]}>next</AuroraText>?
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          Browse curated vacations, get AI-powered recommendations, and keep track of the trips you love — all in
          one place.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ShimmerButton background="var(--color-accent)" onClick={() => navigate("/register")}>
            Get started
          </ShimmerButton>
          <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
            Login
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <p className="text-center text-sm font-bold text-muted-foreground">14 handpicked destinations</p>
        <Marquee pauseOnHover className="[--duration:35s]">
          {DESTINATIONS.map((d) => (
            <figure
              key={d.destination}
              className="relative w-56 shrink-0 overflow-hidden rounded-xl ring-1 ring-foreground/10"
            >
              <img src={imageUrl(d.imageFileName)} alt={d.destination} className="h-32 w-56 bg-muted object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent px-3 py-2 text-sm font-bold text-white">
                {d.destination}
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </section>

      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-extrabold">Everything you need to plan your next trip</h2>
        </div>
        <BentoGrid className="auto-rows-[14rem] grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <BentoCard
              key={feature.name}
              name={feature.name}
              description={feature.description}
              Icon={feature.Icon}
              href="/register"
              cta="Create a free account"
              className="col-span-1"
              background={<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />}
            />
          ))}
        </BentoGrid>
      </section>

      <section className="hero flex flex-col items-center gap-4 text-center">
        <h2 className="hero-title">Ready to plan your next getaway?</h2>
        <p className="hero-subtitle">Create a free account and start browsing in seconds.</p>
        <Button size="lg" variant="secondary" className="relative" onClick={() => navigate("/register")}>
          Create your account
        </Button>
      </section>
    </div>
  );
}
