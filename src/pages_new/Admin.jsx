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

  const [r1start, setR1start] = React.useState("");
  const [r1end, setR1end] = React.useState("");
  const [r2start, setR2start] = React.useState("");
  const [r2end, setR2end] = React.useState("");

  const hdr = { headers: { Authorization: "Bearer " + auth.token } };

  // ================================
  // LOAD ALL ADMIN DATA INCLUDING WINDOWS
  // ================================
  React.useEffect(() => {
    (async () => {
      try {
        const [mcqR, teamR, subR, probR, schedR, winR] = await Promise.all([
          axios.get(API_BASE + "/api/admin/mcqs", hdr).catch(() => ({ data: [] })),
          axios.get(API_BASE + "/api/admin/teams", hdr).catch(() => ({ data: [] })),
          axios.get(API_BASE + "/api/admin/submissions", hdr).catch(() => ({ data: [] })),
          axios.get(API_BASE + "/api/admin/problems", hdr).catch(() => ({ data: [] })),
          axios.get(API_BASE + "/api/schedule").catch(() => ({ data: [] })),
          axios.get(API_BASE + "/api/event-settings", hdr).catch(() => ({ data: {} })),
        ]);

        setMcqs(mcqR.data);
        setTeams(teamR.data);
        setSubs(subR.data);
        setProblems(probR.data);
        setSchedule(schedR.data);

        // Load window values
        setR1start(winR.data.round1_start_iso || "");
        setR1end(winR.data.round1_end_iso || "");
        setR2start(winR.data.round2_start_iso || "");
        setR2end(winR.data.round2_end_iso || "");
      } catch (e) {
        console.error("Admin Load Error:", e);
      }
    })();
  }, [auth.token]);

  // ================================
  // SAVE ROUND WINDOWS
  // ================================
  const saveWindows = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        API_BASE + "/api/event-settings",    // ✅ FIXED: correct route
        {
          round1_start_iso: r1start,
          round1_end_iso: r1end,
          round2_start_iso: r2start,
          round2_end_iso: r2end,
        },
        hdr
      );

      // Re-fetch after saving
      const r = await axios.get(API_BASE + "/api/event-settings", hdr);
      setR1start(r.data.round1_start_iso || "");
      setR1end(r.data.round1_end_iso || "");
      setR2start(r.data.round2_start_iso || "");
      setR2end(r.data.round2_end_iso || "");

      alert("Windows saved");
    } catch (err) {
      console.error("Save Error:", err);
      alert(err?.response?.data?.error || "Failed to save settings");
    }
  };

  // ================================
  // SHORTLIST COMPUTE
  // ================================
  const computeShortlist = async () => {
    await axios.post(API_BASE + "/api/admin/compute-shortlist", {}, hdr);
    alert("Shortlist computed successfully!");
  };

  // ================================
  // RENDER
  // ================================
  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Admin Panel</h2>

        <h3 className="mt">Round Windows</h3>

        <form onSubmit={saveWindows} className="grid gap">
          <input className="input" placeholder="Round-1 Start (ISO)" value={r1start} onChange={(e) => setR1start(e.target.value)} />
          <input className="input" placeholder="Round-1 End (ISO)" value={r1end} onChange={(e) => setR1end(e.target.value)} />
          <input className="input" placeholder="Round-2 Start (ISO)" value={r2start} onChange={(e) => setR2start(e.target.value)} />
          <input className="input" placeholder="Round-2 End (ISO)" value={r2end} onChange={(e) => setR2end(e.target.value)} />

          <button className="btn primary">Save Windows</button>
          <button className="btn" type="button" onClick={computeShortlist}>Compute Shortlist</button>

          <div className="muted small">
            <div>R1 Start: <b>{r1start ? fmtIST(r1start) : "—"}</b></div>
            <div>R1 End: <b>{r1end ? fmtIST(r1end) : "—"}</b></div>
            <div>R2 Start: <b>{r2start ? fmtIST(r2start) : "—"}</b></div>
            <div>R2 End: <b>{r2end ? fmtIST(r2end) : "—"}</b></div>
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
          <input className="input" placeholder="title" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} />
          <input className="input" placeholder="statement" value={p.statement} onChange={(e) => setP({ ...p, statement: e.target.value })} />
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
          <input className="input" placeholder="round" value={sch.round} onChange={(e) => setSch({ ...sch, round: e.target.value })} />
          <input className="input" placeholder="title" value={sch.title} onChange={(e) => setSch({ ...sch, title: e.target.value })} />
          <input className="input" placeholder="description" value={sch.description} onChange={(e) => setSch({ ...sch, description: e.target.value })} />
          <input className="input" placeholder="date (YYYY-MM-DD)" value={sch.date} onChange={(e) => setSch({ ...sch, date: e.target.value })} />
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
