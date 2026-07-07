import ReactMarkdown from "react-markdown";
import type { Vacation } from "../types";
import { imageUrl } from "../api/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface VacationDetailsDialogProps {
  vacation: Vacation | null;
  onOpenChange: (open: boolean) => void;
  onBook?: (vacation: Vacation) => void;
}

export function VacationDetailsDialog({ vacation, onOpenChange, onBook }: VacationDetailsDialogProps) {
  if (!vacation) return null;

  return (
    <Dialog open={!!vacation} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[560px] gap-0 overflow-hidden p-0">
        <div className="max-h-[85vh] overflow-y-auto">
          <img
            src={imageUrl(vacation.imageFileName, 900)}
            alt={vacation.destination}
            className="h-56 w-full object-cover"
          />
          <div className="p-6">
            <DialogHeader className="items-start text-left">
              <DialogTitle className="font-heading text-xl">{vacation.destination}</DialogTitle>
              <DialogDescription className="flex items-center gap-3 font-mono text-xs">
                <span>
                  {formatDate(vacation.startDate)} – {formatDate(vacation.endDate)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="size-3.5" fill={vacation.likedByMe ? "currentColor" : "none"} />
                  {vacation.likesCount}
                </span>
              </DialogDescription>
            </DialogHeader>

            {vacation.details ? (
              <div className="prose prose-sm mt-4 max-w-none text-foreground prose-headings:font-heading prose-headings:text-foreground prose-strong:text-foreground">
                <ReactMarkdown>{vacation.details}</ReactMarkdown>
              </div>
            ) : (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {vacation.description}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between">
              <span className="font-heading text-lg font-extrabold text-foreground">
                ${vacation.price.toLocaleString()}
              </span>
              <DialogFooter className="sm:justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                {onBook && (
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      onBook(vacation);
                    }}
                  >
                    Book this trip
                  </Button>
                )}
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
