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
  if (auth.role !== "team")
  return <Navigate to="/login" />;


  const now = useServerClock();
  const wins = useEventWindows();
  const [qs, setQs] = React.useState([]);
  const [sel, setSel] = React.useState({});
  const [resu, setResu] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [already, setAlready] = React.useState(false);

const r1start = wins?.round1_start_iso || null;
const r1end   = wins?.round1_end_iso || null;



const gate = useGate(now, r1start, r1end, "R1");


  React.useEffect(() => {
    async function load() {
      if (!auth.token) return;

      const hdr = {
        headers: { Authorization: "Bearer " + auth.token },
      };

      const st = await axios.get(API_BASE + "/api/status", hdr).catch(() => null);
      if (st?.data?.round1_attempted) {
        setAlready(true);
        setLoading(false);
        return;
      }

      if (gate.status !== "open") {
        setLoading(false);
        return;
      }

      try {
        const r = await axios.get(API_BASE + "/api/round1/questions", hdr);
        setQs(r.data || []);
      } catch (e) {
        if (e?.response?.data?.error === "ALREADY_SUBMITTED") setAlready(true);
        setQs([]);
      }

      setLoading(false);
    }

    load();
  }, [auth.token, gate.status]);

  const submitAnswers = async () => {
    const hdr = { headers: { Authorization: "Bearer " + auth.token } };

    try {
      const res = await axios.post(
        API_BASE + "/api/round1/submit",
        { answers: sel },
        hdr
      );

      setResu(res.data);

      localStorage.setItem("round1_done", "1");
      await fetchStatusAndSetFlags(auth.token);

      setAlready(true);
    } catch (e) {
      if (e?.response?.status === 409) {
        setAlready(true);
        alert("You have already submitted Round-1.");
      } else {
        alert("Submission failed");
      }
    }
  };

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
          <p className="muted">Your MCQ submission is recorded. You can’t attempt again.</p>
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
          <div key={q.id} className="mcq">
            <div className="q">Q{i + 1}. {q.question}</div>

            {["a", "b", "c", "d"].map((opt) => (
              <label key={opt} className="opt">
                <input
                  type="radio"
                  name={`q${q.id}`}
                  onChange={() => setSel({ ...sel, [q.id]: opt })}
                  checked={sel[q.id] === opt}
                />
                <span className="opt-text">
                  {opt.toUpperCase()}) {q["opt_" + opt]}
                </span>
              </label>
            ))}
          </div>
        ))}

        <div className="row">
          <button className="btn primary" onClick={submitAnswers}>Submit</button>
          {resu && (
            <div className="score">
              Score: <b>{resu.score}</b> / {resu.total}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} update this code thoroughly and give me
