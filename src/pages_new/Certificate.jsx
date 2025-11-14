import React from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config";
import { fmtIST } from "../utils/time";

export default function Certificate({ auth }) {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    if (!auth.token) return;

    const hdr = {
      headers: { Authorization: "Bearer " + auth.token },
    };

    axios
      .get(API_BASE + "/api/certificate-data", hdr)
      .then((r) => setData(r.data))
      .catch(() => setData(null));
  }, [auth.token]);

  if (!auth.token) return <Navigate to="/login" />;
  if (!data) return null;

  const pct = data.total ? data.score / data.total : 0;
  let badge = "Participation";

  if (pct >= 0.8) badge = "Gold";
  else if (pct >= 0.5) badge = "Silver";

  return (
    <div className="container">
      <div className="card glass-card center">

        <div className="cert-head">
          <div className="brand-badge lg">NIT</div>
          <h2>Certificate of {badge}</h2>
        </div>

        <p className="muted">National-Level Coding Competition (Hackathon 2026)</p>

        <div className="cert">
          <div className="title">{data.teamName || "Team"}</div>

          <div>
            Round-1 Score: <b>{data.score}</b> / {data.total}
            {" • "}
            Qualified: <b>{data.qualified ? "Yes" : "No"}</b>
          </div>

          <div className="muted">Date: {fmtIST(data.date)}</div>
        </div>

        <button className="btn primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>

      </div>
    </div>
  );
}
