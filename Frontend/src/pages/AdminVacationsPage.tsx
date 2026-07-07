import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { deleteVacation, fetchAllVacationsAdmin } from "../api/vacations";
import type { Vacation } from "../types";
import { VacationCard } from "../components/VacationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AdminVacationsPage() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Vacation | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredVacations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vacations;
    return vacations.filter((v) => v.destination.toLowerCase().includes(query));
  }, [vacations, search]);

  const load = () => {
    setLoading(true);
    fetchAllVacationsAdmin()
      .then(setVacations)
      .catch(() => setError("Could not load vacations."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteVacation(pendingDelete._id);
      setVacations((prev) => prev.filter((v) => v._id !== pendingDelete._id));
    } catch {
      setError("Could not delete this vacation. Please try again.");
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Manage Vacations</h1>
          <p className="page-subtitle">Add, edit or remove vacations shown to travelers.</p>
        </div>
        <Button onClick={() => navigate("/admin/vacations/new")}>
          <Plus /> Add Vacation
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && vacations.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a destination…"
            aria-label="Search a destination"
            className="h-11 rounded-full pl-9"
          />
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3 overflow-hidden rounded-xl ring-1 ring-foreground/10">
              <Skeleton className="h-[190px] w-full rounded-none" />
              <div className="flex flex-col gap-2 px-4 pb-5">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && vacations.length === 0 && (
        <p className="py-10 text-center italic text-muted-foreground">No vacations yet.</p>
      )}

      {!loading && vacations.length > 0 && filteredVacations.length === 0 && (
        <p className="py-10 text-center italic text-muted-foreground">No vacations match "{search}".</p>
      )}

      {!loading && filteredVacations.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {filteredVacations.map((vacation) => (
            <VacationCard
              key={vacation._id}
              vacation={vacation}
              mode="admin"
              onEdit={(v) => navigate(`/admin/vacations/${v._id}/edit`)}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.destination}"?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
