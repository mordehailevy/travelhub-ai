import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex min-h-11 items-center rounded-full px-4 py-2.5 text-sm font-bold transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
  );

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "";

  const links = (
    <>
      {!isAuthenticated && (
        <>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/login" className={navLinkClass}>
            Login
          </NavLink>
          <NavLink to="/register" className={navLinkClass}>
            Register
          </NavLink>
        </>
      )}

      {isAuthenticated && !isAdmin && (
        <>
          <NavLink to="/vacations" className={navLinkClass}>
            Vacations
          </NavLink>
          <NavLink to="/ai-recommendation" className={navLinkClass}>
            AI Recommendation
          </NavLink>
          <NavLink to="/ask" className={navLinkClass}>
            Ask the data
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </>
      )}

      {isAuthenticated && isAdmin && (
        <>
          <NavLink to="/admin" className={navLinkClass}>
            Vacations
          </NavLink>
          <NavLink to="/admin/bookings" className={navLinkClass}>
            Bookings
          </NavLink>
          <NavLink to="/admin/report" className={navLinkClass}>
            Report
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-5 border-b border-border bg-card/85 px-8 py-3.5 backdrop-blur-md">
      <NavLink to="/" className="inline-flex items-center gap-2 whitespace-nowrap text-[1.3rem] font-extrabold tracking-tight text-foreground no-underline">
        <span
          className="size-[30px] shrink-0 rounded-[9px] [animation:aurora-shift_10s_ease_infinite] [background:var(--aurora-gradient)] [background-size:250%_250%] shadow-[var(--shadow-glow)]"
          aria-hidden
        />
        TravelHub AI
      </NavLink>

      <nav className="hidden flex-wrap items-center gap-1 rounded-full bg-muted p-[5px] md:flex">{links}</nav>

      <div className="flex items-center gap-3.5">
        <ThemeToggle />

        {isAuthenticated && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-bold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground md:inline-flex">
                <Avatar size="sm">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {user.firstName} {user.lastName}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user.firstName} {user.lastName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profil")}>Profil</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-2 p-4" onClick={() => setMobileOpen(false)}>
              {links}
              {isAuthenticated && user && (
                <>
                  <Separator className="my-1" />
                  <button className={navLinkClass({ isActive: false })} onClick={() => navigate("/profil")}>
                    Profil
                  </button>
                  <button className={navLinkClass({ isActive: false })} onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
