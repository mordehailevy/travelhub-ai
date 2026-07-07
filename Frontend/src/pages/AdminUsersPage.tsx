import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchUsersAdmin, updateUserRole, deleteUser } from "../api/users";
import { ApiClientError } from "../api/client";
import type { AdminUser } from "../types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchUsersAdmin()
      .then(setUsers)
      .catch(() => setError("Could not load users."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggleRole = async (targetUser: AdminUser) => {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    setBusyId(targetUser._id);
    setError(null);
    try {
      const updated = await updateUserRole(targetUser._id, nextRole);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not update this user's role.");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusyId(pendingDelete._id);
    try {
      await deleteUser(pendingDelete._id);
      setUsers((prev) => prev.filter((u) => u._id !== pendingDelete._id));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not delete this user.");
    } finally {
      setBusyId(null);
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
        <p className="page-subtitle">View every registered account, promote admins, or remove a user.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <p className="py-10 text-center italic text-muted-foreground">No users yet.</p>
      )}

      {!loading && users.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-bold text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === currentUser?._id;
                return (
                  <tr key={u._id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-bold text-foreground">
                      {u.firstName} {u.lastName} {isSelf && <span className="text-muted-foreground">(you)</span>}
                    </td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "admin" ? "default" : "outline"}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isSelf || busyId === u._id}
                          onClick={() => handleToggleRole(u)}
                        >
                          {u.role === "admin" ? "Demote to user" : "Promote to admin"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isSelf || busyId === u._id}
                          onClick={() => setPendingDelete(u)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDelete?.firstName} {pendingDelete?.lastName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes their account and likes. This cannot be undone.
            </AlertDialogDescription>
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
