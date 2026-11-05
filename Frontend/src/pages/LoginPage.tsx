import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginRequest } from "../api/auth";
import { ApiClientError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Shared demo accounts, created by the backend seed. They are protected
// server-side against edits, so publishing them here is intentional.
const DEMO_ACCOUNTS = [
  { label: "User account", hint: "Browse, like and book vacations", email: "user@travelhub.ai", password: "user1234" },
  { label: "Admin (back office)", hint: "Manage vacations, bookings and reports", email: "admin@travelhub.ai", password: "admin1234" },
];

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, user } = await loginRequest({ email, password });
      login(token, user);
      navigate(user.role === "admin" ? "/admin" : "/vacations");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-[440px] p-9">
      <CardContent className="px-0">
        <h1 className="mb-6 text-center font-heading text-[1.6rem] font-extrabold text-foreground">Login</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Login"}
          </Button>
        </form>
        <p className="mt-4.5 text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/register">Register now</Link>
        </p>
        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Demo accounts</p>
          <ul className="flex flex-col gap-3">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email} className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-foreground">{account.label}</p>
                  <p className="text-xs text-muted-foreground">{account.hint}</p>
                  <p className="mt-1 break-all font-mono text-xs text-foreground">
                    {account.email} / {account.password}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError(null);
                  }}
                >
                  Use
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
