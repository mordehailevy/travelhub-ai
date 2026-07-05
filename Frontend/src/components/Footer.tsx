import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Footer() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span
            className="size-[26px] shrink-0 rounded-lg [animation:aurora-shift_10s_ease_infinite] [background:var(--aurora-gradient)] [background-size:250%_250%]"
            aria-hidden
          />
          <div>
            <p className="font-heading text-base font-extrabold text-foreground">TravelHub AI</p>
            <p className="text-sm text-muted-foreground">Browse, like and plan your next trip.</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground">
            About
          </Link>
          {!isAuthenticated && (
            <>
              <Link to="/login" className="hover:text-foreground">
                Login
              </Link>
              <Link to="/register" className="hover:text-foreground">
                Register
              </Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link to={isAdmin ? "/admin" : "/vacations"} className="hover:text-foreground">
                Vacations
              </Link>
              <Link to="/profil" className="hover:text-foreground">
                Profil
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">
        © 2026 TravelHub AI — student project
      </div>
    </footer>
  );
}
