import { useEffect, useState, type FormEvent } from "react";
import type { Vacation } from "../types";
import { imageUrl } from "../api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface VacationFormValues {
  destination: string;
  description: string;
  details: string;
  startDate: string;
  endDate: string;
  price: string;
  image: File | null;
}

interface VacationFormProps {
  mode: "add" | "edit";
  initial?: Vacation;
  submitting: boolean;
  serverError: string | null;
  onSubmit: (values: VacationFormValues) => void;
  onCancel: () => void;
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export function VacationForm({ mode, initial, submitting, serverError, onSubmit, onCancel }: VacationFormProps) {
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [startDate, setStartDate] = useState(initial ? toDateInputValue(initial.startDate) : "");
  const [endDate, setEndDate] = useState(initial ? toDateInputValue(initial.endDate) : "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const todayIso = new Date().toISOString().slice(0, 10);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setClientError(null);

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 10000) {
      setClientError("Price must be greater than 0 and at most 10,000.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setClientError("End date cannot be before start date.");
      return;
    }
    if (mode === "add" && startDate < todayIso) {
      setClientError("Start date cannot be in the past.");
      return;
    }
    if (mode === "add" && !image) {
      setClientError("Cover image is required.");
      return;
    }

    onSubmit({ destination, description, details, startDate, endDate, price, image });
  };

  const error = clientError ?? serverError;

  return (
    <Card className="mx-auto max-w-[560px] p-9">
      <CardContent className="px-0">
        <h1 className="mb-6 text-center font-heading text-[1.6rem] font-extrabold text-foreground">
          {mode === "add" ? "Add Vacation" : "Edit Vacation"}
        </h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="destination">Destination</Label>
            <Input id="destination" required value={destination} onChange={(e) => setDestination(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="details">Full details (shown in "More info") — optional</Label>
            <Textarea
              id="details"
              rows={8}
              placeholder="Supports basic markdown: ## headings, - bullet lists, **bold**."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="startDate">Start on</Label>
            <Input
              id="startDate"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="endDate">End on</Label>
            <Input id="endDate" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min={1}
              max={10000}
              step="1"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="image">Cover image{mode === "edit" ? " (leave empty to keep current)" : ""}</Label>
            {previewUrl ? (
              <div className="mb-2">
                <p className="mb-1 text-xs font-bold text-muted-foreground">New image</p>
                <img
                  className="max-h-40 w-full rounded-xl border border-border object-cover"
                  src={previewUrl}
                  alt="Selected cover preview"
                />
              </div>
            ) : (
              mode === "edit" &&
              initial && (
                <div className="mb-2">
                  <p className="mb-1 text-xs font-bold text-muted-foreground">Current image</p>
                  <img
                    className="max-h-40 w-full rounded-xl border border-border object-cover"
                    src={imageUrl(initial.imageFileName, 500)}
                    alt={initial.destination}
                  />
                </div>
              )
            )}
            <Input
              id="image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="mt-1 flex gap-2.5">
            <Button className="flex-1" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : mode === "add" ? "Add Vacation" : "Update"}
            </Button>
            <Button className="flex-1" variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
