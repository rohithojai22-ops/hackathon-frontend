import React from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { fmtIST } from "../utils/time";

export default function Leaderboard() {
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    axios
      .get(API_BASE + "/api/leaderboard")
      .then((r) => setRows(r.data))
      .catch(() => setRows([]));
  }, []);

  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Leaderboard (Round 1)</h2>

        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Score</th>
              <th>Out of</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.team_name}</td>
                <td>{r.score}</td>
                <td>{r.total}</td>
                <td>{r.created_at ? fmtIST(r.created_at) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
