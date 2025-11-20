import React from "react";
import axios from "axios";
import { Navigate, Link } from "react-router-dom";
import { API_BASE } from "../config";

import useServerClock from "../hooks/useServerClock";
import useEventWindows from "../hooks/useEventWindows";
import useGate from "../hooks/useGate";

import Locked from "../components_new/Locked";
import CardInfo from "../components_new/CardInfo";
import Countdown from "../components_new/Countdown";

import { isRound1Qualified } from "../utils/flags";
import { fmtIST } from "../utils/time";

export default function Round2({ auth }) {
  if (!auth.token) return <Navigate to="/login" />;
  if (auth.role === "admin") return <Navigate to="/superadmin" />;

  const now = useServerClock();
  const wins = useEventWindows();
 const start = wins?.round2_start_iso;
const end   = wins?.round2_end_iso;

const gate = useGate(now, start, end, "R2");


  const [problems, setProblems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [mySub, setMySub] = React.useState(null);

  const qualified = isRound1Qualified();
  const hdr = { headers: { Authorization: "Bearer " + auth.token } };

  React.useEffect(() => {
    async function load() {
      if (!qualified) {
        setLoading(false);
        return;
      }

      // CHECK IF USER ALREADY SUBMITTED
      const ms = await axios
        .get(API_BASE + "/api/round2/my-submission", hdr)
        .then((r) => r.data)
        .catch(() => null);

      setMySub(ms);

      // IF NOT OPEN → no need load questions
      if (gate.status !== "open") {
        setLoading(false);
        return;
      }

      // IF ALREADY SUBMITTED → stop
      if (ms) {
        setLoading(false);
        return;
      }

      // LOAD PROBLEMS
      try {
        const r = await axios.get(API_BASE + "/api/round2/problems", hdr);
        setProblems(r.data || []);
      } catch {
        setProblems([]);
      }

      setLoading(false);
    }

    load();
  }, [gate.status, auth.token, qualified]);

  // -------------------------------------------------------
  //                NOT QUALIFIED TEAM UI
  // -------------------------------------------------------
  if (!qualified) {
    if (gate.status === "locked")
      return <Locked title="Round 2" when={gate.opensAt} now={now} />;

    if (gate.status === "open")
      return (
        <div className="container narrow">
          <div className="card glass-card center">
            <h2>Round 2</h2>
            <p className="muted">⛔ Your team is not qualified for Round-2.</p>
          </div>
        </div>
      );

    if (gate.status === "ended")
      return (
        <div className="container narrow">
          <div className="card glass-card center">
            <h2>Round 2 – Ended</h2>
            <p className="muted">⛔ Your team is not qualified for Round-2.</p>
          </div>
        </div>
      );
  }

  // -------------------------------------------------------
  //                QUALIFIED TEAM — UI
  // -------------------------------------------------------

  if (gate.status === "loading" || loading)
    return <div className="container">Loading…</div>;

  if (gate.status === "unset")
    return (
      <CardInfo
        title="Round 2"
        msg="Admin has not set the Round-2 window yet."
      />
    );

  if (gate.status === "locked")
    return (
      <Locked
        title="Round 2 – Problems"
        when={gate.opensAt}
        now={now}
      />
    );

  // ALREADY SUBMITTED
  if (mySub)
    return (
      <div className="container narrow">
        <div className="card glass-card center">
          <h2>Round 2 – Submitted ✅</h2>
          <p className="muted">Your file is received. Only one upload is allowed.</p>
          <div className="mt">
            <div><b>File:</b> {mySub.filename}</div>
            <div><b>Uploaded at:</b> {fmtIST(mySub.created_at)}</div>
          </div>
        </div>
      </div>
    );

  if (gate.status === "ended") {
    return (
      <div className="container narrow">
        <div className="card glass-card center">
          <h2>Round 2 – Ended</h2>
          <p className="muted">Submission time is over.</p>
        </div>
      </div>
    );
  }

  // ROUND IS OPEN → show problems
  return (
    <div className="container narrow">
      <div className="card glass-card">

        <div className="row-between">
          <h2>Round 2 – Problems</h2>

          {gate.endsAt && (
            <div className="align-right">
              <p className="muted small">
                Ends at: <b>{fmtIST(gate.endsAt)}</b>
              </p>
              <Countdown now={now} target={gate.endsAt} prefix="Ends in" />
            </div>
          )}
        </div>

        <ol className="problems">
          {problems.map((p) => (
            <li key={p.id}>
              <b>{p.title}</b>: {p.statement}
            </li>
          ))}
        </ol>

        <div className="mt">
          <Link className="btn primary" to="/submit">
            Upload Solution
          </Link>
        </div>
      </div>
    </div>
  );
}
