import React from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function Round3Offline() {
  const [info, setInfo] = React.useState(null);

  React.useEffect(() => {
    axios
      .get(API_BASE + "/api/round3/info")
      .then((r) => setInfo(r.data))
      .catch(() => setInfo(null));
  }, []);

  if (!info) return null;

  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Round 3 – Offline (NIT Silchar)</h2>

        <p className="muted">
          Venue: {info.venue} • Schedule: {info.date_window} • Check-in: {info.checkin}
        </p>

        <p className="bold">Sample Datasets (Test Only)</p>

        <ul className="list">
          {info.datasets?.map((d) => (
            <li key={d.name}>
              <a className="link" href={d.url}>{d.name}</a>
            </li>
          ))}
        </ul>

        <p className="muted">Contact: {info.contact}</p>
      </div>
    </div>
  );
}
