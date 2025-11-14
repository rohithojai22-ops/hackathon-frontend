import React from "react";
import axios from "axios";
import { Navigate, Link } from "react-router-dom";
import { API_BASE } from "../config";
import {
  isRound1Done,
  isRound1Qualified,
  isRound2Qualified,
} from "../utils/flags";

export default function Dashboard({ auth }) {
  const [data, setData] = React.useState(null);
  const [me, setMe] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      if (!auth.token) {
        setLoading(false);
        return;
      }

      const hdr = {
        headers: { Authorization: "Bearer " + auth.token },
      };

      try {
        const [st, meRes] = await Promise.all([
          axios.get(API_BASE + "/api/status", hdr).catch(() => null),
          axios.get(API_BASE + "/api/me", hdr).catch(() => null),
        ]);

        if (st?.data) {
          setData(st.data);

          if (st.data.round1_attempted)
            localStorage.setItem("round1_done", "1");

          if (st.data?.shortlist?.round1_qualified)
            localStorage.setItem("round1_qualified", "1");

          if (st.data?.shortlist?.round2_shortlisted)
            localStorage.setItem("round2_qualified", "1");
        }

        if (meRes?.data) setMe(meRes.data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [auth.token]);

  if (!auth.token) return <Navigate to="/login" />;
  if (loading) return <div className="container">Loading…</div>;

  return (
    <div className="container narrow">
      <div className="card glass-card">
        <h2>
          Welcome{me?.team?.team_name ? `, ${me.team.team_name}` : ""}
        </h2>

        <div className="links">
          <Link className="link" to="/profile">Edit Profile</Link>{" • "}
          <Link className="link" to="/certificate">Certificate</Link>{" • "}
          <Link className="link" to="/results">Results</Link>{" • "}
          <Link className="link" to="/round3-offline">Round 3</Link>{" • "}
          <Link className="link" to="/round1">Round 1</Link>{" • "}

          {(isRound1Done() || isRound1Qualified()) && (
            <Link className="link" to="/round2">
              Round 2
            </Link>
          )}{" • "}

          <Link className="link" to="/submit">Upload Submission</Link>
        </div>

        <div className="mt">
          <p>
            Round 1 Score:{" "}
            <b>
              {!data?.round1_attempted
                ? "N/A"
                : `${data.round1?.score ?? 0} / ${data.round1?.total ?? 15}`}
            </b>
          </p>

          <p>
            Round 1 Qualified:{" "}
            <b>
              {!data?.round1_attempted
                ? "N/A"
                : data.shortlist?.round1_qualified
                ? "Yes"
                : "No"}
            </b>
          </p>

          <p>
            Round 2 Shortlisted:{" "}
            <b>
              {!data?.round1_attempted
                ? "N/A"
                : data.shortlist?.round2_shortlisted
                ? "Yes"
                : "No"}
            </b>
          </p>

          <p>
            Round 3 (Offline) Participation:{" "}
            <b>
              {!data?.shortlist
                ? "N/A"
                : data?.shortlist?.round3_participated
                ? "Yes"
                : "No"}
            </b>
          </p>
        </div>
      </div>
    </div>
  );
}
