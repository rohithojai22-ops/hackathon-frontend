import React from "react";
import { Link } from "react-router-dom";
import Stat from "../components_new/Stat";

export default function Home({ auth }) {
  const token = auth.token;

  return (
    <main className="container">
      <section className="hero">
        <div className="hero-left">

          <span className="pill">National-Level Competition</span>

          <h1 className="hero-title">
            Hackathon <span className="year">2026</span>
          </h1>

          <p className="hero-sub">
            Showcase your AI/ML and problem-solving skills at NIT Silchar.
            Exactly 3 members per team • Round 1 MCQ • Round 2 Coding • Round 3 On-Campus Finale.
          </p>

          <div className="hero-cta">
            {!token && (
              <Link className="btn primary xl" to="/register">Register Now</Link>
            )}
            <Link className="btn" to="/schedule">View Schedule</Link>
          </div>

          <div className="stats">
            <Stat n="3" label="Competition Rounds" />
            <Stat n="₹1.2L" label="Prize Pool" accent />
            <Stat n="3" label="Members / Team" />
            <Stat n="NIT" label="Silchar, Assam" accent />
          </div>
        </div>

        <div className="hero-right">
          <div className="glass-card img-card hero-media">
            <img
              className="hero-img"
              alt="Students collaborating"
              loading="lazy"
              src="https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1400&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
