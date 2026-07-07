import { motion } from "motion/react";
import { Heart, Pencil, Trash2 } from "lucide-react";
import type { Vacation } from "../types";
import { imageUrl } from "../api/client";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface UserCardProps {
  vacation: Vacation;
  mode: "user";
  onToggleLike: (vacation: Vacation) => void;
  likeLoading?: boolean;
  onBook?: (vacation: Vacation) => void;
  onMoreInfo?: (vacation: Vacation) => void;
}

interface AdminCardProps {
  vacation: Vacation;
  mode: "admin";
  onEdit: (vacation: Vacation) => void;
  onDelete: (vacation: Vacation) => void;
}

type VacationCardProps = UserCardProps | AdminCardProps;

export function VacationCard(props: VacationCardProps) {
  const { vacation } = props;

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Card className="h-full gap-0 overflow-hidden py-0">
        <div className="relative">
          <img
            src={imageUrl(vacation.imageFileName, 600)}
            alt={vacation.destination}
            loading="lazy"
            className="h-[190px] w-full bg-muted object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <Badge className="absolute bottom-3.5 left-3.5 bg-white/95 px-3 py-1.5 text-sm font-extrabold text-neutral-900 shadow-sm">
            ${vacation.price.toLocaleString()}
          </Badge>

          {props.mode === "user" && (
            <button
              onClick={() => props.onToggleLike(vacation)}
              disabled={props.likeLoading}
              aria-label={vacation.likedByMe ? "Unlike" : "Like"}
              className={cn(
                "absolute top-3 right-3 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white/92 px-3.5 py-2 text-sm font-bold shadow-sm backdrop-blur-md transition-transform hover:scale-105 disabled:opacity-60",
                vacation.likedByMe ? "text-accent" : "text-neutral-600"
              )}
            >
              <Heart className="size-4" fill={vacation.likedByMe ? "currentColor" : "none"} />
              {vacation.likesCount}
            </button>
          )}
        </div>

        {props.mode === "admin" && (
          <div className="flex gap-2 px-4 pt-3">
            <Button variant="secondary" size="sm" onClick={() => props.onEdit(vacation)}>
              <Pencil /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => props.onDelete(vacation)}>
              <Trash2 /> Delete
            </Button>
          </div>
        )}

        <CardContent className="flex flex-1 flex-col gap-2 pt-4.5 pb-5">
          <h3 className="font-heading text-[1.15rem] font-extrabold tracking-tight text-foreground">
            {vacation.destination}
          </h3>
          <span className="font-mono text-xs text-muted-foreground">
            {formatDate(vacation.startDate)} – {formatDate(vacation.endDate)}
          </span>
          <p className="line-clamp-3 flex-1 text-[0.87rem] text-muted-foreground">{vacation.description}</p>

          {props.mode === "admin" && (
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">♥ {vacation.likesCount}</span>
            </div>
          )}

          {props.mode === "user" && (props.onBook || props.onMoreInfo) && (
            <div className="mt-1 flex gap-2">
              {props.onMoreInfo && (
                <Button size="sm" variant="outline" onClick={() => props.onMoreInfo?.(vacation)}>
                  More info
                </Button>
              )}
              {props.onBook && (
                <Button size="sm" onClick={() => props.onBook?.(vacation)}>
                  Book this trip
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.article>
  );
}
