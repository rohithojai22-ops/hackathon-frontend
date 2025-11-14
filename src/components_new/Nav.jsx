import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/nits-logo.jpeg"; // make sure file exists

import {
  isRound1Done,
  isRound1Qualified,
  isRound2Qualified
} from "../utils/flags";

export default function Nav({ auth }) {
  const token = auth.token;
  const isAdmin = auth.role === "admin";

  return (
    <header className="nav">
      <div className="nav-inner">

        {/* === LEFT SIDE: LOGO + TITLE === */}
        <Link to="/" className="brand">
          <img src={logo} alt="NIT Silchar Logo" className="brand-logo" />
          <div className="brand-text">
            <div className="title-top">NIT SILCHAR</div>
            <div className="title-bottom">HACKATHON 2026</div>
          </div>
        </Link>

        {/* === RIGHT SIDE: NAV LINKS === */}
        <nav className="nav-links">

          <Link to="/schedule">Schedule</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/event-info">Event Info</Link>
          <Link to="/contact">Contact</Link>

          {!token && <Link className="btn ghost" to="/register">Register</Link>}
          {!token && <Link className="btn primary" to="/login">Login</Link>}

          {/* Participant Routes */}
          {token && !isAdmin && <Link className="btn" to="/round1">Round 1</Link>}

          {token && !isAdmin && (isRound1Done() || isRound1Qualified()) && (
            <Link className="btn" to="/round2">Round 2</Link>
          )}

          {token && !isAdmin && (
            <Link className="btn" to="/dashboard">Dashboard</Link>
          )}

          {/* Admin Only */}
          {token && isAdmin && (
            <Link className="btn" to="/superadmin">Admin</Link>
          )}

          {/* Logout */}
          {token && <button className="btn" onClick={auth.clear}>Logout</button>}
        </nav>

      </div>
    </header>
  );
}
