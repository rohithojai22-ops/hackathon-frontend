import React from "react";
import { Link } from "react-router-dom";
import {
  isRound1Done,
  isRound1Qualified,
  isRound2Qualified,
} from "../utils/flags";

export default function Nav({ auth }) {
  const token = auth.token;
  const isAdmin = auth.role === "admin";

  const r1ok = isRound1Done() || isRound1Qualified();

  return (
    <header className="nav">
      <div className="nav-inner">

        {/* BRAND */}
        <Link to="/" className="brand">
          <img src="/src/assets/nits-logo.png" className="nav-logo" />
          <span>NIT SILCHAR<br/>HACKATHON 2026</span>
        </Link>

        {/* NAV LINKS */}
        <nav className="nav-links">
          <Link to="/schedule">Schedule</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/event-info">Event Info</Link>
          <Link to="/contact">Contact</Link>

          {!token && <Link className="btn ghost" to="/register">Register</Link>}
          {!token && <Link className="btn primary" to="/login">Login</Link>}

          {/* Round 1 */}
          {token && !isAdmin && <Link className="btn" to="/round1">Round 1</Link>}

          {/* ROUND-2 ALWAYS SHOWN, BUT DISABLED IF NOT QUALIFIED */}
          {token && !isAdmin && (
            <Link
              className="btn"
              to={r1ok ? "/round2" : "#"}
              style={{
                opacity: r1ok ? 1 : 0.4,
                pointerEvents: r1ok ? "auto" : "none",
              }}
            >
              Round 2
            </Link>
          )}

          {/* OTHER LINKS */}
          {token && <Link className="btn" to="/results">Results</Link>}
          {token && !isAdmin && <Link className="btn" to="/dashboard">Dashboard</Link>}
          {token && isAdmin && <Link className="btn" to="/superadmin">Admin</Link>}
          {token && <button className="btn" onClick={auth.clear}>Logout</button>}
        </nav>
      </div>
    </header>
  );
}
