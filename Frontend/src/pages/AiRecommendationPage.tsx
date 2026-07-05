import { useState, type FormEvent } from "react";
import { getAiRecommendation } from "../api/ai";
import { ApiClientError } from "../api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AiRecommendationPage() {
  const [destination, setDestination] = useState("");
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!destination.trim()) return;

    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const result = await getAiRecommendation(destination.trim());
      setRecommendation(result.recommendation);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not get a recommendation right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Recommendation</h1>
        <p className="page-subtitle">Tell us where you're headed, and get a quick AI-generated itinerary.</p>
      </div>

      <Card className="max-w-[640px] p-7">
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                required
                placeholder="e.g. Rhodes, Greece"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-fit">
              {loading ? "Thinking…" : "Get Recommendation"}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {recommendation && (
            <div className="mt-5 whitespace-pre-wrap border-t border-border pt-5 text-[0.94rem] leading-relaxed">
              {recommendation}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
