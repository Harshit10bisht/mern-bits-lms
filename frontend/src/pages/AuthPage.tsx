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
          {mode === "register" && (
            <label>
              Full name
              <input
                required
                value={formState.fullName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, fullName: event.target.value }))
                }
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              required
              value={formState.email}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={formState.password}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, password: event.target.value }))
              }
            />
          </label>
          {mode === "register" && (
            <label>
              Role
              <select
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
        <p>
          Borrow equipment with confidence, track approvals, and keep school resources organized.
        </p>
        <ul>
          <li>Browse available inventory in real-time</li>
          <li>Submit and track borrowing requests</li>
          <li>Manage approvals and returns with ease</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthPage;

