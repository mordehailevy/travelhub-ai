import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Bot, ArrowRight } from "lucide-react";
import { getAiRecommendation } from "../api/ai";
import { ApiClientError } from "../api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

export function ChatbotButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
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

  const goToFullPage = () => {
    setOpen(false);
    navigate("/ai-recommendation");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the AI chatbot for a trip recommendation"
        className="fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-primary-foreground shadow-[var(--shadow-glow)]"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
      >
        <Bot className="size-5" />
        <span className="text-sm font-bold">Chatbot</span>
      </motion.button>

      <SheetContent side="right" className="flex w-96 flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="size-4" /> AI Trip Assistant
          </SheetTitle>
          <SheetDescription>Ask for a destination and get a quick AI-generated itinerary.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chatbot-destination">Destination</Label>
              <Input
                id="chatbot-destination"
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
            <div className="prose prose-sm mt-4 max-w-none border-t border-border pt-4 text-foreground prose-headings:font-heading prose-headings:text-foreground prose-strong:text-foreground">
              <ReactMarkdown>{recommendation}</ReactMarkdown>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={goToFullPage} className="w-full justify-between">
            Open full page
            <ArrowRight className="size-4" />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
