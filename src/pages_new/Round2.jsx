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

import {
  isRound1Done,
  isRound1Qualified,
} from "../utils/flags";

import { fmtIST } from "../utils/time";

export default function Round2({ auth }) {
  if (!auth.token) return <Navigate to="/login" />;
  if (auth.role === "admin") return <Navigate to="/superadmin" />;

  if (!(isRound1Done() || isRound1Qualified()))
    return <div className="container">You need to complete or qualify from Round-1 to access Round-2.</div>;

  const now = useServerClock();
  const wins = useEventWindows();
  const r2 = wins?.round2;

  const gate = useGate(now, r2?.start_iso, r2?.end_iso, "R2");

  const [problems, setProblems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [mySub, setMySub] = React.useState(null);

  const hdr = { headers: { Authorization: "Bearer " + auth.token } };

  React.useEffect(() => {
    async function load() {
      const ms = await axios
        .get(API_BASE + "/api/round2/my-submission", hdr)
        .then((r) => r.data)
        .catch(() => null);

      setMySub(ms);

      if (gate.status !== "open") {
        setLoading(false);
        return;
      }

      if (ms) {
        setLoading(false);
        return;
      }

      try {
        const r = await axios.get(API_BASE + "/api/round2/problems", hdr);
        setProblems(r.data || []);
      } catch {
        setProblems([]);
      }

      setLoading(false);
    }

    load();
  }, [gate.status, auth.token]);

  if (gate.status === "loading" || loading)
    return <div className="container">Loading…</div>;

  if (gate.status === "unset")
    return <CardInfo title="Round 2" msg="Admin has not set the Round-2 start time yet." />;

  if (gate.status === "locked")
    return <Locked title="Round 2 – Problems" when={gate.opensAt} now={now} />;

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

  return (
    <div className="container narrow">
      <div className="card glass-card">
        
        <div className="row-between">
          <h2>Round 2 – Problems</h2>

          {gate.endsAt && (
            <div className="align-right">
              <p className="muted small">Ends at: <b>{fmtIST(gate.endsAt)}</b></p>
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
          <Link className="btn primary" to="/submit">Upload Solution</Link>
        </div>

      </div>
    </div>
  );
}
