import { useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import { askMcp } from "../api/ai";
import { ApiClientError } from "../api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

      <Card className="mx-auto max-w-[640px] p-7">
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                required
                placeholder="e.g. What is the average price of the vacations?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-fit">
              {loading ? "Asking…" : "Ask"}
            </Button>
          </form>

          <div className="mt-3.5 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <Button
                key={example}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setQuestion(example);
                  ask(example);
                }}
              >
                {example}
              </Button>
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {answer && (
            <div className="prose prose-sm mt-5 max-w-none border-t border-border pt-5 text-foreground prose-headings:font-heading prose-headings:text-foreground prose-strong:text-foreground">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
