import React from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config";

import useServerClock from "../hooks/useServerClock";
import useEventWindows from "../hooks/useEventWindows";
import useGate from "../hooks/useGate";

import Locked from "../components_new/Locked";
import CardInfo from "../components_new/CardInfo";
import Countdown from "../components_new/Countdown";

import { fmtIST } from "../utils/time";
import { fetchStatusAndSetFlags } from "../utils/flags";

export default function Round1({ auth }) {
  if (!auth.token) return <Navigate to="/login" />;
  if (auth.role !== "team") return <Navigate to="/login" />;

  // ---------- All hooks at top (fixed error #310) ----------
  const now = useServerClock();
  const wins = useEventWindows();       // starts null, loads later

  const [qs, setQs] = React.useState([]);
  const [sel, setSel] = React.useState({});
  const [resu, setResu] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [already, setAlready] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // ---------- Safe extract (only after wins loads) ----------
  const r1start = wins?.round1_start_iso || null;
  const r1end = wins?.round1_end_iso || null;

  const gate = useGate(now, r1start, r1end, "R1");

  // ---------- While wins still null, show loader ----------
  if (wins === null) {
    return <div className="container">Loading event window…</div>;
  }

  // ---------- Load Questions ----------
  React.useEffect(() => {
    async function load() {
      if (!auth.token) return;

      const hdr = { headers: { Authorization: "Bearer " + auth.token } };

      // Check if already submitted
      const st = await axios.get(API_BASE + "/api/status", hdr).catch(() => null);
      if (st?.data?.round1_attempted) {
        setAlready(true);
        setLoading(false);
        return;
      }

      // Only load questions during OPEN window
      if (gate.status !== "open") {
        setLoading(false);
        return;
      }

      try {
        const r = await axios.get(API_BASE + "/api/round1/questions", hdr);

        const formatted = (r.data || []).map((q) => ({
          ...q,
          _id: q._id ? String(q._id) : String(q.id),
        }));

        setQs(formatted);
      } catch (e) {
        console.error("Load Q error:", e);
        if (e?.response?.data?.error === "ALREADY_SUBMITTED") setAlready(true);
        setQs([]);
      }

      setLoading(false);
    }

    load();
  }, [auth.token, gate.status]);

  // ---------- Submit Answers ----------
  const submitAnswers = async () => {
    console.log("🔥 Submit Clicked", sel);

    if (!sel || Object.keys(sel).length === 0) {
      alert("Please answer at least one question.");
      return;
    }

    if (gate.status !== "open") {
      alert("Round 1 is not open.");
      return;
    }

    setSubmitting(true);

    const hdr = { headers: { Authorization: "Bearer " + auth.token } };

    try {
      const res = await axios.post(API_BASE + "/api/round1/submit", { answers: sel }, hdr);

      setResu(res.data);
      localStorage.setItem("round1_done", "1");

      await fetchStatusAndSetFlags(auth.token);

      setAlready(true);
    } catch (e) {
      console.error("Submit Error:", e, e?.response?.data);
      if (e?.response?.status === 409) {
        alert("Already submitted.");
        setAlready(true);
      } else {
        alert("Submission failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UI Rendering ----------
  if (gate.status === "loading" || loading)
    return <div className="container">Loading…</div>;

  if (gate.status === "unset")
    return <CardInfo title="Round 1" msg="Admin has not set the Round-1 window yet." />;

  if (gate.status === "locked")
    return <Locked title="Round 1 – MCQ" when={gate.opensAt} now={now} />;

  if (gate.status === "ended")
    return <CardInfo title="Round 1 – Ended" msg="Round-1 has ended." />;

  if (already)
    return (
      <div className="container narrow">
        <div className="card glass-card center">
          <h2>Round 1 – Submitted ✅</h2>
          <p className="muted">Your submission is recorded.</p>
        </div>
      </div>
    );

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <div className="row-between">
          <h2>Round 1 – MCQ</h2>
          {gate.endsAt && (
            <div className="align-right">
              <p className="muted small">Ends at: <b>{fmtIST(gate.endsAt)}</b></p>
              <Countdown now={now} target={gate.endsAt} prefix="Ends in" />
            </div>
          )}
        </div>

        {qs.length === 0 && <div className="muted">No questions available.</div>}

        {qs.map((q, i) => (
          <div key={q._id} className="mcq">
            <div className="q">Q{i + 1}. {q.question}</div>

            {["a", "b", "c", "d"].map((opt) => (
              <label key={opt} className="opt">
                <input
                  type="radio"
                  name={`q${q._id}`}
                  onChange={() => setSel((s) => ({ ...s, [q._id]: opt }))}
                  checked={sel[q._id] === opt}
                />
                <span className="opt-text">
                  {opt.toUpperCase()}) {q[`opt_${opt}`]}
                </span>
              </label>
            ))}
          </div>
        ))}

        <div className="row">
          <button
            className="btn primary"
            onClick={submitAnswers}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
