import React from "react";

export default function Stat({ n, label, accent }) {
  return (
    <div className={`stat ${accent ? "accent" : ""}`}>
      <div className="stat-n">{n}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}
