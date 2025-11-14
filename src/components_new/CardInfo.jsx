import React from "react";

export default function CardInfo({ title, msg }) {
  return (
    <div className="container narrow">
      <div className="card glass-card center">
        <h2>{title}</h2>
        <p className="muted">{msg}</p>
      </div>
    </div>
  );
}
