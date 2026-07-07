import { useEffect, useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchVacations, unlikeVacation } from "../api/vacations";
import { fetchMyBookings, cancelBooking } from "../api/bookings";
import { updateProfile, changePassword } from "../api/auth";
import { ApiClientError } from "../api/client";
import type { Vacation, VacationsPage as VacationsPageData, Booking } from "../types";
import { VacationCard } from "../components/VacationCard";
import { Pagination } from "../components/Pagination";
import { VacationDetailsDialog } from "../components/VacationDetailsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { scrollToTop } from "@/lib/scrollToTop";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function LikedVacationsTab() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<VacationsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [detailsVacation, setDetailsVacation] = useState<Vacation | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVacations(page, "liked")
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    scrollToTop();
  }, [page]);

  const handleToggleLike = async (vacation: Vacation) => {
    if (!result) return;
    setLikingId(vacation._id);
    try {
      await unlikeVacation(vacation._id);
      setResult({ ...result, data: result.data.filter((v) => v._id !== vacation._id) });
    } catch {
      // keep the list as-is on failure
    } finally {
      setLikingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!result || result.data.length === 0) {
    return <p className="py-10 text-center italic text-muted-foreground">You haven't liked any vacation yet.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {result.data.map((vacation) => (
          <VacationCard
            key={vacation._id}
            vacation={vacation}
            mode="user"
            onToggleLike={handleToggleLike}
            likeLoading={likingId === vacation._id}
            onMoreInfo={setDetailsVacation}
          />
        ))}
      </div>
      <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />
      <VacationDetailsDialog vacation={detailsVacation} onOpenChange={(open) => !open && setDetailsVacation(null)} />
    </>
  );
}

const statusVariant: Record<Booking["status"], "default" | "outline" | "secondary"> = {
  confirmed: "default",
  pending: "secondary",
  canceled: "outline",
};

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = () => {
    setLoading(true);
    fetchMyBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleRemove = async (id: string) => {
    await cancelBooking(id);
    loadBookings();
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return <p className="py-10 text-center italic text-muted-foreground">No bookings yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((booking) => (
        <Card key={booking._id} className="p-4">
          <CardContent className="flex items-center justify-between gap-4 px-0">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-heading font-extrabold text-foreground">{booking.destination}</p>
                <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {formatDate(booking.startDate)} – {formatDate(booking.endDate)} · {booking.travelerCount} traveler
                {booking.travelerCount > 1 ? "s" : ""} · ${booking.totalPrice.toLocaleString()} · confirmation{" "}
                {booking.confirmationCode}
              </p>
            </div>
            {booking.status !== "canceled" && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cancel booking"
                onClick={() => handleRemove(booking._id)}
              >
                <Trash2 />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AccountTab() {
  const { user, login } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setSavingProfile(true);
    try {
      const { token, user: updatedUser } = await updateProfile({ firstName, lastName, email });
      login(token, updatedUser);
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err instanceof ApiClientError ? err.message : "Could not update your profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof ApiClientError ? err.message : "Could not update your password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <Card className="p-6">
        <CardContent className="px-0">
          <h2 className="mb-4 font-heading text-lg font-extrabold text-foreground">Profile</h2>
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            {profileError && (
              <Alert variant="destructive">
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}
            {profileSuccess && (
              <Alert>
                <AlertDescription>Profile updated.</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="accountFirstName">First name</Label>
              <Input
                id="accountFirstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="accountLastName">Last name</Label>
              <Input id="accountLastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="accountEmail">Email</Label>
              <Input
                id="accountEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={savingProfile} className="self-start">
              {savingProfile ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardContent className="px-0">
          <h2 className="mb-4 font-heading text-lg font-extrabold text-foreground">Change password</h2>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            {passwordSuccess && (
              <Alert>
                <AlertDescription>Password updated.</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmNewPassword">Confirm new password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                required
                minLength={8}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={savingPassword} className="self-start">
              {savingPassword ? "Updating…" : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProfilPage() {
  const { user } = useAuth();
  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profil</h1>
      </div>

      <Card className="mb-8 max-w-2xl p-7">
        <CardContent className="flex items-center gap-4 px-0">
          <Avatar size="lg">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-heading text-lg font-extrabold text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Badge className="ml-auto" variant={user.role === "admin" ? "default" : "outline"}>
            {user.role}
          </Badge>
        </CardContent>
      </Card>

      <Tabs defaultValue="liked">
        <TabsList>
          <TabsTrigger value="liked">Favoris</TabsTrigger>
          <TabsTrigger value="bookings">Mes réservations</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
        </TabsList>
        <TabsContent value="liked" className="pt-5">
          <LikedVacationsTab />
        </TabsContent>
        <TabsContent value="bookings" className="pt-5">
          <BookingsTab />
        </TabsContent>
        <TabsContent value="account" className="pt-5">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
