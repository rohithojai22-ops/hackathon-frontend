import React from "react";
import { useNavigate } from "react-router-dom";
import { fetchStatusAndSetFlags } from "../utils/flags";

export default function Login({ auth }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();

const submit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    setErr("");

    // login → returns { token, role }
    const res = await auth.login(email, password);

    await fetchStatusAndSetFlags(localStorage.getItem("token"));

    // ✅ Use res.role instead of auth.role
    if (res.role === "admin") {
      navigate("/superadmin");
    } else {
      navigate("/dashboard");
    }
  } catch {
    setErr("Invalid credentials");
  } finally {
    setLoading(false);
  }
};


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
