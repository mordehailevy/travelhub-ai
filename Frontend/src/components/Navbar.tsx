import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar-brand">
        TravelHub AI
      </NavLink>

      <nav className="navbar-links">
        {!isAuthenticated && (
          <>
            <NavLink to="/about" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
              About
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
              Login
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
              Register
            </NavLink>
          </>
        )}

        {isAuthenticated && !isAdmin && (
          <>
            <NavLink to="/vacations" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
              Vacations
            </NavLink>
            <NavLink to="/ai-recommendation" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
              AI Recommendation
            </NavLink>
            <NavLink to="/ask" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
              Ask the data
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
              About
            </NavLink>
          </>
        )}

        {isAuthenticated && isAdmin && (
          <>
            <NavLink to="/admin" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
              Vacations
            </NavLink>
            <NavLink to="/admin/report" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
              Report
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
              About
            </NavLink>
          </>
        )}
      </nav>

      <div className="navbar-right">
        {isAuthenticated && user && (
          <>
            <span className="navbar-user">
              {user.firstName} {user.lastName}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
