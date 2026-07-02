import type { Vacation } from "../types";
import { imageUrl } from "../api/client";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface UserCardProps {
  vacation: Vacation;
  mode: "user";
  onToggleLike: (vacation: Vacation) => void;
  likeLoading?: boolean;
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
    <article className="vacation-card">
      <img
        className="vacation-card-image"
        src={imageUrl(vacation.imageFileName)}
        alt={vacation.destination}
        loading="lazy"
      />

      {props.mode === "admin" && (
        <div className="admin-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => props.onEdit(vacation)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => props.onDelete(vacation)}>
            Delete
          </button>
        </div>
      )}

      <div className="vacation-card-body">
        <div className="vacation-card-top">
          <h3 className="vacation-destination">{vacation.destination}</h3>
        </div>
        <span className="vacation-dates">
          {formatDate(vacation.startDate)} – {formatDate(vacation.endDate)}
        </span>
        <p className="vacation-description">{vacation.description}</p>

        <div className="vacation-card-footer">
          <span className="vacation-price">${vacation.price.toLocaleString()}</span>

          {props.mode === "user" ? (
            <button
              className={`like-btn${vacation.likedByMe ? " liked" : ""}`}
              onClick={() => props.onToggleLike(vacation)}
              disabled={props.likeLoading}
            >
              {vacation.likedByMe ? "♥" : "♡"} {vacation.likesCount}
            </button>
          ) : (
            <span className="vacation-dates">♥ {vacation.likesCount}</span>
          )}
        </div>
      </div>
    </article>
  );
}
