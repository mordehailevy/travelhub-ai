import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BookingCancelPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Checkout canceled</h1>
      </div>

      <Card className="mx-auto max-w-[640px] p-9">
        <CardContent className="flex flex-col items-center gap-4 px-0 text-center">
          <XCircle className="size-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No payment was taken. You can restart the booking any time from the vacations list.
          </p>
          <Button asChild>
            <Link to="/vacations">Back to vacations</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
