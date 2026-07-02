import { useEffect, useState } from "react";
import { fetchVacations, likeVacation, unlikeVacation } from "../api/vacations";
import type { Vacation, VacationFilter, VacationsPage as VacationsPageData } from "../types";
import { VacationCard } from "../components/VacationCard";
import { Pagination } from "../components/Pagination";

const FILTERS: { value: VacationFilter; label: string }[] = [
  { value: "all", label: "All vacations" },
  { value: "liked", label: "Liked by me" },
  { value: "active", label: "Active now" },
  { value: "future", label: "Not started yet" },
];

export function VacationsPage() {
  const [filter, setFilter] = useState<VacationFilter>("all");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<VacationsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchVacations(page, filter)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load vacations. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, filter]);

  const handleFilterChange = (value: VacationFilter) => {
    setFilter(value);
    setPage(1);
  };

  const handleToggleLike = async (vacation: Vacation) => {
    if (!result) return;
    setLikingId(vacation._id);

    const optimistic = {
      ...result,
      data: result.data.map((v) =>
        v._id === vacation._id
          ? { ...v, likedByMe: !v.likedByMe, likesCount: v.likesCount + (v.likedByMe ? -1 : 1) }
          : v
      ),
    };
    setResult(optimistic);

    try {
      if (vacation.likedByMe) {
        await unlikeVacation(vacation._id);
      } else {
        await likeVacation(vacation._id);
      }
    } catch {
      setResult(result);
    } finally {
      setLikingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Vacations</h1>
        <p className="page-subtitle">Browse upcoming and past trips, and like the ones you'd love to take.</p>
      </div>

      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-chip${filter === f.value ? " active" : ""}`}
            onClick={() => handleFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading && <p className="spinner-text">Loading vacations…</p>}

      {!loading && result && result.data.length === 0 && (
        <p className="empty-state">No vacations match this filter yet.</p>
      )}

      {!loading && result && result.data.length > 0 && (
        <>
          <div className="vacation-grid">
            {result.data.map((vacation) => (
              <VacationCard
                key={vacation._id}
                vacation={vacation}
                mode="user"
                onToggleLike={handleToggleLike}
                likeLoading={likingId === vacation._id}
              />
            ))}
          </div>
          <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
