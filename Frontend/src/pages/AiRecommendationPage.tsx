import { useState, type FormEvent } from "react";
import { getAiRecommendation } from "../api/ai";
import { ApiClientError } from "../api/client";

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

      <div className="ai-card">
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="destination">Destination</label>
            <input
              id="destination"
              required
              placeholder="e.g. Rhodes, Greece"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Thinking…" : "Get Recommendation"}
          </button>
        </form>

        {error && <div className="form-error" style={{ marginTop: 16 }}>{error}</div>}
        {recommendation && <div className="ai-result">{recommendation}</div>}
      </div>
    </div>
  );
}
