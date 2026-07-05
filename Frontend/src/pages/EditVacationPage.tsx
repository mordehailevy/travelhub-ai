import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VacationForm, type VacationFormValues } from "../components/VacationForm";
import { fetchVacationById, updateVacation } from "../api/vacations";
import { ApiClientError } from "../api/client";
import type { Vacation } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EditVacationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vacation, setVacation] = useState<Vacation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchVacationById(id)
      .then(setVacation)
      .catch(() => setError("Could not load this vacation."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (values: VacationFormValues) => {
    if (!id) return;
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("destination", values.destination);
    formData.append("description", values.description);
    formData.append("startDate", values.startDate);
    formData.append("endDate", values.endDate);
    formData.append("price", values.price);
    if (values.image) formData.append("image", values.image);

    try {
      await updateVacation(id, formData);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not update vacation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Skeleton className="mx-auto h-96 max-w-[560px] rounded-xl" />;
  if (!vacation)
    return (
      <Alert variant="destructive" className="mx-auto max-w-[560px]">
        <AlertDescription>{error ?? "Vacation not found."}</AlertDescription>
      </Alert>
    );

  return (
    <VacationForm
      mode="edit"
      initial={vacation}
      submitting={submitting}
      serverError={error}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/admin")}
    />
  );
}
