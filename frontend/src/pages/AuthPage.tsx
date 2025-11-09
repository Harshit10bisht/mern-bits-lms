import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AuthMode = "login" | "register";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login({
          email: formState.email,
          password: formState.password,
        });
      } else {
        await register({
          fullName: formState.fullName,
          email: formState.email,
          password: formState.password,
          role: formState.role as "student" | "staff" | "admin",
        });
      }
      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-toggle">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <h1>{mode === "login" ? "Welcome back" : "Create an account"}</h1>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Access your dashboard to request and manage equipment."
              : "Join the portal to borrow resources and stay organized."}
          </p>
          {mode === "register" && (
            <label className="auth-field" htmlFor="fullName">
              <span>Full name</span>
              <input
                id="fullName"
                required
                className="auth-input"
                value={formState.fullName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, fullName: event.target.value }))
                }
              />
            </label>
          )}
          <label className="auth-field" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              type="email"
              required
              className="auth-input"
              value={formState.email}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </label>
          <label className="auth-field" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              className="auth-input"
              value={formState.password}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, password: event.target.value }))
              }
            />
          </label>
          {mode === "register" && (
            <label className="auth-field" htmlFor="role">
              <span>Role</span>
              <select
                id="role"
                className="auth-input"
                value={formState.role}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, role: event.target.value }))
                }
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </div>
      <div className="auth-aside">
        <h2>School Equipment Lending Portal</h2>
        <p className="auth-aside__lead">
          Streamline checkouts, keep departments aligned, and give every borrower a clear path from
          request to return.
        </p>
        <ul>
          <li>
            <strong>Live availability</strong>
            Check inventory status the moment you log in so nothing slips through the cracks.
          </li>
          <li>
            <strong>Guided approvals</strong>
            Route requests to the right staff in seconds and keep decisions transparent.
          </li>
          <li>
            <strong>Return reminders</strong>
            Automate follow-ups and stay on top of due dates without extra spreadsheets.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AuthPage;

