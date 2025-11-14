import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE } from "../config";

export default function Results({ auth }) {
  const [data, setData] = React.useState(null);
  const [rank, setRank] = React.useState(null);
  const [teamName, setTeamName] = React.useState(null);

  React.useEffect(() => {
    async function load() {
      const hdr = auth.token
        ? { headers: { Authorization: "Bearer " + auth.token } }
        : {};

      try {
        if (auth.token) {
          const me = await axios.get(API_BASE + "/api/me", hdr).catch(() => null);
          const tn = me?.data?.team?.team_name || null;
          setTeamName(tn);

          const st = await axios.get(API_BASE + "/api/status", hdr).catch(() => null);
          if (st?.data) setData(st.data);

          const lb = await axios.get(API_BASE + "/api/leaderboard").catch(() => ({
            data: [],
          }));

          if (tn) {
            const idx = (lb.data || []).findIndex((r) => r.team_name === tn);
            if (idx >= 0) setRank(idx + 1);
          }
        }
      } catch {}
    }

    load();
  }, [auth.token]);

  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Results</h2>

        {!auth.token && (
          <p className="muted">Login to view your personal score & certificate.</p>
        )}

        {auth.token && data && (
          <div className="mt">
            <div>
              Team: <b>{teamName}</b>
            </div>

            <div>
              Round 1 Score:{" "}
              <b>
                {!data.round1_attempted
                  ? "N/A"
                  : `${data.round1.score} / ${data.round1.total}`}
              </b>
            </div>

            <div>
              Qualified for Round 2:{" "}
              <b>
                {!data.round1_attempted
                  ? "N/A"
                  : data.shortlist?.round1_qualified
                  ? "Yes"
                  : "No"}
              </b>
            </div>

            <div>
              Round 2 Shortlisted:{" "}
              <b>
                {!data.round1_attempted
                  ? "N/A"
                  : data.shortlist?.round2_shortlisted
                  ? "Yes"
                  : "No"}
              </b>
            </div>

            {rank && (
              <div>
                Leaderboard Rank: <b>#{rank}</b>
              </div>
            )}

            <div className="mt">
              <Link className="btn primary" to="/certificate">
                View / Print Certificate
              </Link>
            </div>
          </div>
        )}

        <div className="mt">
          <Link className="link" to="/leaderboard">
            See full Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
