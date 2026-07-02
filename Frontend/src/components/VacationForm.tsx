import { useState, type FormEvent } from "react";
import type { Vacation } from "../types";
import { imageUrl } from "../api/client";

export interface VacationFormValues {
  destination: string;
  description: string;
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
  const [startDate, setStartDate] = useState(initial ? toDateInputValue(initial.startDate) : "");
  const [endDate, setEndDate] = useState(initial ? toDateInputValue(initial.endDate) : "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [image, setImage] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

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

    onSubmit({ destination, description, startDate, endDate, price, image });
  };

  const error = clientError ?? serverError;

  return (
    <div className="form-card wide-form-card">
      <h1 className="form-title">{mode === "add" ? "Add Vacation" : "Edit Vacation"}</h1>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="destination">Destination</label>
          <input id="destination" required value={destination} onChange={(e) => setDestination(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" required value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="startDate">Start on</label>
          <input
            id="startDate"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="endDate">End on</label>
          <input id="endDate" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="price">Price ($)</label>
          <input
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
        <div className="form-field">
          <label htmlFor="image">Cover image{mode === "edit" ? " (leave empty to keep current)" : ""}</label>
          {mode === "edit" && initial && (
            <img className="current-image-preview" src={imageUrl(initial.imageFileName)} alt={initial.destination} />
          )}
          <input
            id="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : mode === "add" ? "Add Vacation" : "Update"}
          </button>
          <button className="btn btn-secondary btn-block" type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
