import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function AboutPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">About</h1>
      </div>

      <Card className="mx-auto max-w-[640px] p-9">
        <CardContent className="flex flex-col gap-3 px-0">
          <h2 className="font-heading font-extrabold text-primary">TravelHub AI</h2>
          <p>
            TravelHub AI is a full-stack vacations platform built as a final project for the John Bryce Full Stack
            Web Developer track. Registered users can browse vacations, like the ones they'd love to take, and get
            AI-generated travel recommendations. Administrators manage the vacation catalog and review engagement
            through a live report.
          </p>
          <p>
            Built with React &amp; TypeScript on the client, Express &amp; TypeScript with MongoDB on the server, and
            OpenAI for both the recommendation engine and the natural-language MCP data assistant.
          </p>

          <Separator className="my-2" />

          <h2 className="font-heading font-extrabold text-primary">Developer</h2>
          <img
            src="/mordehai-logo.png"
            alt="MordehAI — Full-Stack & AI Developer"
            className="w-full max-w-sm rounded-lg"
          />
          <p>
            Built by <strong className="text-accent">MordehAI</strong> as a final project for the John Bryce Full
            Stack Web Developer track.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
