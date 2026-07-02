import { useState, type FormEvent } from "react";
import { askMcp } from "../api/ai";
import { ApiClientError } from "../api/client";

const EXAMPLES = [
  "How many vacations are currently active?",
  "What is the average price of the vacations?",
  "Which future vacations are in Europe?",
];

export function McpChatPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const result = await askMcp(q.trim());
      setAnswer(result.answer);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not get an answer right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    ask(question);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ask me anything about our vacations</h1>
        <p className="page-subtitle">
          Questions are answered live from the database via our MCP server — try one of the examples below.
        </p>
      </div>

      <div className="ai-card">
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="question">Question</label>
            <textarea
              id="question"
              required
              placeholder="e.g. What is the average price of the vacations?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Asking…" : "Ask"}
          </button>
        </form>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className="filter-chip"
              onClick={() => {
                setQuestion(example);
                ask(example);
              }}
            >
              {example}
            </button>
          ))}
        </div>

        {error && <div className="form-error" style={{ marginTop: 16 }}>{error}</div>}
        {answer && <div className="ai-result">{answer}</div>}
      </div>
    </div>
  );
}
