import React from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config";
import { fetchStatusAndSetFlags } from "../utils/flags";

export default function Register({ auth }) {
  const [form, setForm] = React.useState({
    team_name: "",
    email: "",
    password: "",
    phone: "",
    member1: "",
    member2: "",
    member3: "",
  });

  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.member1.trim() || !form.member2.trim() || !form.member3.trim()) {
      setErr("Please provide names for exactly 3 members.");
      return;
    }

    try {
      setErr("");
      setLoading(true);

      await auth.register(form);
      await fetchStatusAndSetFlags(localStorage.getItem("token"));
    } catch (e) {
      setErr(e.response?.data?.error || "Registration error");
    } finally {
      setLoading(false);
    }
  };

  if (auth.token) return <Navigate to="/dashboard" />;

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Register Team</h2>
        <p className="muted">Exactly 3 members are required.</p>

        {err && <div className="error">{err}</div>}

        <form onSubmit={submit} className="grid gap">
          {[
            "team_name",
            "email",
            "password",
            "phone",
            "member1",
            "member2",
            "member3",
          ].map((k) => (
            <input
              key={k}
              className="input"
              placeholder={k}
              type={k === "password" ? "password" : k === "email" ? "email" : "text"}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              required={["team_name", "email", "password", "member1", "member2", "member3"].includes(k)}
            />
          ))}

          <button className="btn primary" disabled={loading}>
            {loading ? "Registering…" : "Create Team"}
          </button>
        </form>
      </div>
    </div>
  );
}
