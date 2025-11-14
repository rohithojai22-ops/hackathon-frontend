import React from "react";
import { Link } from "react-router-dom";
import {
  isRound1Done,
  isRound1Qualified,
  isRound2Done,
  isRound2Qualified,
} from "../utils/flags";

export default function Nav({ auth }) {
  const token = auth.token;
  const isAdmin = auth.role === "admin";

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span>NIT SILCHAR HACKATHON 2026</span>
        </Link>

        <nav className="nav-links">
          <Link to="/schedule">Schedule</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/event-info">Event Info</Link>
          <Link to="/contact">Contact</Link>

          {!token && <Link className="btn ghost" to="/register">Register</Link>}
          {!token && <Link className="btn primary" to="/login">Login</Link>}

          {token && !isAdmin && <Link className="btn" to="/round1">Round 1</Link>}
          {token && !isAdmin && (isRound1Done() || isRound1Qualified()) && (
            <Link className="btn" to="/round2">Round 2</Link>
          )}
          {token && !isAdmin && (isRound2Done() || isRound2Qualified()) && (
            <Link className="btn" to="/round3-offline">Round 3</Link>
          )}

          {token && <Link className="btn" to="/results">Results</Link>}
          {token && !isAdmin && <Link className="btn" to="/dashboard">Dashboard</Link>}
          {token && isAdmin && <Link className="btn" to="/superadmin">Admin</Link>}
          {token && <button className="btn" onClick={auth.clear}>Logout</button>}
        </nav>
      </div>
    </header>
  );
}
