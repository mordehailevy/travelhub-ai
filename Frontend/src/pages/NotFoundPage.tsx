import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-heading text-6xl font-extrabold text-primary">404</p>
      <h1 className="font-heading text-2xl font-extrabold text-foreground">Page not found</h1>
      <p className="max-w-[46ch] text-muted-foreground">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
