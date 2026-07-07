import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { fetchVacations, likeVacation, unlikeVacation } from "../api/vacations";
import type { Vacation, VacationFilter, VacationSort, VacationsPage as VacationsPageData } from "../types";
import { VacationCard } from "../components/VacationCard";
import { Pagination } from "../components/Pagination";
import { BookingDialog } from "../components/BookingDialog";
import { VacationDetailsDialog } from "../components/VacationDetailsDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { scrollToTop } from "@/lib/scrollToTop";

const FILTERS: { value: VacationFilter; label: string }[] = [
  { value: "all", label: "All vacations" },
  { value: "liked", label: "Liked by me" },
  { value: "active", label: "Active now" },
  { value: "future", label: "Not started yet" },
];

const SORTS: { value: VacationSort; label: string }[] = [
  { value: "date_asc", label: "Date: soonest first" },
  { value: "date_desc", label: "Date: latest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export function VacationsPage() {
  const [filter, setFilter] = useState<VacationFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<VacationSort>("date_asc");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<VacationsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingVacation, setBookingVacation] = useState<Vacation | null>(null);
  const [detailsVacation, setDetailsVacation] = useState<Vacation | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchVacations(page, filter, search, sort)
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
  }, [page, filter, search, sort]);

  useEffect(() => {
    scrollToTop();
  }, [page]);

  const handleFilterChange = (value: VacationFilter) => {
    setFilter(value);
    setPage(1);
  };

  const handleSortChange = (value: VacationSort) => {
    setSort(value);
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="hero"
      >
        <h1 className="hero-title">Where to next?</h1>
        <p className="hero-subtitle">Browse upcoming and past trips, and like the ones you'd love to take.</p>
      </motion.div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search a destination…"
            aria-label="Search a destination"
            className="h-11 rounded-full pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value as VacationSort)}
          aria-label="Sort vacations"
          className="h-11 rounded-full border border-input bg-transparent px-4 text-sm font-bold text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(value) => value && handleFilterChange(value as VacationFilter)}
        variant="outline"
        className="mb-6 flex-wrap"
      >
        {FILTERS.map((f) => (
          <ToggleGroupItem key={f.value} value={f.value} className="min-h-11 rounded-full px-4 font-bold">
            {f.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {!loading && result && (
        <p className="mb-4 text-sm text-muted-foreground">
          {result.totalCount} vacation{result.totalCount === 1 ? "" : "s"} found
        </p>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && result && result.data.length === 0 && (
        <p className="py-10 text-center italic text-muted-foreground">
          {search ? `No vacations match "${search}".` : "No vacations match this filter yet."}
        </p>
      )}

      {!loading && result && result.data.length > 0 && (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
            {result.data.map((vacation, index) => (
              <motion.div
                key={vacation._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <VacationCard
                  vacation={vacation}
                  mode="user"
                  onToggleLike={handleToggleLike}
                  likeLoading={likingId === vacation._id}
                  onBook={setBookingVacation}
                  onMoreInfo={setDetailsVacation}
                />
              </motion.div>
            ))}
          </div>
          <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}

      <BookingDialog vacation={bookingVacation} onOpenChange={(open) => !open && setBookingVacation(null)} />
      <VacationDetailsDialog
        vacation={detailsVacation}
        onOpenChange={(open) => !open && setDetailsVacation(null)}
        onBook={setBookingVacation}
      />
    </div>
  );
}
