import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteVacation, fetchAllVacationsAdmin } from "../api/vacations";
import type { Vacation } from "../types";
import { VacationCard } from "../components/VacationCard";

export function AdminVacationsPage() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    fetchAllVacationsAdmin()
      .then(setVacations)
      .catch(() => setError("Could not load vacations."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (vacation: Vacation) => {
    const confirmed = window.confirm(`Delete "${vacation.destination}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteVacation(vacation._id);
      setVacations((prev) => prev.filter((v) => v._id !== vacation._id));
    } catch {
      setError("Could not delete this vacation. Please try again.");
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">Manage Vacations</h1>
          <p className="page-subtitle">Add, edit or remove vacations shown to travelers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/admin/vacations/new")}>
          + Add Vacation
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && <p className="spinner-text">Loading vacations…</p>}

      {!loading && vacations.length === 0 && <p className="empty-state">No vacations yet.</p>}

      {!loading && vacations.length > 0 && (
        <div className="vacation-grid">
          {vacations.map((vacation) => (
            <VacationCard
              key={vacation._id}
              vacation={vacation}
              mode="admin"
              onEdit={(v) => navigate(`/admin/vacations/${v._id}/edit`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
