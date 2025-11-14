import React from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function Profile({ auth }) {
  const [form, setForm] = React.useState({
    phone: "",
    member1: "",
    member2: "",
    member3: "",
  });

  const [msg, setMsg] = React.useState("");

  React.useEffect(() => {
    if (!auth.token) return;

    const hdr = {
      headers: { Authorization: "Bearer " + auth.token },
    };

    axios.get(API_BASE + "/api/me", hdr).then((r) => {
      const t = r.data.team;
      setForm({
        phone: t?.phone || "",
        member1: t?.member1 || "",
        member2: t?.member2 || "",
        member3: t?.member3 || "",
      });
    });
  }, [auth.token]);

  const save = async (e) => {
    e.preventDefault();

    const hdr = {
      headers: { Authorization: "Bearer " + auth.token },
    };

    try {
      await axios.put(API_BASE + "/api/team", form, hdr);
      setMsg("Saved!");
    } catch (e) {
      setMsg(e.response?.data?.error || "Save failed");
    }
  };

  if (!auth.token) return <Navigate to="/login" />;

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>Edit Team Profile</h2>

        {msg && <div className="ok">{msg}</div>}

        <form onSubmit={save} className="grid gap">
          {["phone", "member1", "member2", "member3"].map((k) => (
            <input
              key={k}
              className="input"
              placeholder={k}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          ))}

          <button className="btn primary">Save</button>
        </form>
      </div>
    </div>
  );
}
