import React from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function Schedule() {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    axios
      .get(API_BASE + "/api/schedule")
      .then((r) => setItems(r.data))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="container">
      <div className="card glass-card">
        <h2>Event Schedule</h2>

        <ul className="list">
          {items.map((it) => (
            <li key={it._id}>
              <div className="bold">
                {it.round} — {it.title}
              </div>
              <div className="muted small">{it.description}</div>
              <div className="muted small">Date: {it.date}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
