import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import { ApiClientError } from "../api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-[440px] p-9">
      <CardContent className="px-0">
        <h1 className="mb-6 text-center font-heading text-[1.6rem] font-extrabold text-foreground">
          Forgot password
        </h1>

        {sent ? (
          <p className="text-center text-sm text-muted-foreground">
            If that email is registered, we've sent a link to reset your password. Check your inbox.
          </p>
        ) : (
          <>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password.
            </p>
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
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-4.5 text-center text-sm text-muted-foreground">
          <Link to="/login">Back to login</Link>
        </p>
      </CardContent>
    </Card>
  );
}
