import React from "react";
import { Link } from "react-router-dom";
import Stat from "../components_new/Stat";

export default function Home({ auth }) {
  const token = auth.token;

  return (
    <main className="container">

      {/* ================= HERO ================= */}
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
              <Link className="btn primary xl" to="/register">
                Register Now
              </Link>
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

        {/* HERO IMAGE – FIXED SIZE */}
        <div className="hero-right">
          <div className="hero-media">
            <img
              className="hero-img"
              alt="Students collaborating"
              loading="lazy"
              src="https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1400&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>


      {/* =============== ABOUT NIT SECTION =============== */}
      <section className="nit-section card">

        <h2>About NIT Silchar</h2>

        <p>
          The National Institute of Technology, Silchar, established in 1967 as a Regional
          Engineering College, is one of India’s premier technical institutions. Upgraded to NIT
          in 2002 and declared an Institute of National Importance under the NIT Act of 2007, NIT
          Silchar stands out for its excellence in education, research, and innovation.
        </p>

        <h3>Recognitions & Highlights</h3>

        <ul>
          <li>
            Ranked among India’s top engineering institutes: NIRF 2024 — Engineering Rank 40,
            Overall 92.
          </li>
          <li>QS Asia University Ranking 2025: Position 541.</li>
          <li>Ranked 205th globally in Green Metric Ranking 2022.</li>
          <li>Hub for advanced AI/ML, research labs, and innovation ecosystems.</li>
          <li>Strong international and industry collaborations.</li>
        </ul>

        <p className="nit-bottom">
          NIT Silchar continues to nurture technocrats and researchers who shape global industries
          and academia.
        </p>

      </section>

    </main>
  );
}
