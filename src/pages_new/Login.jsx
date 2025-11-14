import React from "react";
import { Navigate } from "react-router-dom";
import { fetchStatusAndSetFlags } from "../utils/flags";

export default function Login({ auth }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErr("");

      await auth.login(email, password);
      await fetchStatusAndSetFlags(localStorage.getItem("token"));
    } catch {
      setErr("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (auth.token && auth.role === "team") return <Navigate to="/dashboard" />;
  if (auth.token && auth.role === "admin") return <Navigate to="/superadmin" />;

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Login</h2>

        {err && <div className="error">{err}</div>}

        <form onSubmit={submit} className="grid gap">
          <input
            className="input"
            placeholder="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn primary" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="muted small">Use your registered credentials to log in.</p>
      </div>
    </div>
  );
}
