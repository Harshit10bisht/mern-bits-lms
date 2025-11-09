import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-accent">School</span> Lending Portal
        </div>
        <nav className="nav-links">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/loans">Loans</NavLink>
          {hasRole("admin") && <NavLink to="/admin/equipment">Manage Equipment</NavLink>}
        </nav>
        {user && (
          <div className="user-info">
            <div>
              <span className="user-name">{user.fullName}</span>
              <span className="user-role">{user.role.toUpperCase()}</span>
            </div>
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

