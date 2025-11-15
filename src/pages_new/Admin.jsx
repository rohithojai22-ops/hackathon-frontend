import React from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config";
import { fmtIST } from "../utils/time";

export default function Admin({ auth }) {
  if (!auth.token || auth.role !== "admin") return <Navigate to="/login" />;

  const [mcqs, setMcqs] = React.useState([]);
  const [teams, setTeams] = React.useState([]);
  const [subs, setSubs] = React.useState([]);
  const [problems, setProblems] = React.useState([]);

  const [q, setQ] = React.useState({
    question: "",
    opt_a: "",
    opt_b: "",
    opt_c: "",
    opt_d: "",
    correct: "a",
  });

  const [p, setP] = React.useState({ title: "", statement: "" });

  const [schedule, setSchedule] = React.useState([]);
  const [sch, setSch] = React.useState({
    round: "",
    title: "",
    description: "",
    date: "",
  });

  // Round windows (frontend state)
  const [r1start, setR1start] = React.useState("");
  const [r1end, setR1end] = React.useState("");
  const [r2start, setR2start] = React.useState("");
  const [r2end, setR2end] = React.useState("");

  const hdr = { headers: { Authorization: "Bearer " + auth.token } };

  // ===============================
  // LOAD ADMIN DATA
  // ===============================
  React.useEffect(() => {
    axios.get(API_BASE + "/api/admin/mcqs", hdr).then((r) => setMcqs(r.data));
    axios.get(API_BASE + "/api/admin/teams", hdr).then((r) => setTeams(r.data));
    axios.get(API_BASE + "/api/admin/submissions", hdr).then((r) => setSubs(r.data));
    axios.get(API_BASE + "/api/admin/problems", hdr).then((r) => setProblems(r.data));
    axios.get(API_BASE + "/api/schedule").then((r) => setSchedule(r.data));

    // =============== Load saved event windows from correct API ================
    axios.get(API_BASE + "/api/admin/event-settings", hdr).then((r) => {
      const data = r.data;

      setR1start(data.round1_start_iso ? data.round1_start_iso.slice(0, 16) : "");
      setR1end(data.round1_end_iso ? data.round1_end_iso.slice(0, 16) : "");
      setR2start(data.round2_start_iso ? data.round2_start_iso.slice(0, 16) : "");
      setR2end(data.round2_end_iso ? data.round2_end_iso.slice(0, 16) : "");
    });
  }, [auth.token]);

  // ===============================
  // SAVE WINDOWS
  // ===============================
  const saveWindows = async (e) => {
    e.preventDefault();

    await axios.put(
      API_BASE + "/api/admin/event-settings",
      {
        round1_start_iso: r1start ? new Date(r1start).toISOString() : "",
        round1_end_iso: r1end ? new Date(r1end).toISOString() : "",
        round2_start_iso: r2start ? new Date(r2start).toISOString() : "",
        round2_end_iso: r2end ? new Date(r2end).toISOString() : "",
      },
      hdr
    );

    alert("Windows saved successfully!");
  };

  // ===============================
  // SHORTLIST
  // ===============================
  const computeShortlist = async () => {
    await axios.post(API_BASE + "/api/admin/compute-shortlist", {}, hdr);
    alert("Shortlist computed successfully!");
  };

  // ===============================
  // RENDER UI
  // ===============================
  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Admin Panel</h2>

        {/* ===================== ROUND WINDOWS ====================== */}
        <h3 className="mt">Round Windows</h3>

        <form onSubmit={saveWindows} className="grid gap">
          <input
            type="datetime-local"
            className="input"
            value={r1start}
            onChange={(e) => setR1start(e.target.value)}
          />

          <input
            type="datetime-local"
            className="input"
            value={r1end}
            onChange={(e) => setR1end(e.target.value)}
          />

          <input
            type="datetime-local"
            className="input"
            value={r2start}
            onChange={(e) => setR2start(e.target.value)}
          />

          <input
            type="datetime-local"
            className="input"
            value={r2end}
            onChange={(e) => setR2end(e.target.value)}
          />

          <button className="btn primary">Save Windows</button>
          <button className="btn" type="button" onClick={computeShortlist}>
            Compute Shortlist
          </button>

          <div className="muted small">
            <div>R1 Start: <b>{r1start ? fmtIST(new Date(r1start)) : "—"}</b></div>
            <div>R1 End: <b>{r1end ? fmtIST(new Date(r1end)) : "—"}</b></div>
            <div>R2 Start: <b>{r2start ? fmtIST(new Date(r2start)) : "—"}</b></div>
            <div>R2 End: <b>{r2end ? fmtIST(new Date(r2end)) : "—"}</b></div>
          </div>
        </form>

        {/* MCQs */}
        <h3 className="mt">MCQs</h3>
        <form onSubmit={addMcq} className="grid gap">
          {["question", "opt_a", "opt_b", "opt_c", "opt_d", "correct"].map((k) => (
            <input
              key={k}
              className="input"
              placeholder={k}
              value={q[k]}
              onChange={(e) => setQ({ ...q, [k]: e.target.value })}
            />
          ))}
          <button className="btn">Add MCQ</button>
        </form>

        <ul className="list mt">
          {mcqs.map((m) => (
            <li key={m._id} className="row-between">
              <span>{m.question} <em>({m.correct})</em></span>
              <button className="btn" onClick={() => delMcq(m._id)}>Delete</button>
            </li>
          ))}
        </ul>

        {/* Problems */}
        <h3 className="mt">Problems</h3>
        <form onSubmit={addProb} className="grid gap">
          <input
            className="input"
            placeholder="title"
            value={p.title}
            onChange={(e) => setP({ ...p, title: e.target.value })}
          />
          <input
            className="input"
            placeholder="statement"
            value={p.statement}
            onChange={(e) => setP({ ...p, statement: e.target.value })}
          />
          <button className="btn">Add Problem</button>
        </form>

        <ul className="list mt">
          {problems.map((pr) => (
            <li key={pr._id} className="row-between">
              <div>
                <div className="bold">{pr.title}</div>
                <div className="muted small">{pr.statement}</div>
              </div>
              <button className="btn" onClick={() => delProb(pr._id)}>Delete</button>
            </li>
          ))}
        </ul>

        {/* Teams */}
        <h3 className="mt">Teams</h3>
        <ul className="list small">
          {teams.map((t) => (
            <li key={t._id} className="row-between">
              <span>• {t.team_name}</span>
              <button className="btn" onClick={() => deleteTeam(t._id)}>Delete</button>
            </li>
          ))}
        </ul>

        {/* Schedule */}
        <h3 className="mt">Schedule (Public)</h3>
        <form onSubmit={addSchedule} className="grid four gap">
          <input
            className="input"
            placeholder="round"
            value={sch.round}
            onChange={(e) => setSch({ ...sch, round: e.target.value })}
          />
          <input
            className="input"
            placeholder="title"
            value={sch.title}
            onChange={(e) => setSch({ ...sch, title: e.target.value })}
          />
          <input
            className="input"
            placeholder="description"
            value={sch.description}
            onChange={(e) => setSch({ ...sch, description: e.target.value })}
          />
          <input
            className="input"
            placeholder="date (YYYY-MM-DD)"
            value={sch.date}
            onChange={(e) => setSch({ ...sch, date: e.target.value })}
          />
          <button className="btn primary">Add</button>
        </form>

        <ul className="list mt">
          {schedule.map((item) => (
            <li key={item._id} className="row-between">
              <div>
                <div className="bold">{item.round} — {item.title}</div>
                <div className="muted small">{item.description}</div>
                <div className="muted small">Date: {item.date}</div>
              </div>
              <button className="btn" onClick={() => deleteSchedule(item._id)}>Delete</button>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
