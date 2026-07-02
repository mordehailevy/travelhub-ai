import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VacationForm, type VacationFormValues } from "../components/VacationForm";
import { createVacation } from "../api/vacations";
import { ApiClientError } from "../api/client";

export function AddVacationPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (values: VacationFormValues) => {
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
      await createVacation(formData);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not create vacation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <VacationForm
      mode="add"
      submitting={submitting}
      serverError={error}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/admin")}
    />
  );
}
